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
          const res = await fetch("http://localhost:5001/api/blogs", {
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
        const res = await fetch(`http://localhost:5001/api/blogs/${id}`, {
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
    <div>
      <div className="admin-header">
        <h3>Manage Blogs</h3>
      </div>
      {/* Search could be added here */}
      
      {loading ? <p style={{color:'white'}}>Loading...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length > 0 ? blogs.map(blog => (
                <tr key={blog._id}>
                    <td>{blog.title}</td>
                    <td>{blog.author || 'Unknown'}</td>
                    <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td>
                        {/* ONLY DELETE BUTTON as requested */}
                        <button className="delete-btn" onClick={() => handleDelete(blog._id)}>Delete</button>
                    </td>
                </tr>
            )) : (
                 <tr><td colSpan="4" style={{textAlign:'center'}}>No blogs found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
