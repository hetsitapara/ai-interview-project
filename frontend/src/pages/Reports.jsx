import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/report.css";
import { FaArrowLeft, FaCalendarAlt, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaClock, FaCommentDots, FaSpellCheck, FaRedo, FaBrain } from "react-icons/fa";

const API = 'http://localhost:5001/api';

export default function Reports() {
    const [history, setHistory] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [coaching, setCoaching] = useState('');
    const [coachingLoading, setCoachingLoading] = useState(false);

    const fetchCoaching = async (report) => {
        setCoachingLoading(true);
        setCoaching('');
        try {
            const token = localStorage.getItem('token');
            const results = (report.questions || []).map(q => ({
                question: q.questionText,
                user_answer: q.userAnswer,
                accuracy_score: q.accuracy_score,
                evaluation: q.evaluationType
            }));
            const res = await axios.post(`${API}/interview/coaching`, { results }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoaching(res.data.coaching);
        } catch { setCoaching('Keep practicing! Focus on areas where your scores were lowest.'); }
        finally { setCoachingLoading(false); }
    };


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
                fetchCoaching(data); // Auto-fetch AI coaching
            }
        } catch (err) {
            console.error("Failed to fetch report", err);
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
                    <ReportDetail 
                        report={selectedReport} 
                        coaching={coaching} 
                        coachingLoading={coachingLoading} 
                        fetchCoaching={() => fetchCoaching(selectedReport)}
                    />
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
                                    <div key={item._id} className="history-card" style={{ transition: 'all 0.3s ease', position: 'relative' }}>
                                        <div className="history-content" onClick={() => handleViewReport(item._id)} style={{ cursor: 'pointer' }}>
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
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const navigate = window.confirm("Retake this exact session settings?");
                                                        if (navigate) window.location.href = `/interview?category=${item.category}&difficulty=${item.difficulty}`;
                                                    }}
                                                    style={{
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        border: '1px solid var(--primary)',
                                                        color: 'var(--primary)',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaRedo style={{ marginRight: '5px' }} /> Retry
                                                </button>
                                                <div
                                                    onClick={() => handleViewReport(item._id)}
                                                    style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                >
                                                    <FaChartLine />
                                                </div>
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

function ReportDetail({ report, coaching, coachingLoading, fetchCoaching }) {
    const questions = report.questions || [];
    const [expandedResults, setExpandedResults] = useState({});

    const toggleField = (idx, field) => {
        setExpandedResults(prev => ({
            ...prev,
            [`${idx}_${field}`]: !prev[`${idx}_${field}`]
        }));
    };

    const handleRetry = () => {
        window.location.href = `/interview?retryId=${report._id}`;
    };

    return (
        <div className="detail-container fade-in">
            {/* Header */}
            <div className="report-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div className="report-meta">
                    <h1>{report.category} Report</h1>
                    <p><FaCalendarAlt style={{ marginRight: '8px' }} />Conducted on {new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                    <div className="badge positive" style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
                        Final Score: {report.overallScore.toFixed(1)}/10
                    </div>
                    <button
                        className="btn primary"
                        onClick={handleRetry}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                        }}
                    >
                        <FaRedo /> Retake This Session
                    </button>
                </div>
            </div>
            {/* AI Coach Card */}
            <div style={{ 
                background: 'rgba(139, 92, 246, 0.05)', 
                borderRadius: '20px', 
                padding: '24px', 
                border: '1px solid rgba(139, 92, 246, 0.2)', 
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '100px', color: 'rgba(139, 92, 246, 0.03)', pointerEvents: 'none' }}>
                    <FaBrain />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                        <FaBrain />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>AI Performance Coach</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Personalized analysis by llama3</p>
                    </div>
                </div>

                {coachingLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        <div style={{ margin: '0 auto 10px auto', width: '24px', height: '24px', border: '3px solid rgba(139,92,246,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Analyzing your performance...
                    </div>
                ) : coaching ? (
                    <div className="coaching-text" style={{ color: '#e2e8f0', lineHeight: '1.6', fontSize: '15px' }}>
                        {coaching}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <button onClick={fetchCoaching} className="btn secondary" style={{ fontSize: '13px' }}>Regenerate Coaching</button>
                    </div>
                )}
            </div>

            {/* Archived Resume Analysis if available */}
            {report.resumeAnalysis && (
                <div style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <FaSpellCheck style={{ color: 'var(--primary)' }} />
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Archived Profile Analysis</h3>
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '14px', marginBottom: '20px' }}>{report.resumeAnalysis.summary}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Detected Skills</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {report.resumeAnalysis.skills?.map(s => (
                                    <span key={s} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', fontSize: '11px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>{s}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Recommended Focus</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {report.resumeAnalysis.categories?.map(c => (
                                    <span key={c} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontSize: '11px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>{c}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="qa-question" style={{ marginBottom: (q.category || q.topic) ? '12px' : '20px' }}>Q{idx + 1}: {q.questionText}</div>
                        
                        {(q.category || q.topic) && (
                            <div className="qa-tags" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                {q.category && (
                                    <span style={{ 
                                        background: 'rgba(99, 102, 241, 0.1)', 
                                        color: '#818cf8', 
                                        padding: '2px 10px', 
                                        borderRadius: '6px', 
                                        fontSize: '10px', 
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        border: '1px solid rgba(99, 102, 241, 0.2)'
                                    }}>
                                        {q.category}
                                    </span>
                                )}
                                {q.topic && (
                                    <span style={{ 
                                        background: 'rgba(16, 185, 129, 0.1)', 
                                        color: '#34d399', 
                                        padding: '2px 10px', 
                                        borderRadius: '6px', 
                                        fontSize: '10px', 
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        border: '1px solid rgba(16, 185, 129, 0.2)'
                                    }}>
                                        {q.topic}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="qa-answer" style={{ marginBottom: '15px', color: q.userAnswer ? '#cbd5e1' : '#f87171' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '5px' }}>Your Answer:</span>
                            {q.userAnswer ? `"${q.userAnswer}"` : <span style={{ fontStyle: 'italic' }}>You skipped this</span>}
                        </div>

                        {q.refinedAnswer && q.refinedAnswer !== q.userAnswer && (
                            <div className="qa-answer" style={{ marginBottom: '20px', padding: '15px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    ✨ Improved Answer ({q.evaluationType})
                                </span>
                                <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.6' }}>"{q.refinedAnswer}"</p>
                            </div>
                        )}

                        {q.idealAnswer && (
                            <div className="qa-answer" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.1)', color: '#a5b4fc', marginBottom: '20px' }}>
                                <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>SUGGESTION / IDEAL ANSWER</span>
                                {q.idealAnswer}
                            </div>
                        )}

                        <div className="metrics-badges" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px', marginBottom: '20px' }}>
                            <span className="badge score" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '700' }}>
                                Accuracy: {Math.round((q.accuracy_score || q.final_score / 10 || 0) * 100)}%
                            </span>
                            <span className="badge time" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                                <FaClock /> {q.timeTaken ? `${q.timeTaken}s` : '0s'}
                            </span>
                            <span className="badge similarity" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700' }}>
                                Confidence: {Math.round((q.confidence_score || 0) * 100)}%
                            </span>
                            {q.keyword_score !== undefined && (
                                <span className="badge tone" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.1)', fontSize: '0.75rem', color: '#ec4899', fontWeight: '700' }}>
                                    Keywords: {Math.round((q.keyword_score || 0) * 100)}%
                                </span>
                            )}
                            <span className={`badge eval ${q.evaluation === 'Excellent' ? 'positive' : q.evaluation === 'Good' ? 'neutral' : 'negative'}`} style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#fff', fontWeight: '700' }}>
                                {q.evaluation || 'Partial'}
                            </span>
                            {q.cheating_flag && (
                                <span className="badge cheating" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', fontSize: '0.75rem', color: '#f87171', fontWeight: '800' }}>
                                    ⚠️ SUSPICIOUS ACTIVITY
                                </span>
                            )}
                        </div>

                        {q.explanation && (
                            <div className="qa-overview" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.1)', marginBottom: '15px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaLightbulb /> AI EVALUATION
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#bbf7d0', lineHeight: '1.5' }}>
                                    {q.explanation}
                                </p>
                            </div>
                        )}

                        {q.grammar && q.grammar.issues && q.grammar.issues.length > 0 && (
                            <div className="feedback-section" style={{ marginTop: '15px' }}>
                                <div className="feedback-title" style={{ fontSize: '0.8rem', color: '#f87171' }}><FaExclamationTriangle /> Grammar Feedback</div>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ffbdc3', fontSize: '0.85rem' }}>
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
