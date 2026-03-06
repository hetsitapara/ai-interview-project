import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import "../index.css";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();

      if (response.ok) {
        // SUCCESS
        login(data.user, data.token);

        // Redirect
        if (data.user.role === 'admin') {
          navigate("/admin/manage-questions");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>

      {/* LEFT: BRANDING PANEL */}
      <div className="auth-sidebar" style={{
        flex: '1',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', opacity: '0.1', backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
            Prep<span style={{ color: '#818cf8' }}>AI</span>
          </h1>
          <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '40px', lineHeight: '1.2' }}>
            Master Your Technical<br />Interview Journey.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '50%' }}>
                <CheckCircle size={20} color="#818cf8" />
              </div>
              <span style={{ fontSize: '16px', color: '#cbd5e1' }}>AI-Powered Mock Interfaces</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '50%' }}>
                <CheckCircle size={20} color="#818cf8" />
              </div>
              <span style={{ fontSize: '16px', color: '#cbd5e1' }}>Real-time Code Analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '8px', borderRadius: '50%' }}>
                <CheckCircle size={20} color="#818cf8" />
              </div>
              <span style={{ fontSize: '16px', color: '#cbd5e1' }}>Comprehensive Question Bank</span>
            </div>
          </div>

          <div style={{ marginTop: '60px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontStyle: 'italic', color: '#e2e8f0', marginBottom: '10px' }}>"This platform completely changed how I prepare. The AI feedback is incredibly accurate."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#cbd5e1' }}></div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Alex Chen</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Software Engineer at Google</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="auth-form-container" style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', color: 'white', fontWeight: '700', marginBottom: '10px' }}>Welcome Back</h2>
            <p style={{ color: '#94a3b8' }}>Please enter your details to sign in.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#6366f1' }} /> Remember me
              </label>
              <Link to="/forgot-password" style={{ color: '#818cf8', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button
              disabled={loading}
              className="btn primary"
              style={{ padding: '12px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Signing in...' : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
            Don't have an account? <Link to="/register" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>Create an account</Link>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            Protected by reCAPTCHA and subject to the Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
