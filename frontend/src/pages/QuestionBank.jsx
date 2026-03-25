import { useState, useEffect } from "react";
import axios from "axios";
import { FaBrain, FaMagic, FaSpinner, FaSearch, FaTimes } from "react-icons/fa";

const API = 'http://127.0.0.1:5001/api';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: [], difficulty: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/questions/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setCategories(await res.json());
      } catch (err) { console.error("Failed to load categories", err); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        if (filters.category.length > 0) queryParams.append('category', filters.category.join(','));
        if (filters.difficulty.length > 0) queryParams.append('difficulty', filters.difficulty.join(','));
        if (search) queryParams.append('search', search);
        queryParams.append('page', page);
        queryParams.append('limit', 10);
        const res = await fetch(`${API}/questions?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data = await res.json();
        if (page === 1) setQuestions(data.questions);
        else setQuestions(prev => [...prev, ...data.questions]);
        setHasMore(data.page < data.pages);
        setTotalCount(data.total || data.questions.length);
      } catch (error) { console.error("Error fetching questions:", error); }
      finally { setLoading(false); }
    };
    const timer = setTimeout(fetchQuestions, 400);
    return () => clearTimeout(timer);
  }, [filters, search, page]);

  useEffect(() => { setPage(1); }, [filters, search]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      return { ...prev, [category]: current.includes(value) ? current.filter(i => i !== value) : [...current, value] };
    });
  };

  const clearFilters = () => { setFilters({ category: [], difficulty: [] }); setSearch(""); };

  const diffColors = { Easy: '#4ade80', Medium: '#facc15', Hard: '#f87171' };

  return (
    <div style={{ fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .qb-card { animation:fadeUp 0.4s ease; transition:all 0.3s ease; }
        .qb-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.12)!important; box-shadow:0 20px 60px rgba(0,0,0,0.4)!important;}
        .filter-chip { cursor:pointer; transition:all 0.25s ease; border:1px solid rgba(255,255,255,0.06); }
        .filter-chip:hover { border-color:rgba(255,255,255,0.2)!important; }
        .diff-chip { cursor:pointer; transition:all 0.25s ease; }
        .qb-search-input:focus { border-color:rgba(139,92,246,0.5)!important; box-shadow:0 0 0 4px rgba(139,92,246,0.15)!important; outline:none; }
        .load-more:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(139,92,246,0.5)!important; }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '50px', padding: '8px 20px', marginBottom: '24px' }}>
            <FaBrain style={{ color: '#a78bfa' }} />
            <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>AI-Enhanced · 1000+ Questions</span>
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>Question Bank</h1>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Master industry interview scenarios with AI-guided ideal responses.</p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto 48px', animation: 'fadeUp 0.6s ease' }}>
          <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '16px' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keywords, topics, technologies..."
            className="qb-search-input"
            style={{ width: '100%', padding: '18px 18px 18px 52px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '16px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTimes />
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Filters Sidebar */}
          <aside style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeUp 0.6s ease' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>Category</h3>
                {filters.category.length > 0 && <button onClick={() => setFilters(p => ({ ...p, category: [] }))} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Clear</button>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {categories.map(cat => {
                  const isSelected = filters.category.includes(cat);
                  return (
                    <div key={cat} className="filter-chip" onClick={() => handleFilterChange('category', cat)}
                      style={{ padding: '10px 14px', borderRadius: '12px', background: isSelected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)', borderColor: isSelected ? 'rgba(139,92,246,0.4)' : undefined, display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.08)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                      </div>
                      <span style={{ color: isSelected ? '#c4b5fd' : '#94a3b8', fontSize: '14px', fontWeight: '600' }}>{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '28px' }}>
              <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Difficulty</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Easy', 'Medium', 'Hard'].map(lvl => {
                  const isSelected = filters.difficulty.includes(lvl);
                  return (
                    <div key={lvl} className="diff-chip" onClick={() => handleFilterChange('difficulty', lvl)}
                      style={{ padding: '12px 16px', borderRadius: '14px', background: isSelected ? `${diffColors[lvl]}15` : 'rgba(255,255,255,0.02)', border: `1px solid ${isSelected ? diffColors[lvl] + '40' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: diffColors[lvl], boxShadow: isSelected ? `0 0 8px ${diffColors[lvl]}` : 'none' }} />
                      <span style={{ color: isSelected ? diffColors[lvl] : '#64748b', fontWeight: '700', fontSize: '14px' }}>{lvl}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {(filters.category.length > 0 || filters.difficulty.length > 0 || search) && (
              <button onClick={clearFilters} style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >↩ Reset All Filters</button>
            )}
          </aside>

          {/* Questions Feed */}
          <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                  {loading && page === 1 ? 'Loading...' : `${totalCount || questions.length}+ Scenarios`}
                </h2>
                {(filters.category.length > 0 || filters.difficulty.length > 0) && (
                  <p style={{ color: '#475569', fontSize: '13px', marginTop: '4px' }}>Filtered results</p>
                )}
              </div>
            </div>

            {loading && page === 1 ? (
              <div style={{ textAlign: 'center', padding: '80px' }}>
                <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                <p style={{ color: '#64748b' }}>Syncing question database...</p>
              </div>
            ) : questions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
                <p style={{ color: '#475569', fontSize: '18px', marginBottom: '20px' }}>No questions match your filters.</p>
                <button onClick={clearFilters} style={{ padding: '12px 24px', borderRadius: '50px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', cursor: 'pointer', fontWeight: '700' }}>Reset Filters</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {questions.map(q => (
                  <QuestionCard key={q._id} text={q.question} category={q.category} topic={q.topic} level={q.difficulty} answer={q.answer} diffColors={diffColors} />
                ))}

                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="load-more" onClick={() => setPage(page + 1)} disabled={loading}
                      style={{ padding: '16px 40px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}
                    >
                      {loading ? <><FaSpinner style={{ animation: 'spin 0.8s linear infinite', marginRight: '8px' }} />Loading...</> : 'Load More Scenarios'}
                    </button>
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

function QuestionCard({ text, category, topic, level, answer, diffColors }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [aiAnswer, setAiAnswer] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const generateAiAnswer = async () => {
    setLoadingAi(true); setAiAnswer(''); setShowAnswer(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/ai/model-answer`, { question: text, idealAnswer: answer }, { headers: { Authorization: `Bearer ${token}` } });
      setAiAnswer(res.data.answer);
    } catch (err) { setAiAnswer('Could not generate AI answer. Please ensure Ollama is running.'); }
    finally { setLoadingAi(false); }
  };

  const color = diffColors[level] || '#64748b';

  return (
    <div className="qb-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <span style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(99,102,241,0.2)' }}>{category || 'General'}</span>
        {topic && <span style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '12px', fontWeight: '700', border: '1px solid rgba(16,185,129,0.2)' }}>{topic}</span>}
        <span style={{ padding: '5px 14px', borderRadius: '20px', background: `${color}15`, color: color, fontSize: '12px', fontWeight: '700', border: `1px solid ${color}30`, marginLeft: 'auto' }}>{level}</span>
      </div>

      <p style={{ color: '#e2e8f0', fontSize: '17px', lineHeight: '1.6', fontWeight: '500', marginBottom: showAnswer ? '24px' : '0' }}>{text}</p>

      {showAnswer && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Reference Answer</div>
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{answer}</p>
          </div>

          {aiAnswer || loadingAi ? (
            <div style={{ padding: '20px', background: 'rgba(139,92,246,0.05)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <FaBrain style={{ color: '#a78bfa', fontSize: '14px' }} />
                <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Llama3 AI Answer</span>
              </div>
              {loadingAi ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '14px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating...
                </div>
              ) : (
                <p style={{ color: '#e2e8f0', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.7', margin: 0 }}>"{aiAnswer}"</p>
              )}
            </div>
          ) : (
            <button onClick={generateAiAnswer} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
            >
              <FaMagic />Generate AI Ideal Response
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowAnswer(!showAnswer)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '50px', background: showAnswer ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.1)', border: showAnswer ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(99,102,241,0.3)', color: showAnswer ? '#94a3b8' : '#818cf8', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }}>
          {showAnswer ? '🙈 Hide Answer' : '👁 Reveal Answer'}
        </button>
      </div>
    </div>
  );
}
