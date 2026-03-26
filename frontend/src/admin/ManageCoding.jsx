import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Save, X, Code2, PlusCircle, Trash } from 'lucide-react';

export default function ManageCoding() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState({
        title: '',
        difficulty: 'Easy',
        description: '',
        imageUrl: '',
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        testCases: [{ input: '', expectedOutput: '', isPublic: true }],
        starterCode: {
            javascript: '// Write your code here',
            python: '# Write your code here'
        }
    });

    const API_URL = 'http://127.0.0.1:5001/api/coding/questions';

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestions(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEdit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm(res.data);
            setEditingId(id);
            setShowForm(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuestions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(API_URL, form, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowForm(false);
            setEditingId(null);
            resetForm();
            fetchQuestions();
        } catch (err) {
            console.error(err);
            alert('Failed to save question');
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            difficulty: 'Easy',
            description: '',
            imageUrl: '',
            constraints: '',
            examples: [{ input: '', output: '', explanation: '' }],
            testCases: [{ input: '', expectedOutput: '', isPublic: true }],
            starterCode: {
                javascript: '// Write your code here',
                python: '# Write your code here'
            }
        });
    };

    return (
        <div style={{ animation: 'adminFadeUp 0.8s ease' }}>
            <div className="admin-header">
                <h3>Coding <span style={{ color: 'var(--admin-accent)' }}>Challenges</span></h3>
                {!showForm && (
                    <button 
                        className="add-btn" 
                        onClick={() => { resetForm(); setShowForm(true); }}
                    >
                        <PlusCircle size={18} /> Add New Challenge
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="admin-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ margin: 0 }}>{editingId ? 'Edit' : 'Create'} <span style={{ color: 'var(--admin-accent)' }}>Structure</span></h3>
                        <button 
                            className="cancel-btn" 
                            onClick={() => { setShowForm(false); setEditingId(null); }}
                            style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div className="form-group">
                                <label>Challenge Title</label>
                                <input 
                                    value={form.title} 
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Valid Palindrome II"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Complexity Level</label>
                                <select 
                                    value={form.difficulty} 
                                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                                >
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Problem Statement (Markdown Supported)</label>
                            <textarea 
                                value={form.description} 
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                style={{ height: '180px' }}
                                placeholder="Describe the problem, input/output formats..."
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label>Image URL <span style={{ fontSize: '11px', textTransform: 'none', color: 'var(--admin-text-secondary)' }}>(Optional - e.g., for graphs/trees)</span></label>
                            <input 
                                type="url"
                                value={form.imageUrl || ''} 
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>Execution Examples <span style={{ fontSize: '11px', textTransform: 'none' }}>(Shown on problem page)</span></label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {form.examples.map((ex, idx) => (
                                    <div key={idx} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label style={{ fontSize: '11px' }}>Example Input</label>
                                                <textarea value={ex.input} onChange={(e) => {
                                                    const newEx = [...form.examples];
                                                    newEx[idx].input = e.target.value;
                                                    setForm({ ...form, examples: newEx });
                                                }} style={{ minHeight: '60px', borderRadius: '8px', fontSize: '13px', background: '#000' }} />
                                            </div>
                                            <div className="form-group" style={{ marginBottom: 0 }}>
                                                <label style={{ fontSize: '11px' }}>Example Output</label>
                                                <textarea value={ex.output} onChange={(e) => {
                                                    const newEx = [...form.examples];
                                                    newEx[idx].output = e.target.value;
                                                    setForm({ ...form, examples: newEx });
                                                }} style={{ minHeight: '60px', borderRadius: '8px', fontSize: '13px', background: '#000' }} />
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label style={{ fontSize: '11px' }}>Explanation</label>
                                            <input value={ex.explanation} onChange={(e) => {
                                                const newEx = [...form.examples];
                                                newEx[idx].explanation = e.target.value;
                                                setForm({ ...form, examples: newEx });
                                            }} style={{ fontSize: '13px', borderRadius: '8px' }} />
                                        </div>
                                        {idx > 0 && (
                                            <button 
                                                type="button"
                                                onClick={() => setForm({ ...form, examples: form.examples.filter((_, i) => i !== idx) })} 
                                                style={{ color: 'var(--admin-danger)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px', fontSize: '12px', fontWeight: '700' }}
                                            >
                                                Delete Example
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] })} style={{ color: 'var(--admin-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', marginTop: '12px', fontSize: '13px' }}>+ Add Visual Example</button>
                        </div>

                        <div className="form-group">
                            <label>Validation Engine (Test Cases)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {form.testCases.map((tc, idx) => (
                                    <div key={idx} style={{ padding: '16px', background: tc.isPublic ? 'rgba(16, 185, 129, 0.03)' : 'rgba(99, 102, 241, 0.03)', borderRadius: '12px', border: tc.isPublic ? '1px solid rgba(16, 185, 129, 0.1)' : '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                                            <textarea placeholder="Input Data" value={tc.input} onChange={(e) => {
                                                const newTc = [...form.testCases];
                                                newTc[idx].input = e.target.value;
                                                setForm({ ...form, testCases: newTc });
                                            }} style={{ background: '#000', fontSize: '13px', minHeight: '50px' }} />
                                            <textarea placeholder="Expected String Output" value={tc.expectedOutput} onChange={(e) => {
                                                const newTc = [...form.testCases];
                                                newTc[idx].expectedOutput = e.target.value;
                                                setForm({ ...form, testCases: newTc });
                                            }} style={{ background: '#000', fontSize: '13px', minHeight: '50px' }} />
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                    <input type="checkbox" checked={tc.isPublic} onChange={(e) => {
                                                        const newTc = [...form.testCases];
                                                        newTc[idx].isPublic = e.target.checked;
                                                        setForm({ ...form, testCases: newTc });
                                                    }} style={{ width: '16px', height: '16px' }} />
                                                    <span style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', fontWeight: '700' }}>Public</span>
                                                </label>
                                                {idx > 0 && <button type="button" onClick={() => setForm({ ...form, testCases: form.testCases.filter((_, i) => i !== idx) })} className="delete-btn" style={{ background: 'none', border: 'none', width: 'auto', height: 'auto', padding: '4px' }}><Trash size={16} /></button>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => setForm({ ...form, testCases: [...form.testCases, { input: '', expectedOutput: '', isPublic: false }] })} style={{ color: 'var(--admin-accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', marginTop: '12px', fontSize: '13px' }}>+ Add Evaluation Case</button>
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditingId(null); }}>Discard</button>
                            <button type="submit" className="save-btn">{editingId ? 'Push Update' : 'Initialize Challenge'}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Synchronizing challenge repository...</div>
                    ) : (
                        <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Challenge Info</th>
                                        <th>Difficulty</th>
                                        <th>Configuration</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map(q => (
                                        <tr key={q._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Code2 size={20} color="var(--admin-accent)" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '16px' }}>{q.title}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>Created: {new Date(q.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="difficulty-badge" style={{
                                                    background: q.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' : q.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {q.difficulty}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: '700' }}>
                                                    <span style={{ color: 'var(--admin-text-secondary)' }}>{q.examples?.length ?? '–'} EXAMPLES</span>
                                                    <span style={{ color: 'var(--admin-border)' }}>|</span>
                                                    <span style={{ color: 'var(--admin-text-secondary)' }}>{q.testCases?.length ?? '–'} TESTS</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="edit-btn" onClick={() => handleEdit(q._id)} title="Update Config">✏️</button>
                                                <button className="delete-btn" onClick={() => handleDelete(q._id)} title="Purge Challenge">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
