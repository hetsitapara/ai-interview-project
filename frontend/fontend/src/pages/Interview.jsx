import { useState, useEffect, useRef } from "react";
import "../styles/interview.css";
import "../styles/report.css";
import { FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaClock, FaCommentDots, FaSpellCheck, FaHome, FaRedo } from "react-icons/fa";

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


  const startInterview = async () => {
    try {
        const token = localStorage.getItem('token'); // Assuming auth
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
        <h2>Configure Interview</h2>
        <div className="form-group">
            <label>Category</label>
            <select value={config.category} onChange={e => setConfig({...config, category: e.target.value})}>
                {categories.length > 0 ? (
                    categories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                ) : (
                    <option value="">Loading categories...</option>
                )}
            </select>
        </div>
        {/* Difficulty Removed as per request */}
        {/* <div className="form-group">
            <label>Difficulty</label>
            <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
        </div> */}
        <div className="form-group">
            <label>Number of Questions</label>
            <input 
                type="number" 
                min="5" max="15" 
                value={config.count} 
                onChange={e => setConfig({...config, count: Math.max(5, parseInt(e.target.value) || 0)})} 
            />
        </div>
        <button className="btn primary" onClick={startInterview}>Start Interview</button>
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
          <h2>Generating Report...</h2>
          <div className="spinner"></div> 
          <p>AI is analyzing your answers. This may take a moment.</p>
      </div>
  );

  const renderResults = () => {
      if (!report) return <div>No report data found.</div>;
      
      const questionsData = report.questions || [];

      return (
          <div className="report-page" style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 100, height: 'auto', minHeight: '100vh', padding: '40px 20px' }}>
              <div className="detail-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.95)' }}>
                  
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
