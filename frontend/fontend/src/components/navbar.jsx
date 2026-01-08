import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        Prep<span>AI</span>
      </div>

      {/* Links */}
      <ul className="navbar-links">
        <li>
          <NavLink to="/dashboard" className="nav-link">
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/interview" className="nav-link">
            Mock Interview
          </NavLink>
        </li>
        <li>
          <NavLink to="/questions" className="nav-link">
            Question Bank
          </NavLink>
        </li>
        <li>
          <NavLink to="/blogs" className="nav-link">
            Blogs
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className="nav-link">
            Reports
          </NavLink>
        </li>
      </ul>

      {/* Profile */}
      <div className="navbar-profile">
        
            <NavLink to="/profile" className="nav-link">
            👤
          </NavLink>
      </div>
    </nav>
  );
}
