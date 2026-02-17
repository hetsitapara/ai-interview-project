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
      const res = await fetch(`http://localhost:5001/api/mcq/all?page=${page}&limit=20`, {
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
        ? `http://localhost:5001/api/mcq/${currentQuestion._id}` 
        : 'http://localhost:5001/api/mcq';
      
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
      await fetch(`http://localhost:5001/api/mcq/${id}`, {
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
        await fetch(`http://localhost:5001/api/mcq/deleteAll`, {
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
          
          await fetch('http://localhost:5001/api/mcq/bulk', {
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
      <div className="admin-header"><h3>Manage MCQs</h3></div>
      <div style={{display: 'flex', gap: '10px'}}>
        <button className="add-btn" onClick={openAddModal}>+ Add MCQ</button>
        <button className="add-btn" style={{background: '#8b5cf6'}} onClick={() => setShowBulkModal(true)}>+ Bulk Upload</button>
        <button className="delete-btn" style={{marginLeft: 'auto'}} onClick={handleDeleteAll}>Delete All</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
            <thead>
            <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Type</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {questions.map(q => (
                <tr key={q._id}>
                <td>{q.question.substring(0, 50)}...</td>
                <td>{q.category}</td>
                <td>{q.type}</td>
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
            <div className="modal-content" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                <h3>{isEditing ? 'Edit MCQ' : 'Add MCQ'}</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Question</label>
                        <textarea name="question" value={currentQuestion.question} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <input type="text" name="category" value={currentQuestion.category} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select name="type" value={currentQuestion.type} onChange={handleChange}>
                            <option value="MCQ">Single Choice (MCQ)</option>
                            <option value="MSQ">Multiple Choice (MSQ)</option>
                        </select>
                    </div>
                    
                    <label>Options (Check correct ones)</label>
                    {currentQuestion.options.map((opt, idx) => (
                        <div key={idx} style={{display: 'flex', gap: '10px', marginBottom: '5px'}}>
                            <input 
                                type={currentQuestion.type === 'MCQ' ? 'radio' : 'checkbox'} 
                                checked={currentQuestion.correctOptions.includes(idx)} 
                                onChange={() => toggleCorrectOption(idx)}
                            />
                            <input 
                                type="text" 
                                value={opt} 
                                onChange={(e) => handleOptionChange(idx, e.target.value)} 
                                placeholder={`Option ${idx + 1}`}
                                required
                                style={{flex: 1}}
                            />
                        </div>
                    ))}

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
                <h3>Bulk Upload MCQs</h3>
                <textarea 
                    value={bulkJson} 
                    onChange={(e) => setBulkJson(e.target.value)} 
                    placeholder='[{"question": "...", "category": "...", "type": "MCQ", "options": ["A","B","C","D"], "correctOptions": [0]}]'
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
