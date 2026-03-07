import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/base.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/admin.css";
import "./styles/report.css";
import "./styles/blog.css";
import "./styles/interview.css";
import "./styles/interviewExperience.css";
import "./styles/questionbank.css";
import "./styles/profile.css";


import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
