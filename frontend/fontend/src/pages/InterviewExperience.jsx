import "../styles/interviewExperience.css";

export default function InterviewExperience() {
  return (
    <div className="exp-page">
      <div className="exp-card">

        <h2 className="exp-title">Interview Experiences</h2>

        {/* Filters */}
        <div className="exp-filters">
          <input placeholder="Search by company..." />

          <select>
            <option>Company</option>
            <option>TCS</option>
            <option>Infosys</option>
            <option>Google</option>
            <option>Amazon</option>
          </select>

          <select>
            <option>Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <button className="btn">Share Your Interview Experience</button>
        </div>

        {/* Experience List */}
        <div className="exp-list">
          <ExperienceCard level="Medium" />
          <ExperienceCard level="Medium" />
          <ExperienceCard level="Medium" />
        </div>

      </div>
    </div>
  );
}

function ExperienceCard({ level }) {
  return (
    <div className="exp-item">
      <div className="exp-header">
        <strong>Google | Software Engineer</strong>
        <span className={`tag ${level.toLowerCase()}`}>{level}</span>
      </div>

      <p>
        Had 3 rounds of coding interviews and 1 system design round.
        Focus on DSA and scalability.
      </p>

      <div className="exp-topics">
        <strong>Key Topics:</strong>
        <ul>
          <li>Graph Algorithms</li>
          <li>Dynamic Programming</li>
          <li>Distributed Systems</li>
        </ul>
      </div>

      <button className="view-btn">View Details</button>
    </div>
  );
}
