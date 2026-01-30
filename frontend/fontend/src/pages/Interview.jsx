import { useState, useEffect, useRef } from "react";
import "../styles/interview.css";
import "../styles/report.css";
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaClock, FaCommentDots, FaSpellCheck, FaHome, FaRedo } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Interview() {
  const [step, setStep] = useState("setup"); // setup, interview, loading, results
  const [config, setConfig] = useState({
    category: "HR",
    count: 5,
    difficulty: "Medium"
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { questionId, userAnswer, timeTaken }
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [timer, setTimer] = useState(0); // Seconds per question
  const [report, setReport] = useState(null);
  
  const baseTextRef = useRef("");
  const recognitionRef = useRef(null); 
  const timerRef = useRef(null);

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

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
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


  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  };

  const [loadingMessage, setLoadingMessage] = useState("Generating Report...");

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

          if (!res.ok) throw new Error("Resume processing failed");

          const data = await res.json();
          setQuestions(data);
          setConfig(prev => ({ ...prev, category: "Resume Based Interview" })); // Update category title
          setStep("interview");

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
          if (document.exitFullscreen) {
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
             document.exitFullscreen().catch(err => console.log(err)); 
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

      doc.save(`Interview_Report_${config.category.replace(/,/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
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

  // --- RENDER HELPERS ---

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
                if (data.length > 0) {
                    setConfig(prev => ({ ...prev, category: data[0] }));
                }
            }
        } catch (err) {
            console.error("Failed to load categories", err);
        }
    };
    fetchCategories();
  }, []);

  const renderSetup = () => (
    <div className="interview-card setup-card">
        <h2>Start Interview With</h2>
        
        {/* New Resume Upload Section */}
        <div className="resume-upload-section" style={{marginBottom: '30px', padding: '20px', border: '1px dashed #4ade80', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.05)'}}>
            <h3>📄 Upload Resume to Personalize</h3>
            <p style={{fontSize: '0.9rem', color: '#888', marginBottom: '15px'}}>We'll analyze your skills and ask relevant questions (Java, Python, ML, etc.)</p>
            <input 
                type="file" 
                accept="application/pdf"
                onChange={handleResumeUploadProcess}
                style={{display: 'block', width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff'}}
            />
        </div>

        <div className="divider" style={{margin: '20px 0', textAlign: 'center', color: '#64748b'}}>OR</div>

        <div className="form-group">
            <label>Category (Select One or Multiple)</label>
            <div className="category-grid" style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                <button 
                    className={`cat-btn ${config.category === 'Random' ? 'active' : ''}`}
                    onClick={() => setConfig({...config, category: 'Random'})}
                    style={{ 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        border: '1px solid #475569', 
                        background: config.category === 'Random' ? '#6366f1' : 'rgba(30, 41, 59, 0.5)', 
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Random
                </button>
                {categories.length > 0 ? categories.map(cat => {
                    const isSelected = config.category.split(',').includes(cat) && config.category !== 'Random';
                    return (
                        <button 
                            key={cat}
                            className={`cat-btn ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                                let current = config.category === 'Random' ? [] : config.category.split(',').filter(c => c);
                                if (current.includes(cat)) {
                                    current = current.filter(c => c !== cat);
                                } else {
                                    current.push(cat);
                                }
                                setConfig({...config, category: current.length ? current.join(',') : 'Random'});
                            }}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '20px', 
                                border: `1px solid ${isSelected ? '#6366f1' : '#475569'}`, 
                                background: isSelected ? '#6366f1' : 'rgba(30, 41, 59, 0.5)', 
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    )
                }) : <p>Loading categories...</p>}
            </div>
        </div>
        
        <div className="form-group">
            <label>Number of Questions</label>
            <input 
                type="number" 
                min="5" max="15" 
                value={config.count} 
                onChange={e => setConfig({...config, count: Math.max(5, parseInt(e.target.value) || 0)})} 
            />
        </div>
        <button className="btn primary" onClick={startInterview}>Start Manual Interview</button>
    </div>
  );

  const renderInterview = () => {
      if (!questions.length) return <div>Loading questions...</div>;
      const q = questions[currentQuestionIndex];
      
      return (
        <div className="interview-card">
          <div className="interview-header">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{formatTime(timer)}</span>
          </div>

          <div className="progress-track">
            <div 
                className="progress-fill" 
                style={{width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`}}
            ></div>
          </div>

          <div className="question-box">
            <p><strong>Question:</strong> {q.question}</p>
          </div>

          <div className="answer-box">
             {q.type === 'YesNo' ? (
                 <div className="yes-no-buttons" style={{display: 'flex', gap: '20px', justifyContent: 'center', height: '200px', alignItems: 'center'}}>
                     <button 
                        className={`btn ${currentAnswer === 'Yes' ? 'primary' : 'secondary'}`}
                        onClick={() => setCurrentAnswer('Yes')}
                        style={{width: '120px', fontSize: '1.2rem', padding: '15px'}}
                     >
                         YES
                     </button>
                     <button 
                        className={`btn ${currentAnswer === 'No' ? 'primary' : 'secondary'}`}
                        onClick={() => setCurrentAnswer('No')}
                        style={{width: '120px', fontSize: '1.2rem', padding: '15px'}}
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
            <button className="btn secondary" onClick={handleFinishEarly} style={{marginRight: 'auto'}}>
                End Session
            </button>
            <button className="btn primary" onClick={handleNextQuestion}>
                {currentQuestionIndex === questions.length - 1 ? "Finish & Submit" : "Next Question"}
            </button>
          </div>
        </div>
      );
  };

  const renderLoading = () => (
      <div className="interview-card loading-card">
          <h2>{loadingMessage}</h2>
          <div className="spinner"></div> 
          <p>Please wait while we process your request.</p>
      </div>
  );

  const renderResults = () => {
      if (!report) return <div>No report data found.</div>;
      
      const questionsData = report.questions || [];

      return (
          <div className="report-page" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100, height: 'auto', minHeight: '100vh', padding: '40px 20px' }}>
              <div className="detail-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.95)', padding: '20px', borderRadius: '10px' }}>
                  
                  {/* Header */}
                  <div className="report-header">
                      <div className="report-meta">
                          <h1>Interview Analysis</h1>
                          <p>{config.category} • {questionsData.length} Questions</p>
                      </div>
                      <div className="badge positive" style={{ fontSize: '1.5rem', padding: '10px 25px' }}>
                          Score: {report.overallScore.toFixed(1)}/10
                      </div>
                  </div>

                  {/* Stats Row */}
                  <div className="stats-row">
                      <div className="stat-card">
                          <div className="stat-title">Overall Score</div>
                          <div className="stat-value">{report.overallScore.toFixed(1)}</div>
                          <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Based on AI Evaluation</div>
                      </div>
                      <div className="stat-card">
                          <div className="stat-title">Performance</div>
                          <div className="stat-value" style={{ fontSize: '2rem', marginTop: '15px' }}>
                              {report.overallScore >= 8 ? "Excellent" : report.overallScore >= 5 ? "Good" : "Needs Work"}
                          </div>
                          <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Qualitative Rating</div>
                      </div>
                      <div className="stat-card">
                          <div className="stat-title">Focus Area</div>
                          <div className="stat-value" style={{ fontSize: '1.8rem', marginTop: '18px' }}>{config.category}</div>
                          <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Interview Type</div>
                      </div>
                  </div>
                  
                  {/* Detailed Analysis */}
                  <h3 className="section-title"><FaLightbulb /> Detailed Question Analysis</h3>
                  
                  <div className="questions-analysis">
                      {questionsData.map((q, idx) => (
                          <div key={idx} className="qa-card" style={{ borderColor: q.final_score >= 7 ? '#2ed573' : q.final_score >= 4 ? '#facc15' : '#ff4757' }}>
                              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                                  <div className="qa-question">Q{idx+1}: {q.questionText}</div>
                                  <span className={`badge ${q.final_score >= 7 ? 'positive' : q.final_score >= 4 ? 'neutral' : 'negative'}`}>
                                      {q.final_score}/10
                                  </span>
                              </div>
                              
                              <div className="qa-answer">
                                  <span style={{color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>Your Answer:</span>
                                  "{q.userAnswer}"
                              </div>
                              
                              <div className="qa-answer" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                   <span style={{color: '#a5b4fc', fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>Ideal Answer:</span>
                                   {q.idealAnswer || "Not available"}
                              </div>

                              <div className="metrics-badges">
                                  <span className="badge similarity">
                                      <FaCheckCircle /> Similarity: {Math.round((q.similarity_score||0) * 100)}%
                                  </span>
                                  <span className="badge tone">
                                      <FaCommentDots /> Keywords: {Math.round((q.keyword_score||0) * 100)}%
                                  </span>
                                  {q.sentiment_score && (
                                       <span className={`badge ${q.sentiment_score > 0 ? 'positive' : 'negative'}`}>
                                          Tone: {q.sentiment_score > 0 ? "Positive" : "Negative"}
                                      </span>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="action-buttons" style={{marginTop: '40px', justifyContent: 'center', gap: '20px'}}>
                     <button className="btn primary" onClick={() => setStep("setup")}>
                        <FaRedo style={{marginRight: '8px'}}/> Start New Interview
                     </button>
                     <button className="btn secondary" onClick={downloadReport}>
                        <FaChartLine style={{marginRight: '8px'}}/> Download Report
                     </button>
                     <button className="btn secondary" onClick={() => window.location.href = '/dashboard'}>
                        <FaHome style={{marginRight: '8px'}}/> Go to Dashboard
                     </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <>
      <div className="interview-page">
        {step === "setup" && renderSetup()}
        {step === "interview" && renderInterview()}
        {step === "loading" && renderLoading()}
        {step === "results" && renderResults()}
      </div>
    </>
  );
}
