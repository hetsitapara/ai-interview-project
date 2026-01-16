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
      <div className="blog-main-card">

        <div className="blog-header">
          <div>
            <h2 className="blog-title">Blogs & Interview Tips</h2>
            <button className="add-btn" style={{ marginTop: '10px' }} onClick={() => setShowModal(true)}>
              + Write a Blog
            </button>
          </div>

          <input
            className="blog-search"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {selectedTag && (
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Filtering by: <strong style={{ color: '#38bdf8' }}>{selectedTag}</strong></span>
            <button
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontSize: '14px' }}
            >
              Clear Filter
            </button>
          </div>
        )}

        <div className="blog-layout">

          {/* Blog List */}
          <div className="blog-list">
            {blogs.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No blogs found.</p> : (
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

          {/* Sidebar */}
          <div className="blog-sidebar">
            <div className="sidebar-section">
              <h4>Categories</h4>
              <div className="category-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map(tag => (
                  <span
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`sidebar-tag ${selectedTag === tag ? 'active' : ''}`}
                    style={{
                      padding: '6px 12px',
                      background: selectedTag === tag ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedTag === tag ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
                      color: selectedTag === tag ? '#a5b4fc' : '#94a3b8',
                      borderRadius: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h4>Popular Blogs</h4>
              <ul className="popular-list" style={{ listStyle: 'none', padding: 0 }}>
                {popularBlogs.map((p, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: '18px',
                      cursor: 'pointer',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSearch(p.title)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#6366f1', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{p.tag}</div>
                    <div style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 500 }}>{p.title}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

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
