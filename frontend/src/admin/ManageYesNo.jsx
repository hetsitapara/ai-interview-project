import { useState, useEffect } from "react";
import "../styles/admin.css";

export default function ManageYesNo() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    answer: "Yes",
    category: "",
    difficulty: "Easy"
  });

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5001/api/yesno?page=${page}&limit=20`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      alert(err.message);
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
    setCurrentQuestion({ question: "", answer: "Yes", category: "", difficulty: "Easy" });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (q) => {
    setCurrentQuestion(q);
    setIsEditing(true);
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `http://127.0.0.1:5001/api/yesno/${currentQuestion._id}` 
        : 'http://127.0.0.1:5001/api/yesno';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentQuestion)
      });

      if (!res.ok) throw new Error('Operation failed');

      setShowModal(false);
      fetchQuestions();
      alert(isEditing ? 'Question updated!' : 'Question added!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Question
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://127.0.0.1:5001/api/yesno/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchQuestions();
    } catch (err) {
      alert(err.message);
    }
  };

    // Delete All
  const handleDeleteAll = async () => {
    if (!window.confirm("WARNING: Delete ALL Yes/No Questions?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`http://127.0.0.1:5001/api/yesno/deleteAll`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchQuestions();
        alert("All deleted.");
    } catch (err) { alert(err.message); }
  };

  // Bulk Upload
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkJson, setBulkJson] = useState("");

  const handleBulkSubmit = async (e) => {
      e.preventDefault();
      try {
          const token = localStorage.getItem('token');
          const parsed = JSON.parse(bulkJson);
          if (!Array.isArray(parsed)) throw new Error("Must be array");
          
          await fetch('http://127.0.0.1:5001/api/yesno/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(parsed)
          });
          
          setShowBulkModal(false);
          setBulkJson("");
          fetchQuestions();
          alert("Uploaded successfully");
      } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ animation: 'adminFadeUp 0.8s ease' }}>
      <div className="admin-header">
        <h3>Binary <span style={{ color: 'var(--admin-accent)' }}>Assessment</span></h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="add-btn" onClick={openAddModal}>
            <span style={{ fontSize: '18px' }}>+</span> New Question
          </button>
          <button className="add-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} onClick={() => setShowBulkModal(true)}>
            <span style={{ fontSize: '18px' }}>⚡</span> Bulk Ingest
          </button>
          <button className="delete-btn" style={{ width: 'auto', padding: '0 20px', borderRadius: '16px' }} onClick={handleDeleteAll}>
            Flush Data
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Processing binary dataset...</div>
        ) : (
          <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question Prompt</th>
                  <th>Category</th>
                  <th>Binary Answer</th>
                  <th>Difficulty</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q._id}>
                    <td style={{ maxWidth: '400px' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{q.question}</div>
                    </td>
                    <td>
                      <span style={{ padding: '4px 10px', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        {q.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        color: q.answer === 'Yes' ? 'var(--admin-success)' : 'var(--admin-danger)',
                        fontWeight: '700', fontSize: '13px', textTransform: 'uppercase'
                      }}>
                        {q.answer}
                      </span>
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
                      <button className="edit-btn" onClick={() => openEditModal(q)} title="Edit Entry">✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(q._id)} title="Delete Entry">🗑️</button>
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
            ←
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--admin-border)', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
          >
            →
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditing ? 'Sync' : 'Initialize'} <span style={{ color: 'var(--admin-accent)' }}>Binary Option</span></h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Prompt</label>
                <input type="text" name="question" value={currentQuestion.question} onChange={handleChange} placeholder="e.g. Is JavaScript single-threaded?" required />
              </div>
              <div className="form-group">
                <label>Category Label</label>
                <input type="text" name="category" value={currentQuestion.category} onChange={handleChange} placeholder="e.g. HR, Technical" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Correct Response</label>
                  <select name="answer" value={currentQuestion.answer} onChange={handleChange}>
                    <option value="Yes">Confirm (Yes)</option>
                    <option value="No">Deny (No)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Difficulty Tier</label>
                  <select name="difficulty" value={currentQuestion.difficulty} onChange={handleChange}>
                    <option value="Easy">Entry Level</option>
                    <option value="Medium">Intermediate</option>
                    <option value="Hard">Expert</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Discard</button>
                <button type="submit" className="save-btn">{isEditing ? 'Apply Changes' : 'Initialize Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h3>Mass <span style={{ color: '#8b5cf6' }}>Ingestion</span> (Binary)</h3>
            <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '24px' }}>Provide a JSON array for automated processing.</p>
            <textarea 
              value={bulkJson} 
              onChange={(e) => setBulkJson(e.target.value)} 
              placeholder='[{"question": "...", "answer": "Yes", "category": "HR", "difficulty": "Easy"}]'
              style={{ minHeight: '350px', width: '100%', fontFamily: '"Fira Code", monospace', background: '#000', fontSize: '13px' }}
            ></textarea>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowBulkModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleBulkSubmit} className="save-btn" style={{ background: '#8b5cf6' }}>Process Batch</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
