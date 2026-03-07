import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import DashboardCard from "../components/DashboardCard";
import ProgressBar from "../components/ProgressBar";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaCalendarDay, FaLightbulb, FaRocket, FaSpinner } from "react-icons/fa";

const API = 'http://localhost:5001/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    skillProgress: [],
    recentInterviews: []
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
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Get bottom 3 skills as weak areas
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <div className="main-layout">
          {/* Dashboard Sidebar */}
          <aside className="sidebar-panel">
            <div className="widget-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '4px solid rgba(255,255,255,0.1)' }}>
                🎯
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Level 4</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Pro Interviewee</p>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>650 / 1000 XP</p>
            </div>

            <div className="widget-card">
              <h4>🏆 Daily Streak</h4>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                {[1, 1, 1, 1, 0, 0, 0].map((active, i) => (
                  <div key={i} style={{ flex: 1, height: '30px', background: active ? 'var(--primary)' : 'rgba(255,255,255,0.05)', borderRadius: '6px', border: active ? '1px solid rgba(255,255,255,0.2)' : 'none' }}></div>
                ))}
              </div>
              <p style={{ fontSize: '12px', marginTop: '12px' }}>4 day streak! Keep it up to earn double XP.</p>
            </div>

            <div className="widget-card" style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <h4>🔥 Interview Heatmap</h4>
              <p>You are most active between <b>2pm - 4pm</b>. Your responses are 15% sharper during this time!</p>
            </div>

            {/* AI Study Plan Widget */}
            <div className="widget-card" style={{ border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <FaBrain style={{ color: 'var(--primary)' }} />
                <h4 style={{ margin: 0 }}>AI Study Plan</h4>
              </div>
              
              {!studyPlan ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '15px' }}>Let llama3 analyze your weak areas and create a 5-day plan.</p>
                  <button 
                    onClick={generatePlan} 
                    disabled={planLoading}
                    style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {planLoading ? <FaSpinner className="spin" /> : <><FaRocket /> Generate Plan</>}
                  </button>
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                   <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', marginBottom: '12px' }}>🎯 Goal: {studyPlan.weekly_goal}</p>
                   {studyPlan.plan.map((d, i) => (
                     <div key={i} style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent)' }}>{d.day}</span>
                          <span style={{ fontSize: '11px', color: '#fff' }}>{d.topic}</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '15px', color: '#94a3b8', fontSize: '11px' }}>
                          {d.goals.map((g, j) => <li key={j}>{g}</li>)}
                        </ul>
                     </div>
                   ))}
                   <div style={{ background: 'rgba(251, 191, 36, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)', marginTop: '10px' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#fde68a' }}>💡 <b>Pro Tip:</b> {studyPlan.tip}</p>
                   </div>
                   <button onClick={() => setStudyPlan(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', marginTop: '15px', cursor: 'pointer', width: '100%' }}>Reset Plan</button>
                </div>
              )}
            </div>
          </aside>

          {/* Main Dashboard Content */}
          <main className="content-main">
            <header style={{ marginBottom: '8px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Welcome back, Explorer</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Ready to conquer your next big interview?</p>
            </header>

            <div className="card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <DashboardCard
                title="AI Mock Interview"
                desc="Adaptive AI simulates real high-stakes environments."
                buttonText="Jump In"
                onClick={() => navigate('/interview')}
              />
              <DashboardCard
                title="Resume Advisor"
                desc="ATS-optimized resume reviews and skills gaps analysis."
                buttonText="Analyze Now"
                onClick={() => navigate('/resume-advisor')}
              />
              <DashboardCard
                title="Performance"
                desc="Detailed sentiment and keyword analysis of your sessions."
                buttonText="View Reports"
                onClick={() => navigate('/reports')}
              />
            </div>

            <div className="lower-section" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '48px' }}>
              <div className="progress-box" style={{ padding: '32px', borderRadius: '32px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Domain Proficiency</h3>
                {loading ? <p>Syncing neural data...</p> : (
                  stats.skillProgress && stats.skillProgress.length > 0 ? (
                    stats.skillProgress.map((skill, idx) => (
                      <ProgressBar key={idx} label={skill.label} percent={skill.percent} />
                    ))
                  ) : <p style={{ color: 'var(--text-muted)' }}>No session data recorded yet. Start an interview to see insights.</p>
                )}

                <h3 style={{ marginTop: '40px', marginBottom: '24px', fontSize: '20px' }}>Recent Sessions</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {stats.recentInterviews && stats.recentInterviews.length > 0 ? (
                    stats.recentInterviews.map((interview, idx) => (
                      <div key={idx} style={{
                        padding: '16px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700' }}>{interview.category}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(interview.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{interview.overallScore.toFixed(1)}/10</div>
                          </div>
                          <button
                            onClick={() => window.location.href = `/interview?retryId=${interview._id}`}
                            style={{
                              background: 'var(--primary)',
                              border: 'none',
                              color: '#fff',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    ))
                  ) : <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No recent activity.</p>}
                </div>
              </div>

              <div className="score-box" style={{ padding: '32px', borderRadius: '32px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', textAlign: 'center', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Readiness Score</h3>
                <div className="score-circle" style={{ width: '150px', height: '150px', margin: '0 auto 20px' }}>
                  <div className="score-circle-inner" style={{ fontSize: '32px' }}>{Math.round(stats.averageScore * 10)}%</div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Based on your last {stats.totalInterviews > 5 ? '5' : stats.totalInterviews} sessions.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
