import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaRobot, FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaChartBar, FaSpinner, FaTimes, FaBrain } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function ResumeAdvisor() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setAdvice(null);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const uploadRes = await axios.post(`${API}/resume/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      const { analysis } = uploadRes.data;
      setParsedData(analysis);
      setUploading(false);
      setAnalyzing(true);

      // Now analyze it with llama3
      const adviseRes = await axios.post(`${API}/resume/advise`, {
        resumeText: [analysis.name, analysis.summary, analysis.skills?.join(', ')].join('\n'),
        skills: analysis.skills || []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdvice(adviseRes.data.advice);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume. Make sure Ollama is running.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const atsColor = advice ? (advice.ats_score >= 75 ? '#4ade80' : advice.ats_score >= 50 ? '#facc15' : '#f87171') : '#64748b';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderRadius: '50px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '20px' }}>
            <FaBrain style={{ color: '#a78bfa' }} />
            <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>Powered by llama3 · Fully Local · No API Key</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f1f5f9', margin: 0 }}>AI Resume Advisor</h1>
          <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '16px' }}>Upload your resume and get instant AI-powered feedback, ATS score, and improvement tips.</p>
        </div>

        {/* Upload Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(139,92,246,0.4)', borderRadius: '20px', padding: '40px', textAlign: 'center', marginBottom: '30px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
          <FaUpload style={{ fontSize: '2.5rem', color: '#a78bfa', marginBottom: '16px' }} />
          {file ? (
            <div>
              <p style={{ color: '#4ade80', fontWeight: '600', fontSize: '16px', margin: 0 }}>✅ {file.name}</p>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>Click to change</p>
            </div>
          ) : (
            <div>
              <p style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '16px', margin: 0 }}>Drop your PDF resume here</p>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>or click to browse</p>
            </div>
          )}
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px 20px', color: '#fca5a5', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}><FaTimes />{error}</div>}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || analyzing}
          style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '700', borderRadius: '14px', border: 'none', cursor: file && !uploading && !analyzing ? 'pointer' : 'not-allowed', background: file ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(255,255,255,0.05)', color: file ? '#fff' : '#64748b', marginBottom: '40px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          {uploading ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Parsing Resume...</> :
           analyzing ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Analyzing with llama3...</> :
           <><FaRobot /> Analyze My Resume</>}
        </button>

        {/* Results */}
        {advice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Scores Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '30px', border: `1px solid ${atsColor}40`, textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>ATS Compatibility</p>
                <div style={{ fontSize: '4rem', fontWeight: '900', color: atsColor, lineHeight: 1 }}>{advice.ats_score}<span style={{ fontSize: '1.5rem' }}>/100</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '30px', border: `1px solid #38bdf840`, textAlign: 'center' }}>
                  <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Impact Score</p>
                  <div style={{ fontSize: '4rem', fontWeight: '900', color: '#38bdf8', lineHeight: 1 }}>{advice.impact_score || 0}<span style={{ fontSize: '1.5rem' }}>/100</span></div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '24px', border: '1px solid var(--glass-border)' }}>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', textAlign: 'center' }}>{advice.overall_verdict}</p>
            </div>

            {/* Interview Strategy */}
            {advice.interview_strategy && (
              <div style={{ background: 'rgba(139, 92, 246, 0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <FaBrain style={{ color: '#a78bfa' }} />
                  <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Interview Strategy</span>
                </div>
                <p style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{advice.interview_strategy}</p>
              </div>
            )}

            {/* Grid: Strengths + Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: 'rgba(74,222,128,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(74,222,128,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FaCheckCircle style={{ color: '#4ade80' }} />
                  <span style={{ color: '#4ade80', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Strengths</span>
                </div>
                {(advice.strengths || []).map((s, i) => (
                  <div key={i} style={{ padding: '8px 12px', marginBottom: '8px', background: 'rgba(74,222,128,0.08)', borderRadius: '8px', color: '#bbf7d0', fontSize: '13px' }}>• {s}</div>
                ))}
              </div>
              <div style={{ background: 'rgba(248,113,113,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(248,113,113,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FaExclamationTriangle style={{ color: '#f87171' }} />
                  <span style={{ color: '#f87171', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Weaknesses</span>
                </div>
                {(advice.weaknesses || []).map((w, i) => (
                  <div key={i} style={{ padding: '8px 12px', marginBottom: '8px', background: 'rgba(248,113,113,0.08)', borderRadius: '8px', color: '#fca5a5', fontSize: '13px' }}>• {w}</div>
                ))}
              </div>
            </div>

            {/* Project Ideas */}
            {advice.project_ideas?.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '30px', border: '1px solid var(--glass-border)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <FaLightbulb style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>Recommended Projects to Build Skills</span>
                </div>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {advice.project_ideas.map((project, i) => (
                    <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '16px' }}>{project.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>{project.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {project.tech_stack?.map((tech, ti) => (
                          <span key={ti} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontSize: '11px', fontWeight: '600' }}>{tech}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Tips */}
            <div style={{ background: 'rgba(251,191,36,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(251,191,36,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FaLightbulb style={{ color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Improvement Tips</span>
              </div>
              {(advice.improvement_tips || []).map((tip, i) => (
                <div key={i} style={{ padding: '12px 16px', marginBottom: '10px', background: 'rgba(251,191,36,0.06)', borderRadius: '10px', color: '#fde68a', fontSize: '14px', lineHeight: '1.5' }}>
                  <strong style={{ color: '#fbbf24' }}>{i + 1}.</strong> {tip}
                </div>
              ))}
            </div>

            {/* Suggested Skills */}
            {advice.suggested_skills?.length > 0 && (
              <div style={{ background: 'rgba(139,92,246,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <FaChartBar style={{ color: '#a78bfa' }} />
                  <span style={{ color: '#a78bfa', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Skills to Add</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {advice.suggested_skills.map((skill, i) => (
                    <span key={i} style={{ padding: '6px 14px', borderRadius: '50px', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', fontSize: '13px', fontWeight: '500' }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
