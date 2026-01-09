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

  useEffect(() => {
    // Get user from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setCurrentUser(user);

    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/blogs', {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if(res.ok) {
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    }
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
    if(!window.confirm("Are you sure you want to delete this blog?")) return;
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

  // Filter blogs
  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="blog-page">
      <div className="blog-main-card">

        <div className="blog-header">
            <div>
              <h2 className="blog-title">Blogs & Interview Tips</h2>
              <button className="add-btn" style={{marginTop: '10px'}} onClick={() => setShowModal(true)}>
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

        <div className="blog-layout">

          {/* Blog List */}
          <div className="blog-list">
            {filteredBlogs.length === 0 ? <p>No blogs found.</p> : (
                filteredBlogs.map(blog => (
                    <BlogCard 
                        key={blog._id} 
                        blog={blog} 
                        currentUser={currentUser} 
                        onDelete={handleDelete} 
                    />
                ))
            )}
          </div>

          {/* Sidebar */}
          <div className="blog-sidebar">
            <div className="sidebar-section">
              <h4>Categories</h4>
              <ul>
                <li>DSA</li>
                <li>System Design</li>
                <li>HR</li>
                <li>Career Tips</li>
              </ul>
            </div>

            <div className="sidebar-section">
              <h4>Popular Blogs</h4>
              <ul>
                <li>First Technical Interview</li>
                <li>System Design Basics</li>
                <li>HR Interview Mistakes</li>
                <li>Career Growth Tips</li>
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
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tag/Category</label>
                        <select 
                            value={formData.tag}
                            onChange={e => setFormData({...formData, tag: e.target.value})}
                        >
                            <option value="General">General</option>
                            <option value="DSA">DSA</option>
                            <option value="System Design">System Design</option>
                            <option value="HR">HR</option>
                            <option value="Career Tips">Career Tips</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea 
                            required
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
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

    </div>
  );
}

function BlogCard({ blog, currentUser, onDelete }) {
  const isOwner = currentUser && (currentUser._id === blog.user || currentUser.role === 'admin');
  
  // Format Date
  const dateStr = new Date(blog.createdAt).toLocaleDateString("en-US", {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="blog-card">
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <h3>{blog.title}</h3>
        {isOwner && (
            <button 
                onClick={() => onDelete(blog._id)}
                style={{
                    background:'transparent', 
                    border:'none', 
                    color:'#ef4444', 
                    cursor:'pointer',
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
      {/* Read More could link to a detail page properly later */}
      <button className="read-more-btn">Read More</button>
    </div>
  );
}
