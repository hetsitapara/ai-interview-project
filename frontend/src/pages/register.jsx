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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>

      {/* LEFT: BRANDING PANEL */}
      <div className="auth-sidebar" style={{
        flex: '1',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', opacity: '0.1', backgroundImage: 'radial-gradient(#a5b4fc 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
            Prep<span style={{ color: '#a5b4fc' }}>AI</span>
          </h1>
          <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '40px', lineHeight: '1.2' }}>
            Accelerate Your Career <br />With AI Precision.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Zap size={24} color="#a5b4fc" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Fast Track</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Identify gaps in minutes, not months.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Target size={24} color="#a5b4fc" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Targeted Prep</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Questions tailored to your dream role.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <BookOpen size={24} color="#a5b4fc" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>Learn & Grow</h4>
              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Comprehensive explanations for every concept.</p>
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
            <h2 style={{ fontSize: '28px', color: 'white', fontWeight: '700', marginBottom: '10px' }}>Create Account</h2>
            <p style={{ color: '#94a3b8' }}>Join thousands of developers mastering their craft.</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  required
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  onChange={handleInputChange}
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
                  placeholder="Create a strong password"
                  required
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="btn primary"
              style={{ padding: '12px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '10px' }}
            >
              {loading ? 'Creating Account...' : (
                <>Get Started <ArrowRight size={18} /></>
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
