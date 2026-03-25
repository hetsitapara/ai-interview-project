import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/admin.css"; // Ensure you have styles for modals/forms if needed

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    topic: "DSA",
    category: "",
    difficulty: "Easy",
    answer: "",
    source_type: "Technical"
  });

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5001/api/questions?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setCurrentQuestion({ question: "", topic: "DSA", category: "", difficulty: "Easy", answer: "", source_type: "Technical" });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setCurrentQuestion(q);
    setIsEditing(true);
    setShowModal(true);
  };

  // Submit Form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://127.0.0.1:5001/api/questions/${currentQuestion._id}`
        : 'http://127.0.0.1:5001/api/questions';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentQuestion)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed');
      }

      setShowModal(false);
      fetchQuestions(); // Refresh list
      alert(isEditing ? 'Question updated!' : 'Question added!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Question
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5001/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete question');

      fetchQuestions(); // Refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete All Questions
  const handleDeleteAll = async () => {
    if (!window.confirm("WARNING: Are you sure you want to delete ALL questions? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5001/api/questions/deleteAll`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete all questions');

      fetchQuestions(); // Refresh list
      alert("All questions deleted successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  // Bulk Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState("");

  // ... existing code ...

  // Submit Bulk Form
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let parsedData;
      try {
        parsedData = JSON.parse(bulkJson);
        if (!Array.isArray(parsedData)) throw new Error("Input must be a JSON array");
      } catch (err) {
        throw new Error("Invalid JSON format: " + err.message);
      }

      const res = await fetch('http://127.0.0.1:5001/api/questions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parsedData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Bulk upload failed');
      }

      setShowBulkModal(false);
      setBulkJson("");
      fetchQuestions(); // Refresh list
      alert(`Successfully uploaded ${parsedData.length} questions!`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ animation: 'adminFadeUp 0.8s ease' }}>
      <div className="admin-header">
        <h3>Question <span style={{ color: 'var(--admin-accent)' }}>Management</span></h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="add-btn" onClick={openAddModal}>
            <span style={{ fontSize: '18px' }}>+</span> Single Question
          </button>
          <button className="add-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} onClick={() => setShowBulkModal(true)}>
            <span style={{ fontSize: '18px' }}>⚡</span> Bulk Upload
          </button>
          <button className="delete-btn" style={{ width: 'auto', padding: '0 20px', borderRadius: '16px' }} onClick={handleDeleteAll}>
            Delete All
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Loading questionnaire data...</div>
        ) : (
          <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question Detail</th>
                  <th>Topic</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q._id}>
                    <td style={{ maxWidth: '400px' }}>
                      <div style={{ fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{q.question}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.answer || 'No answer provided'}</div>
                    </td>
                    <td>
                      <span style={{ padding: '4px 10px', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        {q.topic}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>{q.category || 'General'}</span>
                    </td>
                    <td>
                      <span className="difficulty-badge" style={{
                        background: q.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' : q.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
                      }}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="edit-btn" onClick={() => openEditModal(q)} title="Edit Question">✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(q._id)} title="Delete Question">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginTop: '32px' }}>
        <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)' }}>
          Page <span style={{ color: '#fff', fontWeight: '700' }}>{page}</span> of {totalPages}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--admin-border)', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}
          >
            ← Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--admin-border)', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Update' : 'Create'} <span style={{ color: 'var(--admin-accent)' }}>Question</span></h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Prompt</label>
                <input type="text" name="question" value={currentQuestion.question} onChange={handleChange} placeholder="e.g. What is a Closure in JavaScript?" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Topic</label>
                  <select name="topic" value={currentQuestion.topic} onChange={handleChange}>
                    <option value="DSA">DSA</option>
                    <option value="DBMS">DBMS</option>
                    <option value="OS">OS</option>
                    <option value="HR">HR</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty</label>
                  <select name="difficulty" value={currentQuestion.difficulty} onChange={handleChange}>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Category (Path)</label>
                <input type="text" name="category" value={currentQuestion.category} onChange={handleChange} placeholder="e.g. Frontend/React" />
              </div>
              <div className="form-group">
                <label>Expert Answer / Key points</label>
                <textarea name="answer" value={currentQuestion.answer} onChange={handleChange} style={{ minHeight: '120px' }} placeholder="Provide a reference answer..."></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Discard</button>
                <button type="submit" className="save-btn">{isEditing ? 'Save Changes' : 'Create Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h3>Bulk <span style={{ color: '#8b5cf6' }}>Ingestion</span></h3>
            <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '24px' }}>Provide a JSON array containing your question objects.</p>
            <form onSubmit={handleBulkSubmit}>
              <div className="form-group">
                <textarea
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder='[
  {
    "question": "What is...",
    "category": "DBMS",
    "topic": "SQL",
    "difficulty": "Medium",
    "answer": "..."
  }
]'
                  style={{ minHeight: '350px', background: '#000', fontFamily: '"Fira Code", monospace', fontSize: '13px' }}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowBulkModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn" style={{ background: '#8b5cf6' }}>Process Ingestion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
