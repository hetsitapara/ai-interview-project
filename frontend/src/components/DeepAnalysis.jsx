import React from 'react';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaTools, FaFilePdf, FaBrain } from 'react-icons/fa';
import { generatePremiumPDF } from '../utils/generatePremiumPDF';

export default function DeepAnalysis({ report, onBack }) {
    if (!report) return null;

    const questions = report.questions || [];
    const score = Number(report.overallScore || 0);

    // Combine data for deep insights
    const allGrammarIssues = [];
    const strengths = [];
    const improvements = [];
    
    questions.forEach((q, idx) => {
        if (q.grammar_issues && q.grammar_issues.length > 0) {
            allGrammarIssues.push(...q.grammar_issues.map(g => `Q${idx + 1}: ${g}`));
        }

        if (q.final_score >= 7) {
            strengths.push({ qTitle: q.questionText || q.question, score: q.final_score });
        } else {
            improvements.push({ qTitle: q.questionText || q.question, score: q.final_score, evaluation: q.evaluation });
        }
    });

    const getScoreColor = (s) => s >= 8 ? '#4ade80' : s >= 6 ? '#818cf8' : s >= 4 ? '#facc15' : '#f87171';
    const sCol = getScoreColor(score);

    return (
        <div style={{ padding: '40px 5%', minHeight: '100vh', background: '#03030a', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
            <style>{`
                @keyframes daFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
                @keyframes daPulse { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
                .da-card { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid rgba(255,255,255,0.06); }
                .da-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.12); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                .da-btn-pdf:hover { transform: scale(1.02); box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
            `}</style>

            <div style={{ maxWidth: '1240px', margin: '0 auto', animation: 'daFadeUp 0.6s ease out' }}>
                
                {/* ── TOP NAV ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
                    <button 
                        onClick={onBack} 
                        style={{ 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#94a3b8', padding: '12px 24px', borderRadius: '50px', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                            fontSize: '14px', fontWeight: '700', transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        <FaArrowLeft /> Back to Summary
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                            <span style={{ fontWeight: '900', fontSize: '20px' }}>P</span>
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-1px' }}>Prep<span style={{ color: '#818cf8' }}>AI</span></span>
                    </div>

                    <button 
                        className="da-btn-pdf"
                        onClick={() => generatePremiumPDF(report)}
                        style={{ 
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', 
                            color: '#fff', padding: '12px 28px', borderRadius: '50px', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                            fontSize: '14px', fontWeight: '800', transition: 'all 0.3s ease'
                        }}
                    >
                        <FaFilePdf /> Download PDF Report
                    </button>
                </div>

                {/* ── HERO SECTION ── */}
                <div style={{ 
                    background: 'rgba(15, 23, 42, 0.4)', padding: '60px', 
                    borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', 
                    backdropFilter: 'blur(20px)', marginBottom: '40px',
                    display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px', alignItems: 'center'
                }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50px', padding: '6px 16px', marginBottom: '24px' }}>
                            <FaBrain style={{ color: '#818cf8', fontSize: '14px' }} />
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Performance Analysis</span>
                        </div>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 16px', letterSpacing: '-2px', lineHeight: '1' }}>
                            Deep Analysis <span style={{ color: '#818cf8' }}>Insights</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '18px', lineHeight: '1.6', maxWidth: '500px' }}>
                            We've processed your responses using advanced linguistic models to provide a comprehensive evaluation of your skills.
                        </p>
                    </div>

                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Overall Proficiency</div>
                        <div style={{ fontSize: '84px', fontWeight: '950', color: sCol, letterSpacing: '-4px', lineHeight: '1' }}>
                            {score.toFixed(1)}<span style={{ fontSize: '24px', color: '#334155', verticalAlign: 'middle', marginLeft: '4px' }}>/10</span>
                        </div>
                        <div style={{ marginTop: '16px', display: 'inline-block', padding: '6px 20px', borderRadius: '50px', background: `${sCol}15`, border: `1px solid ${sCol}30`, color: sCol, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {score >= 8 ? 'Mastery Level' : score >= 6 ? 'Competent' : score >= 4 ? 'Developing' : 'Foundational'}
                        </div>
                    </div>
                </div>

                {/* ── INSIGHT CARDS ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                    
                    {/* Strengths Card */}
                    <div className="da-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(74, 222, 128, 0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaCheckCircle style={{ color: '#4ade80', fontSize: '20px' }} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>Key Strengths</h3>
                        </div>
                        {strengths.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {strengths.map((s, i) => (
                                    <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>High Proficiency</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '600', lineHeight: '1.5' }}>{s.qTitle}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No key strengths identified yet. Focus on building consistency across all categories.</p>
                        )}
                    </div>

                    {/* Improvements Card */}
                    <div className="da-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(248, 113, 113, 0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaExclamationTriangle style={{ color: '#f87171', fontSize: '20px' }} />
                            </div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#fff' }}>Areas for Growth</h3>
                        </div>
                        {improvements.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {improvements.map((imp, i) => (
                                    <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ fontSize: '12px', color: '#f87171', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' }}>Focus Area</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '600', lineHeight: '1.5', marginBottom: '10px' }}>{imp.qTitle}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '13px', padding: '10px', background: 'rgba(248,113,113,0.05)', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.1)' }}>
                                            {imp.evaluation || "Needs more detail and precision in response."}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#4ade80', fontWeight: '700' }}>Outstanding! You handled all questions with significant expertise.</p>
                        )}
                    </div>
                </div>

                {/* ── LOWER GRID ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                    
                    {/* Grammar Panel */}
                    <div className="da-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(251, 191, 36, 0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaTools style={{ color: '#fbbf24', fontSize: '18px' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Grammar & Clarity</h3>
                        </div>
                        {allGrammarIssues.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {allGrammarIssues.map((issue, idx) => (
                                    <div key={idx} style={{ background: 'rgba(251, 191, 36, 0.05)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(251, 191, 36, 0.15)', color: '#fde68a', fontSize: '13px', lineHeight: '1.6' }}>
                                        {issue}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', border: '1px dashed rgba(74, 222, 128, 0.3)', borderRadius: '20px' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
                                <p style={{ color: '#4ade80', fontSize: '14px', fontWeight: '700', margin: 0 }}>Flawless communication. Your responses were clear and structurally sound.</p>
                            </div>
                        )}
                    </div>

                    {/* Actionable Tips */}
                    <div className="da-card" style={{ padding: '40px', borderRadius: '32px', background: 'rgba(99, 102, 241, 0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FaLightbulb style={{ color: '#818cf8', fontSize: '18px' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Actionable Roadmap</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[
                                { 
                                    condition: score < 6,
                                    title: "Core Concepts",
                                    desc: "Focus on fundamental theory. Revisit the building blocks of this category."
                                },
                                { 
                                    condition: true,
                                    title: "STAR Framework",
                                    desc: "Structure answers with Situation, Task, Action, and Result for maximum impact."
                                },
                                { 
                                    condition: improvements.length > 0,
                                    title: "Targeted Practice",
                                    desc: "Schedule mock sessions focusing exclusively on your lower-scoring topics."
                                },
                                { 
                                    condition: allGrammarIssues.length > 2,
                                    title: "Professional Polish",
                                    desc: "Simplify sentence structures to reduce errors and improve professional tone."
                                }
                            ].filter(t => t.condition).map((tip, i) => (
                                <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px', marginBottom: '8px' }}>{tip.title}</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{tip.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

