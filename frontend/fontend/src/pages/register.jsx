import "../index.css";

export default function Register() {
  return (
    <div className="page-container">
      <div className="card">
        <h2>Create Account</h2>

        <form>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Email address" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Password" required />
          </div>

          <button className="btn">Register</button>
        </form>

        <p className="footer-text">
          Already have an account? <span className="link">Login</span>
        </p>
      </div>
    </div>
  );
}
