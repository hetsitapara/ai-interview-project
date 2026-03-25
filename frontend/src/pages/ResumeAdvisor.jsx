import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaRobot, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaChartBar, FaSpinner, FaTimes, FaBrain } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';

export default function ResumeAdvisor() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const fileRef = useRef();
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') { setFile(f); setError(''); }
    else setError('Please upload a valid PDF file.');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setAdvice(null); setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const uploadRes = await axios.post(`${API}/resume/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const { analysis } = uploadRes.data;
      setParsedData(analysis); setUploading(false); setAnalyzing(true);
      const adviseRes = await axios.post(`${API}/resume/advise`, {
        resumeText: [analysis.name, analysis.summary, analysis.skills?.join(', ')].join('\n'),
        skills: analysis.skills || []
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAdvice(adviseRes.data.advice);
      setActiveTab('overview');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume. Make sure Ollama is running.');
    } finally { setUploading(false); setAnalyzing(false); }
  };

  const atsColor = advice ? (advice.ats_score >= 75 ? '#4ade80' : advice.ats_score >= 50 ? '#facc15' : '#f87171') : '#64748b';
  const isLoading = uploading || analyzing;
  const loadingText = uploading ? 'Parsing your PDF...' : 'Analyzing with AI...';
  const tabs = ['overview', 'strengths', 'projects', 'skills'];

  return (
    <div style={{ paddingBottom: '60px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.3);} 50%{box-shadow:0 0 50px rgba(139,92,246,0.6);} }
        @keyframes progress-fill { from{width:0%;} to{width:var(--target-width);} }
        .ra-tab { cursor:pointer; padding:10px 20px; border-radius:50px; border:1px solid transparent; font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:1px; transition:all 0.3s ease; }
        .ra-tab.active { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border-color:transparent; box-shadow:0 4px 15px rgba(139,92,246,0.4); }
        .ra-tab:not(.active) { color:#64748b; background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,0.06); }
        .ra-tab:not(.active):hover { color:#cbd5e1; border-color:rgba(255,255,255,0.15); }
        .drop-zone { border:2px dashed rgba(139,92,246,0.3); transition:all 0.3s ease; }
        .drop-zone.dragging { border-color:rgba(139,92,246,0.8); background:rgba(139,92,246,0.08)!important; box-shadow:0 0 40px rgba(139,92,246,0.2); }
        .score-circle { transition:all 0.3s ease; }
        .section-card { animation: fadeUp 0.5s ease; }
        .tip-item:hover { transform:translateX(4px); border-color:rgba(255,255,255,0.12)!important; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        {/* PAGE HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeUp 0.6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '50px', padding: '8px 20px', marginBottom: '24px' }}>
            <FaBrain style={{ color: '#a78bfa' }} />
            <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Powered by Llama3 · Fully Local</span>
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-2px', marginBottom: '16px', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Resume Advisor</h1>
          <p style={{ color: '#64748b', fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>Get your ATS score, strengths, gaps, and a personalized action plan in seconds.</p>
        </div>

        {/* MAIN LAYOUT */}
        {!advice ? (
          /* UPLOAD STATE */
          <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeUp 0.7s ease' }}>
            {/* Drop Zone */}
            <div
              className={`drop-zone ${isDragOver ? 'dragging' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') setFile(f); }}
              style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '28px', padding: '60px 40px', textAlign: 'center', cursor: 'pointer', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
              <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(139,92,246,0.3)', ...(file ? { animation: 'pulse-glow 2s ease-in-out infinite' } : {}) }}>
                <FaUpload style={{ fontSize: '2rem', color: '#a78bfa' }} />
              </div>
              {file ? (
                <>
                  <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>✅ {file.name}</p>
                  <p style={{ color: '#475569', fontSize: '14px' }}>Click to change file</p>
                </>
              ) : (
                <>
                  <p style={{ color: '#e2e8f0', fontWeight: '700', fontSize: '22px', marginBottom: '8px' }}>Drop your PDF resume here</p>
                  <p style={{ color: '#475569', fontSize: '15px' }}>or click to browse • PDF only</p>
                </>
              )}
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '16px 20px', color: '#fca5a5', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                <FaTimes />{error}
              </div>
            )}

            <button onClick={handleUpload} disabled={!file || isLoading}
              style={{ width: '100%', padding: '20px', fontSize: '18px', fontWeight: '800', borderRadius: '50px', border: 'none', cursor: file && !isLoading ? 'pointer' : 'not-allowed', background: file && !isLoading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)', color: file && !isLoading ? '#fff' : '#374151', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: file && !isLoading ? '0 8px 30px rgba(139,92,246,0.4)' : 'none' }}
            >
              {isLoading ? (
                <><div style={{ width: '22px', height: '22px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />{loadingText}</>
              ) : (
                <><FaRobot />Analyze My Resume</>
              )}
            </button>

            {isLoading && (
              <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '20px', textAlign: 'center' }}>
                <p style={{ color: '#a78bfa', fontWeight: '600', marginBottom: '16px' }}>{loadingText}</p>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '10px', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* RESULTS STATE */
          <div style={{ animation: 'fadeUp 0.5s ease' }}>
            {/* Score Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' }}>
              {[
                { label: 'ATS Score', value: advice.ats_score, unit: '/100', color: atsColor, gradient: `radial-gradient(circle, ${atsColor}20, transparent 70%)` },
                { label: 'Impact Score', value: advice.impact_score || 0, unit: '/100', color: '#38bdf8', gradient: 'radial-gradient(circle, rgba(56,189,248,0.1), transparent 70%)' },
                { label: 'Skills Match', value: (advice.suggested_skills?.length > 0 ? Math.max(40, 100 - advice.suggested_skills.length * 10) : 85), unit: '%', color: '#a78bfa', gradient: 'radial-gradient(circle, rgba(167,139,250,0.1), transparent 70%)' },
              ].map((score, i) => (
                <div key={i} className="section-card" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${score.color}25`, borderRadius: '24px', padding: '36px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: score.gradient, opacity: 0.5 }} />
                  <p style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', position: 'relative' }}>{score.label}</p>
                  <div style={{ fontSize: '56px', fontWeight: '900', color: score.color, lineHeight: 1, position: 'relative' }}>
                    {score.value}<span style={{ fontSize: '22px', opacity: 0.7 }}>{score.unit}</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '20px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${score.value}%`, background: `linear-gradient(90deg, ${score.color}80, ${score.color})`, borderRadius: '10px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Verdict Banner */}
            {advice.overall_verdict && (
              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', padding: '24px 32px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FaBrain style={{ color: '#818cf8', fontSize: '1.2rem' }} /></div>
                <p style={{ color: '#c7d2fe', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>{advice.overall_verdict}</p>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '36px', flexWrap: 'wrap' }}>
              {tabs.map(tab => (
                <button key={tab} className={`ra-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
              ))}
            </div>

            {/* Tab Content */}
            <div key={activeTab} style={{ animation: 'fadeUp 0.4s ease' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="section-card" style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: '24px', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(74,222,128,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheckCircle style={{ color: '#4ade80' }} /></div>
                      <span style={{ color: '#4ade80', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Strengths</span>
                    </div>
                    {(advice.strengths || []).map((s, i) => (
                      <div key={i} className="tip-item" style={{ padding: '12px 16px', marginBottom: '10px', background: 'rgba(74,222,128,0.06)', borderRadius: '12px', color: '#bbf7d0', fontSize: '14px', border: '1px solid rgba(74,222,128,0.08)', transition: 'all 0.2s ease', lineHeight: '1.5' }}>• {s}</div>
                    ))}
                  </div>
                  <div className="section-card" style={{ background: 'rgba(248,113,113,0.04)', border: '1px solid rgba(248,113,113,0.12)', borderRadius: '24px', padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'rgba(248,113,113,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaExclamationTriangle style={{ color: '#f87171' }} /></div>
                      <span style={{ color: '#f87171', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Areas to Improve</span>
                    </div>
                    {(advice.weaknesses || []).map((w, i) => (
                      <div key={i} className="tip-item" style={{ padding: '12px 16px', marginBottom: '10px', background: 'rgba(248,113,113,0.06)', borderRadius: '12px', color: '#fca5a5', fontSize: '14px', border: '1px solid rgba(248,113,113,0.08)', transition: 'all 0.2s ease', lineHeight: '1.5' }}>• {w}</div>
                    ))}
                  </div>
                  {advice.interview_strategy && (
                    <div className="section-card" style={{ gridColumn: 'span 2', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '24px', padding: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}><div style={{ width: '40px', height: '40px', background: 'rgba(139,92,246,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaBrain style={{ color: '#a78bfa' }} /></div><span style={{ color: '#a78bfa', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Interview Strategy</span></div>
                      <p style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.7', margin: 0 }}>{advice.interview_strategy}</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'strengths' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {(advice.improvement_tips || []).map((tip, i) => (
                    <div key={i} className="tip-item section-card" style={{ padding: '24px', background: 'rgba(251,191,36,0.04)', borderRadius: '18px', color: '#fde68a', fontSize: '15px', border: '1px solid rgba(251,191,36,0.1)', transition: 'all 0.2s ease', display: 'flex', gap: '20px', alignItems: 'flex-start', lineHeight: '1.6' }}>
                      <div style={{ width: '32px', height: '32px', background: 'rgba(251,191,36,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fbbf24', fontWeight: '800', fontSize: '14px' }}>{i + 1}</div>
                      {tip}
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'projects' && advice.project_ideas?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {advice.project_ideas.map((project, i) => (
                    <div key={i} className="section-card" style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s ease', cursor: 'default' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(251,191,36,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaLightbulb style={{ color: '#fbbf24', fontSize: '1rem' }} /></div>
                        <h4 style={{ color: '#fff', fontWeight: '700', fontSize: '16px', margin: 0 }}>{project.title}</h4>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{project.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {project.tech_stack?.map((tech, ti) => (
                          <span key={ti} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', fontSize: '12px', fontWeight: '600', border: '1px solid rgba(56,189,248,0.2)' }}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'skills' && advice.suggested_skills?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ width: '44px', height: '44px', background: 'rgba(167,139,250,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaChartBar style={{ color: '#a78bfa', fontSize: '1.2rem' }} /></div>
                    <span style={{ color: '#a78bfa', fontWeight: '800', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recommended Skills to Add</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {advice.suggested_skills.map((skill, i) => (
                      <span key={i} style={{ padding: '10px 20px', borderRadius: '50px', background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', fontSize: '14px', fontWeight: '600', border: '1px solid rgba(139,92,246,0.2)', cursor: 'default', transition: 'all 0.2s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Re-analyze */}
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button onClick={() => { setAdvice(null); setFile(null); setParsedData(null); }}
                style={{ padding: '14px 32px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '15px' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                ↩ Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
