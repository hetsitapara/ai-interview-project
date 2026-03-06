import "../styles/questionbank.css";

import { useState, useEffect } from "react";
import "../styles/questionbank.css";

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]); // Dynamic categories
  const [filters, setFilters] = useState({
    category: [],
    difficulty: []
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Categories for Filter
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/questions/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const queryParams = new URLSearchParams();
        if (filters.category.length > 0) queryParams.append('category', filters.category.join(','));
        if (filters.difficulty.length > 0) queryParams.append('difficulty', filters.difficulty.join(','));
        if (search) queryParams.append('search', search);

        // Add Pagination
        queryParams.append('page', page);
        queryParams.append('limit', 10);

        const res = await fetch(`http://localhost:5001/api/questions?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch questions');

        const data = await res.json();

        if (page === 1) {
          setQuestions(data.questions);
        } else {
          setQuestions(prev => [...prev, ...data.questions]);
        }

        setHasMore(data.page < data.pages);

      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchQuestions();
    }, 500); // Debounce search

    return () => clearTimeout(debounceFetch);
  }, [filters, search, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, search]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({ category: [], difficulty: [] });
    setSearch("");
  };

  return (
    <div className="qb-page">
      <div className="container-xl">
        <div className="main-layout">
          {/* Sidebar Area */}
          <aside className="sidebar-panel">
            <div className="widget-card">
              <h4>🔍 Discovery</h4>
              <input
                type="text"
                className="qb-search"
                placeholder="Search keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: '#fff', fontSize: '14px', marginTop: '12px' }}
              />
            </div>

            <div className="widget-card">
              <h4>🏷️ Category Filter</h4>
              <div className="filter-section" style={{ marginTop: '15px' }}>
                {categories.length > 0 ? categories.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', marginBottom: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filters.category.includes(cat)}
                      onChange={() => handleFilterChange('category', cat)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {cat}
                  </label>
                )) : <p style={{ fontSize: '12px', color: '#777' }}>Syncing...</p>}
              </div>
            </div>

            <div className="widget-card">
              <h4>⚡ Difficulty</h4>
              <div className="filter-section" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Easy', 'Medium', 'Hard'].map(lvl => (
                  <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={filters.difficulty.includes(lvl)} onChange={() => handleFilterChange('difficulty', lvl)} /> {lvl}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn secondary" onClick={clearFilters} style={{ width: '100%', fontSize: '14px' }}>Reset View</button>
          </aside>

          {/* Main Area */}
          <main className="content-main">
            <div className="qb-header" style={{ marginBottom: '8px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Interactive Question Bank</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Master thousand of industry-specific scenarios with AI-guided ideal responses.</p>
            </div>

            <div className="qb-list" style={{ display: 'grid', gap: '24px' }}>
              {loading && page === 1 ? (
                <div className="loader">Analyzing Question Database...</div>
              ) : questions.length > 0 ? (
                questions.map(q => (
                  <QuestionCard
                    key={q._id}
                    text={q.question}
                    category={q.category}
                    level={q.difficulty}
                    answer={q.answer}
                  />
                ))
              ) : (
                <div className="no-data">No results found in current cluster.</div>
              )}

              {/* Load More Button */}
              {questions.length > 0 && hasMore && (
                <button
                  className="btn primary"
                  onClick={() => setPage(page + 1)}
                  disabled={loading}
                  style={{ width: 'auto', margin: '40px auto', padding: '16px 40px', borderRadius: '50px' }}
                >
                  {loading ? 'Initializing Next Batch...' : 'Load More Scenarios'}
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ text, category, level, answer }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="question-card">
      <div className="question-content">
        <div className="question-meta">
          <span className="category-tag">{category || 'General'}</span>
          <span className={`tag ${level.toLowerCase()}`}>{level}</span>
        </div>
        <p>{text}</p>

        {showAnswer && (
          <div className="answer-box-expanded">
            <strong>Sample Answer:</strong>
            <p>{answer}</p>
          </div>
        )}
      </div>

      <div className="question-actions">
        <button
          className={`action-icon ${showAnswer ? 'active' : ''}`}
          onClick={() => setShowAnswer(!showAnswer)}
          title={showAnswer ? "Hide Answer" : "Show Answer"}
        >
          {showAnswer ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}
