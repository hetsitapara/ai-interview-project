import Navbar from "../components/navbar";
import DashboardCard from "../components/DashboardCard";
import ProgressBar from "../components/ProgressBar";

export default function Dashboard() {
  return (
    <>
      

      <div className="dashboard-container">
        <h1>Dashboard</h1>

        <div className="card-grid">
          <DashboardCard
            title="AI Mock Interview"
            desc="Practice realistic, adaptive scenarios"
            buttonText="Start New Session"
          />
          <DashboardCard
            title="Question Bank"
            desc="Browse thousands of practice questions"
            buttonText="Explore Questions"
          />
          <DashboardCard
            title="Interview Reports"
            desc="Review feedback and track improvement"
            buttonText="View Reports"
          />
        </div>

        <div className="lower-section">
          <div className="progress-box">
            <h3>Skill Progress</h3>
            <ProgressBar label="Technical" percent={70} />
            <ProgressBar label="Communication" percent={85} />
            <ProgressBar label="Problem Solving" percent={60} />
            <ProgressBar label="Behavioral" percent={75} />
          </div>

          <div className="score-box">
            <h3>Interview Readiness</h3>
            <div className="score-circle">78%</div>
            <p>Ready for Mid-Level</p>
          </div>
        </div>
      </div>
    </>
  );
}
