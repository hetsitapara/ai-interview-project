import { useState } from "react";
import "../index.css";

export default function Login() {
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ role, ...formData });
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Login as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === "user" && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn">Login</button>
        </form>

        <p className="footer-text">
          AI Interview Practice System
        </p>
      </div>
    </div>
  );
}
