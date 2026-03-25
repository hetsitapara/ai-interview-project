import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Zap, Target, BookOpen } from "lucide-react";
import "../index.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Better approach: explicit name attributes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5001/api/register", {
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
            Accelerate Your Career <br />With AI Precision.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="glass-panel-premium animate-float" style={{ padding: '24px' }}>
              <Zap size={24} color="#a5b4fc" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Fast Track</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Identify gaps in minutes, not months.</p>
            </div>
            <div className="glass-panel-premium animate-float" style={{ padding: '24px', animationDelay: '1s' }}>
              <Target size={28} color="#a5b4fc" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '5px', color: '#fff' }}>Targeted Prep</h4>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>Questions tailored to your dream role.</p>
            </div>
            <div className="glass-panel-premium animate-float" style={{ padding: '24px', gridColumn: 'span 2', animationDelay: '2s' }}>
              <BookOpen size={28} color="#a5b4fc" style={{ marginBottom: '16px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '5px', color: '#fff' }}>Learn & Grow</h4>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>Comprehensive explanations for every concept.</p>
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
            <h2 style={{ fontSize: '36px', color: 'white', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>Create Account</h2>
            <p style={{ color: '#94a3b8', fontSize: '16px' }}>Join thousands of developers mastering their craft.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  required
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(139, 92, 246, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', marginBottom: '10px', fontWeight: '600' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#64748b' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  onChange={handleInputChange}
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
                  placeholder="Create a strong password"
                  required
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', outline: 'none', transition: 'all 0.3s ease' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(139, 92, 246, 0.05)'; e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="btn-premium-primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              {loading ? 'Creating...' : (
                <>Get Started <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '14px', color: '#94a3b8' }}>
            Already have an account? <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
