export default function AdminSidebar() {
  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>

      <ul>
        <li>👤 Manage Users</li>
        <li className="active">📝 Manage Questions</li>
        <li>📰 Manage Blogs</li>
      </ul>
    </div>
  );
}
