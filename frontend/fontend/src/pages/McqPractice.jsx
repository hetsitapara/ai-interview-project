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
        const res = await axios.get("http://localhost:5001/api/mcq/categories", {
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

      const res = await axios.post("http://localhost:5001/api/mcq/start", formData, config);
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

      const res = await axios.post("http://localhost:5001/api/mcq/submit", { answers: submission }, config);
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
  console.log("RENDER: Step:", step, "Results:", results); // DEBUG

  if (loading) return <div className="interview-page"><div className="loader">Loading...</div></div>;

  return (
    <div className="interview-page" style={{ visibility: 'visible', opacity: 1 }}>
      {step === "setup" && (
        <div className="interview-card">
          <h2>MCQ Practice Setup</h2>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Category (Select One or Multiple)</label>
            <div className="category-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              <button
                className={`cat-btn ${formData.category === 'Random' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, category: 'Random' })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #475569',
                  background: formData.category === 'Random' ? '#6366f1' : 'rgba(30, 41, 59, 0.5)',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Random
              </button>
              {categories.map((cat) => {
                const isSelected = formData.category.split(',').includes(cat) && formData.category !== 'Random';
                return (
                  <button
                    key={cat}
                    className={`cat-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      let current = formData.category === 'Random' ? [] : formData.category.split(',').filter(c => c);
                      if (current.includes(cat)) {
                        current = current.filter(c => c !== cat);
                      } else {
                        current.push(cat);
                      }
                      setFormData({ ...formData, category: current.length ? current.join(',') : 'Random' });
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
              })}
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Number of Questions (5-20)</label>
            <input
              type="number"
              name="count"
              min="5"
              max="20"
              value={formData.count}
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <button className="btn primary" onClick={startQuiz} style={{ width: '100%' }}>
            Start Quiz
          </button>
        </div>
      )}

      {step === "quiz" && questions.length > 0 && (
        <div className="interview-card">
          <div className="interview-header">
            <span>Question {currentQIndex + 1} / {questions.length}</span>
            <span>Time: {formatTime(timer)}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="question-text" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
            {questions[currentQIndex].question}
            {questions[currentQIndex].type === "MSQ" && (
              <span style={{ fontSize: '0.8rem', color: '#aaa', marginLeft: '10px' }}>(Select all that apply)</span>
            )}
          </div>

          <div className="options-grid" style={{ display: 'grid', gap: '12px' }}>
            {questions[currentQIndex].options.map((opt, idx) => {
              const isSelected = (answers[questions[currentQIndex]._id] || []).includes(idx);
              return (
                <div
                  key={idx}
                  className={`option-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleOptionSelect(questions[currentQIndex]._id, idx, questions[currentQIndex].type)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <input
                    type={questions[currentQIndex].type === "MCQ" ? "radio" : "checkbox"}
                    checked={isSelected}
                    readOnly
                    style={{ marginRight: '12px' }}
                  />
                  {opt}
                </div>
              );
            })}
          </div>

          <div className="action-buttons" style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              className="btn secondary"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((i) => i - 1)}
            >
              Previous
            </button>
            {currentQIndex < questions.length - 1 ? (
              <button className="btn primary" onClick={() => setCurrentQIndex((i) => i + 1)}>
                Next
              </button>
            ) : (
              <button className="btn primary" onClick={submitQuiz}>
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {step === "results" && results && (
        <div className="interview-card" style={{ maxWidth: '900px', opacity: 1, visibility: 'visible', animation: 'none', transform: 'none' }}>
          {/* Confetti Temporarily Removed */}
          <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'white' }}>Quiz Results</h2>

          <div className="score-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div className="score-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4>Score</h4>
              <div className="score" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4ade80', marginTop: '10px' }}>
                {results?.correctCount || 0} / {results?.totalQuestions || 0}
              </div>
            </div>
            <div className="score-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4>Accuracy</h4>
              <div className="score" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#60a5fa', marginTop: '10px' }}>
                {results?.totalQuestions > 0 ? Math.round((results.correctCount / results.totalQuestions) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="results-list" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {results?.results && results.results.length > 0 ? (
              results.results.map((res, idx) => {
                const options = res.options || [];
                return (
                  <div key={idx} className="result-item" style={{ marginBottom: '24px', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', borderLeft: res.isCorrect ? '6px solid #4ade80' : '6px solid #f87171' }}>
                    <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', marginRight: '10px' }}>{idx + 1}.</span>
                      {res.questionText || res.question || "Question"}
                    </div>

                    <div className="options-review" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {options.map((opt, oIdx) => {
                        const isSelected = (res.userSelected || []).includes(oIdx);
                        const isCorrect = (res.correctOptions || []).includes(oIdx);

                        let color = 'rgba(255,255,255,0.7)';
                        if (isCorrect) color = '#4ade80';
                        if (isSelected && !isCorrect) color = '#f87171';

                        return (
                          <div key={oIdx} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            color: color,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span>{String(opt)}</span>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                              {isSelected && <span>(You) </span>}
                              {isCorrect && <span>✓</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {res.explanation && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                        💡 {res.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>No detailed results available.</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button className="btn primary" onClick={() => setStep("setup")} style={{ flex: 1 }}>
              Take Another Quiz
            </button>
            <button
              className="btn secondary"
              onClick={downloadReport}
              style={{ flex: 1, background: '#8b5cf6', color: 'white' }}
            >
              Download Report
            </button>
          </div>
        </div >
      )
      }

      {
        step === "results" && !results && (
          <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>
            <h2>Processing Results...</h2>
            <button className="btn primary" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
              Reset
            </button>
          </div>
        )
      }
    </div >
  );
}
