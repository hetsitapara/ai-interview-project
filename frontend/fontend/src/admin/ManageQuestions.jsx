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
      const res = await fetch(`http://localhost:5001/api/questions?page=${page}&limit=20`, {
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
        ? `http://localhost:5001/api/questions/${currentQuestion._id}` 
        : 'http://localhost:5001/api/questions';
      
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
      const res = await fetch(`http://localhost:5001/api/questions/${id}`, {
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
      const res = await fetch(`http://localhost:5001/api/questions/deleteAll`, {
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

        const res = await fetch('http://localhost:5001/api/questions/bulk', {
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
    <>
      <div className="admin-header">
        <h3>Admin Dashboard - Manage Questions</h3>
      </div>

      <div style={{display: 'flex', gap: '10px'}}>
        <button className="add-btn" onClick={openAddModal}>+ Add New Question</button>
        <button className="add-btn" style={{background: '#8b5cf6'}} onClick={() => setShowBulkModal(true)}>+ Bulk Upload</button>
        <button className="delete-btn" style={{marginLeft: 'auto'}} onClick={handleDeleteAll}>Delete All Data</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
            <thead>
            <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {questions.map(q => (
                <tr key={q._id}>
                <td>{q.question}</td>
                <td>
                    <span style={{
                        fontSize: '11px', 
                        background: 'rgba(56, 189, 248, 0.15)', 
                        color: '#38bdf8', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 600
                    }}>{q.category || 'General'}</span>
                </td>
                <td>{q.topic}</td>
                <td>
                    <span className={`tag ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                </td>
                <td>
                    <button className="edit-btn" onClick={() => openEditModal(q)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(q._id)}>Delete</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      )}

      {/* Pagination Controls */}
      <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '10px'}}>
        <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
            style={{padding: '5px 15px', cursor: 'pointer', opacity: page === 1 ? 0.5 : 1}}
        >
            Previous
        </button>
        <span style={{color: 'white', alignSelf: 'center'}}>Page {page} of {totalPages}</span>
        <button 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
            style={{padding: '5px 15px', cursor: 'pointer', opacity: page === totalPages ? 0.5 : 1}}
        >
            Next
        </button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEditing ? 'Edit Question' : 'Add New Question'}</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Question</label>
                        <input type="text" name="question" value={currentQuestion.question} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Category (Optional)</label>
                        <input type="text" name="category" value={currentQuestion.category} onChange={handleChange} placeholder="e.g. DBMS, Web Dev"/>
                    </div>
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
                    <div className="form-group">
                        <label>Answer (Optional)</label>
                        <textarea name="answer" value={currentQuestion.answer} onChange={handleChange}></textarea>
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Bulk Upload Questions</h3>
                <p style={{fontSize: '0.9rem', color: '#ccc', marginBottom: '10px'}}>Paste JSON array of questions here.</p>
                <form onSubmit={handleBulkSubmit} className="admin-form">
                    <div className="form-group">
                        <textarea 
                            value={bulkJson} 
                            onChange={(e) => setBulkJson(e.target.value)} 
                            placeholder='[{"title": "...", "topic": "...", "difficulty": "...", "answer": "..."}]'
                            style={{minHeight: '200px', fontFamily: 'monospace'}}
                            required
                        ></textarea>
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" onClick={() => setShowBulkModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">pUpload</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
}
