import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  FileEdit, 
  Newspaper, 
  CheckSquare, 
  Scale, 
  Terminal,
  LayoutDashboard,
  ShieldCheck
} from "lucide-react";
import "../styles/admin.css";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/manage-users", label: "Users Registry", icon: Users },
    { path: "/admin/manage-questions", label: "Questionnaire", icon: FileEdit },
    { path: "/admin/manage-blogs", label: "Knowledge Hub", icon: Newspaper },
    { path: "/admin/manage-mcq", label: "Objective MCQ", icon: CheckSquare },
    { path: "/admin/manage-yesno", label: "Binary Assessment", icon: Scale },
    { path: "/admin/manage-coding", label: "Coding Engine", icon: Terminal },
  ];

  return (
    <div className="admin-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--admin-accent), #4f46e5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.5)' }}>
          <ShieldCheck color="#fff" size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>Nexus <span style={{ color: 'var(--admin-accent)', fontSize: '14px', fontWeight: '400', display: 'block', marginTop: '-4px' }}>Control Center</span></h2>
        </div>
      </div>

      <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', padding: '0 12px 16px' }}>Core Management</div>
      
      <ul>
        {menuItems.map((item) => (
          <li key={item.path} className={isActive(item.path) ? "active" : ""}>
            <Link to={item.path}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>Admin Protocol v4.0</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Encryption: AES-256 Enabled</div>
      </div>
    </div>
  );
}
