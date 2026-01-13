import { useState, useEffect } from "react";
import "../styles/report.css";

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5001/api/interview/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    };
    fetchHistory();
  }, []);

  // Fetch full report details when an item is clicked
  const handleViewReport = async (id) => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/interview/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setSelectedReport(data);
        }
      } catch (err) {
          alert('Failed to load report details');
      } finally {
          setLoading(false);
      }
  };

  if (loading && !selectedReport && history.length === 0) return <div className="report-page">Loading...</div>;

  if (selectedReport) {
      return (
          <div className="report-page">
              <button className="btn back-btn" onClick={() => setSelectedReport(null)} style={{marginBottom: '20px'}}>
                  ← Back to History
              </button>
              <ReportDetail report={selectedReport} />
          </div>
      );
  }

  return (
    <div className="report-page">
      <h2>Interview History</h2>
      {history.length === 0 ? (
          <p>No interviews completed yet.</p>
      ) : (
          <div className="history-list">
              {history.map(item => (
                  <div key={item._id} className="history-card" onClick={() => handleViewReport(item._id)}>
                      <div className="history-info">
                          <h3>{item.category} Interview</h3>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="history-score">
                          <span className="score-badge">{item.overallScore ? item.overallScore.toFixed(1) : 0}/10</span>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
}

function ReportDetail({ report }) {
    // Calculate averages for the new metrics if available
    const questions = report.questions || [];
    
    // Helper to safely get metric
    const getAvgMetric = (key) => {
        if (!questions.length) return 0;
        const total = questions.reduce((acc, q) => acc + (q[key] ? (q[key].score || q[key]) : 0), 0);
        return (total / questions.length).toFixed(1);
    }

    return (
        <div className="report-card">
            <h2 className="report-title">{report.category} Performance Report</h2>
            <p className="report-date">Conducted on {new Date(report.createdAt).toLocaleString()}</p>

            {/* Top Score Cards */}
            <div className="score-grid">
            <div className="score-card">
                <h4>Overall Score</h4>
                <p className="score">{report.overallScore.toFixed(1)}/10</p>
                <span>Avg Performance</span>
            </div>

            <div className="score-card">
                <h4>Questions</h4>
                <p className="score">{questions.length}</p>
                <span>Completed</span>
            </div>

            <div className="score-card">
                <h4>Difficulty</h4>
                <p className="score" style={{fontSize: '1.2rem'}}>{report.difficulty || 'Mixed'}</p>
                <span>Level</span>
            </div>
            </div>

            {/* Detailed Analytics */}
            <div className="report-lower">
                <div className="skill-box">
                    <h3>Deep Analysis</h3>
                     {/* Show per-question analysis */}
                     <div className="questions-analysis">
                        {questions.map((q, idx) => (
                            <div key={idx} className="qa-item" style={{marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'}}>
                                <h4>Q{idx+1}: {q.questionText}</h4>
                                <p><strong>Answer:</strong> {q.userAnswer}</p>
                                
                                <div className="metrics-row" style={{display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap'}}>
                                    <span className="metric-tag">Similarity: {Math.round((q.similarity_score||0)*100)}%</span>
                                    {q.sentiment && (
                                        <span className={`metric-tag ${q.sentiment.label.toLowerCase()}`}>
                                            Tone: {q.sentiment.label}
                                        </span>
                                    )}
                                    {q.pace && (
                                        <span className="metric-tag">
                                            Pace: {q.pace.wpm} WPM ({q.pace.label})
                                        </span>
                                    )}
                                    {q.grammar && (
                                        <span className="metric-tag">
                                            Grammar: {q.grammar.score}/100
                                        </span>
                                    )}
                                </div>
                                {q.grammar && q.grammar.issues && q.grammar.issues.length > 0 && (
                                    <div className="grammar-issues" style={{fontSize: '0.85rem', color: '#ff6b6b', marginTop: '5px'}}>
                                        Issues: {q.grammar.issues.join(', ')}
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
}

// Simple styling for history cards injected here or assume in CSS
// For now, reliance on existing CSS, but might need some tweaks.
