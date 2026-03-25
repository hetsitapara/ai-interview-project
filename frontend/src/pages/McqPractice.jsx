import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/interview.css";
import Confetti from 'react-confetti';
import jsPDF from "jspdf";

export default function McqPractice() {
  const [step, setStep] = useState("setup"); // setup, quiz, results
  const [formData, setFormData] = useState({ category: "React", count: 10 });
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: [selectedIndices] }
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:5001/api/mcq/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data[0] }));
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
        // Fallback
        setCategories(["React", "DSA", "DBMS", "HR", "JavaScript"]);
      }
    };
    fetchCategories();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (step === "quiz") {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Start Quiz
  const startQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication failed. Please Login again.");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post("http://127.0.0.1:5001/api/mcq/start", formData, config);
      // Backend returns an array directly
      if (Array.isArray(res.data) && res.data.length > 0) {
        setQuestions(res.data);
        setStep("quiz");
        setTimer(0);
        setAnswers({});
        setCurrentQIndex(0);
      } else {
        alert("No questions found for this category.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  // Handle Option Selection
  const handleOptionSelect = (qId, optionIdx, type) => {
    setAnswers((prev) => {
      const currentSelected = prev[qId] || [];
      if (type === "MCQ") {
        // Single select
        return { ...prev, [qId]: [optionIdx] };
      } else {
        // Multi select
        if (currentSelected.includes(optionIdx)) {
          return { ...prev, [qId]: currentSelected.filter((i) => i !== optionIdx) };
        } else {
          return { ...prev, [qId]: [...currentSelected, optionIdx] };
        }
      }
    });
  };

  // Submit Quiz
  const submitQuiz = async () => {
    setLoading(true);
    try {
      // Format answers for backend
      const submission = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOptions: answers[qId],
      }));

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please Login again.");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.post("http://127.0.0.1:5001/api/mcq/submit", { answers: submission }, config);
      console.log("Submission Result:", res.data); // DEBUG
      setResults(res.data);
      setStep("results");
    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const downloadReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // Primary Color
    doc.text("PrepAI - MCQ Practice Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Category: ${formData.category}`, 20, 36);
    doc.text(`Score: ${results?.correctCount} / ${results?.totalQuestions}`, 20, 42);

    let yPos = 55;

    results?.results?.forEach((res, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Question
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");

      const questionText = `${index + 1}. ${res.questionText}`;
      const splitQuestion = doc.splitTextToSize(questionText, 170);
      doc.text(splitQuestion, 20, yPos);
      yPos += (splitQuestion.length * 6) + 2;

      // Status
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (res.isCorrect) {
        doc.setTextColor(46, 204, 113); // Green
        doc.text("Result: Correct", 20, yPos);
      } else {
        doc.setTextColor(231, 76, 60); // Red
        doc.text("Result: Incorrect", 20, yPos);
      }
      yPos += 6;

      // Answer details
      doc.setTextColor(100);
      const correctText = `Correct Answer: ${res.correctOptions.map(i => res.options[i]).join(', ')}`;
      const splitCorrect = doc.splitTextToSize(correctText, 170);
      doc.text(splitCorrect, 20, yPos);
      yPos += (splitCorrect.length * 5) + 2;

      if (!res.isCorrect) {
        const userText = `Your Answer: ${res.userSelected.map(i => res.options[i]).join(', ')}`;
        const splitUser = doc.splitTextToSize(userText, 170);
        doc.text(splitUser, 20, yPos);
        yPos += (splitUser.length * 5) + 2;
      }

      yPos += 8; // Spacing
    });

    doc.save("MCQ_Report.pdf");
  };

  // Renders
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page-gradient)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', border: '4px solid rgba(139, 92, 241, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '600', letterSpacing: '0.5px' }}>{step === "setup" ? "Preparing Assessment..." : "Calculating Results..."}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden', fontFamily: 'var(--font-main)' }}>
      {/* Background Orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1, pointerEvents: 'none', filter: 'blur(80px)' }}></div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .setup-card { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .quiz-option { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; position: relative; overflow: hidden; }
        .quiz-option:hover:not(.selected) { background: rgba(255, 255, 255, 0.05)!important; border-color: rgba(255, 255, 255, 0.2)!important; transform: translateX(8px); }
        .quiz-option.selected { background: rgba(139, 92, 241, 0.12)!important; border-color: var(--primary)!important; box-shadow: 0 0 30px rgba(139, 92, 241, 0.2); }
        .category-pill { cursor: pointer; transition: all 0.25s ease; border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.03); font-weight: 700!important; }
        .category-pill:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.2); background: rgba(255,255,255,0.06); }
        .category-pill.active { background: var(--primary)!important; border-color: var(--primary)!important; box-shadow: 0 8px 20px rgba(139, 92, 241, 0.4); }
        .start-btn:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 20px 40px rgba(139, 92, 241, 0.5); }
      `}</style>

      <div className="container-xl" style={{ padding: '40px 0' }}>
        {step === "setup" ? (
          <div className="setup-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(139, 92, 241, 0.1)', border: '1px solid rgba(139, 92, 241, 0.2)', borderRadius: '50px', padding: '8px 24px', marginBottom: '24px', animation: 'float 4s ease-in-out infinite' }}>
                <span style={{ fontSize: '14px' }}>🚀</span>
                <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Advanced Assessment Platform</span>
              </div>
              <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-2.5px', marginBottom: '16px', color: 'white' }}>MCQ Mastery Hub</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '20px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                Test your knowledge across different domains with our AI-curated question sets. 
                Challenge yourself and track your competitive growth.
              </p>
            </div>

            <div className="main-layout" style={{ gap: '48px' }}>
              <aside className="sidebar-panel">
                <div className="widget-card" style={{ animation: 'fadeUp 0.6s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💡</div>
                    <h4 style={{ margin: 0 }}>Quiz Tips</h4>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>Read all options before deciding. Some questions may have 'All of the above' as a valid choice.</p>
                </div>

                <div className="widget-card" style={{ animation: 'fadeUp 0.8s ease forwards', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 241, 0.05))', border: '1px solid rgba(139, 92, 241, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📊</div>
                    <h4 style={{ margin: 0, color: '#a78bfa' }}>Quick Stats</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total Database</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>12,400+</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: '#94a3b8' }}>Solved Today</span>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#4ade80' }}>452</span>
                    </div>
                  </div>
                </div>

                <div className="widget-card" style={{ animation: 'fadeUp 1s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚡</div>
                    <h4 style={{ margin: 0, color: '#f472b6' }}>Focus Area</h4>
                  </div>
                  <p style={{ fontSize: '15px' }}>Currently targeting: <b style={{ color: '#f472b6', textTransform: 'uppercase' }}>{formData.category}</b></p>
                </div>
              </aside>

              <main className="content-main" style={{ animation: 'fadeUp 0.7s ease forwards' }}>
                <div className="interview-card" style={{ padding: '48px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ marginBottom: '40px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '24px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>Select Quiz Domain</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                      <button
                        className={`category-pill ${formData.category === 'Random' ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, category: 'Random' })}
                        style={{ padding: '16px', borderRadius: '16px', fontSize: '14px', color: '#fff' }}
                      >
                        🎲 Randomize
                      </button>
                      {categories.map((cat) => {
                        const isSelected = formData.category.split(',').includes(cat) && formData.category !== 'Random';
                        const icons = { React: '⚛️', DSA: '📂', DBMS: '🗄️', HR: '🤝', JavaScript: 'JS', MySQL: '🐬', Python: '🐍' };
                        return (
                          <button
                            key={cat}
                            className={`category-pill ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              let current = formData.category === 'Random' ? [] : formData.category.split(',').filter(c => c);
                              if (current.includes(cat)) current = current.filter(c => c !== cat); else current.push(cat);
                              setFormData({ ...formData, category: current.length ? current.join(',') : 'Random' });
                            }}
                            style={{ padding: '16px', borderRadius: '16px', fontSize: '14px', color: '#fff' }}
                          >
                            <span style={{ marginRight: '8px' }}>{icons[cat] || '✨'}</span>{cat}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: '48px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>Question Density</label>
                      <span style={{ fontSize: '14px', color: '#fff', fontWeight: '800', background: 'rgba(139, 92, 241, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>{formData.count} Items</span>
                    </div>
                    <input
                      type="range"
                      name="count"
                      min="5"
                      max="50"
                      step="5"
                      value={formData.count}
                      onChange={handleChange}
                      style={{ width: '100%', height: '6px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '700' }}>
                      <span>5 Q'S</span>
                      <span>25 Q'S</span>
                      <span>50 Q'S</span>
                    </div>
                  </div>

                  <button className="btn-premium-primary start-btn" onClick={startQuiz} style={{ width: '100%', padding: '24px', borderRadius: '20px', fontSize: '18px' }}>
                    Launch Knowledge Assessment <span style={{ marginLeft: '12px' }}>→</span>
                  </button>
                </div>
              </main>
            </div>
          </div>
        ) : step === "quiz" ? (
          <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeUp 0.6s ease forwards' }}>
            {questions.length > 0 && (
              <div className="interview-card" style={{ padding: '48px', position: 'relative' }}>
                {/* Immersive Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139, 92, 241, 0.1)', border: '1px solid rgba(139, 92, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📝</div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Assessment In Progress</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Question {currentQIndex + 1} of {questions.length}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Elapsed Time</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', fontFamily: 'monospace' }}>{formatTime(timer)}</div>
                  </div>
                </div>

                <div className="progress-track" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '48px', overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%`, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)', background: 'linear-gradient(90deg, var(--secondary), var(--primary))' }}></div>
                </div>

                <div style={{ marginBottom: '48px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ background: 'rgba(139, 92, 241, 0.12)', color: '#a78bfa', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', border: '1px solid rgba(139, 92, 241, 0.2)' }}>{questions[currentQIndex].category}</span>
                    <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{questions[currentQIndex].topic}</span>
                    {questions[currentQIndex].type === "MSQ" && (
                       <span style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Multi-Select</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: '1.4', letterSpacing: '-0.5px' }}>{questions[currentQIndex].question}</h2>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {questions[currentQIndex].options.map((opt, idx) => {
                    const isSelected = (answers[questions[currentQIndex]._id] || []).includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`quiz-option ${isSelected ? "selected" : ""}`}
                        onClick={() => handleOptionSelect(questions[currentQIndex]._id, idx, questions[currentQIndex].type)}
                        style={{
                          padding: '24px 32px',
                          borderRadius: '20px',
                          border: '1px solid rgba(255,255,255,0.06)',
                          background: 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px'
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? 'var(--primary)' : 'transparent', border: isSelected ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.1)', transition: 'all 0.2s ease' }}>
                          {isSelected && <Check size={14} color="white" />}
                        </div>
                        <span style={{ fontSize: '18px', fontWeight: '500', color: isSelected ? '#fff' : '#94a3b8' }}>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '64px', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                  <button className="btn-premium-secondary" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex((i) => i - 1)} style={{ padding: '16px 40px', opacity: currentQIndex === 0 ? 0.3 : 1 }}>
                    ← Previous
                  </button>
                  {currentQIndex < questions.length - 1 ? (
                    <button className="btn-premium-primary" onClick={() => setCurrentQIndex((i) => i + 1)} style={{ padding: '16px 64px' }}>
                      Next Question <span style={{ marginLeft: '12px' }}>→</span>
                    </button>
                  ) : (
                    <button className="btn-premium-primary" onClick={submitQuiz} style={{ padding: '16px 64px', background: 'linear-gradient(135deg, #059669, #10b981)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      Complete Assessment <span style={{ marginLeft: '12px' }}>✓</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results Step */
          <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeUp 0.7s ease forwards' }}>
             <div className="interview-card" style={{ padding: '56px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)', zIndex: 0 }}></div>
                
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: '56px' }}>
                  <div style={{ width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '48px', animation: 'float 6s ease-in-out infinite' }}>🏆</div>
                  <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#fff', marginBottom: '16px', letterSpacing: '-2px' }}>Assessment Complete</h1>
                  <p style={{ color: '#64748b', fontSize: '18px' }}>Your performance analysis is ready. Great work today!</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '56px', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Score</div>
                    <div style={{ fontSize: '44px', fontWeight: '900', color: '#4ade80' }}>{results?.correctCount} <span style={{ fontSize: '20px', color: '#1e293b' }}>/ {results?.totalQuestions}</span></div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Accuracy</div>
                    <div style={{ fontSize: '44px', fontWeight: '900', color: '#60a5fa' }}>{results?.totalQuestions > 0 ? Math.round((results.correctCount / results.totalQuestions) * 100) : 0}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '32px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Persistence</div>
                    <div style={{ fontSize: '44px', fontWeight: '900', color: '#facc15' }}>🔥 {Math.min(100, (results?.correctCount || 0) * 10)}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '56px' }}>
                   <button className="btn-premium-primary" onClick={() => setStep("setup")} style={{ flex: 2, padding: '20px' }}>Try Another Assessment</button>
                   <button className="btn-premium-secondary" onClick={downloadReport} style={{ flex: 1, padding: '20px' }}>Export Detailed PDF</button>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '48px' }}>
                   <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileText size={20} color="var(--primary)" /> Review Session Details
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {results?.results?.map((res, idx) => (
                        <div key={idx} style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.015)', border: `1px solid ${res.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`, borderLeftWidth: '6px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <div style={{ fontSize: '17px', fontWeight: '700', color: '#fff', lineHeight: '1.4' }}>{idx + 1}. {res.questionText}</div>
                              {res.isCorrect ? <CheckCircle size={20} color="#4ade80" /> : <AlertCircle size={20} color="#f87171" />}
                           </div>
                           <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                              <span style={{ color: '#4ade80', fontWeight: '700' }}>Answer:</span> {res.correctOptions.map(i => res.options[i]).join(', ')}
                           </div>
                           {res.explanation && (
                              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                 💡 {res.explanation}
                              </div>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper icons/components
function Check({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
}
function CheckCircle({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}
function AlertCircle({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
}
function FileText({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
}
