import { useState, useEffect } from "react";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", tag: "General" });
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const categories = ['General', 'DSA', 'System Design', 'HR', 'Career Tips', 'Behavioral', 'Frontend', 'Backend', 'DevOps', 'Machine Learning', 'Database'];

  const categoryColors = {
    General: '#8b5cf6', DSA: '#6366f1', 'System Design': '#ec4899', HR: '#f59e0b',
    'Career Tips': '#10b981', Behavioral: '#38bdf8', Frontend: '#a78bfa',
    Backend: '#f87171', DevOps: '#34d399', 'Machine Learning': '#facc15', Database: '#fb923c'
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setCurrentUser(user);
    fetchBlogs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBlogs(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBlogs = async (query = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      const s = query.search !== undefined ? query.search : search;
      const t = query.tags !== undefined ? query.tags : selectedTags;
      if (s) params.append('search', s);
      if (t?.length > 0) params.append('tag', t.join(','));
      const res = await fetch(`http://127.0.0.1:5001/api/blogs?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setBlogs(data);
    } catch (err) { console.error("Failed to fetch blogs", err); }
  };

  const handleTagClick = (tag) => {
    const newTags = selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag];
    setSelectedTags(newTags);
    fetchBlogs({ tags: newTags });
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setLoadingCreate(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5001/api/blogs', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { setShowModal(false); setFormData({ title: "", content: "", tag: "General" }); fetchBlogs(); }
      else alert("Failed to create blog");
    } catch (err) { console.error(err); }
    finally { setLoadingCreate(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:5001/api/blogs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchBlogs();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ paddingBottom: '80px', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        .blog-article { transition:all 0.35s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
        .blog-article:hover { transform:translateY(-6px); border-color:rgba(255,255,255,0.15)!important; box-shadow:0 30px 80px rgba(0,0,0,0.5)!important; }
        .blog-article::before { content:''; position:absolute; inset:0; background:linear-gradient(to bottom,rgba(255,255,255,0.03),transparent); opacity:0; transition:opacity 0.3s ease; }
        .blog-article:hover::before { opacity:1; }
        .tag-chip { cursor:pointer; transition:all 0.2s ease; white-space:nowrap; }
        .read-btn:hover { transform:translateX(4px); }
        .submit-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(139,92,246,0.5)!important; }
        .blog-input:focus, .blog-textarea:focus { border-color:rgba(139,92,246,0.5)!important; box-shadow:0 0 0 4px rgba(139,92,246,0.15)!important; outline:none; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(16px); display:flex; align-items:center; justify-content:center; z-index:1000; animation:fadeUp 0.3s ease; }
        .modal-box { background:rgba(15,23,42,0.95); border:1px solid rgba(255,255,255,0.08); border-radius:28px; padding:48px; max-width:680px; width:90%; max-height:90vh; overflow-y:auto; box-shadow:0 40px 120px rgba(0,0,0,0.7); }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', animation: 'fadeUp 0.5s ease', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50px', padding: '6px 16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px' }}>✍️</span>
              <span style={{ color: '#818cf8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Community Knowledge Hub</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px', lineHeight: 1.1 }}>PrepAI Insights</h1>
            <p style={{ color: '#64748b', fontSize: '17px' }}>Stories, strategies & experiences from the interview community.</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ padding: '16px 28px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 6px 20px rgba(99,102,241,0.4)', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
          >
            ✏️ Write Article
          </button>
        </div>

        {/* Search + Tags Bar */}
        <div style={{ marginBottom: '48px', animation: 'fadeUp 0.6s ease' }}>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, topics, authors..."
              className="blog-input"
              style={{ width: '100%', padding: '17px 17px 17px 50px', borderRadius: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '16px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(tag => {
              const isActive = selectedTags.includes(tag);
              const col = categoryColors[tag] || '#8b5cf6';
              return (
                <span key={tag} className="tag-chip" onClick={() => handleTagClick(tag)}
                  style={{ padding: '8px 18px', borderRadius: '50px', background: isActive ? `${col}20` : 'rgba(255,255,255,0.03)', border: `1px solid ${isActive ? col + '50' : 'rgba(255,255,255,0.06)'}`, color: isActive ? col : '#64748b', fontSize: '13px', fontWeight: '700' }}
                >{tag}</span>
              );
            })}
            {selectedTags.length > 0 && (
              <span className="tag-chip" onClick={() => { setSelectedTags([]); fetchBlogs({ tags: [] }); }}
                style={{ padding: '8px 18px', borderRadius: '50px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', fontWeight: '700' }}
              >✕ Clear</span>
            )}
          </div>
        </div>

        {/* Masonry Grid */}
        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
            <p style={{ color: '#475569', fontSize: '20px' }}>No articles found. Be the first to write one!</p>
          </div>
        ) : (
          <div style={{ columns: '3 400px', columnGap: '24px' }}>
            {blogs.map((blog, index) => {
              const col = categoryColors[blog.tag] || '#8b5cf6';
              const isOwner = currentUser && (currentUser._id === blog.user || currentUser.role === 'admin');
              const excerpt = blog.content.length > 180 ? blog.content.substring(0, 180) + '...' : blog.content;
              return (
                <div key={blog._id} className="blog-article" style={{ display: 'inline-block', width: '100%', marginBottom: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', animation: `fadeUp ${0.4 + index * 0.05}s ease`, cursor: 'default' }}>
                  {/* Top Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span style={{ padding: '5px 14px', borderRadius: '20px', background: `${col}15`, color: col, fontSize: '12px', fontWeight: '700', border: `1px solid ${col}30` }}>{blog.tag || 'General'}</span>
                    {isOwner && <button onClick={() => handleDelete(blog._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Delete</button>}
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '19px', fontWeight: '800', lineHeight: '1.3', marginBottom: '12px', letterSpacing: '-0.3px' }}>{blog.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>{excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      By <strong style={{ color: '#94a3b8' }}>{blog.author}</strong> · {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button className="read-btn" onClick={() => setViewingBlog(blog)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: col, fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                      Read more →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
              <h3 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>Write Article</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '40px', height: '40px', color: '#64748b', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Your article title..."
                  className="blog-input" style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '16px', transition: 'all 0.3s ease', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                <select value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })}
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px' }}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '13px', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Content</label>
                <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Share your insights, tips, or experiences..."
                  className="blog-textarea" style={{ width: '100%', height: '200px', padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '15px', resize: 'vertical', transition: 'all 0.3s ease', boxSizing: 'border-box', lineHeight: '1.7' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '14px 24px', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={loadingCreate} style={{ padding: '14px 32px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}>
                  {loadingCreate ? 'Publishing...' : '✓ Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewingBlog && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewingBlog(null)}>
          <div className="modal-box" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '20px' }}>
              <div>
                <span style={{ padding: '5px 14px', borderRadius: '20px', background: `${categoryColors[viewingBlog.tag] || '#8b5cf6'}20`, color: categoryColors[viewingBlog.tag] || '#8b5cf6', fontSize: '12px', fontWeight: '700', display: 'inline-block', marginBottom: '16px' }}>{viewingBlog.tag}</span>
                <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: 1.2 }}>{viewingBlog.title}</h2>
              </div>
              <button onClick={() => setViewingBlog(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', width: '40px', height: '40px', color: '#64748b', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>By <strong style={{ color: '#94a3b8' }}>{viewingBlog.author}</strong> · {new Date(viewingBlog.createdAt).toLocaleDateString()}</p>
            <div style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-wrap', maxHeight: '60vh', overflowY: 'auto' }}>
              {viewingBlog.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
