import { useState, useEffect, useRef } from "react";
import "../styles/interview.css";
import "../styles/report.css";
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaClock, FaCommentDots, FaSpellCheck, FaHome, FaRedo } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    const [resumeAnalysis, setResumeAnalysis] = useState(null); // New state for resume analysis data
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [timer, setTimer] = useState(0); // Seconds per question
    const [report, setReport] = useState(null);

    const baseTextRef = useRef("");
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    // Parse URL params for "Retry" functionality
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        const diff = params.get('difficulty');

        if (cat || diff) {
            setConfig(prev => ({
                ...prev,
                category: cat || prev.category,
                difficulty: diff || prev.difficulty
            }));
            // Optional: auto-start or stay in setup? User said "try again button", 
            // staying in setup with pre-filled values is safer but let's see if 
            // they want direct jump. For now, pre-fill is good.
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
            const res = await fetch('http://localhost:5001/api/resume/upload', {
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

    const startInterview = async () => {
        try {
            setLoadingMessage("Fetching Questions...");
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/interview/start', {
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
            const res = await fetch('http://localhost:5001/api/interview/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: config.category,
                    difficulty: config.difficulty,
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
                const res = await fetch('http://localhost:5001/api/questions/categories', {
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
                const res = await fetch(`http://localhost:5001/api/questions/${encodeURIComponent(config.category)}/topics`, {
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

    const renderSetup = () => (
        <div className="interview-container">
            <div className="main-layout">
                <aside className="sidebar-panel">
                    <div className="widget-card">
                        <h4>💡 Pro Tips</h4>
                        <p>Maintain eye contact with your camera and speak clearly at a moderate pace.</p>
                    </div>
                    <div className="widget-card">
                        <h4>✅ Checklist</h4>
                        <ul style={{ listStyle: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            <li>• Check Microphone</li>
                            <li>• Stable Connection</li>
                            <li>• Quiet Environment</li>
                            <li>• Updated Resume</li>
                        </ul>
                    </div>
                    <div className="widget-card">
                        <h4>📊 Platform Stats</h4>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <span style={{ fontSize: '13px', color: '#888' }}>Sessions Today</span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>1,248</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '13px', color: '#888' }}>AI Accuracy</span>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80' }}>98.2%</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="content-main">
                    <div className="interview-card setup-card">
                        <h2 style={{ marginBottom: '32px', fontSize: '32px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Start Interview Session</h2>

                        <div className="resume-upload-section" style={{ marginBottom: '32px', padding: '32px', border: '2px dashed var(--glass-border)', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.02)' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>📄 Personalized Interview</h3>
                            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>Upload your resume to generate questions tailored precisely to your background and experience.</p>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleResumeUploadProcess}
                                style={{ display: 'block', width: '100%', padding: '16px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '32px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '14px' }}>OR CHOOSE MANUALLY</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)', marginBottom: '12px', display: 'block' }}>TARGET CATEGORIES (Multi-Select)</label>
                            <div className="category-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                <button
                                    className={`cat-btn ${config.category === 'Random' ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, category: 'Random', topic: '' })}
                                    style={{
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        background: config.category === 'Random' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                >
                                    Default Selection
                                </button>
                                {categories.length > 0 ? categories.map(cat => {
                                    const selectedCats = config.category.split(',').map(c => c.trim()).filter(c => c && c !== 'Random');
                                    const isSelected = selectedCats.includes(cat);

                                    return (
                                        <button
                                            key={cat}
                                            className={`cat-btn ${isSelected ? 'active' : ''}`}
                                            onClick={() => {
                                                let newCats = [...selectedCats];
                                                if (isSelected) {
                                                    newCats = newCats.filter(c => c !== cat);
                                                } else {
                                                    newCats.push(cat);
                                                }
                                                const newCategoryString = newCats.length > 0 ? newCats.join(',') : 'Random';
                                                const newTopic = newCats.length > 1 ? '' : config.topic;
                                                setConfig({ ...config, category: newCategoryString, topic: newTopic });
                                            }}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--glass-border)'}`,
                                                background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                                color: '#fff',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    )
                                }) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Syncing categories...</p>}
                            </div>
                        </div>

                        {/* SUBTOPIC DROPDOWN - Hybrid Approach */}
                        {topics.length > 0 && config.category !== 'Random' && !config.category.includes(',') && (
                            <div className="form-group" style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent)', marginBottom: '12px', display: 'block' }}>SPECIFIC TOPIC (OPTIONAL)</label>
                                <select
                                    value={config.topic}
                                    onChange={e => setConfig({ ...config, topic: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        appearance: 'none'
                                    }}
                                >
                                    <option value="" style={{ background: '#1e293b' }}>Any / Random Mix</option>
                                    {topics.map(t => (
                                        <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Multi-Topic Grid (if multiple categories selected) */}
                        {topics.length > 0 && config.category.includes(',') && (
                            <div className="form-group" style={{ marginBottom: '32px', animation: 'fadeIn 0.5s ease' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent)', marginBottom: '12px', display: 'block' }}>SPECIFIC TOPICS (Optional, Multi-Select)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {topics.map(t => {
                                        const selectedTopics = config.topic ? config.topic.split(',').map(s => s.trim()) : [];
                                        const isSelected = selectedTopics.includes(t);
                                        return (
                                            <button
                                                key={t}
                                                onClick={() => {
                                                    let newTopics = [...selectedTopics];
                                                    if (isSelected) {
                                                        newTopics = newTopics.filter(topic => topic !== t);
                                                    } else {
                                                        newTopics.push(t);
                                                    }
                                                    setConfig({ ...config, topic: newTopics.join(',') });
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--glass-border)'}`,
                                                    background: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                                                    color: isSelected ? '#fff' : '#cbd5e1',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {t}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '32px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '12px', display: 'block' }}>NUMBER OF QUESTIONS (Randomized Range)</label>
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
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: `1px solid ${selectedRange === range ? '#10b981' : 'var(--glass-border)'}`,
                                            background: selectedRange === range ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                            color: selectedRange === range ? '#10b981' : '#cbd5e1',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                System will select {config.count} questions.
                            </p>
                        </div>
                        <button
                            className="btn primary"
                            onClick={startInterview}
                            style={{
                                padding: '20px',
                                borderRadius: '16px',
                                fontSize: '18px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            Initialize Session
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );

    const renderInterview = () => {
        if (!questions.length) return <div>Loading questions...</div>;
        const q = questions[currentQuestionIndex];

        return (
            <div className="interview-container">
                <div className="interview-card">
                    <div className="interview-header">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span className="badge" style={{
                            marginLeft: '10px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.1)',
                            fontSize: '0.8em',
                            color: '#cbd5e1'
                        }}>
                            {q.type === 'YesNo' ? 'Rapid Fire' : 'Descriptive'}
                        </span>
                        <span style={{ marginLeft: 'auto' }}>{formatTime(timer)}</span>
                    </div>

                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>

                    <div className="question-box">
                        <p><strong>Question:</strong> {q.question}</p>
                    </div>

                    <div className="answer-box">
                        {q.type === 'YesNo' ? (
                            <div className="yes-no-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'center', height: '200px', alignItems: 'center' }}>
                                <button
                                    className={`btn ${currentAnswer === 'Yes' ? 'primary' : 'secondary'}`}
                                    onClick={() => setCurrentAnswer('Yes')}
                                    style={{ width: '120px', fontSize: '1.2rem', padding: '15px' }}
                                >
                                    YES
                                </button>
                                <button
                                    className={`btn ${currentAnswer === 'No' ? 'primary' : 'secondary'}`}
                                    onClick={() => setCurrentAnswer('No')}
                                    style={{ width: '120px', fontSize: '1.2rem', padding: '15px' }}
                                >
                                    NO
                                </button>
                            </div>
                        ) : (
                            <>
                                <textarea
                                    placeholder="Type or speak your answer here..."
                                    value={currentAnswer}
                                    onChange={(e) => setCurrentAnswer(e.target.value)}
                                />
                                <div
                                    className={`mic-icon ${isListening ? "active" : ""}`}
                                    onClick={toggleMic}
                                    title={isListening ? "Stop listening" : "Start listening"}
                                >
                                    {isListening ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button className="btn secondary" onClick={handleFinishEarly} style={{ marginRight: 'auto' }}>
                            End Session
                        </button>
                        <button className="btn primary" onClick={handleNextQuestion}>
                            {currentQuestionIndex === questions.length - 1 ? "Finish & Submit" : "Next Question"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderLoading = () => (
        <div className="interview-container">
            <div className="interview-card loading-card" style={{ textAlign: 'center' }}>
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
            <div className="report-page" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100, height: 'auto', minHeight: '100vh', padding: '120px 5%' }}>
                <div className="detail-container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.95)', padding: '48px', borderRadius: '32px', border: '1px solid var(--glass-border)', backdropFilter: 'blur(40px)' }}>

                    {/* Header */}
                    <div className="report-header" style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="report-meta">
                            <h1 style={{ fontSize: '40px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Deep Analysis Report</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>{config.category} • {questionsData.length} Evaluated Scenarios</p>
                        </div>
                        <div className="badge positive" style={{ fontSize: '2rem', padding: '20px 40px', borderRadius: '24px', background: 'var(--primary)', boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)' }}>
                            {Math.min(10, report.overallScore).toFixed(1)} <span style={{ fontSize: '1rem', opacity: 0.8 }}>/ 10</span>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                        <div className="stat-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                            <div className="stat-title" style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', marginBottom: '12px' }}>Proficiency Level</div>
                            <div className="stat-value" style={{ fontSize: '32px', fontWeight: '700' }}>
                                {report.overallScore >= 8 ? "Expert" : report.overallScore >= 6 ? "Skilled" : "Beginner"}
                            </div>
                        </div>
                        <div className="stat-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                            <div className="stat-title" style={{ color: 'var(--accent)', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', marginBottom: '12px' }}>Time Efficiency</div>
                            <div className="stat-value" style={{ fontSize: '32px', fontWeight: '700' }}>Optimal</div>
                        </div>
                        <div className="stat-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
                            <div className="stat-title" style={{ color: '#4ade80', fontWeight: '600', textTransform: 'uppercase', fontSize: '12px', marginBottom: '12px' }}>Next Steps</div>
                            <div className="stat-value" style={{ fontSize: '32px', fontWeight: '700' }}>{report.overallScore >= 7 ? "Go Live" : "Revise"}</div>
                        </div>
                    </div>

                    {/* Detailed Metrics Breakdown */}
                    {(() => {
                        const metrics = report.questions.reduce((acc, q) => {
                            acc.relevance += (q.relevance_score || 0);
                            acc.communication += (q.communication_score || 0);
                            acc.confidence += (q.confidence_score || 0);
                            acc.responseTime += (q.response_time_score || 0);
                            return acc;
                        }, { relevance: 0, communication: 0, confidence: 0, responseTime: 0 });

                        const qCount = report.questions.length || 1;

                        return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                                {[
                                    { label: 'Relevance', score: metrics.relevance / qCount, color: '#3b82f6' },
                                    { label: 'Communication', score: metrics.communication / qCount, color: '#a855f7' },
                                    { label: 'Confidence', score: metrics.confidence / qCount, color: '#ef4444' },
                                ].map(metric => (
                                    <div key={metric.label} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>{metric.label}</span>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: metric.color }}>{metric.score.toFixed(1)}/10</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${metric.score * 10}%`, background: metric.color, transition: 'width 1s ease' }}></div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>Response Time</span>
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                                            {(metrics.responseTime / qCount).toFixed(1)}/10
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {(metrics.responseTime / qCount >= 8) ? "Optimal Pace" : "Needs Adjustment"}
                                    </div>
                                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
                                        <div style={{ height: '100%', width: `${(metrics.responseTime / qCount) * 10}%`, background: '#10b981', transition: 'width 1s ease' }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <h3 className="section-title" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px' }}><FaLightbulb color="var(--primary)" /> Point-by-Point Feedback</h3>

                    <div className="questions-analysis" style={{ display: 'grid', gap: '24px' }}>
                        {questionsData.map((q, idx) => (
                            <div key={idx} className="qa-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', borderLeft: `6px solid ${q.final_score >= 7 ? '#2ed573' : q.final_score >= 4 ? '#facc15' : '#ff4757'}`, borderTop: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                    <div className="qa-question" style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Scenario {idx + 1}: {q.questionText}</div>
                                    <span style={{ padding: '8px 20px', borderRadius: '12px', background: q.final_score >= 7 ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 71, 87, 0.2)', color: q.final_score >= 7 ? '#2ed573' : '#ff4757', fontWeight: '700' }}>
                                        {q.final_score}/10
                                    </span>
                                </div>

                                <div className="qa-answer" style={{ marginBottom: '20px', color: q.userAnswer ? '#cbd5e1' : '#f87171', fontSize: '16px', lineHeight: '1.6' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '12px', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>YOUR RESPONSE</span>
                                    {q.userAnswer ? `"${q.userAnswer}"` : <span style={{ fontStyle: 'italic' }}>You skipped this</span>}
                                </div>

                                <div className="qa-answer" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#a5b4fc', marginBottom: '24px' }}>
                                    <span style={{ color: '#818cf8', fontWeight: '700', fontSize: '12px', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>AI RECOMMENDED ANSWER</span>
                                    {q.idealAnswer || "The specific ideal data for this custom question is currently being generated."}
                                </div>

                                <div className="metrics-badges" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                                    <span className="badge score" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', fontSize: '12px', color: 'var(--primary)', fontWeight: '700', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                        Score: {q.final_score}/10
                                    </span>
                                    <span className="badge time" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', fontSize: '12px', color: '#10b981', fontWeight: '700', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <FaClock style={{ marginRight: '6px' }} /> {q.timeTaken ? `${q.timeTaken}s` : '0s'}
                                    </span>
                                    <span className="badge similarity" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', fontSize: '12px', color: '#38bdf8', fontWeight: '700', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                        Match: {Math.round((q.similarity_score || 0) * 100)}%
                                    </span>
                                    <span className="badge tone" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.1)', fontSize: '12px', color: '#ec4899', fontWeight: '700', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                                        Keywords: {Math.round((q.keyword_score || 0) * 100)}%
                                    </span>
                                    <span className="badge rel" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', fontSize: '11px', color: '#3b82f6', fontWeight: '700' }}>
                                        Rel: {q.relevance_score || 0}/10
                                    </span>
                                    <span className="badge comm" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', fontSize: '11px', color: '#a855f7', fontWeight: '700' }}>
                                        Comm: {q.communication_score || 0}/10
                                    </span>
                                    <span className="badge conf" style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>
                                        Conf: {q.confidence_score || 0}/10
                                    </span>
                                </div>

                                {q.aiOverview && (
                                    <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.1)', animation: 'fadeIn 0.5s ease' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                            <FaLightbulb /> AI Strategic Overview
                                        </div>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#bbf7d0', lineHeight: '1.6' }}>
                                            {q.aiOverview}
                                        </p>
                                    </div>
                                )}

                                {q.grammar_issues && q.grammar_issues.length > 0 && (
                                    <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FaSpellCheck /> GRAMMAR FEEDBACK
                                        </div>
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#fca5a5' }}>
                                            {q.grammar_issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="action-buttons" style={{ marginTop: '60px', justifyContent: 'center', gap: '20px' }}>
                        <button className="btn primary" onClick={() => setStep("setup")} style={{ padding: '16px 32px', borderRadius: '14px' }}>
                            <FaRedo style={{ marginRight: '8px' }} /> Try Again
                        </button>
                        <button className="btn secondary" onClick={downloadReport} style={{ padding: '16px 32px', borderRadius: '14px' }}>
                            <FaChartLine style={{ marginRight: '8px' }} /> Export PDF
                        </button>
                        <button className="btn secondary" onClick={() => window.location.href = '/dashboard'} style={{ padding: '16px 32px', borderRadius: '14px' }}>
                            <FaHome style={{ marginRight: '8px' }} /> Return Home
                        </button>
                    </div>
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
                        className="btn"
                        style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}
                    >
                        Adjust Settings
                    </button>
                    <button
                        onClick={startInterviewFromAnalysis}
                        className="btn primary"
                        style={{ padding: '12px 32px' }}
                    >
                        Start Interview &rarr;
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="interview-page">
            {step === "analysis" && renderAnalysis()}
            {step === "setup" && renderSetup()}
            {step === "interview" && renderInterview()}
            {step === "loading" && renderLoading()}
            {step === "results" && renderResults()}
        </div>
    );
}
