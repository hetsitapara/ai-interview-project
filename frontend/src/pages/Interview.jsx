import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/interview.css";
import "../styles/report.css";
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaClock, FaCommentDots, FaSpellCheck, FaHome, FaRedo, FaTerminal, FaBrain } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DeepAnalysis from '../components/DeepAnalysis';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

export default function Interview() {
    const [step, setStep] = useState('setup'); // setup -> analysis -> interview -> results
    const [config, setConfig] = useState({
        category: "HR",
        topic: "", // Add topic
        count: 5,
        difficulty: "Medium"
    });
    const [selectedRange, setSelectedRange] = useState('5-10'); // New state for visual range selection
    const [topics, setTopics] = useState([]); // Add topics state
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // Array of { questionId, userAnswer, timeTaken }
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [resumeUploaded, setResumeUploaded] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [resumeAnalysis, setResumeAnalysis] = useState(null); // New state for resume analysis data
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [timer, setTimer] = useState(0); // Seconds per question
    const [report, setReport] = useState(null);
    const [devMode, setDevMode] = useState(false);
    const [expandedResults, setExpandedResults] = useState({});
    const [expandedAI, setExpandedAI] = useState({}); // per-question AI answer toggle
    const [expandedDB, setExpandedDB] = useState({}); // per-question DB answer toggle
    const [hint, setHint] = useState('');
    const [hintLoading, setHintLoading] = useState(false);

    const getHint = async () => {
        const q = questions[currentQuestionIndex];
        if (!q) return;
        setHintLoading(true);
        setHint('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/interview/hint`, { question: q.question }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHint(res.data.hint);
        } catch { setHint('Think about the core concepts related to this topic.'); }
        finally { setHintLoading(false); }
    };


    const toggleResultField = (idx, field) => {
        setExpandedResults(prev => ({
            ...prev,
            [`${idx}_${field}`]: !prev[`${idx}_${field}`]
        }));
    };

    const baseTextRef = useRef("");
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    // Parse URL params for "Retry" functionality
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        const diff = params.get('difficulty');
        const top = params.get('topic');
        const cnt = params.get('count');
        const retryId = params.get('retryId');

        if (retryId) {
            const fetchRetry = async () => {
                setLoadingMessage("Restoring Session...");
                setStep("loading");
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`http://127.0.0.1:5001/api/interview/${retryId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setConfig({
                            category: data.category,
                            topic: data.topic || "",
                            difficulty: data.difficulty,
                            count: data.questions.length
                        });
                        setResumeAnalysis(data.resumeAnalysis || null);
                        
                        // Map archived questions back to session format (if they exist)
                        if (data.questions && data.questions.length > 0) {
                            const retryQuestions = data.questions.map(q => ({
                                _id: q.questionId,
                                question: q.questionText,
                                category: data.category,
                                topic: data.topic,
                                answer: q.idealAnswer,
                                type: (q.idealAnswer === 'Yes' || q.idealAnswer === 'No') ? 'YesNo' : 'Text'
                            }));
                            setQuestions(retryQuestions);
                            // If it's a retry with saved questions, go directly to analysis or interview
                            setStep(data.resumeAnalysis ? "analysis" : "interview");
                        } else {
                            // If it's an old session without saved questions, stay in setup but with correct config
                            setStep("setup");
                        }
                    } else {
                        throw new Error("Failed to fetch session");
                    }
                } catch (err) {
                    console.error("Retry failed", err);
                    setStep("setup");
                }
            };
            fetchRetry();
        } else if (cat || diff || top || cnt) {
            setConfig(prev => ({
                ...prev,
                category: cat || prev.category,
                difficulty: diff || prev.difficulty,
                topic: top || prev.topic,
                count: cnt ? parseInt(cnt) : prev.count
            }));
        }
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        // finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const currentSessionTranscript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                setCurrentAnswer(baseTextRef.current + (baseTextRef.current && currentSessionTranscript ? " " : "") + currentSessionTranscript);
            };

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                // Auto-restart if it was supposed to be listening (and wasn't stopped manually)
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Timer logic
    useEffect(() => {
        if (step === "interview") {
            setTimer(0);
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [step, currentQuestionIndex]);


    const handleResumeUploadProcess = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoadingMessage("Scanning Resume & Generating Questions...");
        setStep("loading");

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:5001/api/resume/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // No Content-Type for FormData, browser sets it with boundary
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Resume processing failed");
            }

            const data = await res.json();
            if (data.analysis) {
                setResumeAnalysis(data.analysis);
                // Pre-fill config with detected categories
                if (data.analysis.categories && data.analysis.categories.length > 0) {
                    setConfig(prev => ({
                        ...prev,
                        category: data.analysis.categories.join(',')
                    }));
                }
                setStep("analysis"); // Go to analysis view first
            } else {
                // Fallback to old behavior if no analysis returned (shouldn't happen with new backend)
                setQuestions(data);
                setStep("interview");
            }

            // Enter Fullscreen
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                }
            } catch (err) { console.warn("Fullscreen request failed", err); }

        } catch (err) {
            alert(err.message);
            setStep("setup");
        }
    };

    const startInterview = async (forceNew = false) => {
        // Reset session state
        setAnswers([]);
        setCurrentQuestionIndex(0);
        setCurrentAnswer("");
        setTimer(0);
        setReport(null);

        // If we already have questions (from a previous attempt or retry fetch) and aren't forcing a fresh batch
        if (questions.length > 0 && !forceNew) {
            setStep("interview");
            return;
        }

        try {
            setLoadingMessage("Fetching Questions...");
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:5001/api/interview/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Failed to fetch questions');

            const data = await res.json();
            setQuestions(data);
            setStep("interview");

            // Enter Fullscreen (Screen Lock)
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
                    await document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
                    await document.documentElement.msRequestFullscreen();
                }
            } catch (err) {
                console.warn("Fullscreen request failed", err);
            }

        } catch (err) {
            alert(err.message);
            if (step === 'loading') setStep('setup');
        }
    };

    // Function to start interview from Analysis view
    const startInterviewFromAnalysis = async () => {
        setLoadingMessage("Generating Interview Questions...");
        setStep("loading");

        try {
            await startInterview();
        } catch (err) {
            console.error("Failed to start interview from analysis", err);
            setStep("setup");
        }
    };

    // Text-To-Speech & Cleanup
    useEffect(() => {
        if (step === "interview" && questions[currentQuestionIndex]) {
            const text = questions[currentQuestionIndex].question;
            const speech = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.cancel(); // Stop previous
            window.speechSynthesis.speak(speech);

            return () => window.speechSynthesis.cancel();
        }
    }, [step, currentQuestionIndex, questions]);

    // Exit Fullscreen on cleanup or when interview ends
    useEffect(() => {
        return () => {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.log(err)); // Ignore error if not in fullscreen
            }
        };
    }, []);

    // Focus Mode Toggle
    useEffect(() => {
        if (step === "interview") {
            document.body.classList.add("focus-mode");
        } else {
            document.body.classList.remove("focus-mode");
        }

        return () => document.body.classList.remove("focus-mode");
    }, [step]);

    const handleNextQuestion = () => {
        // Save current answer
        const currentQ = questions[currentQuestionIndex];
        const answerData = {
            questionId: currentQ._id,
            questionText: currentQ.question,
            category: currentQ.category,
            topic: currentQ.topic,
            idealAnswer: currentQ.answer,
            userAnswer: currentAnswer,
            timeTaken: timer
        };

        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = answerData;
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAnswer("");
            baseTextRef.current = "";
        } else {
            submitInterview(newAnswers);
        }
    };

    const handleFinishEarly = () => {
        // Save current answer and submit
        const currentQ = questions[currentQuestionIndex];
        const answerData = {
            questionId: currentQ._id,
            questionText: currentQ.question,
            category: currentQ.category,
            topic: currentQ.topic,
            idealAnswer: currentQ.answer,
            userAnswer: currentAnswer,
            timeTaken: timer
        };
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = answerData;
        setAnswers(newAnswers);

        if (window.confirm("Are you sure you want to end the interview early?")) {
            submitInterview(newAnswers);
        }
    };

    const submitInterview = async (finalAnswers) => {
        setLoadingMessage("Analyzing Interview...");
        setStep("loading");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://127.0.0.1:5001/api/interview/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: config.category,
                    topic: config.topic,
                    difficulty: config.difficulty,
                    resumeAnalysis: resumeAnalysis,
                    answers: finalAnswers
                })
            });

            if (!res.ok) throw new Error('Failed to submit interview');

            const data = await res.json();
            setReport(data);
            setStep("results");

            // Exit Fullscreen
            if (document.exitFullscreen) {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(err => console.log(err));
                }
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }

        } catch (err) {
            alert(err.message);
            setStep("interview"); // Go back on error?
        }
    };

    const downloadReport = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxLineWidth = pageWidth - margin * 2;
        let y = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Interview Analysis Report", margin, y);
        y += 10;

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Category: ${config.category}  |  Date: ${new Date().toLocaleDateString()}`, margin, y);
        y += 15;

        // Score
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Overall Score: ${report.overallScore.toFixed(1)} / 10`, margin, y);
        y += 20;

        doc.setLineWidth(0.5);
        doc.line(margin, y - 10, pageWidth - margin, y - 10);

        // Questions
        doc.setFontSize(12);

        report.questions.forEach((q, index) => {
            // Check page break
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            const qTitle = `Q${index + 1}: ${q.questionText} (${q.final_score}/10)`;
            const qLines = doc.splitTextToSize(qTitle, maxLineWidth);
            doc.text(qLines, margin, y);
            y += qLines.length * 7;

            // Check space for answers
            if (y > 270) { doc.addPage(); y = 20; }

            doc.setFont("helvetica", "normal");
            doc.setTextColor(50);
            const ansPrefix = "Your Answer: ";
            // Strip basic HTML if present or newlines? Usually plain text.
            const ansText = doc.splitTextToSize(ansPrefix + (q.userAnswer || "No answer"), maxLineWidth);
            doc.text(ansText, margin, y);
            y += ansText.length * 7;

            if (y > 270) { doc.addPage(); y = 20; }

            doc.setTextColor(100); // Greyer for ideal
            const idealPrefix = "Ideal Answer: ";
            const idealText = doc.splitTextToSize(idealPrefix + (q.idealAnswer || "N/A"), maxLineWidth);
            doc.text(idealText, margin, y);
            y += idealText.length * 7 + 10; // Extra spacing
        });

        doc.save(`Interview_Report_${config.category.replace(/,/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const toggleMic = () => {
        if (!recognitionRef.current) {
            alert("Browser does not support Speech Recognition.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            baseTextRef.current = currentAnswer;
            recognitionRef.current.start();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://127.0.0.1:5001/api/questions/categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                    if (data.length > 0 && !config.category) {
                        setConfig(prev => ({ ...prev, category: data[0] }));
                    }
                }
            } catch (err) {
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Topics when Category changes
    useEffect(() => {
        const fetchTopics = async () => {
            if (!config.category || config.category === 'Random') {
                setTopics([]);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://127.0.0.1:5001/api/questions/${encodeURIComponent(config.category)}/topics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTopics(data);
                    setConfig(prev => ({ ...prev, topic: "" }));
                }
            } catch (err) {
                console.error("Failed to load topics", err);
            }
        };
        fetchTopics();
    }, [config.category]);

    const renderSetup = () => {
        const selectedCats = config.category !== 'Random' ? config.category.split(',').map(c => c.trim()).filter(Boolean) : [];

        const handleDrop = (e) => {
            e.preventDefault(); setDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                handleResumeUploadProcess({ target: { files: [file] } });
                setResumeUploaded(true);
            }
        };

        return (
        <div style={{ paddingBottom: '80px', fontFamily: 'Outfit, sans-serif' }}>
            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
                @keyframes glow-pulse { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3);} 50%{box-shadow:0 0 40px rgba(139,92,246,0.6);} }
                @keyframes spin { to{transform:rotate(360deg);} }
                @keyframes float-orb { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-20px) scale(1.05);} }
                @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
                .setup-cat-btn { transition:all 0.25s cubic-bezier(0.16,1,0.3,1); cursor:pointer; position:relative; overflow:hidden; }
                .setup-cat-btn:hover { transform:translateY(-2px); }
                .setup-cat-btn.sel { box-shadow:0 0 20px rgba(99,102,241,0.4); }
                .range-tile { transition:all 0.3s cubic-bezier(0.16,1,0.3,1); cursor:pointer; position:relative; overflow:hidden; }
                .range-tile:hover { transform:translateY(-4px); }
                .range-tile.sel { animation:glow-pulse 2s ease-in-out infinite; }
                .tip-item:hover { border-color:rgba(255,255,255,0.15)!important; }
                .launch-btn:hover:not(:disabled) { transform:translateY(-3px) scale(1.01)!important; box-shadow:0 16px 40px rgba(99,102,241,0.7)!important; }
                .drop-zone-active { border-color:rgba(99,102,241,0.7)!important; background:rgba(99,102,241,0.08)!important; }
                .topic-chip:hover { transform:scale(1.05); }
                .sidebar-widget { transition:border-color 0.3s ease; }
                .sidebar-widget:hover { border-color:rgba(255,255,255,0.12)!important; }
            `}</style>

            {/* Ambient orbs */}
            <div style={{ position:'fixed', top:'10%', left:'5%', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(99,102,241,0.06),transparent 70%)', filter:'blur(60px)', pointerEvents:'none', animation:'float-orb 10s ease-in-out infinite', zIndex:0 }} />
            <div style={{ position:'fixed', bottom:'10%', right:'5%', width:'350px', height:'350px', background:'radial-gradient(circle,rgba(139,92,246,0.05),transparent 70%)', filter:'blur(70px)', pointerEvents:'none', animation:'float-orb 12s ease-in-out infinite reverse', zIndex:0 }} />

            <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'0 40px', position:'relative', zIndex:1 }}>

                {/* ── Page Header ── */}
                <div style={{ textAlign:'center', marginBottom:'56px', animation:'fadeUp 0.5s ease' }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'50px', padding:'8px 22px', marginBottom:'24px' }}>
                        <span style={{ fontSize:'14px' }}>🎯</span>
                        <span style={{ color:'#818cf8', fontSize:'13px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' }}>AI-Powered Mock Interview</span>
                    </div>
                    <h1 style={{ fontSize:'52px', fontWeight:'900', letterSpacing:'-2px', background:'linear-gradient(135deg, #fff 30%, #a5b4fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'12px' }}>
                        Start Your Session
                    </h1>
                    <p style={{ color:'#475569', fontSize:'18px', maxWidth:'560px', margin:'0 auto' }}>
                        Configure your interview, upload your résumé, and let AI do the rest.
                    </p>
                </div>

                {/* ── Two-column layout ── */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'32px', alignItems:'start' }}>

                    {/* LEFT — Main Config */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'28px', animation:'fadeUp 0.6s ease' }}>

                        {/* Resume Upload */}
                        <div
                            className={dragActive ? 'drop-zone-active' : ''}
                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            style={{ background:'rgba(255,255,255,0.02)', border:`2px dashed ${dragActive ? 'rgba(99,102,241,0.7)' : 'rgba(99,102,241,0.25)'}`, borderRadius:'24px', padding:'40px', transition:'all 0.3s ease', position:'relative', overflow:'hidden' }}
                        >
                            <div style={{ position:'absolute', top:'-20px', right:'-20px', fontSize:'120px', color:'rgba(99,102,241,0.03)', pointerEvents:'none' }}>📄</div>
                            <div style={{ display:'flex', alignItems:'flex-start', gap:'20px' }}>
                                <div style={{ width:'56px', height:'56px', background:'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', flexShrink:0, border:'1px solid rgba(99,102,241,0.25)' }}>📄</div>
                                <div style={{ flex:1 }}>
                                    <div style={{ fontWeight:'800', color:'#fff', fontSize:'20px', marginBottom:'6px' }}>Personalized Interview</div>
                                    <p style={{ color:'#475569', fontSize:'14px', lineHeight:'1.6', marginBottom:'20px' }}>
                                        Drop your PDF résumé here to generate questions tailored to your exact background and experience.
                                    </p>
                                    <label htmlFor="resume-upload" style={{ display:'inline-flex', alignItems:'center', gap:'10px', padding:'12px 24px', borderRadius:'50px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.35)', color:'#a5b4fc', fontWeight:'700', fontSize:'14px', cursor:'pointer', transition:'all 0.2s ease' }}
                                        onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background='rgba(99,102,241,0.12)'}
                                    >
                                        <span>📎</span>Choose PDF File
                                    </label>
                                    <input id="resume-upload" type="file" accept="application/pdf" onChange={e => { handleResumeUploadProcess(e); setResumeUploaded(true); }} style={{ display:'none' }} />
                                </div>
                            </div>
                            {dragActive && (
                                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(99,102,241,0.05)', borderRadius:'22px', fontSize:'18px', fontWeight:'700', color:'#818cf8' }}>
                                    Drop your résumé here ↓
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                            <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, rgba(255,255,255,0.06))' }} />
                            <span style={{ color:'#374151', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'2px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'50px', padding:'6px 18px' }}>or choose manually</span>
                            <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, rgba(255,255,255,0.06))' }} />
                        </div>

                        {/* Category Selector */}
                        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'24px', padding:'32px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
                                <div style={{ width:'40px', height:'40px', background:'rgba(99,102,241,0.12)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🎯</div>
                                <div>
                                    <div style={{ fontWeight:'800', color:'#fff', fontSize:'16px' }}>Target Categories</div>
                                    <div style={{ fontSize:'12px', color:'#374151' }}>Select one or more — multi-select supported</div>
                                </div>
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
                                <button
                                    className={`setup-cat-btn ${config.category === 'Random' ? 'sel' : ''}`}
                                    onClick={() => setConfig({ ...config, category:'Random', topic:'' })}
                                    style={{ padding:'12px 22px', borderRadius:'50px', border:`1px solid ${config.category === 'Random' ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`, background:config.category === 'Random' ? 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))' : 'rgba(255,255,255,0.03)', color:config.category === 'Random' ? '#c4b5fd' : '#64748b', fontSize:'14px', fontWeight:'700' }}
                                >
                                    🔀 Default Mix
                                </button>
                                {categories.length > 0 ? categories.map(cat => {
                                    const selCats = config.category.split(',').map(c => c.trim()).filter(c => c && c !== 'Random');
                                    const isSel = selCats.includes(cat);
                                    return (
                                        <button key={cat}
                                            className={`setup-cat-btn ${isSel ? 'sel' : ''}`}
                                            onClick={() => {
                                                let newCats = [...selCats];
                                                if (isSel) newCats = newCats.filter(c => c !== cat);
                                                else newCats.push(cat);
                                                setConfig({ ...config, category: newCats.length > 0 ? newCats.join(',') : 'Random', topic: newCats.length > 1 ? '' : config.topic });
                                            }}
                                            style={{ padding:'12px 22px', borderRadius:'50px', border:`1px solid ${isSel ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`, background:isSel ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.18))' : 'rgba(255,255,255,0.03)', color:isSel ? '#c4b5fd' : '#64748b', fontSize:'14px', fontWeight:'700' }}
                                        >{cat}</button>
                                    );
                                }) : <p style={{ color:'#374151', fontSize:'14px' }}>Loading categories...</p>}
                            </div>

                            {/* Topic selector */}
                            {topics.length > 0 && config.category !== 'Random' && !config.category.includes(',') && (
                                <div style={{ marginTop:'24px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.05)', animation:'fadeUp 0.4s ease' }}>
                                    <div style={{ fontSize:'12px', fontWeight:'700', color:'#ec4899', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'14px' }}>Specific Topic (Optional)</div>
                                    <select value={config.topic} onChange={e => setConfig({ ...config, topic:e.target.value })}
                                        style={{ width:'100%', padding:'14px 18px', borderRadius:'14px', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.08)', color:'#e2e8f0', fontSize:'15px', cursor:'pointer', appearance:'none', fontFamily:'Outfit,sans-serif' }}>
                                        <option value="" style={{ background:'#1e293b' }}>Any / Random Mix</option>
                                        {topics.map(t => <option key={t} value={t} style={{ background:'#1e293b' }}>{t}</option>)}
                                    </select>
                                </div>
                            )}

                            {topics.length > 0 && config.category.includes(',') && (
                                <div style={{ marginTop:'24px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.05)', animation:'fadeUp 0.4s ease' }}>
                                    <div style={{ fontSize:'12px', fontWeight:'700', color:'#ec4899', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'14px' }}>Topics (Multi-Select)</div>
                                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                                        {topics.map(t => {
                                            const selTopics = config.topic ? config.topic.split(',').map(s => s.trim()) : [];
                                            const isSel = selTopics.includes(t);
                                            return (
                                                <span key={t} className="topic-chip"
                                                    onClick={() => {
                                                        let nt = [...selTopics];
                                                        if (isSel) nt = nt.filter(x => x !== t); else nt.push(t);
                                                        setConfig({ ...config, topic:nt.join(',') });
                                                    }}
                                                    style={{ padding:'6px 14px', borderRadius:'20px', border:`1px solid ${isSel ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.08)'}`, background:isSel ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.03)', color:isSel ? '#f472b6' : '#64748b', fontSize:'13px', fontWeight:'700', cursor:'pointer', transition:'all 0.2s ease' }}
                                                >{t}</span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Question Count */}
                        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'24px', padding:'32px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
                                <div style={{ width:'40px', height:'40px', background:'rgba(16,185,129,0.12)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>🔢</div>
                                <div>
                                    <div style={{ fontWeight:'800', color:'#fff', fontSize:'16px' }}>Number of Questions</div>
                                    <div style={{ fontSize:'12px', color:'#374151' }}>Randomized from your chosen range · Will pick {config.count}</div>
                                </div>
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
                                {[
                                    { range:'5-10', label:'Quick', desc:'~10 min', emoji:'⚡' },
                                    { range:'10-15', label:'Standard', desc:'~20 min', emoji:'🎯' },
                                    { range:'15-20', label:'Deep Dive', desc:'~35 min', emoji:'🔬' }
                                ].map(({ range, label, desc, emoji }) => {
                                    const isSel = selectedRange === range;
                                    return (
                                        <button key={range} className={`range-tile ${isSel ? 'sel' : ''}`}
                                            onClick={() => {
                                                setSelectedRange(range);
                                                const [min, max] = range.split('-').map(Number);
                                                setConfig({ ...config, count: Math.floor(Math.random() * (max - min + 1)) + min });
                                            }}
                                            style={{ padding:'20px 16px', borderRadius:'18px', border:`1px solid ${isSel ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.06)'}`, background:isSel ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)', color:'#fff', cursor:'pointer', textAlign:'center', position:'relative', overflow:'hidden' }}
                                        >
                                            {isSel && <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(16,185,129,0.08),transparent)', pointerEvents:'none' }} />}
                                            <div style={{ fontSize:'28px', marginBottom:'10px' }}>{emoji}</div>
                                            <div style={{ fontSize:'22px', fontWeight:'900', color:isSel ? '#34d399' : '#e2e8f0', letterSpacing:'-0.5px', marginBottom:'4px' }}>{range}</div>
                                            <div style={{ fontSize:'13px', fontWeight:'700', color:isSel ? '#6ee7b7' : '#475569', marginBottom:'3px' }}>{label}</div>
                                            <div style={{ fontSize:'11px', color:'#374151' }}>{desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dev Mode Toggle */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.02)', padding:'22px 28px', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                                <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:devMode ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', border:`1px solid ${devMode ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`, transition:'all 0.3s ease' }}>
                                    <FaSpellCheck style={{ color: devMode ? '#10b981' : '#475569' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight:'800', color:'#fff', fontSize:'15px', marginBottom:'3px' }}>Developer Mode</div>
                                    <div style={{ fontSize:'12px', color:'#374151' }}>Shows ideal answers for scoring verification</div>
                                </div>
                            </div>
                            <div onClick={() => setDevMode(!devMode)}
                                style={{ width:'56px', height:'28px', padding:'4px', background:devMode ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.08)', borderRadius:'20px', position:'relative', cursor:'pointer', transition:'all 0.3s ease', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
                                <div style={{ width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', left:devMode ? '31px' : '4px', transition:'all 0.3s cubic-bezier(0.68,-0.55,0.265,1.55)', boxShadow:'0 2px 6px rgba(0,0,0,0.35)' }} />
                            </div>
                        </div>

                        {/* Launch CTA */}
                        <button className="launch-btn" onClick={() => startInterview(true)}
                            style={{ width:'100%', padding:'22px', borderRadius:'20px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', border:'none', color:'#fff', fontSize:'19px', fontWeight:'900', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'14px', boxShadow:'0 8px 30px rgba(99,102,241,0.5)', transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)', letterSpacing:'-0.3px' }}>
                            <span style={{ fontSize:'22px' }}>🚀</span>
                            Initialize Interview Session
                        </button>
                    </div>

                    {/* RIGHT — Sidebar */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'20px', animation:'fadeUp 0.7s ease', position:'sticky', top:'110px' }}>

                        {/* Pre-flight Checklist */}
                        <div className="sidebar-widget" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'22px', padding:'26px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                                <div style={{ width:'38px', height:'38px', background:'rgba(74,222,128,0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>✅</div>
                                <div style={{ fontWeight:'800', color:'#fff', fontSize:'15px' }}>Pre-flight Checklist</div>
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                                {[
                                    { icon:'🎙️', label:'Microphone working', color:'#4ade80' },
                                    { icon:'📶', label:'Stable connection', color:'#4ade80' },
                                    { icon:'🔇', label:'Quiet environment', color:'#4ade80' },
                                    { icon:'📄', label:'Résumé ready', color:'#4ade80' },
                                ].map((item, i) => (
                                    <div key={i} className="tip-item" style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 14px', borderRadius:'12px', background:'rgba(74,222,128,0.04)', border:'1px solid rgba(74,222,128,0.1)', transition:'border-color 0.2s ease' }}>
                                        <span style={{ fontSize:'16px' }}>{item.icon}</span>
                                        <span style={{ color:'#94a3b8', fontSize:'14px', fontWeight:'600' }}>{item.label}</span>
                                        <span style={{ marginLeft:'auto', color:item.color, fontSize:'12px' }}>●</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pro Tips */}
                        <div className="sidebar-widget" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'22px', padding:'26px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                                <div style={{ width:'38px', height:'38px', background:'rgba(251,191,36,0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>💡</div>
                                <div style={{ fontWeight:'800', color:'#fff', fontSize:'15px' }}>Pro Tips</div>
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                                {[
                                    'Maintain eye contact with your camera.',
                                    'Speak clearly at a moderate pace.',
                                    'Structure answers with context → action → result.',
                                    'Use the hint button when you are stuck.',
                                ].map((tip, i) => (
                                    <div key={i} style={{ display:'flex', gap:'10px', fontSize:'13px', color:'#94a3b8', lineHeight:'1.5' }}>
                                        <span style={{ color:'#fbbf24', flexShrink:0, fontWeight:'800' }}>{i+1}.</span>
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Platform Stats */}
                        <div className="sidebar-widget" style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.04))', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'22px', padding:'26px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
                                <div style={{ width:'38px', height:'38px', background:'rgba(99,102,241,0.12)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>📊</div>
                                <div style={{ fontWeight:'800', color:'#fff', fontSize:'15px' }}>Platform Stats</div>
                            </div>
                            {[
                                { label:'Sessions Today', value:'1,248', color:'#e2e8f0' },
                                { label:'AI Accuracy', value:'98.2%', color:'#4ade80' },
                                { label:'Avg Score Uplift', value:'+34%', color:'#818cf8' },
                                { label:'Questions DB', value:'10,000+', color:'#f472b6' },
                            ].map((s, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <span style={{ fontSize:'13px', color:'#475569', fontWeight:'600' }}>{s.label}</span>
                                    <span style={{ fontSize:'14px', fontWeight:'800', color:s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Session Summary Card */}
                        <div className="sidebar-widget" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'22px', padding:'26px' }}>
                            <div style={{ fontSize:'12px', fontWeight:'700', color:'#374151', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'16px' }}>Session Preview</div>
                            {[
                                { label:'Mode', value: config.category === 'Random' ? 'Mixed' : config.category },
                                { label:'Questions', value: config.count },
                                { label:'Topic', value: config.topic || 'Any' },
                                { label:'Dev Mode', value: devMode ? 'ON' : 'OFF' },
                            ].map((row, i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', pady:'6px', marginBottom:'10px' }}>
                                    <span style={{ fontSize:'13px', color:'#475569' }}>{row.label}</span>
                                    <span style={{ fontSize:'13px', fontWeight:'800', color:'#e2e8f0', maxWidth:'160px', textAlign:'right', textOverflow:'ellipsis', overflow:'hidden', whiteSpace:'nowrap' }}>{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const renderInterview = () => {
        if (!questions.length) return <div>Loading questions...</div>;
        const q = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        const isLast = currentQuestionIndex === questions.length - 1;
        const isYesNo = q.type === 'YesNo';

        return (
            <div className="interview-container" style={{ gap: 0 }}>
                <style>{`
                    @keyframes ivFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
                    @keyframes ivPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 70%{box-shadow:0 0 0 10px rgba(239,68,68,0)} }
                    @keyframes ivWave { 0%,100%{transform:scaleY(0.4)} 50%{transform:scaleY(1)} }
                    .iv-textarea:focus { border-color:rgba(99,102,241,0.7)!important; background:rgba(99,102,241,0.06)!important; box-shadow:0 0 0 4px rgba(99,102,241,0.12)!important; outline:none; }
                    .iv-textarea::placeholder { color:#374151; }
                    .iv-hint-btn:hover { background:rgba(251,191,36,0.2)!important; }
                    .iv-btn-end:hover   { background:rgba(255,255,255,0.1)!important; border-color:rgba(255,255,255,0.2)!important; }
                    .iv-btn-next:hover  { transform:translateY(-2px); box-shadow:0 12px 32px rgba(99,102,241,0.55)!important; }
                    .iv-yes-btn:hover, .iv-no-btn:hover { transform:scale(1.05); }
                    .iv-wave-bar { display:inline-block; width:3px; height:14px; background:#ef4444; border-radius:2px; animation:ivWave 0.6s ease-in-out infinite; }
                `}</style>

                {/* ── TOP STAT BAR ── */}
                <div style={{ display:'flex', alignItems:'center', gap:'0', background:'rgba(6,6,18,0.7)', backdropFilter:'blur(20px)', borderRadius:'24px 24px 0 0', border:'1px solid rgba(255,255,255,0.07)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'16px 32px', flexWrap:'wrap', rowGap:'12px' }}>
                    {/* Progress dots */}
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flex:1 }}>
                        {questions.map((_, i) => (
                            <div key={i} style={{ width: i <= currentQuestionIndex ? '28px' : '8px', height:'8px', borderRadius:'4px', background: i < currentQuestionIndex ? '#4ade80' : i === currentQuestionIndex ? 'linear-gradient(90deg,#6366f1,#a78bfa)' : 'rgba(255,255,255,0.1)', transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)', boxShadow: i === currentQuestionIndex ? '0 0 10px rgba(99,102,241,0.6)' : 'none' }} />
                        ))}
                    </div>
                    {/* Question count */}
                    <span style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap', marginRight:'24px' }}>
                        Q <span style={{ color:'#fff' }}>{currentQuestionIndex + 1}</span> / {questions.length}
                    </span>
                    {/* Type badge */}
                    <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'800', letterSpacing:'1px', textTransform:'uppercase', background: isYesNo ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.12)', color: isYesNo ? '#fbbf24' : '#a78bfa', border:`1px solid ${isYesNo ? 'rgba(251,191,36,0.25)' : 'rgba(99,102,241,0.25)'}`, marginRight:'20px' }}>
                        {isYesNo ? '⚡ Rapid Fire' : '📝 Descriptive'}
                    </span>
                    {/* Timer */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'50px', padding:'6px 16px' }}>
                        <FaClock style={{ color:'#818cf8', fontSize:'12px' }} />
                        <span style={{ fontSize:'15px', fontWeight:'800', color:'#c7d2fe', fontVariantNumeric:'tabular-nums', letterSpacing:'0.5px' }}>{formatTime(timer)}</span>
                    </div>
                </div>

                {/* ── PROGRESS FILL ── */}
                <div style={{ height:'3px', background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#6366f1,#a78bfa,#ec4899)', transition:'width 0.5s cubic-bezier(0.16,1,0.3,1)', boxShadow:'0 0 12px rgba(99,102,241,0.5)' }} />
                </div>

                {/* ── MAIN TWO-COLUMN BODY ── */}
                <div style={{ display:'grid', gridTemplateColumns: isYesNo ? '1fr' : '1fr 1.2fr', gap:'0', background:'rgba(8,8,20,0.75)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.06)', borderTop:'none', borderBottom:'none', animation:'ivFadeUp 0.4s ease both' }}>

                    {/* ── LEFT: Question Panel ── */}
                    <div style={{ padding:'36px', borderRight: isYesNo ? 'none' : '1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', gap:'24px' }}>

                        {/* Question number label */}
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                            <div style={{ width:'36px', height:'36px', borderRadius:'12px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'900', color:'#fff', boxShadow:'0 4px 14px rgba(99,102,241,0.4)', flexShrink:0 }}>
                                {currentQuestionIndex + 1}
                            </div>
                            <div>
                                <div style={{ fontSize:'11px', fontWeight:'800', color:'#6366f1', textTransform:'uppercase', letterSpacing:'1.5px' }}>Current Question</div>
                                <div style={{ fontSize:'12px', color:'#374151', marginTop:'1px' }}>{Math.round(progress)}% complete</div>
                            </div>
                        </div>

                        {/* Question text */}
                        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'28px', flex: isYesNo ? 0 : 1 }}>
                            <p style={{ color:'#f1f5f9', fontSize:'18px', fontWeight:'600', lineHeight:'1.7', margin:0, letterSpacing:'-0.1px' }}>
                                {q.question}
                            </p>
                        </div>

                        {/* Tags */}
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                            {q.category && (
                                <span style={{ padding:'5px 14px', borderRadius:'20px', fontSize:'11px', fontWeight:'800', background:'rgba(99,102,241,0.12)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.2)', letterSpacing:'0.5px', textTransform:'uppercase' }}>
                                    # {q.category}
                                </span>
                            )}
                            {q.topic && (
                                <span style={{ padding:'5px 14px', borderRadius:'20px', fontSize:'11px', fontWeight:'800', background:'rgba(16,185,129,0.12)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)', letterSpacing:'0.5px', textTransform:'uppercase' }}>
                                    {q.topic}
                                </span>
                            )}
                        </div>

                        {/* Hint / Debug */}
                        {!isYesNo && (
                            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                                <button className="iv-hint-btn" onClick={getHint} disabled={hintLoading}
                                    style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', color:'#fbbf24', padding:'10px 18px', borderRadius:'50px', cursor:'pointer', fontSize:'13px', fontWeight:'700', display:'flex', alignItems:'center', gap:'8px', width:'fit-content', transition:'all 0.2s ease' }}>
                                    <FaLightbulb />{hintLoading ? 'Fetching hint...' : '💡 Get AI Hint'}
                                </button>
                                {hint && (
                                    <div style={{ padding:'16px 20px', background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.18)', borderLeft:'3px solid #fbbf24', borderRadius:'14px', color:'#fde68a', fontSize:'14px', lineHeight:'1.7', animation:'ivFadeUp 0.3s ease' }}>
                                        <strong style={{ color:'#fbbf24', display:'block', marginBottom:'4px', fontSize:'11px', letterSpacing:'1px', textTransform:'uppercase' }}>💡 Hint</strong>
                                        {hint}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Debug */}
                        {devMode && (
                            <div style={{ padding:'20px', background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.15)', borderLeft:'3px solid #38bdf8', borderRadius:'14px', animation:'ivFadeUp 0.3s ease' }}>
                                <div style={{ color:'#38bdf8', fontWeight:'800', fontSize:'11px', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px', display:'flex', alignItems:'center', gap:'6px' }}>
                                    <FaSpellCheck /> Debug · Ideal Answer
                                </div>
                                <p style={{ margin:'0 0 12px', lineHeight:'1.6', color:'#bae6fd', fontSize:'14px' }}>{q.answer}</p>
                                <button onClick={() => setCurrentAnswer(q.answer)}
                                    style={{ background:'rgba(56,189,248,0.15)', border:'1px solid rgba(56,189,248,0.3)', color:'#7dd3fc', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                                    <FaTerminal style={{ fontSize:'10px' }} /> Auto-fill
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: Answer Panel ── */}
                    <div style={{ padding:'36px', display:'flex', flexDirection:'column', gap:'20px' }}>
                        {isYesNo ? (
                            <div style={{ display:'flex', gap:'20px', justifyContent:'center', alignItems:'center', flex:1, minHeight:'200px' }}>
                                {['Yes','No'].map(opt => (
                                    <button key={opt} className={opt === 'Yes' ? 'iv-yes-btn' : 'iv-no-btn'}
                                        onClick={() => setCurrentAnswer(opt)}
                                        style={{ width:'140px', height:'80px', borderRadius:'20px', fontSize:'20px', fontWeight:'900', cursor:'pointer', border:'2px solid', transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)', background: currentAnswer === opt ? (opt==='Yes' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)') : 'rgba(255,255,255,0.04)', borderColor: currentAnswer === opt ? (opt==='Yes' ? '#4ade80' : '#f87171') : 'rgba(255,255,255,0.1)', color: currentAnswer === opt ? (opt==='Yes' ? '#4ade80' : '#f87171') : '#64748b', boxShadow: currentAnswer === opt ? `0 8px 24px rgba(${opt==='Yes'?'74,222,128':'248,113,113'},0.3)` : 'none' }}>
                                        {opt === 'Yes' ? '✓ YES' : '✗ NO'}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Answer label row */}
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                    <div style={{ fontSize:'11px', fontWeight:'800', color:'#374151', textTransform:'uppercase', letterSpacing:'2px' }}>Your Answer</div>
                                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                        {isListening && (
                                            <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'50px', padding:'4px 12px' }}>
                                                {[1,2,3,4].map(i => (
                                                    <span key={i} className="iv-wave-bar" style={{ animationDelay:`${i*0.1}s`, height:`${8+i*3}px` }} />
                                                ))}
                                                <span style={{ color:'#f87171', fontSize:'11px', fontWeight:'700', marginLeft:'4px' }}>Recording</span>
                                            </div>
                                        )}
                                        <span style={{ fontSize:'12px', color:'#374151', fontVariantNumeric:'tabular-nums' }}>
                                            {currentAnswer.length} chars
                                        </span>
                                    </div>
                                </div>

                                {/* Textarea */}
                                <div style={{ position:'relative', flex:1, display:'flex', flexDirection:'column' }}>
                                    <textarea
                                        className="iv-textarea"
                                        placeholder="Type your answer here, or click the microphone to speak..."
                                        value={currentAnswer}
                                        onChange={(e) => setCurrentAnswer(e.target.value)}
                                        style={{ flex:1, width:'100%', minHeight:'260px', padding:'20px 20px 68px 20px', borderRadius:'20px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', resize:'none', fontSize:'15px', color:'#e2e8f0', lineHeight:'1.75', fontFamily:'Outfit, sans-serif', transition:'all 0.3s ease', boxSizing:'border-box' }}
                                    />
                                    {/* Mic button inside textarea */}
                                    <div className={`mic-icon ${isListening ? "active" : ""}`} onClick={toggleMic} title={isListening ? "Stop" : "Speak"}
                                        style={{ position:'absolute', right:'16px', bottom:'16px', width:'46px', height:'46px', borderRadius:'50%', background: isListening ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.15)', border:`2px solid ${isListening ? 'rgba(239,68,68,0.5)' : 'rgba(99,102,241,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.3s ease', animation: isListening ? 'ivPulse 1.5s infinite' : 'none' }}>
                                        {isListening ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── ACTION FOOTER ── */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(6,6,18,0.7)', backdropFilter:'blur(20px)', borderRadius:'0 0 24px 24px', border:'1px solid rgba(255,255,255,0.07)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'20px 32px', gap:'16px' }}>
                    <button className="iv-btn-end" onClick={handleFinishEarly}
                        style={{ padding:'12px 24px', borderRadius:'50px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontSize:'14px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s ease' }}>
                        ✕ End Session
                    </button>

                    {/* Center: question navigation dots */}
                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                        {questions.map((_,i) => (
                            <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background: i === currentQuestionIndex ? '#6366f1' : i < currentQuestionIndex ? '#4ade80' : 'rgba(255,255,255,0.15)', transition:'all 0.3s ease' }} />
                        ))}
                    </div>

                    <button className="iv-btn-next" onClick={handleNextQuestion}
                        style={{ padding:'12px 32px', borderRadius:'50px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', border:'none', color:'#fff', fontSize:'15px', fontWeight:'800', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 6px 20px rgba(99,102,241,0.4)', transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)', letterSpacing:'-0.2px' }}>
                        {isLast ? '🏁 Finish & Submit' : 'Next Question →'}
                    </button>
                </div>
            </div>
        );
    };



    const renderLoading = () => (
        <div className="interview-container">
            <div className="glass-panel-premium loading-card" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>{loadingMessage}</h2>
                <div className="spinner"></div>
                <p>Please wait while we process your request.</p>
            </div>
        </div>
    );

    const renderResults = () => {
        if (!report) return <div>No report data found.</div>;
        const questionsData = report.questions || [];

        return (
            <div className="report-page">
                <div className="report-container-premium">
                    
                    {/* Hero Section */}
                    <div className="premium-header">
                        <h1 className="premium-title">Deep Analysis Report</h1>
                        <p className="premium-subtitle">{config.category} • {questionsData.length} Evaluated Scenarios</p>
                    </div>

                    <div className="hero-score-wrapper">
                        <div className="score-circle-container">
                            <svg className="score-svg" style={{ '--target-offset': 816 - (816 * Math.min(10, report.overallScore) / 10) }}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <circle className="score-bg" cx="140" cy="140" r="130" />
                                <circle className="score-progress" cx="140" cy="140" r="130" />
                            </svg>
                            <div className="score-content">
                                <div className="score-number">{Math.min(10, report.overallScore).toFixed(1)}</div>
                                <div className="score-denominator">/ 10</div>
                            </div>
                        </div>
                    </div>

                    {/* Archived Resume Analysis if available */}
                    {resumeAnalysis && (
                        <div className="bento-card" style={{ marginBottom: '60px' }}>
                            <div className="bento-title" style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '16px' }}>
                                <FaSpellCheck style={{ color: 'var(--primary)', marginRight: '8px' }} /> Session Profile Breakdown
                            </div>
                            <p style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '24px' }}>{resumeAnalysis.summary}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                                {resumeAnalysis.skills && (
                                    <div>
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Detected Skills</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {resumeAnalysis.skills.map(s => (
                                                <span key={s} className="premium-metric-badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.2)' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {resumeAnalysis.categories && (
                                    <div>
                                        <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Recommended Focus</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {resumeAnalysis.categories.map(c => (
                                                <span key={c} className="premium-metric-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.2)' }}>{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bento Stats */}
                    <div className="bento-stats">
                        <div className="bento-card">
                            <div className="bento-title"><FaBrain style={{ color: 'var(--primary)' }} /> Proficiency Level</div>
                            <div className="bento-value">
                                {report.overallScore >= 8 ? "Expert" : report.overallScore >= 6 ? "Skilled" : "Beginner"}
                            </div>
                        </div>
                        <div className="bento-card">
                            <div className="bento-title"><FaClock style={{ color: '#34d399' }} /> Time Efficiency</div>
                            <div className="bento-value">Optimal</div>
                        </div>
                        <div className="bento-card">
                            <div className="bento-title"><FaLightbulb style={{ color: '#facc15' }} /> Next Steps</div>
                            <div className="bento-value">{report.overallScore >= 7 ? "Go Live" : "Revise"}</div>
                        </div>
                    </div>

                    <h3 className="section-title" style={{ marginBottom: '40px', fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <FaChartLine style={{ color: 'var(--primary)' }} /> Point-by-Point Analysis
                    </h3>

                    {/* Timeline Q&A */}
                    <div className="qa-timeline-container">
                        {questionsData.map((q, idx) => (
                            <div key={idx} className="timeline-item">
                                <div className="timeline-dot">{idx + 1}</div>
                                <div className="qa-premium-card" style={{ borderLeft: `6px solid ${q.final_score >= 7 ? '#34d399' : q.final_score >= 4 ? '#fbbf24' : '#f87171'}` }}>
                                    
                                    <div className="qa-header">
                                        <div className="qa-question-text">{q.questionText}</div>
                                        <div className="score-pill-container">
                                            <span className="qa-score-pill" style={{ color: q.final_score >= 7 ? '#34d399' : q.final_score >= 4 ? '#fbbf24' : '#f87171' }}>
                                                {q.final_score.toFixed(1)} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>/ 10</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Attributes row */}
                                    <div className="metrics-row" style={{ marginBottom: '32px' }}>
                                        {q.category && <span className="premium-metric-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)' }}>{q.category}</span>}
                                        {q.topic && <span className="premium-metric-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{q.topic}</span>}
                                        <span className="premium-metric-badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                                            ACCURACY: {Math.round((q.accuracy_score || 0) * 100)}%
                                        </span>
                                        <span className="premium-metric-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                            TIME: {q.timeTaken ? `${q.timeTaken}s` : '0s'}
                                        </span>
                                    </div>

                                    <div className="response-bubble">
                                        <div className="response-label">Your Response</div>
                                        <div className="response-text">
                                            {q.userAnswer ? `"${q.userAnswer}"` : <span style={{ fontStyle: 'italic', color: '#f87171' }}>You skipped this.</span>}
                                        </div>
                                    </div>

                                    {/* Feedback Drawers */}
                                    <div className="feedback-drawers">
                                        {(q.aiImprovedAnswer || q.aiAdvice) && (
                                            <div>
                                                <button 
                                                    className={`drawer-toggle ${expandedAI[idx] ? 'active ai' : ''}`}
                                                    onClick={() => setExpandedAI(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaLightbulb /> AI Strategic Expansion</span>
                                                    <span>{expandedAI[idx] ? '▲' : '▼'}</span>
                                                </button>
                                                {expandedAI[idx] && (
                                                    <div className="drawer-content ai" style={{ marginTop: '8px' }}>
                                                        {q.aiImprovedAnswer && (
                                                            <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#c084fc', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Generated Response</div>
                                                                <div>{q.aiImprovedAnswer}</div>
                                                            </div>
                                                        )}
                                                        {q.aiAdvice && (
                                                            <div>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#a78bfa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actionable Advice</div>
                                                                <div>{q.aiAdvice}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {q.idealAnswer && (
                                            <div>
                                                <button 
                                                    className={`drawer-toggle ${expandedDB[idx] ? 'active db' : ''}`}
                                                    onClick={() => setExpandedDB(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FaCheckCircle /> Database Benchmark</span>
                                                    <span>{expandedDB[idx] ? '▲' : '▼'}</span>
                                                </button>
                                                {expandedDB[idx] && (
                                                    <div className="drawer-content db" style={{ marginTop: '8px' }}>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#6ee7b7', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ideal Benchmark</div>
                                                        <div>{q.idealAnswer}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {q.explanation && (
                                        <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                <FaLightbulb /> Evaluation Rationale
                                            </div>
                                            <p style={{ margin: 0, fontSize: '1.05rem', color: '#a7f3d0', lineHeight: '1.7' }}>
                                                {q.explanation}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Sticky Action Bar */}
                <div className="sticky-action-bar">
                    <button className="btn-premium-primary" onClick={() => startInterview()}>
                        <FaRedo /> Retake Session
                    </button>
                    <button className="btn-premium-primary" onClick={() => setStep('deep_analysis')} style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)' }}>
                        <FaBrain /> Deep Analysis
                    </button>
                    <button className="btn-premium-secondary" onClick={downloadReport}>
                        <FaChartLine /> Export PDF
                    </button>
                    <button className="btn-premium-secondary" onClick={() => window.location.href = '/dashboard'}>
                        <FaHome /> Return Home
                    </button>
                </div>
            </div>
        );
    };

    const renderAnalysis = () => (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'var(--bg-dark)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto'
        }}>
            <div className="glass-card" style={{ maxWidth: '800px', width: '90%', padding: '40px', animation: 'fadeIn 0.5s ease', margin: '40px 0' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Resume Analysis
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    AI-powered breakdown of {resumeAnalysis?.name || "Candidate"}'s profile
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '12px', fontSize: '1.1rem' }}>Executive Summary</h3>
                    <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>{resumeAnalysis?.summary}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <div>
                        <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Detected Skills</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {resumeAnalysis?.skills && resumeAnalysis.skills.map(skill => (
                                <span key={skill} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '12px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Focus</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {resumeAnalysis?.categories && resumeAnalysis.categories.map(cat => (
                                <span key={cat} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-group" style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '12px', display: 'block' }}>NUMBER OF QUESTIONS</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {['5-10', '10-15', '15-20'].map(range => (
                            <button
                                key={range}
                                onClick={() => {
                                    setSelectedRange(range);
                                    const [min, max] = range.split('-').map(Number);
                                    const randomCount = Math.floor(Math.random() * (max - min + 1)) + min;
                                    setConfig({ ...config, count: randomCount });
                                }}
                                className={`range-btn ${selectedRange === range ? 'active' : ''}`}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: `1px solid ${selectedRange === range ? '#10b981' : 'var(--glass-border)'}`,
                                    background: selectedRange === range ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    color: selectedRange === range ? '#10b981' : '#cbd5e1',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button
                        onClick={() => setStep("setup")}
                        className="btn-premium-secondary"
                        style={{ padding: '12px 24px' }}
                    >
                        Adjust Settings
                    </button>
                    <button
                        onClick={startInterviewFromAnalysis}
                        className="btn-premium-primary"
                        style={{ padding: '12px 32px' }}
                    >
                        Start Interview &rarr;
                    </button>
                </div>
            </div>
        </div>
    );

    if (step === "results") return renderResults();
    if (step === "deep_analysis") return <DeepAnalysis report={report} onBack={() => setStep("results")} />;

    return (
        <div className="interview-page">
            {step === "analysis" && renderAnalysis()}
            {step === "setup" && renderSetup()}
            {step === "interview" && renderInterview()}
            {step === "loading" && renderLoading()}
        </div>
    );
}
