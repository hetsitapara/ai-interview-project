import React from 'react';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaTools } from 'react-icons/fa';

export default function DeepAnalysis({ report, onBack }) {
    if (!report) return null;

    const questions = report.questions || [];

    // Combine data for deep insights
    const totalQuestions = questions.length;
    let totalTime = 0;
    const allGrammarIssues = [];
    const strengths = [];
    const improvements = [];
    
    questions.forEach((q, idx) => {
        totalTime += (q.timeTaken || 0);

        if (q.grammar_issues && q.grammar_issues.length > 0) {
            allGrammarIssues.push(...q.grammar_issues.map(g => `Q${idx + 1}: ${g}`));
        }

        if (q.final_score >= 7) {
            strengths.push({ qTitle: q.questionText, score: q.final_score });
        } else {
            improvements.push({ qTitle: q.questionText, score: q.final_score, evaluation: q.evaluation });
        }
    });

    return (
        <div style={{ padding: '40px 5%', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <div className="detail-container fade-in" style={{ 
                maxWidth: '1200px', margin: '0 auto', 
                background: 'rgba(15, 23, 42, 0.95)', padding: '48px', 
                borderRadius: '32px', border: '1px solid var(--glass-border)', 
                backdropFilter: 'blur(40px)' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                    <button 
                        onClick={onBack} 
                        style={{ 
                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
                            color: '#fff', padding: '12px 20px', borderRadius: '12px', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            marginRight: 'auto', transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        <FaArrowLeft /> Back to Summary
                    </button>
                    <div style={{ textAlign: 'center', flex: 1, marginRight: '100px' }}>
                        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, fontFamily: 'var(--font-heading)' }}>
                            Deep Analysis Insights
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Detailed breakdown of your performance</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    {/* Strengths Card */}
                    <div style={{ padding: '32px', borderRadius: '24px', background: 'rgba(46, 213, 115, 0.05)', border: '1px solid rgba(46, 213, 115, 0.2)' }}>
                        <h3 style={{ color: '#2ed573', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '20px' }}>
                            <FaCheckCircle /> Key Strengths
                        </h3>
                        {strengths.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', color: '#c8d6e5', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {strengths.map((s, i) => (
                                    <li key={i}><strong>Excellent on:</strong> {s.qTitle} (Score: {s.score}/10)</li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: '#8395a7' }}>No key strengths identified in this session. Keep practicing!</p>
                        )}
                    </div>

                    {/* Areas for Improvement */}
                    <div style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255, 71, 87, 0.05)', border: '1px solid rgba(255, 71, 87, 0.2)' }}>
                        <h3 style={{ color: '#ff4757', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '20px' }}>
                            <FaExclamationTriangle /> Areas for Improvement
                        </h3>
                        {improvements.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', color: '#c8d6e5', listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {improvements.map((imp, i) => (
                                    <li key={i}><strong>Needs Work:</strong> {imp.qTitle} <br/><span style={{ color: '#ff6b81', fontSize: '14px' }}>Evaluation: {imp.evaluation}</span></li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: '#8395a7' }}>Great job! No major areas of concern.</p>
                        )}
                    </div>
                </div>

                {/* Grammar & Communication Card */}
                <div style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255, 165, 2, 0.05)', border: '1px solid rgba(255, 165, 2, 0.2)', marginBottom: '40px' }}>
                    <h3 style={{ color: '#ffa502', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '20px' }}>
                        <FaTools /> Communication & Grammar
                    </h3>
                    {allGrammarIssues.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            {allGrammarIssues.map((issue, idx) => (
                                <div key={idx} style={{ background: 'rgba(255, 165, 2, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 165, 2, 0.2)', color: '#ffeaa7', fontSize: '14px' }}>
                                    {issue}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#8395a7' }}>Your grammar and communication were perfect. No issues flagged!</p>
                    )}
                </div>

                {/* Overall Actionable Tips */}
                <div style={{ padding: '32px', borderRadius: '24px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <h3 style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', marginBottom: '20px' }}>
                        <FaLightbulb /> Actionable Tips
                    </h3>
                    <ul style={{ paddingLeft: '20px', color: '#c8d6e5', listStyleType: 'square', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {report.overallScore < 6 && (
                            <li><strong>Review Core Concepts:</strong> Your overall score indicates some gaps in foundational knowledge. Revisit the basics.</li>
                        )}
                        {totalTime / totalQuestions < 20 && (
                            <li><strong>Elaborate Your Answers:</strong> You are answering very quickly. Try to use the STAR method (Situation, Task, Action, Result) to provide more detail.</li>
                        )}
                        {improvements.length > 0 && (
                            <li><strong>Practice Weak Areas:</strong> Focus your next mock interview specifically on topics where you scored lower today.</li>
                        )}
                        <li><strong>Confidence and Pacing:</strong> Keep a steady pace. Take a deep breath before answering complex questions to structure your thoughts.</li>
                        {allGrammarIssues.length > 3 && (
                            <li><strong>Grammar Check:</strong> A few grammatical patterns were noticed. Reviewing basic sentence structures could improve the professional polish of your answers.</li>
                        )}
                    </ul>
                </div>

            </div>
        </div>
    );
}
