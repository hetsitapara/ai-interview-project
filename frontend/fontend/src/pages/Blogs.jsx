import { useState, useEffect } from "react";
import "../styles/blog.css";
// reusing admin styles for modal if possible or just inline/new css
import "../styles/admin.css";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tag: "General"
  });

  const [selectedTag, setSelectedTag] = useState('');
  const [viewingBlog, setViewingBlog] = useState(null);

  const categories = [
    'General', 'DSA', 'System Design', 'HR', 'Career Tips',
    'Behavioral', 'Frontend', 'Backend', 'DevOps', 'Machine Learning', 'Database'
  ];

  const popularBlogs = [
    { title: "10 Tips for Your First Interview", tag: "Career Tips" },
    { title: "Understanding System Design Patterns", tag: "System Design" },
    { title: "Common HR Mistakes to Avoid", tag: "HR" },
    { title: "How to Negotiate Your Salary", tag: "Career Tips" },
    { title: "Mastering the Coding Round", tag: "DSA" }
  ];

  useEffect(() => {
    // Get user from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setCurrentUser(user);

    fetchBlogs();
  }, []);

  // Fetch Blogs with filters
  const fetchBlogs = async (query = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      const s = query.search !== undefined ? query.search : search;
      const t = query.tag !== undefined ? query.tag : selectedTag;

      if (s) params.append('search', s);
      if (t) params.append('tag', t);

      const res = await fetch(`http://localhost:5001/api/blogs?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleTagClick = (tag) => {
    const newTag = selectedTag === tag ? '' : tag;
    setSelectedTag(newTag);
    fetchBlogs({ tag: newTag });
  };

  const clearFilters = () => {
    setSelectedTag('');
    setSearch('');
    fetchBlogs({ search: '', tag: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ title: "", content: "", tag: "General" });
        fetchBlogs();
      } else {
        alert("Failed to create blog");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchBlogs();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="blog-page">
      <div className="container-xl">
        <div className="main-layout">
          {/* Blog Sidebar */}
          <aside className="sidebar-panel">
            <div className="widget-card">
              <h4>🔍 Global Search</h4>
              <input
                className="blog-search"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
              />
            </div>

            <div className="widget-card">
              <h4>🏷️ Top Categories</h4>
              <div className="category-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                {categories.map(tag => (
                  <span
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`sidebar-tag ${selectedTag === tag ? 'active' : ''}`}
                    style={{
                      padding: '8px 14px',
                      background: selectedTag === tag ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedTag === tag ? 'rgba(255,255,255,0.2)' : 'var(--glass-border)'}`,
                      color: selectedTag === tag ? '#fff' : 'var(--text-muted)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="widget-card">
              <h4>🚀 Trending Discussions</h4>
              <ul className="popular-list" style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                {popularBlogs.map((p, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: '16px',
                      cursor: 'pointer',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      border: '1px solid var(--glass-border)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSearch(p.title)}
                  >
                    <div style={{ fontSize: '10px', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>{p.tag}</div>
                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, lineHeight: '1.4' }}>{p.title}</div>
                  </li>
                ))}
              </ul>
            </div>

            <button className="add-btn" style={{ width: '100%', padding: '16px', borderRadius: '14px', fontWeight: '700' }} onClick={() => setShowModal(true)}>
              + Create New Article
            </button>
          </aside>

          {/* Blog Feed area */}
          <main className="content-main">
            <header style={{ marginBottom: '8px' }}>
              <h2 style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Knowledge Hub</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Insights, tips, and experiences from the PrepAI community.</p>
            </header>

            {selectedTag && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>{selectedTag}</span>
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Clear All Filters</button>
              </div>
            )}

            <div className="blog-list" style={{ display: 'grid', gap: '32px' }}>
              {blogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 40px', background: 'var(--glass-bg)', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No articles match your current search criteria.</p>
                  <button className="btn secondary" onClick={clearFilters} style={{ marginTop: '20px' }}>Show All Blogs</button>
                </div>
              ) : (
                blogs.map(blog => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    currentUser={currentUser}
                    onDelete={handleDelete}
                    onRead={() => setViewingBlog(blog)}
                  />
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ADD BLOG MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Write a New Blog</h3>
            <form onSubmit={handleCreate} className="admin-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tag/Category</label>
                <select
                  value={formData.tag}
                  onChange={e => setFormData({ ...formData, tag: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  style={{ height: '200px' }}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BLOG MODAL */}
      {viewingBlog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '28px' }}>{viewingBlog.title}</h2>
              <span className="tag" style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                padding: '4px 12px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                fontSize: '11px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>{viewingBlog.tag}</span>
            </div>

            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              By <span style={{ color: '#fff' }}>{viewingBlog.author}</span> • {new Date(viewingBlog.createdAt).toLocaleDateString()}
            </p>

            <div style={{
              color: '#cbd5e1',
              lineHeight: '1.8',
              fontSize: '16px',
              whiteSpace: 'pre-wrap',
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: '15px'
            }}>
              {viewingBlog.content}
            </div>

            <div className="modal-actions" style={{ marginTop: '30px', justifyContent: 'flex-end' }}>
              <button className="save-btn" onClick={() => setViewingBlog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function BlogCard({ blog, currentUser, onDelete, onRead }) {
  const isOwner = currentUser && (currentUser._id === blog.user || currentUser.role === 'admin');

  // Format Date
  const dateStr = new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="blog-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3>{blog.title}</h3>
        {isOwner && (
          <button
            onClick={() => onDelete(blog._id)}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: 'none',
              color: '#ef4444',
              padding: '4px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Delete
          </button>
        )}
      </div>

      <div className="blog-meta">
        <span className="tag">{blog.tag || 'General'}</span>
        <span>By {blog.author} • {dateStr}</span>
      </div>
      <p className="blog-excerpt">
        {blog.content.length > 150 ? blog.content.substring(0, 150) + "..." : blog.content}
      </p>
      <button className="read-more-btn" onClick={onRead}>Read More</button>
    </div>
  );
}
