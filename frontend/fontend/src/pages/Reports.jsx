import { useState, useEffect } from "react";
import "../styles/report.css";
import { FaArrowLeft, FaCalendarAlt, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaClock, FaCommentDots, FaSpellCheck } from "react-icons/fa";

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading && !selectedReport && history.length === 0) 
      return <div className="report-page"><div className="loader">Loading...</div></div>;

  if (selectedReport) {
      return (
          <div className="report-page fade-in">
             <div className="report-container">
                <button className="btn back-btn" onClick={() => setSelectedReport(null)} style={{ marginBottom: '30px' }}>
                    <FaArrowLeft /> Back to Dashboard
                </button>
                <ReportDetail report={selectedReport} />
             </div>
          </div>
      );
  }

  return (
    <div className="report-page fade-in">
      <div className="report-container">
        <h2><FaChartLine style={{marginRight: '15px'}}/>Interview Insights</h2>
        
        {history.length === 0 ? (
            <div style={{textAlign: 'center', marginTop: '50px', color: '#9ca3af'}}>
                <p>No interviews completed yet. Start one to see analytics!</p>
            </div>
        ) : (
            <div className="history-grid">
                {history.map(item => (
                    <div key={item._id} className="history-card" onClick={() => handleViewReport(item._id)}>
                        <div className="history-content">
                            <div className="history-header">
                                <div className="history-date">
                                    <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <div className={`badge ${item.overallScore >= 7 ? 'positive' : item.overallScore >= 4 ? 'neutral' : 'negative'}`}>
                                    {item.overallScore >= 7 ? 'Excellent' : item.overallScore >= 4 ? 'Good' : 'Needs Work'}
                                </div>
                            </div>
                            <h3 className="history-title">{item.category} Interview</h3>
                        </div>
                        
                        <div className="history-footer">
                             <div>
                                <div className="score-mini">{item.overallScore ? item.overallScore.toFixed(1) : 0}</div>
                                <div className="score-label">Score</div>
                             </div>
                             <FaChartLine style={{ fontSize: '2rem', opcode: 0.2, color: 'rgba(255,255,255,0.1)' }} />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

function ReportDetail({ report }) {
    const questions = report.questions || [];

    return (
        <div className="detail-container fade-in">
            {/* Header */}
            <div className="report-header">
                <div className="report-meta">
                    <h1>{report.category} Report</h1>
                    <p><FaCalendarAlt style={{marginRight: '8px'}} />Conducted on {new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div className="badge positive" style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                    Final Score: {report.overallScore.toFixed(1)}/10
                </div>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-title">Detailed Score</div>
                    <div className="stat-value">{report.overallScore.toFixed(1)}</div>
                    <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Out of 10.0</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Questions</div>
                    <div className="stat-value">{questions.length}</div>
                    <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Difficulty</div>
                    <div className="stat-value" style={{ fontSize: '2rem', marginTop: '18px' }}>{report.difficulty || 'Mixed'}</div>
                    <div style={{color: '#9ca3af', fontSize: '0.8rem'}}>Level</div>
                </div>
            </div>

            {/* Content Analysis */}
            <h3 className="section-title"><FaLightbulb /> Performance Analysis</h3>
            
            <div className="questions-analysis">
                {questions.map((q, idx) => (
                    <div key={idx} className="qa-card">
                        <div className="qa-question">Q{idx+1}: {q.questionText}</div>
                        
                        <div className="qa-answer">
                            <span style={{color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px'}}>Your Answer:</span>
                            "{q.userAnswer}"
                        </div>
                        
                        <div className="metrics-badges">
                            <span className="badge similarity">
                                <FaCheckCircle /> Match: {Math.round((q.similarity_score||0)*100)}%
                            </span>
                            
                            {q.sentiment && (
                                <span className="badge tone">
                                    <FaCommentDots /> Tone: {q.sentiment.label}
                                </span>
                            )}
                            
                            {q.pace && (
                                <span className="badge pace">
                                    <FaClock /> {q.pace.wpm} WPM ({q.pace.label})
                                </span>
                            )}
                            
                            {q.grammar && (
                                <span className="badge grammar">
                                    <FaSpellCheck /> Grammar: {q.grammar.score}/100
                                </span>
                            )}
                        </div>

                        {q.grammar && q.grammar.issues && q.grammar.issues.length > 0 && (
                            <div className="feedback-section">
                                <div className="feedback-title"><FaExclamationTriangle /> Grammar Issues</div>
                                <ul style={{margin: 0, paddingLeft: '20px', color: '#ffbdc3'}}>
                                    {q.grammar.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}
