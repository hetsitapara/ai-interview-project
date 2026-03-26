import Navbar from "../components/navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-[120px] w-full max-w-[1600px] mx-auto px-6">
        <Outlet />
      </main>
    </div>
  );
}
