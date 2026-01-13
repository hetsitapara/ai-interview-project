import { useState } from "react";
import "../styles/interviewExperience.css";

export default function InterviewExperience() {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("Company");
  const [difficultyFilter, setDifficultyFilter] = useState("Difficulty");

  // Mock Data
  const experiences = [
    {
      id: 1,
      company: "Google",
      role: "Software Engineer",
      level: "Medium",
      desc: "Had 3 rounds of coding interviews and 1 system design round. Focus on DSA and scalability.",
      topics: ["Graph Algorithms", "Dynamic Programming", "Distributed Systems"]
    },
    {
      id: 2,
      company: "Amazon",
      role: "SDE I",
      level: "Easy",
      desc: "Two coding rounds focused on Arrays and Strings. One LP round.",
      topics: ["Arrays", "Strings", "Leadership Principles"]
    },
    {
      id: 3,
      company: "TCS",
      role: "System Engineer",
      level: "Easy",
      desc: "Basic aptitude and one technical round with basic Java questions.",
      topics: ["Java Basics", "Aptitude", "SQL"]
    },
    {
      id: 4,
      company: "Infosys",
      role: "Specialist Programmer",
      level: "Hard",
      desc: "Competitve programming style questions. Dynamic Programming and Trees.",
      topics: ["DP", "Trees", "Graph"]
    }
  ];

  const filteredExperiences = experiences.filter(exp => {
      const matchesSearch = exp.company.toLowerCase().includes(search.toLowerCase()) || 
                            exp.role.toLowerCase().includes(search.toLowerCase());
      const matchesCompany = companyFilter === "Company" || exp.company === companyFilter;
      const matchesDifficulty = difficultyFilter === "Difficulty" || exp.level === difficultyFilter;

      return matchesSearch && matchesCompany && matchesDifficulty;
  });

  return (
    <div className="exp-page">
      <div className="exp-card">

        <h2 className="exp-title">Interview Experiences</h2>

        {/* Filters */}
        <div className="exp-filters">
          <input 
            placeholder="Search by company or role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}>
            <option value="Company">All Companies</option>
            <option value="TCS">TCS</option>
            <option value="Infosys">Infosys</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
          </select>

          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="Difficulty">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button className="btn">Share Your Interview Experience</button>
        </div>

        {/* Experience List */}
        <div className="exp-list">
          {filteredExperiences.length > 0 ? (
              filteredExperiences.map(exp => (
                  <ExperienceCard key={exp.id} data={exp} />
              ))
          ) : <p>No experiences found matching filters.</p>}
        </div>

      </div>
    </div>
  );
}

function ExperienceCard({ data }) {
  return (
    <div className="exp-item">
      <div className="exp-header">
        <strong>{data.company} | {data.role}</strong>
        <span className={`tag ${data.level.toLowerCase()}`}>{data.level}</span>
      </div>

      <p>{data.desc}</p>

      <div className="exp-topics">
        <strong>Key Topics:</strong>
        <ul>
          {data.topics.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      <button className="view-btn">View Details</button>
    </div>
  );
}
