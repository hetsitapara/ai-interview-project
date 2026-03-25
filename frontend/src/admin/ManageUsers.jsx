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
      
      const res = await fetch("http://127.0.0.1:5001/api/users", { // Need to verify/create this route
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
          const res = await fetch(`http://127.0.0.1:5001/api/users/${id}`, {
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
    <div style={{ animation: 'adminFadeUp 0.8s ease' }}>
      <div className="admin-header">
        <h3>User <span style={{ color: 'var(--admin-accent)' }}>Accounts</span></h3>
        <div style={{ color: 'var(--admin-text-secondary)', fontSize: '14px', fontWeight: '600' }}>
          Total Users: <span style={{ color: '#fff' }}>{users.length}</span>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>Retrieving user database...</div>
        ) : (
          <div className="admin-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Email Address</th>
                  <th>Permission Level</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-accent)', fontWeight: '700', fontSize: '14px' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{user.name}</div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--admin-text-secondary)' }}>{user.email}</td>
                    <td>
                      <span className="difficulty-badge" style={{
                        background: user.role === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                        color: user.role === 'admin' ? 'var(--admin-accent)' : 'var(--admin-text-secondary)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="delete-btn" onClick={() => handleDelete(user._id)} title="Remove User">🗑️</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-secondary)', fontStyle: 'italic' }}>
                      No users registered in the system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--admin-danger)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '14px' }}>
          ⚠️ Error: {error}
        </div>
      )}
    </div>
  );
}
