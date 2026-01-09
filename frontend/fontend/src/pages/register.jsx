import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");


  
  // Better approach: explicit name attributes
  const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Create Account</h2>
        {error && <p style={{color: "red", textAlign: "center", marginBottom: "1rem"}}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
                type="text" 
                name="name"
                placeholder="Your name" 
                required 
                onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
                type="email" 
                name="email"
                placeholder="Email address" 
                required 
                onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
                type="password" 
                name="password"
                placeholder="Password" 
                required 
                onChange={handleInputChange}
            />
          </div>

          <button className="btn">Register</button>
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}
