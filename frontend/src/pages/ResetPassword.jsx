import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Key, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const safeToken = useMemo(() => (token ? String(token) : ""), [token]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setMessage("");
    if (!safeToken) { setError("Missing reset token."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/reset-password/${encodeURIComponent(safeToken)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.message || "Failed to reset password"); return; }
      setMessage(data.message || "Password reset successful.");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  const strengthScore = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : password.match(/[A-Z]/) && password.match(/[0-9]/) ? 4 : 3;
  const strengthLabels = ['', 'Too Short', 'Weak', 'Moderate', 'Strong'];
  const strengthColors = ['', '#f87171', '#f59e0b', '#60a5fa', '#4ade80'];

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden', background: 'var(--page-gradient)' }}>
      <style>{`
        @keyframes orb-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-25px);} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes checkPop { 0%{transform:scale(0);} 70%{transform:scale(1.2);} 100%{transform:scale(1);} }
        .rp-input:focus { border-color:rgba(139,92,246,0.6)!important; box-shadow:0 0 0 4px rgba(139,92,246,0.15)!important; outline:none; }
        .rp-btn:hover:not(:disabled) { transform:translateY(-3px) scale(1.02)!important; box-shadow:0 12px 30px rgba(139,92,246,0.6)!important; }
        .feature-row:hover { border-color:rgba(255,255,255,0.12)!important; }
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,23,42,1) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '120%', height: '120%', background: 'radial-gradient(circle at 30% 40%, rgba(139,92,246,0.1), transparent 65%)', filter: 'blur(70px)', animation: 'orb-float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(236,72,153,0.06), transparent 70%)', filter: 'blur(90px)', animation: 'orb-float 10s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '50px', padding: '8px 20px', marginBottom: '40px' }}>
            <ShieldCheck size={16} color="#c4b5fd" />
            <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Secure Reset Flow</span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '24px' }}>
            <span style={{ background: 'linear-gradient(135deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>New password,</span><br />
            <span style={{ color: '#fff' }}>fresh start.</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', lineHeight: '1.7', maxWidth: '380px', marginBottom: '48px' }}>
            Create a strong, unique password for your account. This link expires in 1 hour.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: <Key size={20} color="#8b5cf6" />, title: 'Min 6 Characters', desc: 'Longer passwords are much harder to crack.' },
              { icon: <Lock size={20} color="#ec4899" />, title: 'Mix It Up', desc: 'Use uppercase, numbers, and symbols for strong security.' },
              { icon: <ShieldCheck size={20} color="#10b981" />, title: 'Never Reuse', desc: 'Each account should have a unique password.' },
            ].map((item, i) => (
              <div key={i} className="feature-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', transition: 'border-color 0.3s ease' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                <div><div style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '15px', marginBottom: '3px' }}>{item.title}</div><div style={{ fontSize: '13px', color: '#475569' }}>{item.desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={{ width: '520px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: 'var(--page-gradient)' }}>
        <div style={{ width: '100%', animation: 'fadeSlideIn 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
          {!success ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <Lock size={32} color="#a78bfa" />
                </div>
                <h2 style={{ fontSize: '32px', color: '#fff', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1px' }}>Reset Password</h2>
                <p style={{ color: '#475569', fontSize: '16px' }}>Choose a strong new password below.</p>
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '16px 20px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                  <AlertTriangle size={16} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Create a strong password"
                      className="rp-input"
                      style={{ width: '100%', padding: '16px 50px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        {[1, 2, 3, 4].map(s => (
                          <div key={s} style={{ flex: 1, height: '3px', borderRadius: '10px', background: strengthScore >= s ? strengthColors[strengthScore] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s ease' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', color: strengthColors[strengthScore], fontWeight: '700' }}>{strengthLabels[strengthScore]}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat new password"
                      className="rp-input"
                      style={{ width: '100%', padding: '16px 50px', borderRadius: '14px', background: confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`, color: 'white', fontSize: '16px', transition: 'all 0.3s ease', boxSizing: 'border-box' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex' }}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === password && (
                    <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '6px', fontWeight: '600' }}>✓ Passwords match</div>
                  )}
                </div>

                <button type="submit" disabled={loading} className="rp-btn"
                  style={{ padding: '18px', borderRadius: '50px', background: loading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: '800', fontSize: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 6px 20px rgba(139,92,246,0.4)' }}
                >
                  {loading ? (
                    <><div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Updating...</>
                  ) : (
                    <>Update Password <ArrowRight size={20} /></>
                  )}
                </button>
                <div style={{ textAlign: 'center', fontSize: '14px', color: '#475569' }}>
                  <Link to="/login" style={{ color: '#8b5cf6', fontWeight: '700', textDecoration: 'none' }}>← Back to Sign In</Link>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeSlideIn 0.6s ease' }}>
              <div style={{ width: '88px', height: '88px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', border: '1px solid rgba(52,211,153,0.3)', animation: 'checkPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
                <CheckCircle size={40} color="#34d399" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Password Updated!</h2>
              <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.7', marginBottom: '8px' }}>{message}</p>
              <p style={{ color: '#374151', fontSize: '14px' }}>Redirecting you to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
