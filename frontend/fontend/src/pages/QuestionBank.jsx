import "../styles/questionbank.css";

export default function QuestionBank() {
  return (
    <div className="qb-page">
      <div className="qb-card">

        <h2 className="qb-title">Question Bank</h2>

        {/* Search */}
        <input
          type="text"
          className="qb-search"
          placeholder="Search questions..."
        />

        <div className="qb-layout">

          {/* Filters */}
          <div className="qb-filters">
            <h4>Filters</h4>

            <div className="filter-section">
              <h5>Topic</h5>
              <label><input type="checkbox" /> DSA</label>
              <label><input type="checkbox" /> DBMS</label>
              <label><input type="checkbox" /> OS</label>
              <label><input type="checkbox" /> HR</label>
            </div>

            <div className="filter-section">
              <h5>Difficulty</h5>
              <label><input type="checkbox" /> Easy</label>
              <label><input type="checkbox" /> Medium</label>
              <label><input type="checkbox" /> Hard</label>
            </div>

            <button className="btn">Clear Filters</button>
          </div>

          {/* Question List */}
          <div className="qb-list">
            <QuestionCard
              text="Explain the difference between B-Tree and B+ Tree in DBMS?"
              level="Easy"
            />
            <QuestionCard
              text="Explain the difference between A-Tree and In DBMS?"
              level="Medium"
            />
            <QuestionCard
              text="Explain the difference between B-Tree and B-Ret in DBMS?"
              level="Medium"
            />
            <QuestionCard
              text="Explain the difference between B-Tree and B+ Tree in DBMS?"
              level="Hard"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

function QuestionCard({ text, level }) {
  return (
    <div className="question-card">
      <div>
        <p>{text}</p>
        <span className={`tag ${level.toLowerCase()}`}>{level}</span>
      </div>
      <span className="bookmark">🔖</span>
    </div>
  );
}
