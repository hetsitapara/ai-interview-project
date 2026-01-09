import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import "../styles/admin.css"; // Ensure you have styles for modals/forms if needed

export default function ManageQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    title: "",
    topic: "DSA",
    difficulty: "Easy",
    answer: ""
  });

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/questions', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  // Open Add Modal
  const openAddModal = () => {
    setCurrentQuestion({ title: "", topic: "DSA", difficulty: "Easy", answer: "" });
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

  return (
    <>
      <div className="admin-header">
        <h3>Admin Dashboard - Manage Questions</h3>
      </div>

      <button className="add-btn" onClick={openAddModal}>+ Add New Question</button>

      {loading ? <p>Loading...</p> : (
        <table className="admin-table">
            <thead>
            <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {questions.map(q => (
                <tr key={q._id}>
                <td>{q.title}</td>
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

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{isEditing ? 'Edit Question' : 'Add New Question'}</h3>
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={currentQuestion.title} onChange={handleChange} required />
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
    </>
  );
}
