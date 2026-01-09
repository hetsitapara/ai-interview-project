import { Link, useLocation } from "react-router-dom";
import "../styles/admin.css";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="admin-sidebar">
      <h2>PrepAI Admin</h2>

      <ul>
        <Link to="/admin/manage-users" style={{textDecoration:'none'}}>
            <li className={isActive("/admin/manage-users") ? "active" : ""}>👤 Manage Users</li>
        </Link>
        <Link to="/admin/manage-questions" style={{textDecoration:'none'}}>
            <li className={isActive("/admin/manage-questions") ? "active" : ""}>📝 Manage Questions</li>
        </Link>
        <Link to="/admin/manage-blogs" style={{textDecoration:'none'}}>
            <li className={isActive("/admin/manage-blogs") ? "active" : ""}>📰 Manage Blogs</li>
        </Link>
      </ul>
    </div>
  );
}
