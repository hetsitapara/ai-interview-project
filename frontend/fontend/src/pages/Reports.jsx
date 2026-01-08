import "../styles/report.css";

export default function Reports() {
  return (
    <div className="report-page">
      <div className="report-card">

        <h2 className="report-title">Interview Performance Report</h2>

        {/* Top Score Cards */}
        <div className="score-grid">
          <div className="score-card">
            <h4>Technical Score</h4>
            <p className="score">85%</p>
            <span>Strong understanding</span>
          </div>

          <div className="score-card">
            <h4>Communication Score</h4>
            <p className="score">78%</p>
            <span>Needs refinement</span>
          </div>

          <div className="score-card">
            <h4>Confidence Score</h4>
            <p className="score">62%</p>
            <span>Room for improvement</span>
          </div>
        </div>

        {/* Lower Section */}
        <div className="report-lower">

          {/* Skill Breakdown */}
          <div className="skill-box">
            <h3>Skill Proficiency Breakdown</h3>

            <SkillBar label="Problem Solving" value={80} />
            <SkillBar label="Coding" value={90} />
            <SkillBar label="Clarity" value={75} />
            <SkillBar label="Tone" value={70} />
            <SkillBar label="Body Language" value={60} />
          </div>

          {/* Feedback */}
          <div className="feedback-box">
            <h3>Key Feedback</h3>
            <ul>
              <li>
                <strong>Positive:</strong> Strong technical knowledge and clear explanations.
              </li>
              <li>
                <strong>Improvement:</strong> Reduce filler words and speak with more confidence.
              </li>
            </ul>

            <button className="btn download-btn">
              Download Report (PDF)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* Skill Bar Component */
function SkillBar({ label, value }) {
  return (
    <div className="skill-item">
      <span>{label}</span>
      <div className="skill-bar">
        <div style={{ width: `${value}%` }}></div>
      </div>
      <span>{value}%</span>
    </div>
  );
}
