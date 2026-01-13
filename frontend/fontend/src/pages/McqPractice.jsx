import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/interview.css";
import Confetti from 'react-confetti'; 

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

  // Helper to format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
            <label style={{ display: 'block', marginBottom: '8px' }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
                 <div style={{textAlign: 'center', padding: '20px'}}>No detailed results available.</div>
             )}
          </div>

          <button className="btn primary" onClick={() => setStep("setup")} style={{ width: '100%', marginTop: '24px' }}>
             Take Another Quiz
          </button>
        </div>
      )}
      
      {step === "results" && !results && (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>
            <h2>Processing Results...</h2>
            <button className="btn primary" onClick={() => window.location.reload()} style={{marginTop: '20px'}}>
                Reset
            </button>
        </div>
      )}
    </div>
  );
}
