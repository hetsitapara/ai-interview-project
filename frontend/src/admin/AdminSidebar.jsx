import { Link, useLocation } from "react-router-dom";
import {
  Users, FileEdit, Newspaper, CheckSquare, Scale, Terminal,
  ShieldCheck, LogOut, BarChart2, Zap
} from "lucide-react";
import "../styles/admin.css";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/manage-users",     label: "Users",       sub: "Registry & Roles",    icon: Users,      col: "#a78bfa" },
    { path: "/admin/manage-questions", label: "Questions",   sub: "Questionnaire Bank",  icon: FileEdit,   col: "#60a5fa" },
    { path: "/admin/manage-blogs",     label: "Blogs",       sub: "Knowledge Hub",       icon: Newspaper,  col: "#f472b6" },
    { path: "/admin/manage-mcq",       label: "MCQ",         sub: "Objective Tests",     icon: CheckSquare,col: "#4ade80" },
    { path: "/admin/manage-yesno",     label: "Yes / No",    sub: "Binary Assessment",   icon: Scale,      col: "#fbbf24" },
    { path: "/admin/manage-coding",    label: "Coding",      sub: "Challenge Engine",    icon: Terminal,   col: "#f87171" },
  ];

  return (
    <aside className="admin-sidebar">
      {/* ── Logo ── */}
      <div className="admin-logo-wrap">
        <div className="admin-logo-icon">
          <ShieldCheck size={22} color="#fff" />
          <span className="admin-logo-pulse" />
        </div>
        <div>
          <div className="admin-logo-name">PrepAI</div>
          <div className="admin-logo-role">
            <Zap size={10} style={{ marginRight: 4 }} /> Admin Console
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="admin-status-bar">
        <span className="admin-status-dot" />
        <span>All Systems Operational</span>
      </div>

      {/* ── Nav label ── */}
      <div className="admin-nav-label">Navigation</div>

      {/* ── Menu ── */}
      <nav className="admin-nav">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} className={`admin-nav-item ${active ? "active" : ""}`}
              style={{ "--item-col": item.col }}>
              {active && <span className="admin-item-glow" style={{ background: item.col }} />}
              <span className="admin-item-icon" style={{ background: active ? `${item.col}22` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? item.col + "40" : "rgba(255,255,255,0.06)"}` }}>
                <item.icon size={16} color={active ? item.col : "#94a3b8"} />
              </span>
              <span className="admin-item-text">
                <span className="admin-item-label" style={{ color: active ? "#fff" : "#94a3b8" }}>{item.label}</span>
                <span className="admin-item-sub">{item.sub}</span>
              </span>
              {active && <span className="admin-item-bar" style={{ background: item.col }} />}
            </Link>
          );
        })}
      </nav>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Footer card ── */}
      <div className="admin-sidebar-foot">
        <div className="admin-foot-avatar">A</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="admin-foot-name">Admin</div>
          <div className="admin-foot-badge">Super Admin</div>
        </div>
        <button className="admin-foot-logout" title="Logout">
          <LogOut size={15} color="#f87171" />
        </button>
      </div>
    </aside>
  );
}
