import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../styles/admin.css";
import { Bell, Search } from "lucide-react";

const routeTitles = {
  "/admin/manage-users":     { label: "Users Registry",    sub: "Manage platform users and permissions" },
  "/admin/manage-questions": { label: "Questionnaire",     sub: "Curate interview question bank" },
  "/admin/manage-blogs":     { label: "Knowledge Hub",     sub: "Manage community blogs & articles" },
  "/admin/manage-mcq":       { label: "Objective MCQ",     sub: "Multiple choice quiz management" },
  "/admin/manage-yesno":     { label: "Binary Assessment", sub: "Yes/No question management" },
  "/admin/manage-coding":    { label: "Coding Engine",     sub: "Manage coding challenges & test cases" },
};

export default function AdminLayout() {
  const location = useLocation();
  const page = routeTitles[location.pathname] || { label: "Admin", sub: "Control Center" };

  return (
    <div className="admin-page">
      <AdminSidebar />
      <div className="admin-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>

        {/* ── Top Bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(6,6,16,0.6)',
          backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 50,
          gap: '20px',
        }}>
          {/* Page title */}
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>{page.label}</h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569', fontWeight: '500' }}>{page.sub}</p>
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
              <input placeholder="Quick search..." style={{
                paddingLeft: '38px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50px', color: '#fff', fontSize: '13px', fontFamily: 'Outfit, sans-serif',
                outline: 'none', width: '220px', transition: 'all 0.3s ease',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.background = 'rgba(99,102,241,0.06)'; e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Notification bell */}
            <button style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              position: 'relative', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <Bell size={16} color="#64748b" />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '7px', height: '7px', background: '#6366f1', borderRadius: '50%', border: '1.5px solid #03030a' }} />
            </button>

            {/* Avatar */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', fontSize: '15px', color: '#fff',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)', cursor: 'pointer',
            }}>A</div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div style={{ padding: '36px 40px', flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          <div className="admin-card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
