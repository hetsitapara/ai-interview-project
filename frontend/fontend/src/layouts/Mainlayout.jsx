import Navbar from "../components/navbar";
import { Outlet, useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Outlet />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
