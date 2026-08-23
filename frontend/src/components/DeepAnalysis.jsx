import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaTools,
         FaFilePdf, FaBrain, FaTrophy, FaFire, FaChartBar, FaCode, FaStar,
         FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { generatePremiumPDF } from '../utils/generatePremiumPDF';

/* ─── Animated count-up hook ─── */
function useCountUp(target, duration = 1400, delay = 200) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = null;
        let frame;
        const timeout = setTimeout(() => {
            const step = (ts) => {
                if (!start) start = ts;
                const prog = Math.min((ts - start) / duration, 1);
                const ease = 1 - Math.pow(1 - prog, 4);
                setVal(+(target * ease).toFixed(1));
                if (prog < 1) frame = requestAnimationFrame(step);
                else setVal(target);
            };
            frame = requestAnimationFrame(step);
        }, delay);
        return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
    }, [target, duration, delay]);
    return val;
}

/* ─── Mini animated progress bar ─── */
function MiniBar({ value, color, delay = 0 }) {
    const [w, setW] = useState(0);
    useEffect(() => {
        const t = setTimeout(() => setW(value), delay + 300);
        return () => clearTimeout(t);
    }, [value, delay]);
    return (
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', flex: 1 }}>
            <div style={{
                height: '100%', borderRadius: '99px', width: `${w}%`,
                background: color, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 10px ${color}80`
            }} />
        </div>
    );
}

/* ─── Animated SVG ring ─── */
function ScoreRing({ score, size = 180, strokeW = 10 }) {
    const radius = (size - strokeW * 2) / 2;
    const circ = 2 * Math.PI * radius;
    const [offset, setOffset] = useState(circ);
    const animated = useCountUp(score, 1600, 400);
    useEffect(() => {
        const t = setTimeout(() => setOffset(circ - (circ * Math.min(score, 10)) / 10), 500);
        return () => clearTimeout(t);
    }, [score, circ]);
    const col = score >= 8 ? '#4ade80' : score >= 6 ? '#818cf8' : score >= 4 ? '#facc15' : '#f87171';
    const label = score >= 8 ? 'Expert' : score >= 6 ? 'Skilled' : score >= 4 ? 'Developing' : 'Foundational';
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                    <linearGradient id={`rg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor={col} />
                    </linearGradient>
                    <filter id="rglow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                <circle cx={size/2} cy={size/2} r={radius} fill="none"
                    stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
                <circle cx={size/2} cy={size/2} r={radius} fill="none"
                    stroke={`url(#rg-${size})`} strokeWidth={strokeW} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1)', filter: 'url(#rglow)' }} />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', textAlign: 'center'
            }}>
                <span style={{
                    fontSize: size > 150 ? '48px' : '28px', fontWeight: 900,
                    lineHeight: 1, letterSpacing: '-2px',
                    background: `linear-gradient(135deg, #fff 30%, ${col})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>{animated.toFixed(1)}</span>
                <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.7)', fontWeight: 600, marginTop: 4 }}>/10</span>
                {size > 150 && (
                    <span style={{
                        marginTop: 10, fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px',
                        textTransform: 'uppercase', padding: '4px 12px', borderRadius: '99px',
                        background: `${col}20`, border: `1px solid ${col}40`, color: col
                    }}>{label}</span>
                )}
            </div>
        </div>
    );
}

/* ─── Metric row with icon + bar ─── */
function MetricRow({ label, value, color, icon, delay }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', width: 110, flexShrink: 0 }}>{label}</span>
            <MiniBar value={value} color={color} delay={delay} />
            <span style={{ fontSize: 13, fontWeight: 800, color, width: 40, textAlign: 'right', flexShrink: 0 }}>{value}%</span>
        </div>
    );
}

/* ─── Question card ─── */
function QuestionCard({ q, idx, expanded, onToggle }) {
    const score = Number(q.final_score || 0);
    const col = score >= 7 ? '#4ade80' : score >= 4 ? '#facc15' : '#f87171';
    const accuracy = Math.round((q.accuracy_score || 0) * 100);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} style={{
            opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            transitionDelay: `${idx * 80}ms`
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.025)', borderRadius: 24,
                border: `1px solid rgba(255,255,255,0.07)`,
                borderLeft: `4px solid ${col}`,
                overflow: 'hidden', marginBottom: 20,
                transition: 'all 0.3s ease',
                boxShadow: expanded ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${col}20` : 'none'
            }}>
                {/* Card header — always visible */}
                <div
                    onClick={onToggle}
                    style={{ padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 20 }}
                >
                    {/* Index bubble */}
                    <div style={{
                        width: 40, height: 40, flexShrink: 0, borderRadius: 12,
                        background: `${col}18`, border: `1px solid ${col}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 900, color: col
                    }}>{idx + 1}</div>

                    {/* Question */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.5 }}>
                            {q.questionText || q.question}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {q.category && <Tag label={q.category} color="#818cf8" bg="rgba(99,102,241,0.1)" />}
                            {q.topic    && <Tag label={q.topic}    color="#34d399" bg="rgba(16,185,129,0.1)" />}
                            <Tag label={`Accuracy ${accuracy}%`} color="#f472b6" bg="rgba(236,72,153,0.1)" />
                            <Tag label={`Time ${q.timeTaken || 0}s`} color="#fbbf24" bg="rgba(245,158,11,0.1)" />
                        </div>
                    </div>

                    {/* Score ring */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <ScoreRing score={score} size={68} strokeW={6} />
                    </div>

                    {/* Chevron */}
                    <div style={{
                        width: 32, height: 32, flexShrink: 0, borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(148,163,184,0.6)', fontSize: 13,
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s ease'
                    }}>▼</div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                    <div style={{ padding: '0 28px 28px', animation: 'daSlideDown 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {/* Your Response */}
                            <div style={{ gridColumn: '1/-1' }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(148,163,184,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>Your Response</div>
                                <div style={{
                                    background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '16px 20px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    fontSize: 14, color: '#e2e8f0', lineHeight: 1.7
                                }}>{q.userAnswer || q.answer || '—'}</div>
                            </div>

                            {/* AI Evaluation */}
                            {q.evaluation && (
                                <div style={{ gridColumn: '1/-1' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>🤖 AI Evaluation</div>
                                    <div style={{
                                        background: 'rgba(99,102,241,0.06)', borderRadius: 14, padding: '16px 20px',
                                        borderLeft: '3px solid #6366f1',
                                        fontSize: 14, color: '#c7d2fe', lineHeight: 1.7
                                    }}>{q.evaluation}</div>
                                </div>
                            )}

                            {/* Ideal Answer */}
                            {q.idealAnswer && (
                                <div style={{ gridColumn: '1/-1' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#34d399', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>✅ Ideal Answer</div>
                                    <div style={{
                                        background: 'rgba(16,185,129,0.05)', borderRadius: 14, padding: '16px 20px',
                                        borderLeft: '3px solid #10b981',
                                        fontSize: 14, color: '#a7f3d0', lineHeight: 1.7
                                    }}>{q.idealAnswer}</div>
                                </div>
                            )}

                            {/* Metrics */}
                            <div style={{ gridColumn: '1/-1', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <MetricRow label="Accuracy"  value={accuracy}                                    color="#f472b6" icon="🎯" delay={0} />
                                <MetricRow label="Fluency"   value={Math.round((q.fluency_score   || 0) * 100)} color="#818cf8" icon="💬" delay={80} />
                                <MetricRow label="Keywords"  value={Math.round((q.keyword_score   || 0) * 100)} color="#34d399" icon="🔑" delay={160} />
                                <MetricRow label="Depth"     value={Math.min(100, Math.round(score * 10))}      color="#fbbf24" icon="📚" delay={240} />
                            </div>

                            {/* Grammar issues */}
                            {q.grammar_issues && q.grammar_issues.length > 0 && (
                                <div style={{ gridColumn: '1/-1' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>⚠️ Grammar Notes</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {q.grammar_issues.map((g, i) => (
                                            <div key={i} style={{
                                                padding: '8px 14px', borderRadius: 8,
                                                background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)',
                                                fontSize: 13, color: '#fde68a'
                                            }}>{g}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Tag({ label, color, bg }) {
    return (
        <span style={{
            padding: '3px 10px', borderRadius: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
            background: bg, color, border: `1px solid ${color}30`
        }}>{label}</span>
    );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function DeepAnalysis({ report, onBack }) {
    const [expandedIdx, setExpandedIdx] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

    if (!report) return null;

    const questions = report.questions || [];
    const score = Math.min(10, Number(report.overallScore || 0));

    const strengths    = questions.filter(q => Number(q.final_score) >= 7);
    const improvements = questions.filter(q => Number(q.final_score) < 7);
    const allGrammar   = questions.flatMap((q, i) => (Array.isArray(q.grammar_issues) ? q.grammar_issues : []).map(g => `Q${i+1}: ${g}`));

    const avgAccuracy = Math.round(questions.reduce((a, q) => a + (q.accuracy_score || 0), 0) / Math.max(questions.length, 1) * 100);
    const avgFluency  = Math.round(questions.reduce((a, q) => a + (q.fluency_score  || 0), 0) / Math.max(questions.length, 1) * 100);
    const avgKeyword  = Math.round(questions.reduce((a, q) => a + (q.keyword_score  || 0), 0) / Math.max(questions.length, 1) * 100);

    const scoreColor = score >= 8 ? '#4ade80' : score >= 6 ? '#818cf8' : score >= 4 ? '#facc15' : '#f87171';
    const TABS = ['overview', 'questions', 'insights'];

    return (
        <div style={{
            minHeight: '100vh', background: '#03030a', color: '#fff',
            fontFamily: 'Outfit, sans-serif', position: 'relative', overflow: 'hidden'
        }}>
            {/* ── Global keyframes ── */}
            <style>{`
                @keyframes daFadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
                @keyframes daSlideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }
                @keyframes daGlow    { 0%,100%{opacity:.6} 50%{opacity:1} }
                @keyframes daSpin    { to{transform:rotate(360deg)} }
                @keyframes daFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
                @keyframes daPing    { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2);opacity:0} }
                .da-card-hover { transition: all .35s cubic-bezier(.16,1,.3,1); }
                .da-card-hover:hover { transform: translateY(-5px) !important; box-shadow: 0 24px 60px rgba(0,0,0,.5) !important; border-color: rgba(255,255,255,.14) !important; }
                .da-tab { transition: all .25s ease; cursor: pointer; }
                .da-tab:hover { color: #fff !important; }
                .pdf-btn { transition: all .3s ease; }
                .pdf-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 30px rgba(99,102,241,.5) !important; }
                .back-btn { transition: all .25s ease; }
                .back-btn:hover { background: rgba(255,255,255,.1) !important; color: #fff !important; }
                .da-insight-card { transition: all .35s ease; }
                .da-insight-card:hover { transform: translateY(-4px); }
                ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }
            `}</style>

            {/* ── Ambient background orbs ── */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', width: 700, height: 700, top: -200, left: -200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 65%)', animation: 'daFloat 14s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', width: 500, height: 500, bottom: -100, right: -100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.1) 0%, transparent 65%)', animation: 'daFloat 18s ease-in-out infinite reverse' }} />
                <div style={{ position: 'absolute', width: 300, height: 300, top: '40%', left: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,.07) 0%, transparent 65%)', animation: 'daFloat 10s ease-in-out infinite 4s' }} />
            </div>

            {/* ── NAVBAR ── */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(3,3,10,.85)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,.06)',
                padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72
            }}>
                <button className="back-btn" onClick={onBack} style={{
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#94a3b8', padding: '10px 22px', borderRadius: 50,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: 14, fontWeight: 700
                }}>
                    <FaHome /> Return to Dashboard
                </button>

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, boxShadow: '0 4px 14px rgba(99,102,241,.4)' }}>P</div>
                    <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>Prep<span style={{ color: '#818cf8' }}>AI</span></span>
                </div>

                <button className="pdf-btn" onClick={() => generatePremiumPDF(report)} style={{
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none',
                    color: '#fff', padding: '10px 24px', borderRadius: 50, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 800,
                    boxShadow: '0 4px 20px rgba(99,102,241,.4)'
                }}>
                    <FaFilePdf /> Export PDF
                </button>
            </nav>

            {/* ── MAIN CONTENT ── */}
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '60px 5% 120px' }}>

                {/* ═══ HERO SECTION ═══ */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 60,
                    alignItems: 'center', marginBottom: 64,
                    animation: mounted ? 'daFadeUp .7s cubic-bezier(.16,1,.3,1)' : 'none'
                }}>
                    {/* Left text */}
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.25)',
                            borderRadius: 99, padding: '6px 18px', marginBottom: 24, position: 'relative'
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
                                boxShadow: '0 0 8px #4ade80', animation: 'daGlow 1.5s ease-in-out infinite'
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#a5b4fc', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                AI Performance Analysis
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(42px,4.5vw,68px)', fontWeight: 900,
                            lineHeight: 1.02, letterSpacing: '-2.5px', margin: '0 0 20px',
                            background: 'linear-gradient(135deg,#fff 40%,#a5b4fc 70%,#c084fc)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                        }}>
                            Deep Analysis<br/>
                            <span style={{ background: 'linear-gradient(135deg,#818cf8,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Insights</span>
                        </h1>

                        <p style={{ fontSize: 17, color: 'rgba(148,163,184,.8)', lineHeight: 1.7, maxWidth: 480, margin: '0 0 36px' }}>
                            Advanced linguistic AI has processed your responses and generated a comprehensive skill profile across {questions.length} evaluated scenarios.
                        </p>

                        {/* Quick stats strip */}
                        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                            {[
                                { icon: '✅', val: strengths.length,    label: 'Strengths',    col: '#4ade80' },
                                { icon: '📈', val: improvements.length, label: 'Focus Areas',  col: '#f87171' },
                                { icon: '⚠️', val: allGrammar.length,   label: 'Grammar Notes',col: '#fbbf24' },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <span style={{ fontSize: 28, fontWeight: 900, color: s.col, letterSpacing: '-1px' }}>{s.val}</span>
                                    <span style={{ fontSize: 12, color: 'rgba(148,163,184,.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{s.icon} {s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — large score ring + bars */}
                    <div style={{
                        background: 'rgba(255,255,255,.025)', borderRadius: 32,
                        border: '1px solid rgba(255,255,255,.07)', padding: '40px 36px',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 40px 80px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(148,163,184,.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>Overall Score</div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <ScoreRing score={score} size={190} strokeW={12} />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 24 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(148,163,184,.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Skill Breakdown</div>
                            <MetricRow label="Accuracy"  value={avgAccuracy} color="#f472b6" icon="🎯" delay={600}  />
                            <MetricRow label="Fluency"   value={avgFluency}  color="#818cf8" icon="💬" delay={700}  />
                            <MetricRow label="Keywords"  value={avgKeyword}  color="#34d399" icon="🔑" delay={800}  />
                            <MetricRow label="Depth"     value={Math.min(100, Math.round(score * 10))} color="#fbbf24" icon="📚" delay={900} />
                        </div>
                    </div>
                </div>

                {/* ═══ TAB BAR ═══ */}
                <div style={{
                    display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.07)', borderRadius: 16,
                    padding: 6, marginBottom: 48, width: 'fit-content'
                }}>
                    {TABS.map(tab => (
                        <button key={tab} className="da-tab" onClick={() => setActiveTab(tab)} style={{
                            padding: '10px 28px', borderRadius: 11, border: 'none', cursor: 'pointer',
                            fontWeight: 800, fontSize: 14, textTransform: 'capitalize', letterSpacing: '.3px',
                            background: activeTab === tab ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
                            color: activeTab === tab ? '#fff' : 'rgba(148,163,184,.7)',
                            boxShadow: activeTab === tab ? '0 4px 20px rgba(99,102,241,.4)' : 'none',
                            transition: 'all .25s ease'
                        }}>
                            {tab === 'overview' ? '📊 Overview' : tab === 'questions' ? '❓ Questions' : '💡 Insights'}
                        </button>
                    ))}
                </div>

                {/* ═══ OVERVIEW TAB ═══ */}
                {activeTab === 'overview' && (
                    <div style={{ animation: 'daFadeUp .5s ease' }}>
                        {/* 4-metric bento */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
                            {[
                                { icon: '🏆', val: score >= 8 ? 'Expert' : score >= 6 ? 'Skilled' : 'Developing', label: 'Proficiency', col: scoreColor },
                                { icon: '⚡', val: `${questions.length}`, label: 'Questions', col: '#818cf8' },
                                { icon: '🎯', val: `${avgAccuracy}%`, label: 'Avg Accuracy', col: '#f472b6' },
                                { icon: '🔑', val: `${avgKeyword}%`, label: 'Keyword Score', col: '#34d399' },
                            ].map((m, i) => (
                                <div key={i} className="da-card-hover" style={{
                                    background: 'rgba(255,255,255,.025)', borderRadius: 24,
                                    border: '1px solid rgba(255,255,255,.07)', padding: '28px 24px',
                                    backdropFilter: 'blur(16px)',
                                    animation: `daFadeUp .5s ease ${i * 80}ms both`
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
                                    <div style={{ fontSize: 32, fontWeight: 900, color: m.col, letterSpacing: '-1px', marginBottom: 6 }}>{m.val}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(148,163,184,.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Strengths + Improvements */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                            {/* Strengths */}
                            <div className="da-card-hover" style={{
                                background: 'rgba(74,222,128,.03)', border: '1px solid rgba(74,222,128,.1)',
                                borderRadius: 28, padding: 36
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Key Strengths</div>
                                        <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 600 }}>{strengths.length} high-scoring answers</div>
                                    </div>
                                </div>
                                {strengths.length > 0 ? strengths.map((q, i) => (
                                    <div key={i} style={{
                                        padding: '14px 18px', background: 'rgba(255,255,255,.02)', borderRadius: 14,
                                        border: '1px solid rgba(74,222,128,.1)', marginBottom: 10,
                                        display: 'flex', alignItems: 'center', gap: 12
                                    }}>
                                        <span style={{ fontSize: 16, color: '#4ade80', fontWeight: 900 }}>↑</span>
                                        <div>
                                            <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>{(q.questionText || q.question || '').slice(0, 80)}{(q.questionText || '').length > 80 ? '…' : ''}</div>
                                            <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 800, marginTop: 4 }}>Score: {Number(q.final_score).toFixed(1)}/10</div>
                                        </div>
                                    </div>
                                )) : <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: 14 }}>No high-scoring answers yet. Keep practicing!</p>}
                            </div>

                            {/* Improvements */}
                            <div className="da-card-hover" style={{
                                background: 'rgba(248,113,113,.03)', border: '1px solid rgba(248,113,113,.1)',
                                borderRadius: 28, padding: 36
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
                                    <div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Areas for Growth</div>
                                        <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>{improvements.length} answers need work</div>
                                    </div>
                                </div>
                                {improvements.length > 0 ? improvements.map((q, i) => (
                                    <div key={i} style={{
                                        padding: '14px 18px', background: 'rgba(255,255,255,.02)', borderRadius: 14,
                                        border: '1px solid rgba(248,113,113,.1)', marginBottom: 10
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                            <span style={{ fontSize: 16, color: '#f87171', fontWeight: 900 }}>↓</span>
                                            <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{(q.questionText || q.question || '').slice(0, 70)}…</div>
                                        </div>
                                        {q.evaluation && <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, paddingLeft: 28 }}>{q.evaluation.slice(0, 100)}…</div>}
                                    </div>
                                )) : <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 14 }}>🎉 Excellent! You handled all questions with expertise.</p>}
                            </div>
                        </div>

                        {/* Grammar + Roadmap */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                            {/* Grammar */}
                            <div className="da-card-hover" style={{
                                background: 'rgba(251,191,36,.02)', border: '1px solid rgba(251,191,36,.08)',
                                borderRadius: 28, padding: 32
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📝</div>
                                    <div style={{ fontSize: 17, fontWeight: 800 }}>Grammar & Clarity</div>
                                </div>
                                {allGrammar.length > 0 ? allGrammar.slice(0, 5).map((g, i) => (
                                    <div key={i} style={{ padding: '10px 14px', background: 'rgba(251,191,36,.05)', borderRadius: 10, border: '1px solid rgba(251,191,36,.15)', color: '#fde68a', fontSize: 13, marginBottom: 8 }}>{g}</div>
                                )) : (
                                    <div style={{ padding: 24, textAlign: 'center', border: '1px dashed rgba(74,222,128,.3)', borderRadius: 16 }}>
                                        <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
                                        <p style={{ color: '#4ade80', fontSize: 14, fontWeight: 700, margin: 0 }}>Flawless communication — no grammar issues detected!</p>
                                    </div>
                                )}
                            </div>

                            {/* Roadmap tips */}
                            <div className="da-card-hover" style={{
                                background: 'rgba(99,102,241,.03)', border: '1px solid rgba(99,102,241,.09)',
                                borderRadius: 28, padding: 32
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(99,102,241,.1)', border: '1px solid rgba(99,102,241,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🗺️</div>
                                    <div style={{ fontSize: 17, fontWeight: 800 }}>Actionable Roadmap</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    {[
                                        { show: score < 6,              icon: '📖', title: 'Core Concepts',     desc: 'Revisit fundamentals. Build a solid foundation before advancing.' },
                                        { show: true,                   icon: '⭐', title: 'STAR Framework',    desc: 'Structure answers with Situation, Task, Action, Result for max impact.' },
                                        { show: improvements.length > 0,icon: '🎯', title: 'Targeted Practice', desc: 'Run mock sessions focusing on your lower-scoring topics.' },
                                        { show: allGrammar.length > 1,  icon: '🖊️', title: 'Language Polish',   desc: 'Simplify sentence structure to reduce errors and sound more professional.' },
                                        { show: score >= 7,             icon: '🚀', title: 'Advanced Scenarios', desc: 'Challenge yourself with edge cases and system design questions.' },
                                        { show: true,                   icon: '📊', title: 'Track Progress',    desc: 'Re-take sessions weekly and compare your score trends over time.' },
                                    ].filter(t => t.show).slice(0, 4).map((tip, i) => (
                                        <div key={i} style={{
                                            padding: '16px 18px', background: 'rgba(255,255,255,.03)', borderRadius: 16,
                                            border: '1px solid rgba(255,255,255,.06)',
                                            animation: `daFadeUp .5s ease ${i * 80 + 200}ms both`
                                        }}>
                                            <div style={{ fontSize: 22, marginBottom: 8 }}>{tip.icon}</div>
                                            <div style={{ fontWeight: 800, color: '#fff', fontSize: 14, marginBottom: 6 }}>{tip.title}</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{tip.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ QUESTIONS TAB ═══ */}
                {activeTab === 'questions' && (
                    <div style={{ animation: 'daFadeUp .5s ease' }}>
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: 15, color: 'rgba(148,163,184,.7)', fontWeight: 600 }}>
                                {questions.length} questions — click any card to expand full analysis
                            </span>
                        </div>
                        {questions.map((q, i) => (
                            <QuestionCard
                                key={i} q={q} idx={i}
                                expanded={expandedIdx === i}
                                onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                            />
                        ))}
                    </div>
                )}

                {/* ═══ INSIGHTS TAB ═══ */}
                {activeTab === 'insights' && (
                    <div style={{ animation: 'daFadeUp .5s ease' }}>
                        {/* Performance breakdown table */}
                        <div style={{
                            background: 'rgba(255,255,255,.025)', borderRadius: 28,
                            border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden', marginBottom: 28
                        }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 20 }}>📊</span>
                                <span style={{ fontWeight: 800, fontSize: 18 }}>Performance Breakdown</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,.02)' }}>
                                            {['#', 'Question', 'Score', 'Accuracy', 'Fluency', 'Keywords', 'Time'].map(h => (
                                                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'rgba(148,163,184,.6)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.map((q, i) => {
                                            const s = Number(q.final_score || 0);
                                            const col = s >= 7 ? '#4ade80' : s >= 4 ? '#facc15' : '#f87171';
                                            return (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.04)', transition: 'background .2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '16px 20px', fontWeight: 800, color: col }}>{i + 1}</td>
                                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#e2e8f0', maxWidth: 260 }}>
                                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionText || q.question}</div>
                                                    </td>
                                                    <td style={{ padding: '16px 20px' }}>
                                                        <span style={{ fontWeight: 900, fontSize: 16, color: col }}>{s.toFixed(1)}</span>
                                                        <span style={{ fontSize: 11, color: 'rgba(148,163,184,.5)' }}>/10</span>
                                                    </td>
                                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#f472b6', fontWeight: 700 }}>{Math.round((q.accuracy_score || 0) * 100)}%</td>
                                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#818cf8', fontWeight: 700 }}>{Math.round((q.fluency_score  || 0) * 100)}%</td>
                                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#34d399', fontWeight: 700 }}>{Math.round((q.keyword_score  || 0) * 100)}%</td>
                                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>{q.timeTaken || 0}s</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Summary insight cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                            {[
                                { icon: '🎯', title: 'Best Answer', val: questions.length ? `Q${questions.indexOf(questions.reduce((a,b) => Number(a.final_score) > Number(b.final_score) ? a : b, questions[0])) + 1}` : '-', col: '#4ade80', desc: `Score: ${questions.length ? Math.max(...questions.map(q=>Number(q.final_score))).toFixed(1) : 0}/10` },
                                { icon: '📉', title: 'Needs Work', val: questions.length ? `Q${questions.indexOf(questions.reduce((a,b) => Number(a.final_score) < Number(b.final_score) ? a : b, questions[0])) + 1}` : '-', col: '#f87171', desc: `Score: ${questions.length ? Math.min(...questions.map(q=>Number(q.final_score))).toFixed(1) : 0}/10` },
                                { icon: '📊', title: 'Avg Score', val: `${(questions.reduce((s,q)=>s+Number(q.final_score),0)/Math.max(questions.length,1)).toFixed(1)}`, col: '#818cf8', desc: 'Across all questions' },
                            ].map((card, i) => (
                                <div key={i} className="da-insight-card" style={{
                                    background: 'rgba(255,255,255,.025)', borderRadius: 24,
                                    border: '1px solid rgba(255,255,255,.07)', padding: '28px 24px',
                                    animation: `daFadeUp .5s ease ${i * 100}ms both`
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 14 }}>{card.icon}</div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(148,163,184,.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>{card.title}</div>
                                    <div style={{ fontSize: 40, fontWeight: 900, color: card.col, letterSpacing: '-2px', lineHeight: 1 }}>{card.val}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(148,163,184,.6)', marginTop: 6 }}>{card.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── STICKY ACTION BAR ── */}
            <div style={{
                position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(10,10,28,.88)', backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 100,
                padding: '14px 24px', display: 'flex', gap: 12, alignItems: 'center',
                boxShadow: '0 30px 60px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.08)',
                zIndex: 200, animation: 'daFadeUp .6s ease .4s both'
            }}>
                {[
                    { label: 'Home',    icon: '🏠',   onClick: onBack,                            style: { background: 'rgba(255,255,255,.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,.1)' } },
                    { label: 'Overview',icon: '📊',   onClick: () => setActiveTab('overview'),    style: activeTab==='overview'?{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}:{background:'rgba(255,255,255,.04)',color:'#94a3b8',border:'1px solid rgba(255,255,255,.08)'} },
                    { label: 'Questions',icon:'❓',   onClick: () => setActiveTab('questions'),   style: activeTab==='questions'?{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}:{background:'rgba(255,255,255,.04)',color:'#94a3b8',border:'1px solid rgba(255,255,255,.08)'} },
                    { label: 'Insights',icon: '💡',  onClick: () => setActiveTab('insights'),    style: activeTab==='insights'?{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff'}:{background:'rgba(255,255,255,.04)',color:'#94a3b8',border:'1px solid rgba(255,255,255,.08)'} },
                    { label: 'Export PDF',icon:'📄',  onClick: () => generatePremiumPDF(report), style: { background: 'linear-gradient(135deg,#ec4899,#8b5cf6)', color: '#fff', boxShadow: '0 4px 16px rgba(236,72,153,.4)' } },
                ].map((btn, i) => (
                    <button key={i} onClick={btn.onClick} style={{
                        padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
                        fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center',
                        gap: 7, transition: 'all .25s ease', whiteSpace: 'nowrap',
                        ...btn.style
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                        <span>{btn.icon}</span> {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
