import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MainLayout from "./layouts/Mainlayout";
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import Interview from "./pages/Interview";
import Reports from "./pages/Reports";
import AdminLayout from "./admin/AdminLayout";
import ManageQuestions from "./admin/ManageQuestions";
import ManageUsers from "./admin/ManageUsers";
import ManageBlogs from "./admin/ManageBlogs";
import Profile from "./pages/profile";
import Blogs from "./pages/Blogs";
import InterviewExperience from "./pages/InterviewExperience";
import McqPractice from "./pages/McqPractice";
import LandingPage from "./pages/LandingPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questions" element={<QuestionBank />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/reports" element={<Reports />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/experiences" element={<InterviewExperience />} />
          <Route path="/mcq" element={<McqPractice />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes (No Navbar from MainLayout) */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route path="manage-questions" element={<ManageQuestions />} />
           <Route path="manage-users" element={<ManageUsers />} />
           <Route path="manage-blogs" element={<ManageBlogs />} />
        </Route>

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
