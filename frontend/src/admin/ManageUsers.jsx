import { useState, useEffect } from "react";
import "../styles/admin.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      // Assuming a backend endpoint exists or mocking it for now if not
      // If backend endpoint /api/users doesn't exist, this will error.
      // We might need to add it to backend/server.js if not present.
      // For now, let's assume we need to create it or it mimics the profile structure.
      // Wait, user asked to "fix" it, implying it might be there but empty.
      // But file listing showed it didn't exist in admin folder.
      // I am creating it now.
      
      const res = await fetch("http://localhost:5001/api/users", { // Need to verify/create this route
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this user?")) return;
      try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5001/api/users/${id}`, {
              method: "DELETE",
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if(!res.ok) throw new Error("Failed to delete user");
          fetchUsers();
      } catch (err) {
          alert(err.message);
      }
  }

  return (
    <div className="admin-page-content"> {/* Inner content wrapper if needed, or direct fragments */}
      <div className="admin-header">
        <h3>Manage Users</h3>
      </div>

      {loading ? <p style={{color:'white'}}>Loading...</p> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                 <td>
                    <span className={`tag ${user.role === 'admin' ? 'admin' : 'user'}`} style={{
                        padding: '4px 8px', borderRadius: '4px', 
                        background: user.role === 'admin' ? '#3b82f6' : '#64748b',
                        color: 'white', fontSize: '12px'
                    }}>
                        {user.role}
                    </span>
                </td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            )) : (
                <tr><td colSpan="4" style={{textAlign:'center'}}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
