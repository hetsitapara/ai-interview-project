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
      const response = await fetch("http://127.0.0.1:5001/api/login", {
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
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 1) 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.15), transparent 60%)', filter: 'blur(60px)' }}></div>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', opacity: '0.05', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

        <div style={{ position: 'relative', zIndex: 1, color: 'white', padding: '0 40px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-2px' }}>
            Prep<span className="text-gradient-accent">AI</span>
          </h1>
          <h2 style={{ fontSize: '38px', fontWeight: '800', marginBottom: '40px', lineHeight: '1.1', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
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

          <div className="glass-panel-premium animate-float" style={{ marginTop: '60px', padding: '30px' }}>
            <p style={{ fontStyle: 'italic', color: '#e2e8f0', marginBottom: '16px', fontSize: '18px', lineHeight: '1.5' }}>"This platform completely changed how I prepare. The real-time Llama3 feedback is incredibly accurate and insightful."</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', border: '2px solid rgba(255,255,255,0.2)' }}></div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>Alex Chen</div>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Senior SWE @ Tech Giant</div>
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
        background: 'var(--page-gradient)',
        padding: '40px'
      }}>
        <div style={{ width: '100%', maxWidth: '440px', background: 'transparent' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', color: 'white', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>Welcome Back</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Please enter your details to sign in.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(139, 92, 246, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(139, 92, 246, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
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
              className="btn-premium-primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              {loading ? 'Authenticating...' : (
                <>Sign In Securely <ArrowRight size={20} /></>
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
