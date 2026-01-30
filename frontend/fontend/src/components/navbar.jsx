```javascript
import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const userRole = user?.role || "user";

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
                   <NavLink to="/users" className="nav-link">
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
                <NavLink to="/coding-test" className="nav-link">
                    Coding Test
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

      {/* Profile & Logout */}
      <div className="navbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <NavLink to="/profile" className="nav-link" title="Profile">
                User
                {/* 👤 replaced with text or icon if prefered, specifically asked for 'user' link previously? No, kept symbol */}
             <span style={{ fontSize: '1.2rem'}}>👤</span>
            </NavLink>
            <button 
                onClick={logout} 
                className="nav-link" 
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'rgba(255,255,255,0.7)'
                }}
                title="Logout"
            >
                <LogOut size={20} />
            </button>
      </div>
    </nav>
  );
}
```
