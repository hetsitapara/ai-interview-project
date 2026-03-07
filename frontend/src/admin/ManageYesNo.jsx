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
      const res = await fetch(`http://localhost:5001/api/yesno?page=${page}&limit=20`, {
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
        ? `http://localhost:5001/api/yesno/${currentQuestion._id}` 
        : 'http://localhost:5001/api/yesno';
      
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
      await fetch(`http://localhost:5001/api/yesno/${id}`, {
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
        await fetch(`http://localhost:5001/api/yesno/deleteAll`, {
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
          
          await fetch('http://localhost:5001/api/yesno/bulk', {
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
    <>
      <div className="admin-header"><h3>Manage Yes/No Questions</h3></div>
      <div style={{display: 'flex', gap: '10px'}}>
        <button className="add-btn" onClick={openAddModal}>+ Add Question</button>
        <button className="add-btn" style={{background: '#8b5cf6'}} onClick={() => setShowBulkModal(true)}>+ Bulk Upload</button>
        <button className="delete-btn" style={{marginLeft: 'auto'}} onClick={handleDeleteAll}>Delete All</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
            <thead>
            <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Answer</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {questions.map(q => (
                <tr key={q._id}>
                <td>{q.question}</td>
                <td>{q.category}</td>
                <td>{q.answer}</td>
                <td>
                    <button className="edit-btn" onClick={() => openEditModal(q)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(q._id)}>Delete</button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '10px'}}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span style={{color: 'white'}}>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEditing ? 'Edit Question' : 'Add Question'}</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Question</label>
                        <input type="text" name="question" value={currentQuestion.question} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <input type="text" name="category" value={currentQuestion.category} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Answer</label>
                        <select name="answer" value={currentQuestion.answer} onChange={handleChange}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
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
                    
                    <div className="modal-actions">
                        <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                        <button type="submit" className="save-btn">Save</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {showBulkModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Bulk Upload</h3>
                <textarea 
                    value={bulkJson} 
                    onChange={(e) => setBulkJson(e.target.value)} 
                    placeholder='[{"question": "...", "answer": "Yes", "category": "HR", "difficulty": "Easy"}]'
                    style={{minHeight: '200px', width: '100%', fontFamily: 'monospace'}}
                ></textarea>
                <div className="modal-actions">
                    <button type="button" onClick={() => setShowBulkModal(false)} className="cancel-btn">Cancel</button>
                    <button onClick={handleBulkSubmit} className="save-btn">Upload</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
