import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaArrowLeft, FaCalendarAlt, FaChartLine, FaCheckCircle,
  FaExclamationTriangle, FaLightbulb, FaBrain, FaRedo,
  FaSpellCheck, FaChevronDown, FaChevronUp
} from "react-icons/fa";

const API = 'http://127.0.0.1:5001/api';

// ─── Tiny sparkline using SVG ─────────────────────────────────────────────────
function Sparkline({ data, color = "#818cf8" }) {
  if (!data || !Array.isArray(data) || data.length < 2) return null;
  const W = 200, H = 60, pad = 4;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v / max) * (H - pad * 2));
    return `${x},${y}`;
  }).join(" ");
  const area = `M ${pts.split(" ").join(" L ")} L ${W - pad},${H} L ${pad},${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "60px" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Circular Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, max = 10, size = 100, color = "#818cf8", label = "" }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, (score || 0) / max));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={circ * (1-pct)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.38em" fill="#fff" style={{ transform: "rotate(90deg)", transformOrigin: "50% 50%", fontSize: `${size/5}px`, fontWeight: 900, fontFamily: "Outfit,sans-serif" }}>
        {Number(score || 0).toFixed(1)}
      </text>
    </svg>
  );
}

export default function Reports() {
  const [history, setHistory]           = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [coaching, setCoaching]         = useState("");
  const [coachingLoading, setCoachingLoading] = useState(false);
  const [stats, setStats]               = useState({ averageScore: 0, totalSessions: 0, topCategory: "N/A", recentTrend: [] });
  const [dailyTip, setDailyTip]         = useState("");
  const [sortBy, setSortBy]             = useState("newest");
  const [filterCategory, setFilterCategory] = useState("All");

  // ─ Fetch on mount
  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      
      const hdr = { Authorization: `Bearer ${token}` };
      try {
        const [histRes, statsRes, tipRes] = await Promise.allSettled([
          fetch(`${API}/interview/history`, { headers: hdr }).then(async r => {
              if (r.status === 401) { logout(); return []; }
              const d = await r.json();
              return Array.isArray(d) ? d : [];
          }),
          axios.get(`${API}/stats/summary`, { headers: hdr }).then(r => r.data).catch(e => { if(e.response?.status === 401) logout(); return null; }),
          axios.get(`${API}/stats/tip`, { headers: hdr }).then(r => r.data).catch(e => null),
        ]);

        if (histRes.status === "fulfilled") setHistory(histRes.value);
        if (statsRes.status === "fulfilled" && statsRes.value) setStats(statsRes.value);
        if (tipRes.status === "fulfilled" && tipRes.value) setDailyTip(tipRes.value.tip);
        
      } catch (err) { 
          console.error("Reports Fetch Error:", err); 
      } finally { 
          setLoading(false); 
      }
    };
    fetchAll();
  }, []);

  const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
  };

  const fetchCoaching = async (report) => {
    setCoachingLoading(true); setCoaching("");
    try {
      const token = localStorage.getItem("token");
      const results = (report.questions || []).map(q => ({
        question: q.questionText, user_answer: q.userAnswer,
        accuracy_score: q.accuracy_score, evaluation: q.evaluationType
      }));
      const res = await axios.post(`${API}/interview/coaching`, { results }, { headers: { Authorization: `Bearer ${token}` } });
      setCoaching(res.data.coaching);
    } catch { setCoaching("Keep practicing! Focus on areas where your scores were lowest."); }
    finally { setCoachingLoading(false); }
  };

  const handleViewReport = async (id) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/interview/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return logout();
      const data = await res.json();
      setSelectedReport(data);
      fetchCoaching(data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  // ─ Derived: all categories for filter
  const safeHistory = Array.isArray(history) ? history : [];
  const categories = ["All", ...new Set(safeHistory.map(h => h.category).filter(Boolean))];

  // ─ Filtered + sorted list
  const filteredHistory = safeHistory
    .filter(h => filterCategory === "All" || h.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "score-high") return (b.overallScore || 0) - (a.overallScore || 0);
      if (sortBy === "score-low") return (a.overallScore || 0) - (b.overallScore || 0);
      return 0;
    });

  const scoreGrade = (s) => s >= 8 ? { label: "EXCELLENT", color: "#4ade80", bg: "rgba(74,222,128,0.1)" }
    : s >= 6 ? { label: "GOOD", color: "#818cf8", bg: "rgba(129,140,248,0.1)" }
    : s >= 4 ? { label: "AVERAGE", color: "#facc15", bg: "rgba(250,204,21,0.1)" }
    : { label: "NEEDS WORK", color: "#f87171", bg: "rgba(248,113,113,0.1)" };

  // ════════════════════ REPORT DETAIL VIEW ════════════════════
  if (selectedReport) {
    return (
      <DetailView
        report={selectedReport}
        coaching={coaching}
        coachingLoading={coachingLoading}
        detailLoading={detailLoading}
        fetchCoaching={() => fetchCoaching(selectedReport)}
        onBack={() => { setSelectedReport(null); setCoaching(""); }}
      />
    );
  }

  // ════════════════════ MAIN LIST VIEW ════════════════════
  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "Outfit, sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin     { to{transform:rotate(360deg);} }
        @keyframes growUp   { from{height:0;} to{} }
        @keyframes shimmer  { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        .r-card { transition:all 0.35s cubic-bezier(0.16,1,0.3,1); }
        .r-card:hover { transform:translateY(-6px)!important; border-color:rgba(255,255,255,0.14)!important; box-shadow:0 28px 70px rgba(0,0,0,0.5)!important; }
        .filter-pill { cursor:pointer; transition:all 0.2s ease; padding:8px 18px; border-radius:50px; font-size:13px; font-weight:700; border:1px solid transparent; }
        .filter-pill:hover { border-color:rgba(255,255,255,0.15)!important; }
        .scrollable { scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.08) transparent; }
        .scrollable::-webkit-scrollbar { width:4px; }
        .scrollable::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:10px; }
      `}</style>

      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,10,20,0.8)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "52px", height: "52px", border: "3px solid rgba(99,102,241,0.15)", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            <p style={{ color: "#fff", fontWeight: "700", letterSpacing: "3px", fontSize: "11px", textTransform: "uppercase" }}>Analyzing Reports</p>
        </div>
      )}

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "10px 40px 80px" }}>

        {/* ── Page Header ─────────────────── */}
        <div style={{ marginBottom: "52px", animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "50px", padding: "7px 20px", marginBottom: "20px" }}>
            <FaChartLine style={{ color: "#818cf8" }} />
            <span style={{ color: "#818cf8", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Performance Intelligence</span>
          </div>
          <h1 style={{ fontSize: "52px", fontWeight: "900", letterSpacing: "-2px", background: "linear-gradient(135deg, #fff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "8px" }}>Interview Reports</h1>
          <p style={{ color: "#475569", fontSize: "18px" }}>Deep insights from every session, powered by AI analysis.</p>
        </div>

        {/* ── Stats Bento Row ───────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: "20px", marginBottom: "48px", animation: "fadeUp 0.6s ease" }}>
          {[
            { label: "Avg Mastery", value: `${stats?.averageScore || 0}/10`, color: "#818cf8", bg: "rgba(129,140,248,0.07)", icon: "⚡" },
            { label: "Total Sessions", value: stats?.totalSessions || 0, color: "#4ade80", bg: "rgba(74,222,128,0.07)", icon: "🎯" },
            { label: "Top Domain", value: stats?.topCategory || "N/A", color: "#f59e0b", bg: "rgba(245,158,11,0.07)", icon: "🏆", small: true },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: "24px", padding: "28px 24px", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{s.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: s.color, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: s.small ? "22px" : "32px", fontWeight: "900", color: "#fff", letterSpacing: "-1px" }}>{s.value}</div>
            </div>
          ))}
          {/* Trend Sparkline card */}
          <div style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "24px", padding: "24px 28px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Score Trend</div>
                <div style={{ fontSize: "13px", color: "#475569" }}>Last {stats?.recentTrend?.length || 0} sessions</div>
              </div>
              <FaChartLine style={{ color: "#818cf8", fontSize: "18px", opacity: 0.5 }} />
            </div>
            <Sparkline data={stats?.recentTrend || []} color="#818cf8" />
          </div>
        </div>

        {/* ── Achievements Row ─────────────────── */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "40px", animation: "fadeUp 0.7s ease", flexWrap: "wrap" }}>
          {[
            { icon: "🌟", label: "Pro", desc: "Avg ≥ 8/10",   active: (stats?.averageScore || 0) >= 8 },
            { icon: "🔥", label: "Active", desc: "5+ Sessions", active: (stats?.totalSessions || 0) >= 5 },
            { icon: "🎓", label: "Expert", desc: "10+ Sessions", active: (stats?.totalSessions || 0) >= 10 },
            { icon: "🚀", label: "Started", desc: "First session", active: safeHistory.length > 0 },
          ].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", borderRadius: "16px", background: a.active ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${a.active ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.04)"}`, opacity: a.active ? 1 : 0.35, transition: "all 0.3s ease" }}>
              <span style={{ fontSize: "22px" }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: "800", color: a.active ? "#c4b5fd" : "#94a3b8", fontSize: "14px" }}>{a.label}</div>
                <div style={{ fontSize: "12px", color: "#374151" }}>{a.desc}</div>
              </div>
            </div>
          ))}
          {dailyTip && (
            <div style={{ flex: 1, minWidth: "260px", display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderRadius: "16px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)" }}>
              <FaLightbulb style={{ color: "#4ade80", fontSize: "20px", flexShrink: 0 }} />
              <p style={{ color: "#d1fae5", fontSize: "13px", lineHeight: "1.5", margin: 0, fontStyle: "italic" }}>"{dailyTip}"</p>
            </div>
          )}
        </div>

        {/* ── Filter / Sort Bar ─────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <span key={cat} className="filter-pill"
                onClick={() => setFilterCategory(cat)}
                style={{ background: filterCategory === cat ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", borderColor: filterCategory === cat ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)", color: filterCategory === cat ? "#818cf8" : "#64748b" }}
              >{cat}</span>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ padding: "10px 16px", borderRadius: "12px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            <option value="newest">Newest First</option>
            <option value="score-high">Highest Score</option>
            <option value="score-low">Lowest Score</option>
          </select>
        </div>

        {/* ── Session Cards Grid ────────────── */}
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 40px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "28px" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>📁</div>
            <h3 style={{ color: "#fff", fontSize: "24px", fontWeight: "800", marginBottom: "12px" }}>No sessions yet</h3>
            <p style={{ color: "#475569", marginBottom: "32px" }}>Complete your first interview to see analytics here.</p>
            <button onClick={() => window.location.href = "/interview"}
              style={{ padding: "16px 32px", borderRadius: "50px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff", fontWeight: "800", fontSize: "16px", cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
              Start a Session →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px,1fr))", gap: "24px" }}>
            {filteredHistory.map((item, idx) => {
              const grade = scoreGrade(item.overallScore || 0);
              const score = item.overallScore || 0;
              return (
                <div key={item._id} className="r-card"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", overflow: "hidden", animation: `fadeUp ${0.4 + idx * 0.05}s ease`, cursor: "pointer" }}
                  onClick={() => handleViewReport(item._id)}
                >
                  {/* Card Top Accent */}
                  <div style={{ height: "4px", background: `linear-gradient(90deg, ${grade.color}, transparent)` }} />

                  <div style={{ padding: "28px" }}>
                    {/* Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "13px", marginBottom: "10px" }}>
                          <FaCalendarAlt />
                          {new Date(item.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                        <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.3px" }}>{item.category} Session</h3>
                        {item.difficulty && <span style={{ fontSize: "12px", color: "#64748b" }}>Difficulty: {item.difficulty}</span>}
                      </div>
                      <span style={{ padding: "5px 14px", borderRadius: "20px", background: grade.bg, color: grade.color, fontSize: "11px", fontWeight: "800", border: `1px solid ${grade.color}30`, flexShrink: 0 }}>{grade.label}</span>
                    </div>

                    {/* Score + Ring */}
                    <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
                      <ScoreRing score={score} size={80} color={grade.color} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Overall Score</div>
                        <div style={{ fontSize: "28px", fontWeight: "900", color: grade.color, letterSpacing: "-1px" }}>{score.toFixed(1)}<span style={{ fontSize: "16px", color: "#374151" }}>/10</span></div>
                        <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>{item.questions?.length || "?"} questions answered</div>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(score / 10) * 100}%`, background: `linear-gradient(90deg, ${grade.color}80, ${grade.color})`, borderRadius: "10px", transition: "width 1s ease" }} />
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                      <button onClick={e => { e.stopPropagation(); window.location.href = `/interview?retryId=${item._id}`; }}
                        style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s ease" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
                      >
                        <FaRedo />Retry
                      </button>
                      <span style={{ color: "#818cf8", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        View Report →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  REPORT DETAIL VIEW
// ════════════════════════════════════════════════════════
function DetailView({ report, coaching, coachingLoading, detailLoading, fetchCoaching, onBack }) {
  const questions = report.questions || [];
  const [expanded, setExpanded] = useState({});
  const score = report.overallScore || 0;
  const grade = score >= 8 ? { label: "Excellent", color: "#4ade80", bg: "rgba(74,222,128,0.08)" }
    : score >= 6 ? { label: "Good", color: "#818cf8", bg: "rgba(129,140,248,0.08)" }
    : score >= 4 ? { label: "Average", color: "#facc15", bg: "rgba(250,204,21,0.08)" }
    : { label: "Needs Work", color: "#f87171", bg: "rgba(248,113,113,0.08)" };

  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "Outfit, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        .q-card { transition:border-color 0.3s ease; }
        .q-card:hover { border-color:rgba(255,255,255,0.12)!important; }
        .toggle-btn { cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px; padding:8px 16px; border-radius:10px; font-size:12px; font-weight:700; border:1px solid; }
        .toggle-btn:hover { filter:brightness(1.2); }
        .scrollable { scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.08) transparent; }
        .scrollable::-webkit-scrollbar { width:4px; }
        .scrollable::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:10px; }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 40px 80px" }}>

        {/* ── Back Button ───────────── */}
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50px", padding: "10px 22px", color: "#94a3b8", fontWeight: "700", cursor: "pointer", fontSize: "14px", marginBottom: "40px", transition: "all 0.3s ease" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          <FaArrowLeft />Back to Reports
        </button>

        {/* ── Report Header Bento ───── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "24px", marginBottom: "40px", alignItems: "start", animation: "fadeUp 0.5s ease" }}>
          <div style={{ background: grade.bg, border: `1px solid ${grade.color}25`, borderRadius: "28px", padding: "36px 40px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: grade.color, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px" }}>
              {grade.label} Performance
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#fff", letterSpacing: "-1px", marginBottom: "8px" }}>{report.category} Report</h1>
            <p style={{ color: "#475569", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
              <FaCalendarAlt />{new Date(report.createdAt).toLocaleString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <button onClick={() => window.location.href = `/interview?retryId=${report._id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "50px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", color: "#fff", fontWeight: "800", fontSize: "15px", cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
              <FaRedo />Retake This Session
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "24px 28px", textAlign: "center" }}>
              <ScoreRing score={score} size={110} color={grade.color} />
              <div style={{ marginTop: "12px", fontSize: "11px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>Overall Score</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Questions", value: questions.length },
                { label: "Difficulty", value: report.difficulty || "Mixed" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px 18px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{s.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#fff" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI Coaching ─────────────────── */}
        <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,102,241,0.04))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "24px", padding: "32px", marginBottom: "40px", position: "relative", overflow: "hidden", animation: "fadeUp 0.6s ease" }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", fontSize: "120px", color: "rgba(139,92,246,0.04)", pointerEvents: "none" }}>
            <FaBrain />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(139,92,246,0.15)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaBrain style={{ color: "#a78bfa", fontSize: "20px" }} />
              </div>
              <div>
                <div style={{ fontWeight: "800", color: "#fff", fontSize: "18px" }}>AI Performance Coach</div>
                <div style={{ fontSize: "13px", color: "#475569" }}>Personalized analysis · Powered by Llama3</div>
              </div>
            </div>
            {!coachingLoading && coaching && (
              <button onClick={fetchCoaching}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "50px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                <FaRedo />Regenerate
              </button>
            )}
          </div>

          {coachingLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "#64748b", fontSize: "15px" }}>
              <div style={{ width: "24px", height: "24px", border: "2.5px solid rgba(139,92,246,0.2)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.9s linear infinite", flexShrink: 0 }} />
              Analyzing your performance across all questions...
            </div>
          ) : coaching ? (
            <p style={{ color: "#e2e8f0", lineHeight: "1.8", fontSize: "16px", margin: 0 }}>{coaching}</p>
          ) : (
            <button onClick={fetchCoaching}
              style={{ padding: "12px 24px", borderRadius: "50px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
              Generate AI Coaching
            </button>
          )}
        </div>

        {/* ── Per-Question Analysis ──────── */}
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px", animation: "fadeUp 0.7s ease" }}>
          <div style={{ width: "40px", height: "40px", background: "rgba(251,191,36,0.12)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaLightbulb style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <div style={{ fontWeight: "800", color: "#fff", fontSize: "18px" }}>Question-by-Question Analysis</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>{questions.length} questions reviewed</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {questions.map((q, idx) => {
            const qScore  = Number(q.final_score || 0);
            const qColor  = qScore >= 7 ? "#4ade80" : qScore >= 5 ? "#facc15" : "#f87171";
            const aiKey   = `${idx}_ai`;
            const dbKey   = `${idx}_db`;
            const accPct  = Math.round((q.accuracy_score || 0) * 100);
            const kwPct   = Math.round((q.keyword_score  || 0) * 100);

            return (
              <div key={idx} className="q-card"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "24px", overflow: "hidden", animation: `fadeUp ${0.5 + idx * 0.04}s ease` }}
              >
                {/* Question Score Bar Top */}
                <div style={{ height: "3px", background: `linear-gradient(90deg, ${qColor}, transparent)` }} />

                <div style={{ padding: "28px" }}>
                  {/* Q header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Question {idx + 1}</div>
                      <p style={{ color: "#e2e8f0", fontSize: "16px", fontWeight: "600", lineHeight: "1.6", margin: 0 }}>{q.questionText}</p>
                    </div>
                    {/* Score pill */}
                    <div style={{ flexShrink: 0, width: "60px", height: "60px", borderRadius: "18px", background: `${qColor}12`, border: `1.5px solid ${qColor}35`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: qColor, lineHeight: 1 }}>{qScore}</div>
                      <div style={{ fontSize: "10px", color: "#475569", fontWeight: "700" }}>/10</div>
                    </div>
                  </div>

                  {/* User Answer */}
                  <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Your Answer</div>
                    <p style={{ color: q.userAnswer ? "#cbd5e1" : "#475569", fontSize: "15px", lineHeight: "1.7", margin: 0, fontStyle: !q.userAnswer ? "italic" : "normal" }}>
                      {q.userAnswer ? `"${q.userAnswer}"` : "You skipped this question."}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {[
                      { label: "Accuracy", value: `${accPct}%`, color: "#818cf8", bg: "rgba(129,140,248,0.08)" },
                      kwPct ? { label: "Keywords", value: `${kwPct}%`, color: "#ec4899", bg: "rgba(236,72,153,0.08)" } : null,
                      { label: "Final Score", value: `${qScore}/10`, color: qColor, bg: `${qColor}10` },
                    ].filter(Boolean).map((m, mi) => (
                      <div key={mi} style={{ padding: "8px 16px", borderRadius: "12px", background: m.bg, border: `1px solid ${m.color}20`, display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>{m.label}</span>
                        <span style={{ fontSize: "14px", fontWeight: "900", color: m.color }}>{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Toggle Buttons */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {(q.aiImprovedAnswer || q.aiAdvice) && (
                      <button className="toggle-btn" onClick={() => toggle(aiKey)}
                        style={{ background: expanded[aiKey] ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.07)", borderColor: "rgba(139,92,246,0.35)", color: "#a78bfa" }}>
                        🤖 AI Answer {expanded[aiKey] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    )}
                    {q.idealAnswer && (
                      <button className="toggle-btn" onClick={() => toggle(dbKey)}
                        style={{ background: expanded[dbKey] ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.05)", borderColor: "rgba(16,185,129,0.3)", color: "#34d399" }}>
                        📚 Reference Answer {expanded[dbKey] ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    )}
                  </div>

                  {/* AI Answer Panel */}
                  {expanded[aiKey] && (q.aiImprovedAnswer || q.aiAdvice) && (
                    <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(139,92,246,0.25)", marginBottom: "14px", animation: "slideIn 0.25s ease" }}>
                      {q.aiImprovedAnswer && (
                        <div style={{ padding: "18px 22px", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))" }}>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>🤖 AI Generated Answer</div>
                          <p style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: "1.8", margin: 0 }}>{q.aiImprovedAnswer}</p>
                        </div>
                      )}
                      {q.aiAdvice && (
                        <div style={{ padding: "16px 22px", background: "rgba(99,102,241,0.04)", borderTop: "1px solid rgba(139,92,246,0.12)" }}>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>💡 Advice</div>
                          <p style={{ color: "#a5b4fc", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{q.aiAdvice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Rationale */}
                  {q.explanation && (
                    <div style={{ padding: "16px 20px", borderRadius: "14px", background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaLightbulb />AI Scoring Rationale
                      </div>
                      <p style={{ color: "#fde68a", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
