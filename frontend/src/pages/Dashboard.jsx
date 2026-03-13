import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import DashboardCard from "../components/DashboardCard";
import ProgressBar from "../components/ProgressBar";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaCalendarDay, FaLightbulb, FaRocket, FaSpinner, FaFire, FaChartLine, FaTrophy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/Dashboard.css";

const API = 'http://localhost:5001/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    skillProgress: [],
    recentInterviews: [],
    xp: { totalXP: 0, currentLevel: 1, xpInLevel: 0, nextLevelXP: 1000 },
    streak: 0,
    heatmap: { peakHour: 'N/A', sharpestHour: 'N/A', activeSessions: 0 },
    readiness: 0
  });
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Smooth transition
      }
    };
    fetchStats();
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const token = localStorage.getItem('token');
      const weakAreas = [...stats.skillProgress]
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3)
        .map(s => s.category);

      const res = await axios.post(`${API}/ai/study-plan`, { 
        weakAreas: weakAreas.length > 0 ? weakAreas : ['General Coding', 'Data Structures', 'System Design'],
        level: 'Intermediate'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudyPlan(res.data.plan);
    } catch (err) {
      console.error("Plan error:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="neural-sync">
          <div className="spin-orbit"></div>
          <p style={{ color: 'var(--primary)', fontWeight: '700', letterSpacing: '2px' }}>SYNCING NEURAL DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <motion.div 
        className="dashboard-wrapper container-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="main-layout" style={{ paddingTop: '40px' }}>
          {/* Dashboard Sidebar */}
          <aside className="sidebar-panel">
            <motion.div 
              className="widget-card" 
              style={{ textAlign: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}
              whileHover={{ y: -5 }}
            >
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '80px', color: 'rgba(255,255,255,0.03)' }}>
                <FaTrophy />
              </div>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #a78bfa)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '4px solid rgba(255,255,255,0.1)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                🎯
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Level {stats.xp.currentLevel}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>{stats.xp.currentLevel > 5 ? 'Elite Master' : 'Rising Interviewee'}</p>
              
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '24px', overflow: 'hidden' }}>
                <motion.div 
                   className="xp-bar-inner"
                   initial={{ width: 0 }}
                   animate={{ width: `${(stats.xp.xpInLevel / stats.xp.nextLevelXP) * 100}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                ></motion.div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>NEXT LEVEL</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stats.xp.xpInLevel.toFixed(2)} / {stats.xp.nextLevelXP} XP</span>
              </div>
            </motion.div>

            <div className="widget-card" style={{ position: 'relative' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFire style={{ color: '#f59e0b' }} /> Daily Streak
              </h4>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`streak-bar ${i < stats.streak ? 'active' : ''}`}
                    style={{ 
                      flex: 1, 
                      height: '35px', 
                      background: i < stats.streak ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      border: i < stats.streak ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                      opacity: i < stats.streak ? 1 : 0.3
                    }}
                  ></div>
                ))}
              </div>
              <p style={{ fontSize: '14px', marginTop: '16px', color: '#fff', fontWeight: '500' }}>
                {stats.streak} day streak! {stats.streak > 0 ? 'You\'re on fire! ⚡' : 'Start your first session today!'}
              </p>
            </div>

            <div className="widget-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f472b6' }}>
                <FaChartLine /> Peak Performance
              </h4>
              <p style={{ color: '#e2e8f0' }}>You perform best during <b>{stats.heatmap.sharpestHour}</b>. Sessions at this time are typically <b>{Math.round(stats.readiness/10 + 10)}% sharper</b> than average!</p>
              <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '12px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                🏆 Peak Hour: {stats.heatmap.peakHour}
              </div>
            </div>

            {/* AI Study Plan Widget */}
            <div className="widget-card" style={{ border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <FaBrain style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0 }}>AI Neural Path</h4>
              </div>
              
              {!studyPlan ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>Llama3 has analyzed your weak areas. Generate your 5-day optimization path.</p>
                  <button 
                    onClick={generatePlan} 
                    disabled={planLoading}
                    style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' }}
                  >
                    {planLoading ? <FaSpinner className="spin" /> : <><FaRocket /> Initialize Path</>}
                  </button>
                </div>
              ) : (
                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
                   <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '800', marginBottom: '15px' }}>🎯 TARGET: {studyPlan.weekly_goal}</p>
                   {studyPlan.plan.map((d, i) => (
                     <div key={i} style={{ marginBottom: '15px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent)', textTransform: 'uppercase' }}>{d.day}</span>
                          <span style={{ fontSize: '12px', color: '#fff', fontWeight: '600' }}>{d.topic}</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '15px', color: '#94a3b8', fontSize: '11px', lineHeight: '1.6' }}>
                          {d.goals.map((g, j) => <li key={j}>{g}</li>)}
                        </ul>
                     </div>
                   ))}
                   <div style={{ background: 'rgba(251, 191, 36, 0.08)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)', marginTop: '10px' }}>
                      <p style={{ margin: 0, fontSize: '12px', color: '#fde68a', fontStyle: 'italic' }}>💡 <b>Coach Insight:</b> {studyPlan.tip}</p>
                   </div>
                   <button onClick={() => setStudyPlan(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', marginTop: '20px', cursor: 'pointer', width: '100%', fontWeight: '700' }}>RESET NEURAL PATH</button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="content-main">
            <header style={{ marginBottom: '16px' }}>
              <motion.h1 
                style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'var(--font-heading)', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                Welcome back, Explorer
              </motion.h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '20px', fontWeight: '500' }}>Forge your path to professional mastery.</p>
            </header>

            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '24px' }}>
              <div className="dashboard-card" onClick={() => navigate('/interview')}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>🎮</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>AI Mock Interview</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>Dynamic high-stakes environment simulation with real-time feedback.</p>
                <div style={{ marginTop: '24px', color: 'var(--primary)', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  JUMP IN <FaRocket />
                </div>
              </div>
              <div className="dashboard-card" onClick={() => navigate('/resume-advisor')}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>📄</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Resume Expert</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>ATS-driven optimization and comprehensive skill gap analysis.</p>
                <div style={{ marginTop: '24px', color: 'var(--primary)', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ANALYZE NOW <FaCalendarDay />
                </div>
              </div>
              <div className="dashboard-card" onClick={() => navigate('/reports')}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>📊</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>Performance Hub</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>Deep dive into sentiment, keyword usage, and growth trends.</p>
                <div style={{ marginTop: '24px', color: 'var(--primary)', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  VIEW LOGS <FaChartLine />
                </div>
              </div>
            </div>

            <div className="lower-section" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '40px' }}>
              <div style={{ padding: '40px', borderRadius: '32px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                <h3 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ padding: '8px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}>📊</span> Domain Proficiency
                </h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {stats.skillProgress && stats.skillProgress.length > 0 ? (
                    stats.skillProgress.map((skill, idx) => (
                      <ProgressBar key={idx} label={skill.label} percent={skill.percent} />
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '20px' }}>No session data recorded yet. Initialize your first interview to see neural mappings.</p>}
                </div>

                <h3 style={{ marginTop: '56px', marginBottom: '32px', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ padding: '8px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '12px' }}>📅</span> Recent Sessions
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {stats.recentInterviews && stats.recentInterviews.length > 0 ? (
                    stats.recentInterviews.map((interview, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                          padding: '20px 24px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '20px',
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{interview.category}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(interview.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>{interview.overallScore.toFixed(1)}<span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/10</span></div>
                          </div>
                          <button
                            onClick={() => window.location.href = `/interview?retryId=${interview._id}`}
                            style={{
                              background: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid var(--primary)',
                              color: 'var(--primary)',
                              padding: '10px 18px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            RETRY
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>Archive currently offline.</p>}
                </div>
              </div>

              <div style={{ padding: '40px', borderRadius: '32px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', textAlign: 'center', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '32px', fontSize: '24px', fontWeight: '800' }}>Readiness Score</h3>
                
                <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 32px' }}>
                  <svg className="score-circle-svg" style={{ '--dashoffset': 440 - (440 * stats.readiness) / 100 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                    <circle className="score-circle-bg" cx="90" cy="90" r="70" />
                    <circle className="score-circle-progress" cx="90" cy="90" r="70" />
                  </svg>
                  <div className="score-text">
                    <span style={{ fontSize: '40px', fontWeight: '900', color: '#fff' }}>{stats.readiness}%</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700' }}>Ready</span>
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                  Your current professional readiness is optimized based on the last <b>{stats.totalInterviews > 5 ? '5' : stats.totalInterviews}</b> neural sessions.
                </p>

                <div style={{ padding: '20px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>AI Forecast</h4>
                  <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0 }}>
                    {stats.readiness >= 80 ? "You're in the elite percentile. High probability of offers for SDE-2 roles." : 
                     stats.readiness >= 60 ? "Solid performance. Target areas: System Design and High-Level Architecture." : 
                     "Foundation building in progress. Focus on core DSA and algorithm optimization."}
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}
