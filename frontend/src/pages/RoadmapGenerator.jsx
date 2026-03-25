import React, { useState } from "react";
import axios from "axios";
import { Rocket, Map, Clock, BookOpen, Copy, Check, Brain, Code, Server, Layout, Database, Shield, Smartphone, Terminal, Zap, ChevronRight } from "lucide-react";

export default function RoadmapGenerator() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [copied, setCopied] = useState(false);

  const popularRoles = [
    { name: "Frontend Developer", icon: <Layout size={18} />, color: '#6366f1' },
    { name: "Backend Developer", icon: <Server size={18} />, color: '#8b5cf6' },
    { name: "Full Stack Developer", icon: <Code size={18} />, color: '#ec4899' },
    { name: "DevOps Engineer", icon: <Terminal size={18} />, color: '#10b981' },
    { name: "AI/ML Engineer", icon: <Brain size={18} />, color: '#f59e0b' },
    { name: "Mobile Developer", icon: <Smartphone size={18} />, color: '#38bdf8' },
    { name: "Data Scientist", icon: <Database size={18} />, color: '#a78bfa' },
    { name: "Cybersecurity Analyst", icon: <Shield size={18} />, color: '#f87171' },
  ];

  const levels = [
    { id: 'Beginner', icon: '🌱', desc: 'Just starting out' },
    { id: 'Intermediate', icon: '⚡', desc: 'Some experience' },
    { id: 'Advanced', icon: '🚀', desc: 'Senior level' },
  ];

  const handleGenerate = async (selectedRole = role) => {
    if (!selectedRole) return;
    setLoading(true); setRoadmap(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://127.0.0.1:5001/api/roadmap/generate", { role: selectedRole, level }, { headers: { Authorization: `Bearer ${token}` } });
      setRoadmap(res.data);
      setExpandedPhase(0);
    } catch (err) {
      alert("Failed to generate roadmap. Please try again.");
    } finally { setLoading(false); }
  };

  const copyToClipboard = () => {
    if (!roadmap) return;
    let text = `AI Roadmap for ${roadmap.role} (${roadmap.level})\n\n`;
    roadmap.phases.forEach(p => {
      text += `Phase ${p.phase}: ${p.title} (${p.duration})\n${p.description}\n\n`;
      p.topics.forEach(t => { text += `- ${t.name}\n  Subtopics: ${t.subtopics.join(", ")}\n  Resources: ${t.resources.join(", ")}\n`; });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const phaseColors = ['#8b5cf6', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#38bdf8'];

  return (
    <div style={{ paddingBottom: '80px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4);} 50%{box-shadow:0 0 0 12px rgba(139,92,246,0);} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(120px) rotate(0deg);} to{transform:rotate(360deg) translateX(120px) rotate(-360deg);} }
        .role-chip { cursor:pointer; transition:all 0.25s cubic-bezier(0.16,1,0.3,1)!important; }
        .role-chip:hover { transform:translateY(-3px) scale(1.05)!important; }
        .level-card { cursor:pointer; transition:all 0.3s ease!important; }
        .level-card:hover { transform:translateY(-4px)!important; }
        .phase-item { cursor:pointer; transition:all 0.3s ease!important; }
        .phase-item:hover { transform:translateX(4px)!important; }
        .topic-card { transition:all 0.3s ease!important; }
        .topic-card:hover { transform:translateY(-2px)!important; border-color:rgba(255,255,255,0.15)!important; }
        .rg-btn:hover:not(:disabled) { transform:translateY(-3px) scale(1.02)!important; box-shadow:0 16px 40px rgba(139,92,246,0.6)!important; }
      `}</style>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px', animation: 'fadeUp 0.6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '50px', padding: '8px 20px', marginBottom: '24px' }}>
            <Brain size={16} color="#818cf8" />
            <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>AI-Powered Career Guidance</span>
          </div>
          <h1 style={{ fontSize: '60px', fontWeight: '900', letterSpacing: '-2.5px', marginBottom: '16px', background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>Build Your Career Roadmap</h1>
          <p style={{ color: '#64748b', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
            Pick your goal. Get a personalised step-by-step learning plan powered by AI.
          </p>
        </div>

        {/* Config Panel */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '32px', padding: '48px', marginBottom: '48px', backdropFilter: 'blur(20px)', animation: 'fadeUp 0.7s ease' }}>
          {/* Popular Roles */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>Popular Learning Paths</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {popularRoles.map((r) => (
                <button key={r.name} className="role-chip"
                  onClick={() => { setRole(r.name); handleGenerate(r.name); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 22px', borderRadius: '50px', background: role === r.name ? `${r.color}25` : 'rgba(255,255,255,0.04)', border: role === r.name ? `1px solid ${r.color}60` : '1px solid rgba(255,255,255,0.06)', color: role === r.name ? '#fff' : '#94a3b8', fontSize: '14px', fontWeight: '600', boxShadow: role === r.name ? `0 4px 20px ${r.color}30` : 'none' }}
                >
                  <span style={{ color: role === r.name ? r.color : '#64748b' }}>{r.icon}</span>{r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Level & Custom Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '40px', alignItems: 'start' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '2px' }}>Experience Level</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {levels.map(l => (
                  <div key={l.id} className="level-card" onClick={() => setLevel(l.id)}
                    style={{ flex: 1, padding: '20px', borderRadius: '20px', background: level === l.id ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)', border: level === l.id ? '2px solid rgba(139,92,246,0.4)' : '2px solid rgba(255,255,255,0.06)', textAlign: 'center', boxShadow: level === l.id ? '0 0 30px rgba(139,92,246,0.2)' : 'none' }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{l.icon}</div>
                    <div style={{ fontWeight: '800', color: level === l.id ? '#c4b5fd' : '#94a3b8', marginBottom: '4px', fontSize: '15px' }}>{l.id}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: 0 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '2px' }}>Custom Role</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. Cloud Architect..."
                  style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px', outline: 'none', width: '260px', transition: 'border-color 0.3s ease' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button className="rg-btn" onClick={() => handleGenerate()} disabled={loading || !role}
                  style={{ padding: '16px 28px', borderRadius: '50px', background: loading || !role ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', fontWeight: '800', fontSize: '15px', cursor: loading || !role ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 6px 20px rgba(99,102,241,0.4)', whiteSpace: 'nowrap' }}
                >
                  {loading ? <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Rocket size={18} />}
                  {loading ? 'Building...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', animation: 'fadeUp 0.5s ease' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 32px' }}>
              <div style={{ width: '80px', height: '80px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ position: 'absolute', inset: '10px', background: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={24} color="#818cf8" /></div>
            </div>
            <h3 style={{ fontSize: '24px', color: 'white', fontWeight: '800', marginBottom: '12px' }}>Crafting your roadmap...</h3>
            <p style={{ color: '#64748b', fontSize: '16px' }}>AI is analyzing the best path for your career goals.</p>
          </div>
        )}

        {/* Roadmap Output */}
        {roadmap && !loading && (
          <div style={{ animation: 'fadeUp 0.5s ease' }}>
            {/* Roadmap Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '36px', fontWeight: '900', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', letterSpacing: '-1px' }}>{roadmap.role} Journey</h2>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '15px' }}>Level: <strong style={{ color: '#818cf8' }}>{roadmap.level}</strong></span>
                  <span style={{ color: '#64748b', fontSize: '15px' }}>• {roadmap.phases?.length} phases</span>
                </div>
              </div>
              <button onClick={copyToClipboard}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                {copied ? <><Check size={16} color="#4ade80" />Copied!</> : <><Copy size={16} />Copy Roadmap</>}
              </button>
            </div>

            {/* Timeline + Detail Split */}
            <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Left: Phase Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: '120px' }}>
                {roadmap.phases.map((phase, idx) => {
                  const color = phaseColors[idx % phaseColors.length];
                  const isActive = expandedPhase === idx;
                  return (
                    <div key={idx} style={{ position: 'relative' }}>
                      {idx < roadmap.phases.length - 1 && (
                        <div style={{ position: 'absolute', left: '27px', top: '70px', bottom: '-8px', width: '2px', background: `linear-gradient(to bottom, ${color}60, transparent)`, zIndex: 0 }} />
                      )}
                      <div className="phase-item" onClick={() => setExpandedPhase(idx)}
                        style={{ display: 'flex', gap: '20px', padding: '20px 24px', background: isActive ? `${color}12` : 'rgba(255,255,255,0.02)', borderRadius: '20px', border: isActive ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', position: 'relative', zIndex: 1, boxShadow: isActive ? `0 4px 20px ${color}20` : 'none' }}
                      >
                        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: isActive ? color : 'rgba(255,255,255,0.05)', color: isActive ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', flexShrink: 0, boxShadow: isActive ? `0 0 20px ${color}50` : 'none', transition: 'all 0.3s ease' }}>
                          {phase.phase}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: isActive ? '#fff' : '#94a3b8', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{phase.title}</h3>
                          <div style={{ display: 'flex', gap: '12px', color: '#475569', fontSize: '12px', fontWeight: '600' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{phase.duration}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} />{phase.topics.length} Topics</span>
                          </div>
                        </div>
                        <ChevronRight size={18} style={{ color: isActive ? color : '#374151', transform: isActive ? 'rotate(90deg)' : 'none', transition: 'all 0.3s ease', flexShrink: 0, marginTop: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Phase Detail */}
              <div key={expandedPhase} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.06)', padding: '40px', animation: 'fadeUp 0.4s ease' }}>
                {(() => {
                  const phase = roadmap.phases[expandedPhase];
                  const color = phaseColors[expandedPhase % phaseColors.length];
                  return (
                    <>
                      <div style={{ marginBottom: '32px', padding: '24px', background: `${color}10`, borderRadius: '20px', border: `1px solid ${color}25` }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Phase {phase.phase} · {phase.duration}</div>
                        <h3 style={{ fontSize: '28px', color: 'white', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.5px' }}>{phase.title}</h3>
                        <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px', margin: 0 }}>{phase.description}</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {phase.topics.map((topic, tIdx) => (
                          <div key={tIdx} className="topic-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <h4 style={{ color: 'white', fontWeight: '700', fontSize: '17px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '8px', height: '8px', background: color, borderRadius: '50%', boxShadow: `0 0 8px ${color}` }} />{topic.name}
                            </h4>
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>Subtopics</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {topic.subtopics.map((st, sidx) => (
                                  <span key={sidx} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '20px', background: `${color}15`, color: color, border: `1px solid ${color}30`, fontWeight: '600' }}>{st}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>Resources</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {topic.resources.map((res, ridx) => (
                                  <div key={ridx} style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={12} color={color} />{res}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
