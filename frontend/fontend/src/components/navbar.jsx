import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/navbar.css";

export default function Navbar() {
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setUserRole(user.role || "user");
        } catch (e) {
            console.error(e);
        }
    }
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        Prep<span>AI</span>
      </div>

      {/* Links */}
      <ul className="navbar-links">
        {userRole === 'admin' ? (
            <>
                <li>
                    <NavLink to="/admin/manage-questions" className="nav-link">
                        Manage Questions
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/blogs" className="nav-link">
                        Blogs
                    </NavLink>
                </li>
                <li>
                   <NavLink to="/users" className="nav-link"> {/* Assuming users page exists or placeholder */}
                        Users
                    </NavLink>
                </li>
            </>
        ) : (
            <>
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
                <NavLink to="/mcq" className="nav-link">
                    MCQ Practice
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
            </>
        )}
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
