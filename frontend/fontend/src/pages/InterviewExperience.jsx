import { useState } from "react";
import "../styles/interviewExperience.css";

export default function InterviewExperience() {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("Company");
  const [difficultyFilter, setDifficultyFilter] = useState("Difficulty");

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExperiences = async () => {
      setLoading(true);
      try {
          const params = new URLSearchParams();
          if (search) params.append('search', search);
          if (companyFilter !== "Company") params.append('company', companyFilter);
          if (difficultyFilter !== "Difficulty") params.append('level', difficultyFilter);

          const token = localStorage.getItem('token');
          // Assuming public endpoint, but sending token if good practice (not strictly needed for GET based on route)
          const res = await fetch(`http://localhost:5001/api/experiences?${params.toString()}`);
          const data = await res.json();
          if(res.ok) {
              setExperiences(data);
          }
      } catch (err) {
          console.error("Failed to fetch experiences", err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
     // Debounce search
     const timer = setTimeout(() => {
         fetchExperiences();
     }, 500);
     return () => clearTimeout(timer);
  }, [search, companyFilter, difficultyFilter]);

  // Unique Companies for dropdown (can be computed from fetched data or separate API, for now simple from current list or static if desired. Static list of major companies is fine or we can extend logic later)
  // For now let's keep the filter static or simple, the search triggers the fetch.


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
          {loading ? <p>Loading experiences...</p> : (
             experiences.length > 0 ? (
                experiences.map(exp => (
                    <ExperienceCard key={exp._id} data={exp} />
                ))
            ) : <p>No experiences found matching filters.</p>
          )}
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
