import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle, AlertTriangle, Shield, Lock, Zap } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setDevResetUrl(""); setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.message || "Failed to request password reset"); return; }
      setMessage(data.message || "If an account exists for that email, a password reset link has been sent.");
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
      setSent(true);
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', background: 'var(--page-gradient)' }}>
      <style>{`
        @keyframes orb-float { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-30px) scale(1.05);} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes checkPop { 0%{transform:scale(0);} 70%{transform:scale(1.2);} 100%{transform:scale(1);} }
        .fp-input:focus { border-color: var(--primary)!important; background: rgba(139, 92, 246, 0.05)!important; box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2)!important; outline: none; }
        .fp-btn:hover:not(:disabled) { transform: translateY(-3px) scale(1.02)!important; box-shadow: 0 12px 30px rgba(139, 92, 246, 0.6)!important; }
      `}</style>

      {/* LEFT BRANDING PANEL */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 1) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.12), transparent 60%)', filter: 'blur(60px)', animation: 'orb-float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08), transparent 70%)', filter: 'blur(80px)', animation: 'orb-float 10s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '50px', padding: '8px 20px', marginBottom: '40px' }}>
            <Shield size={16} color="#c4b5fd" />
            <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Secure Recovery</span>
          </div>

          <h1 style={{ fontSize: '52px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-2px', lineHeight: 1.1 }}>
            <span style={{ background: 'linear-gradient(135deg, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Don't worry,</span><br />
            <span style={{ color: '#fff' }}>We've got you.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.7', maxWidth: '400px', marginBottom: '48px' }}>
            Enter your email and we'll send a secure password reset link straight to your inbox.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: <Lock size={20} color="#8b5cf6" />, title: 'Encrypted Link', desc: 'Reset links are one-time use and expire in 1 hour.' },
              { icon: <Shield size={20} color="#ec4899" />, title: 'Zero Data Stored', desc: 'We never store your password in plain text.' },
              { icon: <Zap size={20} color="#10b981" />, title: 'Instant Delivery', desc: 'Check your inbox within seconds of the request.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={{ width: '520px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: 'var(--page-gradient)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ width: '100%', animation: 'fadeSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)' }}>

          {!sent ? (
            <>
              <div style={{ marginBottom: '48px', textAlign: 'center' }}>
                <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.2))', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <Mail size={32} color="#a78bfa" />
                </div>
                <h2 style={{ fontSize: '32px', color: 'white', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' }}>Forgot Password?</h2>
                <p style={{ color: '#64748b', fontSize: '16px' }}>Enter your email to receive a reset link.</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '16px 20px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                  <AlertTriangle size={16} />{error}
                </div>
              )}

              {devResetUrl && (
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#c7d2fe', padding: '16px', borderRadius: '14px', marginBottom: '24px', fontSize: '13px', wordBreak: 'break-all' }}>
                  <strong style={{ display: 'block', marginBottom: '6px', color: '#a5b4fc' }}>🔧 Dev reset link:</strong>
                  <a href={devResetUrl} style={{ color: '#818cf8', textDecoration: 'underline' }}>{devResetUrl}</a>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com"
                      className="fp-input"
                      style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="fp-btn"
                  style={{ padding: '18px', borderRadius: '50px', background: loading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: '800', fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)' }}
                >
                  {loading ? (
                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Sending link...</>
                  ) : (
                    <>Send Reset Link <ArrowRight size={20} /></>
                  )}
                </button>

                <div style={{ textAlign: 'center', fontSize: '14px', color: '#475569' }}>
                  Remembered it? <Link to="/login" style={{ color: '#8b5cf6', fontWeight: '700', textDecoration: 'none' }}>Back to Sign In</Link>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeSlideIn 0.6s ease' }}>
              <div style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(52,211,153,0.3)', animation: 'checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
                <CheckCircle size={40} color="#34d399" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Check your inbox!</h2>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.7', marginBottom: '40px' }}>{message}</p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', borderRadius: '50px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: '700', textDecoration: 'none', boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}>
                Back to Sign In <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
