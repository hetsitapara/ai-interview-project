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
    const [stats, setStats] = useState({ averageScore: 0, totalSessions: 0, topCategory: 'N/A', recentTrend: [] });
    const [dailyTip, setDailyTip] = useState('Loading your daily career insight...');

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

        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statsRes, tipRes] = await Promise.all([
                    axios.get(`${API}/stats/summary`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API}/stats/tip`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setStats(statsRes.data);
                setDailyTip(tipRes.data.tip);
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };

        fetchHistory();
        fetchStats();
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
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaChartLine style={{ color: 'var(--primary)' }} /> Performance Trend
                            </h4>
                            <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '6px', marginTop: '20px', padding: '0 5px' }}>
                                {stats.recentTrend.length > 0 ? stats.recentTrend.map((h, i) => (
                                    <div 
                                        key={i} 
                                        title={`Score: ${h}/10`}
                                        style={{ 
                                            flex: 1, 
                                            height: `${(h / 10) * 100}%`, 
                                            background: 'linear-gradient(to top, var(--primary), #a78bfa)', 
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                            animation: `growUp 0.8s ease-out ${i * 0.1}s both`
                                        }}
                                    ></div>
                                )) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '11px', border: '1px dashed var(--glass-border)', borderRadius: '8px' }}>
                                        No trend data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="widget-card">
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaCheckCircle style={{ color: '#4ade80' }} /> Achievements
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                                {[
                                    { icon: '🌟', label: 'Pro', active: stats.averageScore >= 8 },
                                    { icon: '🔥', label: 'Active', active: stats.totalSessions >= 5 },
                                    { icon: '🎓', label: 'Expert', active: stats.totalSessions >= 10 },
                                    { icon: '🚀', label: 'Fast', active: history.length > 0 }
                                ].map((ach, i) => (
                                    <div 
                                        key={i} 
                                        style={{ 
                                            padding: '12px 8px', 
                                            background: ach.active ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.01)', 
                                            borderRadius: '12px', 
                                            textAlign: 'center', 
                                            border: `1px solid ${ach.active ? 'rgba(139, 92, 246, 0.3)' : 'var(--glass-border)'}`,
                                            opacity: ach.active ? 1 : 0.3,
                                            transform: ach.active ? 'scale(1)' : 'scale(0.95)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ fontSize: '22px', marginBottom: '4px' }}>{ach.icon}</div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: ach.active ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{ach.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="widget-card" style={{ 
                            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08), rgba(34, 197, 94, 0.08))', 
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '60px', color: 'rgba(74, 222, 128, 0.05)', transform: 'rotate(15deg)' }}>
                                <FaLightbulb />
                            </div>
                            <h4 style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                                <FaLightbulb /> Career Insight
                            </h4>
                            <p style={{ position: 'relative', fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0', fontStyle: 'italic', marginTop: '12px' }}>
                                "{dailyTip}"
                            </p>
                        </div>
                    </aside>

                    {/* Reports Main area */}
                    <main className="content-main">
                        <header style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                                <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                                    <FaChartLine size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: 0 }}>Session History</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Deep dive into your AI-analyzed interview performance logs.</p>
                                </div>
                            </div>
                        </header>

                        {/* Quick Stats Summary */}
                        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <div className="stat-card" style={{ background: 'rgba(139, 92, 246, 0.03)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Average Mastery</div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>{stats.averageScore}<span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/10</span></div>
                            </div>
                            <div className="stat-card" style={{ background: 'rgba(74, 222, 128, 0.03)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Sessions</div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>{stats.totalSessions}</div>
                            </div>
                            <div className="stat-card" style={{ background: 'rgba(244, 63, 94, 0.03)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Top Domain</div>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '10px' }}>{stats.topCategory}</div>
                            </div>
                        </div>

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
                                                        if (navigate) window.location.href = `/interview?retryId=${item._id}`;
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
                        Final Score: {report.overallScore ? report.overallScore.toFixed(1) : '0.0'}/10
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
                    <div className="stat-value">{report.overallScore ? report.overallScore.toFixed(1) : '0.0'}</div>
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

                        {/* Toggle buttons row */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                            {(q.aiImprovedAnswer || q.aiAdvice) && (
                                <button
                                    onClick={() => toggleField(idx, 'ai')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '8px 16px', borderRadius: '9px', cursor: 'pointer',
                                        background: expandedResults[`${idx}_ai`] ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.08)',
                                        border: '1px solid rgba(139, 92, 246, 0.4)',
                                        color: '#a78bfa', fontWeight: '700', fontSize: '11px',
                                        transition: 'all 0.2s ease', textTransform: 'uppercase'
                                    }}
                                >
                                    🤖 AI Generated Answer {expandedResults[`${idx}_ai`] ? '▲' : '▼'}
                                </button>
                            )}
                            {q.idealAnswer && (
                                <button
                                    onClick={() => toggleField(idx, 'db')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        padding: '8px 16px', borderRadius: '9px', cursor: 'pointer',
                                        background: expandedResults[`${idx}_db`] ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.06)',
                                        border: '1px solid rgba(16, 185, 129, 0.35)',
                                        color: '#34d399', fontWeight: '700', fontSize: '11px',
                                        transition: 'all 0.2s ease', textTransform: 'uppercase'
                                    }}
                                >
                                    📚 Database Answer {expandedResults[`${idx}_db`] ? '▲' : '▼'}
                                </button>
                            )}
                        </div>

                        {/* AI Generated Answer Panel */}
                        {expandedResults[`${idx}_ai`] && (q.aiImprovedAnswer || q.aiAdvice) && (
                            <div style={{ marginBottom: '14px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)', animation: 'fadeIn 0.25s ease' }}>
                                {q.aiImprovedAnswer && (
                                    <div style={{ padding: '18px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' }}>
                                        <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            🤖 AI GENERATED ANSWER
                                        </span>
                                        <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: '1.7' }}>{q.aiImprovedAnswer}</p>
                                    </div>
                                )}
                                {q.aiAdvice && (
                                    <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderTop: '1px solid rgba(139, 92, 246, 0.15)' }}>
                                        <span style={{ color: '#818cf8', fontWeight: '700', fontSize: '11px', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>💡 ADVICE / ENHANCEMENTS</span>
                                        <p style={{ margin: 0, color: '#a5b4fc', fontSize: '12px', lineHeight: '1.6' }}>{q.aiAdvice}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Database Answer Panel */}
                        {expandedResults[`${idx}_db`] && q.idealAnswer && (
                            <div style={{ marginBottom: '14px', padding: '18px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', animation: 'fadeIn 0.25s ease' }}>
                                <span style={{ color: '#34d399', fontWeight: '700', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    📚 DATABASE / REFERENCE ANSWER
                                </span>
                                <p style={{ margin: 0, color: '#a7f3d0', fontSize: '13px', lineHeight: '1.75' }}>{q.idealAnswer}</p>
                            </div>
                        )}

                        <div className="metrics-badges" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px', marginBottom: '20px' }}>
                            <span className="badge score" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '700' }}>
                                Accuracy: {Math.round((q.accuracy_score || 0) * 100)}%
                            </span>

                            {q.keyword_score !== undefined && (
                                <span className="badge tone" style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.1)', fontSize: '0.75rem', color: '#ec4899', fontWeight: '700' }}>
                                    Keywords: {Math.round((q.keyword_score || 0) * 100)}%
                                </span>
                            )}
                            <span className={`badge eval`} style={{ padding: '4px 10px', borderRadius: '8px', background: q.final_score >= 7 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 165, 2, 0.1)', fontSize: '0.8rem', color: q.final_score >= 7 ? '#4ade80' : '#ffa502', fontWeight: '800' }}>
                                {q.final_score}/10
                            </span>
                        </div>

                        {q.explanation && (
                            <div className="qa-overview" style={{ padding: '20px', borderRadius: '16px', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.1)', marginBottom: '15px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaLightbulb /> AI SCORING RATIONALE
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#bbf7d0', lineHeight: '1.5' }}>
                                    {q.explanation}
                                </p>
                            </div>
                        )}

                        {q.grammar_issues && q.grammar_issues.length > 0 && (
                            <div className="feedback-section" style={{ marginTop: '15px' }}>
                                <div className="feedback-title" style={{ fontSize: '0.8rem', color: '#f87171' }}><FaExclamationTriangle /> Grammar Feedback</div>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ffbdc3', fontSize: '0.85rem' }}>
                                    {q.grammar_issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
}
