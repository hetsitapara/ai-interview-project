import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import {
  FaBrain, FaCalendarDay, FaLightbulb, FaRocket,
  FaSpinner, FaFire, FaChartLine, FaTrophy, FaRedo, FaStar
} from "react-icons/fa";

const API = "http://127.0.0.1:5001/api";

// ─── Animated SVG Ring ─────────────────────────────────────────────────
function Ring({ value = 0, max = 100, size = 140, stroke = 11, color = "#818cf8" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, (Number(value) || 0) / max));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size / 4, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{Number(value || 0).toFixed(0)}%</span>
        <span style={{ fontSize: size / 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Ready</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    skillProgress: [],
    recentInterviews: [],
    xp: { totalXP: 0, currentLevel: 1, xpInLevel: 0, nextLevelXP: 1000 },
    streak: 0,
    heatmap: { peakHour: "N/A", sharpestHour: "N/A", activeSessions: 0 },
    readiness: 0,
  });
  const [loading, setLoading] = useState(true);
  const [studyPlan, setStudyPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { if (mounted) setLoading(false); return; }
        
        const res = await fetch(`${API}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 401) return logout();

        if (res.ok && mounted) {
          const data = await res.json();
          setStats(prev => ({
            ...prev,
            ...data,
            xp: data?.xp || prev.xp,
            heatmap: data?.heatmap || prev.heatmap,
            skillProgress: Array.isArray(data?.skillProgress) ? data.skillProgress : prev.skillProgress,
            recentInterviews: Array.isArray(data?.recentInterviews) ? data.recentInterviews : prev.recentInterviews,
          }));
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        if (mounted) setTimeout(() => setLoading(false), 500);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    try {
      const token = localStorage.getItem("token");
      const safeSkills = Array.isArray(stats.skillProgress) ? stats.skillProgress : [];
      const weakAreas = [...safeSkills]
        .sort((a, b) => (Number(a.percent || a.accuracy) || 0) - (Number(b.percent || b.accuracy) || 0))
        .slice(0, 3)
        .map(s => s.label || s.category)
        .filter(Boolean);
      const res = await axios.post(`${API}/ai/study-plan`, {
        weakAreas: weakAreas.length ? weakAreas : ["General Coding", "Data Structures", "System Design"],
        level: "Intermediate",
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStudyPlan(res.data.plan);
    } catch (e) { 
        console.error("Study Plan Error:", e);
        if (e.response?.status === 401) logout();
    }
    finally { setPlanLoading(false); }
  };

  const xp = stats.xp || { totalXP: 0, currentLevel: 1, xpInLevel: 0, nextLevelXP: 1000 };
  const heatmap = stats.heatmap || { peakHour: "N/A", sharpestHour: "N/A", activeSessions: 0 };
  const xpPct = xp.nextLevelXP > 0 ? ((xp.xpInLevel || 0) / xp.nextLevelXP) * 100 : 0;
  const levelTitle = (xp.currentLevel || 1) >= 10 ? "Elite Master"
    : (xp.currentLevel || 1) >= 7 ? "Senior Candidate"
    : (xp.currentLevel || 1) >= 4 ? "Rising Star" : "Aspiring Pro";
  const scoreColor = (s) => (s || 0) >= 7 ? "#4ade80" : (s || 0) >= 5 ? "#facc15" : "#f87171";

  const navCards = [
    { icon: "💻", label: "Coding Test",    route: "/coding-test",  color: "#818cf8", bg: "rgba(129,140,248,0.08)" },
    { icon: "❓", label: "Question Bank",  route: "/questions",    color: "#34d399", bg: "rgba(52,211,153,0.08)"  },
    { icon: "🗺️", label: "Roadmap",        route: "/roadmap",      color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    { icon: "📝", label: "Blogs",           route: "/blogs",        color: "#f472b6", bg: "rgba(244,114,182,0.08)"},
    { icon: "🎤", label: "Experiences",    route: "/experiences",  color: "#38bdf8", bg: "rgba(56,189,248,0.08)" },
    { icon: "📊", label: "Reports",        route: "/reports",      color: "#a78bfa", bg: "rgba(167,139,250,0.08)"},
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "Outfit,sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin     { to{transform:rotate(360deg);} }
        @keyframes pulseglow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.25);} 50%{box-shadow:0 0 48px rgba(139,92,246,0.55);} }
        @keyframes floatUp  { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
        .db-hover { transition:all 0.3s cubic-bezier(0.16,1,0.3,1); cursor:pointer; }
        .db-hover:hover { transform:translateY(-5px)!important; box-shadow:0 20px 60px rgba(0,0,0,0.5)!important; }
        .db-hover:hover .arr { opacity:1!important; transform:translateX(4px)!important; }
        .arr { opacity:0; transition:all 0.25s ease; }
        .hero:hover .rkt { animation:floatUp 1.4s ease-in-out infinite!important; box-shadow:0 0 56px rgba(139,92,246,0.8)!important; }
        .chip { transition:all 0.25s cubic-bezier(0.16,1,0.3,1); cursor:pointer; }
        .chip:hover { transform:translateY(-3px); box-shadow:0 8px 20px rgba(0,0,0,0.3)!important; }
        .retry-btn:hover { background:rgba(139,92,246,0.22)!important; }
        .sbar { scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.06) transparent; }
        .sbar::-webkit-scrollbar { width:4px; }
        .sbar::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:10px; }
      `}</style>

      {/* Loading Overlay (non-blocking) */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,10,20,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "52px", height: "52px", border: "3px solid rgba(99,102,241,0.15)", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <p style={{ color: "#fff", fontWeight: "700", letterSpacing: "3px", fontSize: "11px", textTransform: "uppercase" }}>Syncing Neural Data</p>
        </div>
      )}

      <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 40px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "36px", animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "50px", padding: "6px 18px", marginBottom: "14px" }}>
            <FaStar style={{ color: "#818cf8", fontSize: "11px" }} />
            <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px" }}>PrepAI Dashboard</span>
          </div>
          <h1 style={{ fontSize: "50px", fontWeight: "900", letterSpacing: "-2px", background: "linear-gradient(135deg,#fff 40%,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>
            Welcome back, Explorer
          </h1>
          <p style={{ color: "#475569", fontSize: "17px" }}>Forge your path to professional mastery.</p>
        </div>

        {/* ── Two-col layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "28px", alignItems: "start" }}>

          {/* ─── SIDEBAR ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "120px", animation: "fadeUp 0.5s ease" }}>

            {/* XP Card */}
            <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "24px", padding: "28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-30px", right: "-30px", fontSize: "90px", color: "rgba(99,102,241,0.04)", pointerEvents: "none" }}><FaTrophy /></div>
              <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", boxShadow: "0 0 24px rgba(99,102,241,0.5)", animation: "pulseglow 3s ease-in-out infinite" }}>🎯</div>
              <div style={{ fontSize: "26px", fontWeight: "900", color: "#fff", letterSpacing: "-1px", marginBottom: "3px" }}>Level {xp.currentLevel || 1}</div>
              <div style={{ fontSize: "12px", color: "#475569", fontWeight: "700", marginBottom: "18px" }}>{levelTitle}</div>
              <div style={{ height: "7px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden", marginBottom: "7px" }}>
                <div style={{ height: "100%", width: `${xpPct}%`, background: "linear-gradient(90deg,#4f46e5,#a855f7)", borderRadius: "10px", transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: "#818cf8", fontWeight: "700" }}>NEXT LEVEL</span>
                <span style={{ color: "#374151" }}>{Math.round(xp.xpInLevel || 0)} / {xp.nextLevelXP || 1000} XP</span>
              </div>
            </div>

            {/* Streak */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "22px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{ width: "34px", height: "34px", background: "rgba(245,158,11,0.12)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaFire style={{ color: "#f59e0b", fontSize: "14px" }} />
                </div>
                <span style={{ fontWeight: "800", color: "#fff", fontSize: "14px" }}>Daily Streak</span>
                <span style={{ marginLeft: "auto", fontWeight: "900", fontSize: "20px", color: (stats.streak || 0) > 0 ? "#f59e0b" : "#374151" }}>{stats.streak || 0}</span>
              </div>
              <div style={{ display: "flex", gap: "5px", alignItems: "flex-end", height: "32px" }}>
                {[...Array(7)].map((_, i) => (
                  <div key={i} style={{ flex: 1, height: i < (stats.streak || 0) ? "100%" : "28%", background: i < (stats.streak || 0) ? "linear-gradient(to top,#f59e0b,#fbbf24)" : "rgba(255,255,255,0.05)", borderRadius: "5px 5px 0 0", transition: `height 0.7s ease ${i * 0.08}s` }} />
                ))}
              </div>
              <p style={{ fontSize: "12px", color: (stats.streak || 0) > 0 ? "#fde68a" : "#374151", marginTop: "10px", fontWeight: "600" }}>
                {(stats.streak || 0) > 0 ? `${stats.streak} day streak! You're on fire! ⚡` : "Start your first session today!"}
              </p>
            </div>

            {/* Peak Performance */}
            <div style={{ background: "linear-gradient(135deg,rgba(236,72,153,0.06),rgba(139,92,246,0.04))", border: "1px solid rgba(236,72,153,0.15)", borderRadius: "22px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "34px", height: "34px", background: "rgba(236,72,153,0.12)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaChartLine style={{ color: "#f472b6", fontSize: "13px" }} />
                </div>
                <span style={{ fontWeight: "800", color: "#f472b6", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>Peak Performance</span>
              </div>
              <p style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6", marginBottom: "10px" }}>
                Best during <strong style={{ color: "#fff" }}>{heatmap.sharpestHour || "N/A"}</strong>.{" "}
                Sessions are <strong style={{ color: "#f472b6" }}>{Math.round((stats.readiness || 0) / 10 + 10)}% sharper</strong> at this time.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", background: "rgba(255,255,255,0.04)", borderRadius: "11px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>
                🏆 Peak Hour: {heatmap.peakHour || "N/A"}
              </div>
            </div>

            {/* AI Neural Path */}
            <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "22px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "34px", height: "34px", background: "rgba(139,92,246,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaBrain style={{ color: "#a78bfa", fontSize: "13px" }} />
                </div>
                <span style={{ fontWeight: "800", color: "#a78bfa", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>AI Neural Path</span>
              </div>
              {!studyPlan ? (
                <>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "14px" }}>Llama3 analyzed your weak areas. Generate your 5-day optimization path.</p>
                  <button onClick={generatePlan} disabled={planLoading}
                    style={{ width: "100%", padding: "11px", borderRadius: "13px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", color: "#fff", fontWeight: "800", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 18px rgba(99,102,241,0.4)" }}>
                    {planLoading ? <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> : <><FaRocket />Initialize Path</>}
                  </button>
                </>
              ) : (
                <div className="sbar" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "6px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "800", color: "#a78bfa", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>🎯 {studyPlan.weekly_goal}</p>
                  {(Array.isArray(studyPlan.plan) ? studyPlan.plan : []).map((d, i) => (
                    <div key={i} style={{ marginBottom: "10px", padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "13px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "900", color: "#ec4899", textTransform: "uppercase" }}>{d.day}</span>
                        <span style={{ fontSize: "11px", color: "#fff", fontWeight: "700" }}>{d.topic}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "14px", color: "#475569", fontSize: "11px", lineHeight: "1.7" }}>
                        {(Array.isArray(d.goals) ? d.goals : []).map((g, j) => <li key={j}>{g}</li>)}
                      </ul>
                    </div>
                  ))}
                  {studyPlan.tip && (
                    <div style={{ background: "rgba(251,191,36,0.06)", padding: "10px 12px", borderRadius: "11px", border: "1px solid rgba(251,191,36,0.15)", margin: "8px 0" }}>
                      <p style={{ margin: 0, fontSize: "12px", color: "#fde68a", fontStyle: "italic" }}>💡 <strong>Coach:</strong> {studyPlan.tip}</p>
                    </div>
                  )}
                  <button onClick={() => setStudyPlan(null)} style={{ background: "none", border: "none", color: "#374151", fontSize: "11px", marginTop: "8px", cursor: "pointer", width: "100%", fontWeight: "700", textTransform: "uppercase" }}>Reset Path</button>
                </div>
              )}
            </div>
          </div>

          {/* ─── MAIN CONTENT ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

            {/* Hero CTA */}
            <div className="db-hover hero"
              onClick={() => navigate("/interview")}
              style={{ background: "linear-gradient(135deg,rgba(79,70,229,0.16),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "28px", padding: "48px 52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "28px", position: "relative", overflow: "hidden", animation: "fadeUp 0.5s ease" }}>
              <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "280px", height: "280px", background: "radial-gradient(circle,rgba(99,102,241,0.14),transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#818cf8", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "14px" }}>Start Simulation</div>
                <h2 style={{ fontSize: "38px", fontWeight: "900", color: "#fff", letterSpacing: "-1.5px", marginBottom: "12px" }}>AI Mock Interview</h2>
                <p style={{ color: "#94a3b8", fontSize: "16px", maxWidth: "500px", lineHeight: "1.65" }}>
                  High-stakes simulation with real-time feedback and Llama3 evaluation.
                </p>
                <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {["Real-time AI Scoring", "Voice Input", "Adaptive Questions"].map(f => (
                    <span key={f} style={{ padding: "5px 13px", borderRadius: "20px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontSize: "12px", fontWeight: "700" }}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="rkt" style={{ width: "84px", height: "84px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "34px", boxShadow: "0 8px 30px rgba(99,102,241,0.6)", flexShrink: 0, zIndex: 1 }}>
                <FaRocket />
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", animation: "fadeUp 0.55s ease" }}>
              {[
                { label: "Total Sessions", value: stats.totalInterviews || 0, color: "#818cf8", icon: "🎯" },
                { label: "Avg Score", value: `${Number(stats.averageScore || 0).toFixed(1)}/10`, color: "#4ade80", icon: "⚡" },
                { label: "Active Sessions", value: heatmap.activeSessions || 0, color: "#f59e0b", icon: "🔥" },
                { label: "Readiness", value: `${Number(stats.readiness || 0).toFixed(0)}%`, color: "#ec4899", icon: "🚀" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "20px 18px", position: "relative", overflow: "hidden" }}>
                  <div style={{ fontSize: "20px", marginBottom: "10px" }}>{s.icon}</div>
                  <div style={{ fontSize: "10px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "5px" }}>{s.label}</div>
                  <div style={{ fontSize: "24px", fontWeight: "900", color: s.color, letterSpacing: "-1px" }}>{s.value}</div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg,${s.color}55,transparent)` }} />
                </div>
              ))}
            </div>

            {/* Feature Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", animation: "fadeUp 0.6s ease" }}>
              <div className="db-hover" onClick={() => navigate("/resume-advisor")}
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "24px", padding: "30px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ width: "52px", height: "52px", background: "rgba(52,211,153,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#34d399", fontSize: "22px", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <FaCalendarDay />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>Resume Expert</h3>
                    <span className="arr" style={{ color: "#34d399", fontSize: "18px" }}>→</span>
                  </div>
                  <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", marginTop: "6px" }}>ATS-driven optimization and comprehensive skill gap analysis.</p>
                </div>
              </div>

              <div className="db-hover" onClick={() => navigate("/reports")}
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(244,114,182,0.15)", borderRadius: "24px", padding: "30px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ width: "52px", height: "52px", background: "rgba(244,114,182,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#f472b6", fontSize: "22px", border: "1px solid rgba(244,114,182,0.2)" }}>
                  <FaChartLine />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#fff" }}>Performance Hub</h3>
                    <span className="arr" style={{ color: "#f472b6", fontSize: "18px" }}>→</span>
                  </div>
                  <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.6", marginTop: "6px" }}>Deep dive into sentiment, keyword usage, and growth trends.</p>
                </div>
              </div>
            </div>

            {/* Quick Nav */}
            <div style={{ animation: "fadeUp 0.65s ease" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "12px" }}>Quick Access</div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {navCards.map((n, i) => (
                  <div key={i} className="chip" onClick={() => navigate(n.route)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "50px", background: n.bg, border: `1px solid ${n.color}22`, boxShadow: "0 4px 14px rgba(0,0,0,0.2)" }}>
                    <span style={{ fontSize: "16px" }}>{n.icon}</span>
                    <span style={{ fontWeight: "700", color: n.color, fontSize: "13px" }}>{n.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 232px", gap: "18px", animation: "fadeUp 0.7s ease" }}>

              {/* Domain Proficiency + Recent */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div style={{ width: "36px", height: "36px", background: "rgba(99,102,241,0.12)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📊</div>
                  <span style={{ fontWeight: "800", color: "#fff", fontSize: "16px" }}>Domain Proficiency</span>
                </div>
                {Array.isArray(stats.skillProgress) && stats.skillProgress.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {stats.skillProgress.map((skill, i) => {
                      const pct = Number(skill.percent ?? Math.round((skill.accuracy || 0) * 100)) || 0;
                      return (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>{skill.label || skill.category}</span>
                            <span style={{ fontSize: "13px", fontWeight: "900", color: "#818cf8" }}>{pct}%</span>
                          </div>
                          <div style={{ height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#4f46e5,#a855f7)", borderRadius: "10px", transition: `width 1.2s ease ${i * 0.12}s` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 16px", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "14px", color: "#374151", fontSize: "13px", lineHeight: "1.7" }}>
                    No session data yet.<br />Start your first interview to map your skills.
                  </div>
                )}

                {Array.isArray(stats.recentInterviews) && stats.recentInterviews.length > 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "28px 0 16px" }}>
                      <div style={{ width: "36px", height: "36px", background: "rgba(74,222,128,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📅</div>
                      <span style={{ fontWeight: "800", color: "#fff", fontSize: "16px" }}>Recent Sessions</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {stats.recentInterviews.map((iv, i) => {
                        const sc = Number(iv.overallScore || 0);
                        const clr = scoreColor(sc);
                        return (
                          <div key={i}
                            style={{ padding: "16px 18px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "14px", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: `linear-gradient(to bottom,${clr},transparent)`, borderRadius: "4px 0 0 4px" }} />
                            <div style={{ flex: 1, paddingLeft: "4px" }}>
                              <div style={{ fontWeight: "800", color: "#fff", fontSize: "14px" }}>{iv.category}</div>
                              <div style={{ fontSize: "11px", color: "#374151", marginTop: "2px" }}>{new Date(iv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                            </div>
                            <div style={{ fontWeight: "900", fontSize: "18px", color: clr, letterSpacing: "-0.5px", flexShrink: 0 }}>
                              {sc.toFixed(1)}<span style={{ fontSize: "11px", color: "#374151", fontWeight: "700" }}>/10</span>
                            </div>
                            <button className="retry-btn"
                              onClick={e => { e.stopPropagation(); window.location.href = `/interview?retryId=${iv._id}`; }}
                              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa", padding: "7px 13px", borderRadius: "10px", fontSize: "11px", fontWeight: "800", cursor: "pointer", flexShrink: 0, transition: "all 0.2s ease" }}>
                              <FaRedo style={{ fontSize: "9px", marginRight: "3px" }} />RETRY
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Readiness Ring */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", padding: "26px", textAlign: "center", display: "flex", flexDirection: "column", gap: "18px", height: "fit-content" }}>
                <div style={{ fontWeight: "800", color: "#fff", fontSize: "16px" }}>Readiness Score</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Ring value={Number(stats.readiness || 0)} size={140} stroke={11}
                    color={(Number(stats.readiness) || 0) >= 80 ? "#4ade80" : (Number(stats.readiness) || 0) >= 60 ? "#818cf8" : "#facc15"} />
                </div>
                <p style={{ color: "#374151", fontSize: "12px", lineHeight: "1.6" }}>
                  Based on your last <strong style={{ color: "#fff" }}>{Math.min(5, Number(stats.totalInterviews) || 0)}</strong> sessions
                </p>
                <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>
                  <div style={{ fontSize: "9px", fontWeight: "800", color: "#ec4899", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "7px" }}>AI Forecast</div>
                  <p style={{ fontSize: "12px", color: "#e2e8f0", margin: 0, lineHeight: "1.6" }}>
                    {(Number(stats.readiness) || 0) >= 80 ? "Elite percentile. High probability of SDE-2 offers."
                      : (Number(stats.readiness) || 0) >= 60 ? "Solid. Target: System Design & Architecture."
                      : "Foundation phase. Focus on core DSA & algorithms."}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
