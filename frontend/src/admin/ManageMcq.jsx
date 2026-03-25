import { useState, useEffect } from "react";
import "../styles/admin.css";

export default function ManageMcq() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOptions: [], // indices
    category: "",
    type: "MCQ"
  });

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5001/api/mcq/all?page=${page}&limit=20`, {
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

  const handleOptionChange = (idx, value) => {
      const newOptions = [...currentQuestion.options];
      newOptions[idx] = value;
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const toggleCorrectOption = (idx) => {
      let newCorrect = [...currentQuestion.correctOptions];
      if (newCorrect.includes(idx)) {
          newCorrect = newCorrect.filter(i => i !== idx);
      } else {
          // If MCQ, only one correct
          if (currentQuestion.type === 'MCQ') newCorrect = [idx];
          else newCorrect.push(idx); // MSQ
      }
      setCurrentQuestion(prev => ({ ...prev, correctOptions: newCorrect }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setCurrentQuestion({ question: "", options: ["", "", "", ""], correctOptions: [], category: "", type: "MCQ" });
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
        ? `http://127.0.0.1:5001/api/mcq/${currentQuestion._id}` 
        : 'http://127.0.0.1:5001/api/mcq';
      
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
      alert(isEditing ? 'MCQ updated!' : 'MCQ added!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Question
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this MCQ?")) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://127.0.0.1:5001/api/mcq/${id}`, {
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
    if (!window.confirm("WARNING: Delete ALL MCQs?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`http://127.0.0.1:5001/api/mcq/deleteAll`, {
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
          
          await fetch('http://127.0.0.1:5001/api/mcq/bulk', {
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
        <h3>Objective <span style={{ color: 'var(--admin-accent)' }}>Questionnaire</span></h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="add-btn" onClick={openAddModal}>
            <span style={{ fontSize: '18px' }}>+</span> New MCQ
          </button>
          <button className="add-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} onClick={() => setShowBulkModal(true)}>
            <span style={{ fontSize: '18px' }}>⚡</span> Bulk Ingest
          </button>
          <button className="delete-btn" style={{ width: 'auto', padding: '0 20px', borderRadius: '16px' }} onClick={handleDeleteAll}>
            Clear Database
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Syncing with MCQ engine...</div>
        ) : (
          <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Question Content</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr key={q._id}>
                    <td style={{ maxWidth: '450px' }}>
                      <div style={{ fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{q.question.substring(0, 100)}...</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                        {q.options.length} options • {q.correctOptions.length} correct
                      </div>
                    </td>
                    <td>
                      <span style={{ padding: '4px 10px', background: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        {q.category}
                      </span>
                    </td>
                    <td>
                      <span className="difficulty-badge" style={{
                        background: q.type === 'MCQ' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: q.type === 'MCQ' ? '#10b981' : '#f59e0b'
                      }}>
                        {q.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="edit-btn" onClick={() => openEditModal(q)} title="Modify Question">✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(q._id)} title="Purge Record">🗑️</button>
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
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <h3>{isEditing ? 'Sync' : 'Initialize'} <span style={{ color: 'var(--admin-accent)' }}>Objective</span></h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Text</label>
                <textarea name="question" value={currentQuestion.question} onChange={handleChange} style={{ minHeight: '100px' }} placeholder="Enter the evaluation prompt..." required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Category Tags</label>
                  <input type="text" name="category" value={currentQuestion.category} onChange={handleChange} placeholder="e.g. JavaScript, AWS" required />
                </div>
                <div className="form-group">
                  <label>Evaluation Model</label>
                  <select name="type" value={currentQuestion.type} onChange={handleChange}>
                    <option value="MCQ">Single Response (MCQ)</option>
                    <option value="MSQ">Multiple Response (MSQ)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--admin-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
                  Response Options <span style={{ fontSize: '11px', textTransform: 'none', fontWeight: '400' }}>(Toggle checkmark for correct response)</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQuestion.options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
                      <div 
                        onClick={() => toggleCorrectOption(idx)}
                        style={{ 
                          width: '24px', height: '24px', borderRadius: '6px', 
                          background: currentQuestion.correctOptions.includes(idx) ? 'var(--admin-success)' : 'rgba(255,255,255,0.1)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '14px', transition: 'all 0.2s'
                        }}
                      >
                        {currentQuestion.correctOptions.includes(idx) ? '✓' : ''}
                      </div>
                      <input 
                        type="text" 
                        value={opt} 
                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                        placeholder={`Option ${idx + 1}`}
                        required
                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '0', fontSize: '14px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Discard</button>
                <button type="submit" className="save-btn">{isEditing ? 'Commit Changes' : 'Publish Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <h3>Mass <span style={{ color: '#8b5cf6' }}>Ingestion</span> (MCQ)</h3>
            <p style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', marginBottom: '24px' }}>Provide a JSON array for automated processing.</p>
            <textarea 
              value={bulkJson} 
              onChange={(e) => setBulkJson(e.target.value)} 
              placeholder='[{"question": "...", "category": "...", "type": "MCQ", "options": ["A","B","C","D"], "correctOptions": [0]}]'
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
