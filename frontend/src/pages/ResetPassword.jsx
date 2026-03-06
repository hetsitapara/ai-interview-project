import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import "../index.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const safeToken = useMemo(() => (token ? String(token) : ""), [token]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!safeToken) {
      setError("Missing reset token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/reset-password/${encodeURIComponent(safeToken)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setMessage(data.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page"
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        overflow: "hidden",
        background: "#020617",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ marginBottom: "24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "28px", color: "white", fontWeight: "700", marginBottom: "10px" }}>
            Reset your password
          </h2>
          <p style={{ color: "#94a3b8" }}>
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              color: "#f87171",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.10)",
              border: "1px solid rgba(34, 197, 94, 0.20)",
              color: "#86efac",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            padding: "22px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "14px", marginBottom: "8px", fontWeight: "500" }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#64748b" }} />
              <input
                type="password"
                placeholder="Enter a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 40px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: "block", color: "#cbd5e1", fontSize: "14px", marginBottom: "8px", fontWeight: "500" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#64748b" }} />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 40px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="btn primary"
            style={{
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              marginTop: "4px",
            }}
          >
            {loading ? "Updating..." : <>Update password <ArrowRight size={18} /></>}
          </button>

          <div style={{ textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>
            Back to <Link to="/login" style={{ color: "#818cf8", fontWeight: "600", textDecoration: "none" }}>Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

