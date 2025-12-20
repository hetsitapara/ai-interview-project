import { useState } from "react";

export default function Login() {
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload =
      role === "admin"
        ? { role, password: formData.password }
        : { role, email: formData.email, password: formData.password };

    console.log("Login Payload:", payload);
    alert("Check console for submitted data");
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Role Selection */}
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <form onSubmit={handleSubmit}>
        {/* User-only email */}
        {role === "user" && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
        )}

        {/* Common / Admin field */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
