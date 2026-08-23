import Navbar from "../components/navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Outlet />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      background: 'var(--page-gradient)',
      overflowX: 'hidden'
    }}>
      <Navbar />
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        paddingTop: '100px' 
      }}>
        <Outlet />
      </main>
    </div>
  );
}
