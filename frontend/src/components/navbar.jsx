import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const userRole = user?.role || "user";

    return (
        <nav className="navbar">
            <div className="navbar-container">
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
                                <NavLink to="/roadmap" className="nav-link">
                                    Roadmap
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
                <div className="navbar-actions">
                    <NavLink to="/profile" className="nav-link" title="Profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Profile"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid rgba(124, 58, 237, 0.5)'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <User size={20} color="#e5e5e5" />
                            </div>
                        )}
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
                            color: 'rgba(255,255,255,0.7)',
                            padding: '8px',
                            borderRadius: '50%',
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        title="Logout"
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
