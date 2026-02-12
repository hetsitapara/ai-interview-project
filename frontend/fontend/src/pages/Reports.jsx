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
            <div className="container-xl" style={{ paddingTop: '120px' }}>
                <div className="main-layout">
                    {/* Reports Sidebar */}
                    <aside className="sidebar-panel">
                        <div className="widget-card">
                            <h4>📊 Performance Trend</h4>
                            <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '12px' }}>
                                {[40, 60, 45, 80, 55, 90, 85].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '2px', opacity: 0.5 + (h / 200) }}></div>
                                ))}
                            </div>
                        </div>

                        <div className="widget-card">
                            <h4>🏆 Achievemnts</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                                {['🌟', '🔥', '🎓', '🚀'].map(icon => (
                                    <div key={icon} style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', textAlign: 'center', fontSize: '20px', border: '1px solid var(--glass-border)' }}>
                                        {icon}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="widget-card" style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <h4 style={{ color: '#4ade80' }}>💡 Career Tip</h4>
                            <p>Candidates who review their reports for 10+ minutes perform 30% better in real technical interviews.</p>
                        </div>
                    </aside>

                    {/* Reports Main area */}
                    <main className="content-main">
                        <header style={{ marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}><FaChartLine style={{ marginRight: '15px' }} />Session History</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Deep dive into your AI-analyzed interview performance logs.</p>
                        </header>

                        {history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--glass-bg)', borderRadius: '32px', border: '1px solid var(--glass-border)', color: '#9ca3af' }}>
                                <div style={{ fontSize: '40px', marginBottom: '20px' }}>📁</div>
                                <p>Your archive is currently empty. Start your first session to begin tracking progress!</p>
                                <button className="btn primary" onClick={() => window.location.href = '/interview'} style={{ marginTop: '20px' }}>Start Session</button>
                            </div>
                        ) : (
                            <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                                {history.map(item => (
                                    <div key={item._id} className="history-card" onClick={() => handleViewReport(item._id)} style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
                                        <div className="history-content">
                                            <div className="history-header" style={{ marginBottom: '20px' }}>
                                                <div className="history-date" style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className={`badge ${item.overallScore >= 7 ? 'positive' : item.overallScore >= 4 ? 'neutral' : 'negative'}`} style={{ padding: '4px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '800', background: item.overallScore >= 7 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: item.overallScore >= 7 ? '#4ade80' : '#ef4444' }}>
                                                    {item.overallScore >= 7 ? 'EXPERIENCED' : item.overallScore >= 4 ? 'STABLE' : 'CRITICAL'}
                                                </div>
                                            </div>
                                            <h3 className="history-title" style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{item.category} Session</h3>
                                        </div>

                                        <div className="history-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                <div className="score-mini" style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>{item.overallScore ? item.overallScore.toFixed(1) : 0}</div>
                                                <div className="score-label" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 10</div>
                                            </div>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                <FaChartLine />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
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
                    <p><FaCalendarAlt style={{ marginRight: '8px' }} />Conducted on {new Date(report.createdAt).toLocaleString()}</p>
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
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Out of 10.0</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Questions</div>
                    <div className="stat-value">{questions.length}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Difficulty</div>
                    <div className="stat-value" style={{ fontSize: '2rem', marginTop: '18px' }}>{report.difficulty || 'Mixed'}</div>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Level</div>
                </div>
            </div>

            {/* Content Analysis */}
            <h3 className="section-title"><FaLightbulb /> Performance Analysis</h3>

            <div className="questions-analysis">
                {questions.map((q, idx) => (
                    <div key={idx} className="qa-card">
                        <div className="qa-question">Q{idx + 1}: {q.questionText}</div>

                        <div className="qa-answer">
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Your Answer:</span>
                            "{q.userAnswer}"
                        </div>

                        <div className="metrics-badges">
                            <span className="badge similarity">
                                <FaCheckCircle /> Match: {Math.round((q.similarity_score || 0) * 100)}%
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
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ffbdc3' }}>
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
