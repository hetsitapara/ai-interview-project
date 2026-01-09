import "../styles/questionbank.css";

import { useState, useEffect } from "react";
import "../styles/questionbank.css";

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    topic: [],
    difficulty: []
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const queryParams = new URLSearchParams();
        if (filters.topic.length > 0) queryParams.append('topic', filters.topic.join(','));
        if (filters.difficulty.length > 0) queryParams.append('difficulty', filters.difficulty.join(','));
        if (search) queryParams.append('search', search);

        const res = await fetch(`http://localhost:5001/api/questions?${queryParams.toString()}`, {
             headers: {
                'Authorization': `Bearer ${token}`
             }
        });
        
        if (!res.ok) throw new Error('Failed to fetch questions');

        const data = await res.json();
        setQuestions(data);
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
    setFilters({ topic: [], difficulty: [] });
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
              <h5>Topic</h5>
              <label><input type="checkbox" checked={filters.topic.includes('DSA')} onChange={() => handleFilterChange('topic', 'DSA')} /> DSA</label>
              <label><input type="checkbox" checked={filters.topic.includes('DBMS')} onChange={() => handleFilterChange('topic', 'DBMS')} /> DBMS</label>
              <label><input type="checkbox" checked={filters.topic.includes('OS')} onChange={() => handleFilterChange('topic', 'OS')} /> OS</label>
              <label><input type="checkbox" checked={filters.topic.includes('HR')} onChange={() => handleFilterChange('topic', 'HR')} /> HR</label>
            </div>

            <div className="filter-section">
              <h5>Difficulty</h5>
              <label><input type="checkbox" checked={filters.difficulty.includes('Easy')} onChange={() => handleFilterChange('difficulty', 'Easy')} /> Easy</label>
              <label><input type="checkbox" checked={filters.difficulty.includes('Medium')} onChange={() => handleFilterChange('difficulty', 'Medium')} /> Medium</label>
              <label><input type="checkbox" checked={filters.difficulty.includes('Hard')} onChange={() => handleFilterChange('difficulty', 'Hard')} /> Hard</label>
            </div>

            <button className="btn" style={{width: '100%', marginTop: '20px'}} onClick={clearFilters}>Clear Filters</button>
          </div>

          {/* Question List */}
          <div className="qb-list">
            {loading ? (
                <p>Loading questions...</p>
            ) : questions.length > 0 ? (
                questions.map(q => (
                    <QuestionCard
                        key={q._id}
                        text={q.title}
                        level={q.difficulty}
                    />
                ))
            ) : (
                <p>No questions found.</p>
            )}
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
