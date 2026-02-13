import { useState, useEffect } from "react";
import { Search, Filter, Briefcase, Building, MapPin, Calendar, ArrowRight, Star } from "lucide-react";
import "../styles/interviewExperience.css";

export default function InterviewExperience() {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);

  // Mock data for initial render if API fails or is empty, to show the layout
  const mockExperiences = [
    { _id: '1', company: 'Google', role: 'SDE II', level: 'Hard', date: '2023-10-15', location: 'Bangalore', desc: '3 rounds of coding, 1 system design. Focus on graphs and DP.', topics: ['Graphs', 'DP', 'System Design'], rating: 4.5 },
    { _id: '2', company: 'Amazon', role: 'Frontend Engineer', level: 'Medium', date: '2023-11-02', location: 'Hyderabad', desc: 'OA followed by 2 technical rounds. Lots of leadership principle questions.', topics: ['React', 'JavaScript', 'Leadership Principles'], rating: 4.0 },
    { _id: '3', company: 'Microsoft', role: 'Software Engineer', level: 'Medium', date: '2023-09-20', location: 'Noida', desc: 'Focus on OS concepts and low-level design.', topics: ['OS', 'LLD', 'Arrays'], rating: 4.2 },
  ];

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (companyFilter !== "All") params.append('company', companyFilter);
      if (difficultyFilter !== "All") params.append('level', difficultyFilter);

      // Simulate API delay or fetch
      // const res = await fetch(`http://localhost:5001/api/experiences?${params.toString()}`);
      // const data = await res.json();
      // if (res.ok) setExperiences(data);

      // Using mock data for now to ensure UI looks good immediately
      setTimeout(() => {
        setExperiences(mockExperiences);
        setLoading(false);
      }, 800);

    } catch (err) {
      console.error("Failed to fetch experiences", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExperiences();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, companyFilter, difficultyFilter]);

  return (
    <div className="interview-page">
      <div className="container-xl" style={{ paddingTop: '40px' }}>
        <div className="main-layout">

          {/* SIDEBAR FILTERS */}
          <aside className="sidebar-panel">
            <div className="widget-card">
              <button className="btn primary" style={{ width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Briefcase size={18} /> Share Experience
              </button>

              <h4 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Filters</h4>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>Search</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                  <input
                    placeholder="Role, Company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>Company</label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                >
                  <option value="All">All Companies</option>
                  <option value="Google">Google</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Meta">Meta</option>
                  <option value="TCS">TCS</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', display: 'block' }}>Difficulty</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficultyFilter(d)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: difficultyFilter === d ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                        background: difficultyFilter === d ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                        color: difficultyFilter === d ? '#818cf8' : '#94a3b8',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="widget-card">
              <h4 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Trending Companies</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Google', 'Amazon', 'Atlassian', 'Uber'].map((c, i) => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold', fontSize: '10px' }}>{c[0]}</div>
                      {c}
                    </div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>{120 - i * 15} Posts</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN FEED */}
          <main className="content-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>Interview Experiences</h2>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Showing {experiences.length} results</span>
            </div>

            {loading ? (
              <div className="loader">Loading...</div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {experiences.length > 0 ? (
                  experiences.map(exp => (
                    <ExperienceCard key={exp._id} data={exp} />
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    No experiences found matching your filters.
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function ExperienceCard({ data }) {
  return (
    <div className="widget-card" style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
            {data.company[0]}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>{data.role}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {data.company}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {data.location}</span>
            </div>
          </div>
        </div>
        <span style={{
          background: data.level === 'Easy' ? 'rgba(74, 222, 128, 0.1)' : data.level === 'Medium' ? 'rgba(250, 204, 21, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          color: data.level === 'Easy' ? '#4ade80' : data.level === 'Medium' ? '#facc15' : '#f87171',
          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
        }}>
          {data.level}
        </span>
      </div>

      <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '14px', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {data.desc}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {data.topics.map((t, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: '#94a3b8' }}>{t}</span>
          ))}
        </div>
        <button style={{ background: 'transparent', color: '#818cf8', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          Read Full Experience <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
