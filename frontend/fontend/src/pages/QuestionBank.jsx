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
      <div className="qb-card">

        <h2 className="qb-title">Question Bank</h2>

        {/* Search */}
        <input
          type="text"
          className="qb-search"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="qb-layout">

          {/* Filters */}
          <div className="qb-filters">
            <h4>Filters</h4>

            <div className="filter-section">
              <h5>Category</h5>
              {categories.length > 0 ? categories.map(cat => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    checked={filters.category.includes(cat)}
                    onChange={() => handleFilterChange('category', cat)}
                  />
                  {cat}
                </label>
              )) : <p style={{ fontSize: '12px', color: '#777' }}>No categories yet</p>}
            </div>

            <div className="filter-section">
              <h5>Difficulty</h5>
              <label><input type="checkbox" checked={filters.difficulty.includes('Easy')} onChange={() => handleFilterChange('difficulty', 'Easy')} /> Easy</label>
              <label><input type="checkbox" checked={filters.difficulty.includes('Medium')} onChange={() => handleFilterChange('difficulty', 'Medium')} /> Medium</label>
              <label><input type="checkbox" checked={filters.difficulty.includes('Hard')} onChange={() => handleFilterChange('difficulty', 'Hard')} /> Hard</label>
            </div>

            <button className="secondary-btn clear-filters-btn" onClick={clearFilters}>Clear Filters</button>
          </div>

          {/* Question List */}
          <div className="qb-list">
            {loading && page === 1 ? (
              <div className="loader">Loading questions...</div>
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
              <div className="no-data">No questions found matching your criteria.</div>
            )}

            {/* Load More Button */}
            {questions.length > 0 && hasMore && (
              <button
                className="btn load-more-btn"
                onClick={() => setPage(page + 1)}
                disabled={loading}
                style={{ width: 'auto', margin: '30px auto' }}
              >
                {loading ? 'Loading...' : 'Load More Questions'}
              </button>
            )}
          </div>

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
