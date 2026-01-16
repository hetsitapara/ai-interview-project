import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import DashboardCard from "../components/DashboardCard";
import ProgressBar from "../components/ProgressBar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    skillProgress: [],
    recentInterviews: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5001/api/dashboard/stats', {
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

  return (
    <>
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        <div className="card-grid">
          <DashboardCard
            title="AI Mock Interview"
            desc="Practice realistic, adaptive scenarios"
            buttonText="Start New Session"
            onClick={() => navigate('/interview')}
          />
          <DashboardCard
            title="Question Bank"
            desc="Browse thousands of practice questions"
            buttonText="Explore Questions"
            onClick={() => navigate('/questions')}
          />
          <DashboardCard
            title="Interview Reports"
            desc="Review feedback and track improvement"
            buttonText="View Reports"
            onClick={() => navigate('/reports')}
          />
        </div>

        <div className="lower-section">
          <div className="progress-box">
            <h3>Skill Progress</h3>
            {loading ? <p>Loading stats...</p> : (
              stats.skillProgress && stats.skillProgress.length > 0 ? (
                stats.skillProgress.map((skill, idx) => (
                  <ProgressBar key={idx} label={skill.label} percent={skill.percent} />
                ))
              ) : <p>No interview data yet.</p>
            )}
          </div>

          <div className="score-box">
            <h3>Interview Readiness</h3>
            <div className="score-circle">
              <div className="score-circle-inner">{Math.round(stats.averageScore * 10)}%</div>
            </div>
            <p>Based on Average Score</p>
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <small>Total Sessions: {stats.totalInterviews}</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
