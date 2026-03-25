import { useState, useEffect } from "react";
import "../styles/admin.css";

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
      try {
          const token = localStorage.getItem("token");
           // Assuming endpoint exists
          const res = await fetch("http://127.0.0.1:5001/api/blogs", {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if(!res.ok) throw new Error("Failed");
          const data = await res.json();
          setBlogs(data);
      } catch(e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  }

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this blog?")) return;
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:5001/api/blogs/${id}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(!res.ok) throw new Error("Failed");
        fetchBlogs();
    } catch (e) {
        alert(e.message);
    }
  }

  return (
    <div style={{ animation: 'adminFadeUp 0.8s ease' }}>
      <div className="admin-header">
        <h3>Blog <span style={{ color: 'var(--admin-accent)' }}>Repository</span></h3>
        <div style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', fontWeight: '600' }}>
          Total Articles: <span style={{ color: '#fff' }}>{blogs.length}</span>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Scanning blog archives...</div>
        ) : (
          <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article Title</th>
                  <th>Author</th>
                  <th>Published Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length > 0 ? blogs.map(blog => (
                  <tr key={blog._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{blog.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)', marginTop: '2px' }}>ID: {blog._id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👤</div>
                        <span style={{ color: 'var(--admin-text-secondary)' }}>{blog.author || 'Internal Team'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--admin-text-secondary)', fontSize: '13px' }}>
                      {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="delete-btn" onClick={() => handleDelete(blog._id)} title="Remove Article">🗑️</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-secondary)', fontStyle: 'italic' }}>
                      No blog posts found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '24px' }}>💡</div>
        <div style={{ fontSize: '14px', color: 'var(--admin-text-secondary)', lineHeight: '1.5' }}>
          Deleting a blog post is <span style={{ color: 'var(--admin-danger)', fontWeight: '700' }}>permanent</span>. Ensure you have a backup of the content if needed before proceeding.
        </div>
      </div>
    </div>
  );
}
