import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-page">
  <AdminSidebar />
  <div className="admin-content">
    <div className="admin-card">
      <Outlet />
    </div>
  </div>
</div>

  );
}
