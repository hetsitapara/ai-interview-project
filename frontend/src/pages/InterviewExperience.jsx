import { useState, useEffect } from "react";
import { Briefcase, Building, MapPin, Star, Search, ChevronRight } from "lucide-react";

export default function InterviewExperience() {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [featured, setFeatured] = useState(null);

  const mockExperiences = [
    { _id: '1', company: 'Google', role: 'SDE II', level: 'Hard', date: '2024-01-15', location: 'Bangalore', desc: '5 rounds total: 2 technical coding, 1 system design, 1 behavioral, 1 hiring committee. Heavy focus on graphs and dynamic programming. System design was for a URL shortener at scale.', topics: ['Graphs', 'DP', 'System Design', 'Behavioral'], rating: 4.8, emoji: '🌐' },
    { _id: '2', company: 'Amazon', role: 'Frontend Engineer', level: 'Medium', date: '2024-02-10', location: 'Hyderabad', desc: 'OA with 2 DSA problems followed by 3 technical rounds. Leadership principles featured heavily throughout. Strong emphasis on React performance and state management.', topics: ['React', 'JavaScript', 'Leadership Principles', 'Redux'], rating: 4.2, emoji: '📦' },
    { _id: '3', company: 'Microsoft', role: 'Software Engineer', level: 'Medium', date: '2023-12-20', location: 'Noida', desc: 'Four rounds focused on OS concepts, low‑level design, and algorithms. Very conversational and collaborative style of interview.', topics: ['OS', 'LLD', 'Arrays', 'C++'], rating: 4.5, emoji: '🪟' },
    { _id: '4', company: 'Meta', role: 'ML Engineer', level: 'Hard', date: '2023-11-05', location: 'Remote', desc: 'Focused on deep learning systems, large-scale ML infrastructure, and distributed training. Two coding rounds with ML-specific questions.', topics: ['PyTorch', 'Distributed Systems', 'ML Infra', 'Python'], rating: 4.6, emoji: '🔵' },
    { _id: '5', company: 'Stripe', role: 'Backend Engineer', level: 'Medium', date: '2024-03-01', location: 'Remote', desc: 'Take-home project first, followed by 3 technical discussions. Very API-design-focused. High bar for clean code and documentation.', topics: ['REST APIs', 'Node.js', 'PostgreSQL', 'System Design'], rating: 4.7, emoji: '💳' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = mockExperiences;
      if (search) filtered = filtered.filter(e => e.company.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase()));
      if (companyFilter !== 'All') filtered = filtered.filter(e => e.company === companyFilter);
      if (difficultyFilter !== 'All') filtered = filtered.filter(e => e.level === difficultyFilter);
      setExperiences(filtered);
      setFeatured(filtered[0] || null);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [search, companyFilter, difficultyFilter]);

  const diffColors = { Easy: '#4ade80', Medium: '#facc15', Hard: '#f87171' };

  return (
    <div style={{ paddingBottom: '80px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .exp-card { transition:all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .exp-card:hover { transform:translateY(-5px); border-color:rgba(255,255,255,0.15)!important; box-shadow:0 25px 70px rgba(0,0,0,0.5)!important; }
        .company-chip { cursor:pointer; transition:all 0.2s ease; }
        .diff-pill { cursor:pointer; transition:all 0.2s ease; }
        .ie-input:focus { border-color:rgba(139,92,246,0.5)!important; box-shadow:0 0 0 4px rgba(139,92,246,0.15)!important; outline:none; }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50px', padding: '8px 20px', marginBottom: '24px' }}>
            <Briefcase size={16} color="#818cf8" />
            <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Real Stories · Vetted Experiences</span>
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>Interview Experiences</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Real insights from engineers who've been through the process.</p>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', flexWrap: 'wrap', animation: 'fadeUp 0.6s ease' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, role..."
              className="ie-input"
              style={{ width: '100%', padding: '16px 16px 16px 50px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {['All', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Stripe'].map(c => (
              <span key={c} className="company-chip" onClick={() => setCompanyFilter(c)}
                style={{ padding: '11px 20px', borderRadius: '50px', background: companyFilter === c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${companyFilter === c ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}`, color: companyFilter === c ? '#818cf8' : '#64748b', fontSize: '14px', fontWeight: '700' }}
              >{c}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <span key={d} className="diff-pill" onClick={() => setDifficultyFilter(d)}
                style={{ padding: '11px 18px', borderRadius: '50px', background: difficultyFilter === d ? `${diffColors[d] || '#8b5cf6'}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${difficultyFilter === d ? `${diffColors[d] || '#818cf8'}50` : 'rgba(255,255,255,0.06)'}`, color: difficultyFilter === d ? (diffColors[d] || '#818cf8') : '#64748b', fontSize: '14px', fontWeight: '700' }}
              >{d}</span>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
            <p style={{ color: '#475569' }}>Loading experiences...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '24px' }}>
            {experiences.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: '#475569', fontSize: '20px' }}>No experiences match your filters.</p>
              </div>
            ) : experiences.map((exp, i) => (
              <div key={exp._id} className="exp-card"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: `fadeUp ${0.4 + i * 0.08}s ease` }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {exp.emoji}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '4px', letterSpacing: '-0.3px' }}>{exp.role}</h3>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} />{exp.company}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} />{exp.location}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ padding: '5px 14px', borderRadius: '20px', background: `${diffColors[exp.level]}15`, color: diffColors[exp.level], fontSize: '12px', fontWeight: '700', border: `1px solid ${diffColors[exp.level]}30`, flexShrink: 0 }}>{exp.level}</span>
                </div>

                {/* Rating */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} fill={s <= Math.round(exp.rating) ? '#facc15' : 'none'} color={s <= Math.round(exp.rating) ? '#facc15' : '#334155'} />
                  ))}
                  <span style={{ color: '#64748b', fontSize: '13px', marginLeft: '6px', fontWeight: '600' }}>{exp.rating}</span>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', marginBottom: '20px' }}>
                  {exp.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {exp.topics.map((t, ti) => (
                    <span key={ti} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(99,102,241,0.2)' }}>{t}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#374151', fontSize: '12px' }}>{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#818cf8', fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'gap 0.2s ease' }}
                    onMouseEnter={e => e.currentTarget.style.gap = '10px'}
                    onMouseLeave={e => e.currentTarget.style.gap = '6px'}
                  >
                    Read Full Story <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
