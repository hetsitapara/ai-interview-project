import { useState, useEffect, useRef } from "react";
import { Zap, Code2, Users, Star, TrendingUp, Clock, BarChart2, CheckCircle, AlertTriangle, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

const API = "http://localhost:5001/api";

// --- Complexity Graph Component ---
function ComplexityGraph({ complexity }) {
  const canvasRef = useRef(null);

  const COMPLEXITIES = [
    { label: "O(1)", value: 1 },
    { label: "O(log n)", value: 2 },
    { label: "O(n)", value: 3 },
    { label: "O(n log n)", value: 4 },
    { label: "O(n²)", value: 5 },
    { label: "O(n³)", value: 6 },
    { label: "O(2ⁿ)", value: 7 },
  ];

  const getComplexityValue = (label) => {
    if (!label) return 3;
    const c = label.toLowerCase();
    if (c.includes("1") || c === "o(1)") return 1;
    if (c.includes("log n") && !c.includes("n log")) return 2;
    if ((c === "o(n)" || c.includes("linear")) && !c.includes("log") && !c.includes("2")) return 3;
    if (c.includes("n log n") || c.includes("nlogn")) return 4;
    if (c.includes("n^2") || c.includes("n²") || c.includes("n*n") || c.includes("quadratic")) return 5;
    if (c.includes("n^3") || c.includes("n³") || c.includes("cubic")) return 6;
    if (c.includes("2^n") || c.includes("2ⁿ") || c.includes("exponential")) return 7;
    return 3;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const PAD = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = PAD.top + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + plotW, y);
      ctx.stroke();
    }

    // Draw all complexity curves first (ghost curves)
    const curves = [
      { label: "O(1)", color: "rgba(74,222,128,0.2)", fn: (x) => 0.02 },
      { label: "O(log n)", color: "rgba(56,189,248,0.2)", fn: (x) => Math.log2(x + 1) / 7 },
      { label: "O(n)", color: "rgba(167,139,250,0.2)", fn: (x) => x },
      { label: "O(n log n)", color: "rgba(251,191,36,0.2)", fn: (x) => x * Math.log2(x * 7 + 1) / 7 },
      { label: "O(n²)", color: "rgba(251,146,60,0.2)", fn: (x) => Math.pow(x, 2) },
      { label: "O(n³)", color:"rgba(248,113,113,0.2)", fn: (x) => Math.pow(x, 3) },
      { label: "O(2ⁿ)", color: "rgba(244,63,94,0.2)", fn: (x) => Math.pow(2, x * 7) / Math.pow(2, 7) },
    ];

    const userValue = getComplexityValue(complexity);

    curves.forEach(({ label, color, fn }, idx) => {
      const isActive = COMPLEXITIES[idx]?.value === userValue;
      ctx.beginPath();
      ctx.strokeStyle = isActive ? color.replace("0.2", "1") : color;
      ctx.lineWidth = isActive ? 3 : 1;

      for (let px = 0; px <= plotW; px += 2) {
        const x = px / plotW;
        const rawY = fn(x);
        const clampedY = Math.min(rawY, 1);
        const cy = PAD.top + plotH - clampedY * plotH;
        if (px === 0) ctx.moveTo(PAD.left + px, cy);
        else ctx.lineTo(PAD.left + px, cy);
      }
      ctx.stroke();

      if (isActive) {
        // Glow effect
        ctx.shadowColor = color.replace("0.2", "0.8");
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Axes
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, PAD.top + plotH);
    ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    ctx.fillText("n →", PAD.left + plotW - 20, H - 8);
    ctx.save();
    ctx.translate(12, PAD.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Time →", -20, 0);
    ctx.restore();

  }, [complexity]);

  const userValue = getComplexityValue(complexity);
  const displayLabel = COMPLEXITIES.find(c => c.value === userValue)?.label || complexity || "O(n)";

  const getComplexityRating = (val) => {
    if (val <= 2) return { label: "Excellent", color: "#4ade80" };
    if (val <= 3) return { label: "Good", color: "#a78bfa" };
    if (val <= 4) return { label: "Fair", color: "#facc15" };
    if (val <= 5) return { label: "Poor", color: "#fb923c" };
    return { label: "Critical", color: "#f87171" };
  };

  const rating = getComplexityRating(userValue);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <canvas ref={canvasRef} width={340} height={160}
        style={{ width: "100%", borderRadius: "10px", background: "rgba(0,0,0,0.2)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ color: "#64748b", fontSize: "11px" }}>Your Complexity:</span>
          <span style={{ color: "#e2e8f0", fontFamily: "monospace", fontWeight: "700", marginLeft: "8px", fontSize: "15px" }}>{displayLabel}</span>
        </div>
        <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
          background: `${rating.color}20`, color: rating.color, border: `1px solid ${rating.color}40` }}>
          {rating.label}
        </span>
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {COMPLEXITIES.map(c => (
          <span key={c.label} style={{
            padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontFamily: "monospace",
            background: c.value === userValue ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
            color: c.value === userValue ? "#a78bfa" : "#475569",
            border: c.value === userValue ? "1px solid rgba(167,139,250,0.4)" : "1px solid transparent",
            fontWeight: c.value === userValue ? "700" : "400"
          }}>{c.label}</span>
        ))}
      </div>
    </div>
  );
}

// --- Star Rating ---
function StarRating({ rating, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < rating ? "#facc15" : "#334155", fontSize: "14px" }}>★</span>
      ))}
    </span>
  );
}

// --- Score Bar ---
function ScoreBar({ value, max = 10, color = "#818cf8" }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", height: "8px", overflow: "hidden" }}>
      <div style={{
        width: `${(value / max) * 100}%`, height: "100%", borderRadius: "8px",
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 8px ${color}60`
      }} />
    </div>
  );
}

// --- Main CodeAnalysis Component ---
export default function CodeAnalysis({ code, language, question, isVisible }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const sectionCollapse = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  // Fetch analysis whenever code or question changes (triggered externally)
  const fetchAnalysis = async () => {
    if (!code || !code.trim() || code.trim().length < 20) {
      setError("Not enough code to analyze. Write some code first!");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/coding/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, language, questionTitle: question?.title || "Coding Problem" })
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      setError("Failed to analyze code. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      background: "#0f172a",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      height: "100%",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(15,23,42,0.95)",
        position: "sticky",
        top: 0,
        zIndex: 1
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>AI Code Analysis</div>
            <div style={{ color: "#64748b", fontSize: "11px" }}>Powered by Llama3</div>
          </div>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "7px",
            padding: "8px 18px", borderRadius: "8px",
            background: loading ? "rgba(99,102,241,0.2)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", color: "white", fontWeight: "700",
            fontSize: "12px", cursor: loading ? "wait" : "pointer",
            transition: "all 0.2s", boxShadow: loading ? "none" : "0 4px 12px rgba(99,102,241,0.35)"
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite"
              }} />
              Analyzing...
            </>
          ) : (
            <><Zap size={13} /> Analyze Code</>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Initial State */}
        {!loading && !analysis && !error && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
            <BarChart2 size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#64748b", marginBottom: "8px" }}>AI Analysis Ready</div>
            <div style={{ fontSize: "13px", lineHeight: "1.6", maxWidth: "260px", margin: "0 auto" }}>
              Click <strong style={{ color: "#818cf8" }}>Analyze Code</strong> to get complexity analysis, approach feedback, code quality rating, and improvement suggestions.
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <AlertTriangle size={16} style={{ marginTop: "2px", flexShrink: 0, color: "#f87171" }} />
            <span style={{ fontSize: "13px" }}>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{
                height: i === 1 ? "180px" : "120px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                overflow: "hidden",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                  animation: "shimmer 1.5s infinite"
                }} />
              </div>
            ))}
            <style>{`
              @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
              @keyframes spin { to{transform:rotate(360deg)} }
            `}</style>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <>

            {/* Summary Banner */}
            <div style={{
              padding: "16px 20px",
              borderRadius: "14px",
              background: analysis.overall_rating >= 7
                ? "linear-gradient(135deg, rgba(74,222,128,0.08), rgba(56,189,248,0.08))"
                : analysis.overall_rating >= 5
                ? "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(99,102,241,0.08))"
                : "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(248,113,113,0.08))",
              border: `1px solid ${analysis.overall_rating >= 7 ? "rgba(74,222,128,0.2)" : analysis.overall_rating >= 5 ? "rgba(167,139,250,0.2)" : "rgba(251,146,60,0.2)"}`,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px" }}>
                  ✓ Approach &nbsp; ✓ Efficiency &nbsp; ✓ Code Style
                </div>
                <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#e2e8f0" }}>
                  {analysis.summary}
                </p>
              </div>
              <div style={{
                flexShrink: 0, marginLeft: "16px",
                width: "56px", height: "56px", borderRadius: "14px",
                background: "rgba(255,255,255,0.05)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>
                <span style={{ fontSize: "22px", fontWeight: "800", color: analysis.overall_rating >= 7 ? "#4ade80" : analysis.overall_rating >= 5 ? "#a78bfa" : "#fb923c" }}>
                  {analysis.overall_rating}
                </span>
                <span style={{ fontSize: "9px", color: "#64748b" }}>/10</span>
              </div>
            </div>

            {/* Time Complexity Section */}
            <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                onClick={() => sectionCollapse("complexity")}
                style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                  borderBottom: collapsed.complexity ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <TrendingUp size={16} color="#f59e0b" />
                  <span style={{ color: "#f59e0b", fontWeight: "700", fontSize: "14px" }}>⚡ Efficiency</span>
                </div>
                {collapsed.complexity ? <ChevronDown size={14} color="#64748b" /> : <ChevronUp size={14} color="#64748b" />}
              </div>
              {!collapsed.complexity && (
                <div style={{ padding: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Time</div>
                      <div style={{ fontSize: "18px", fontFamily: "monospace", fontWeight: "700", color: "#e2e8f0" }}>
                        {analysis.time_complexity || "O(n)"}
                      </div>
                    </div>
                    <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px" }}>Space</div>
                      <div style={{ fontSize: "18px", fontFamily: "monospace", fontWeight: "700", color: "#e2e8f0" }}>
                        {analysis.space_complexity || "O(n)"}
                      </div>
                    </div>
                  </div>
                  <ComplexityGraph complexity={analysis.time_complexity} />
                  {analysis.efficiency_suggestion && (
                    <div style={{ marginTop: "14px", padding: "12px", borderRadius: "10px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", fontSize: "12px", color: "#fcd34d", lineHeight: "1.6" }}>
                      <span style={{ fontWeight: "700", color: "#f59e0b" }}>Suggestions: </span>{analysis.efficiency_suggestion}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Approach Section */}
            <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                onClick={() => sectionCollapse("approach")}
                style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                  borderBottom: collapsed.approach ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Users size={16} color="#a78bfa" />
                  <span style={{ color: "#a78bfa", fontWeight: "700", fontSize: "14px" }}>🧠 Approach</span>
                </div>
                {collapsed.approach ? <ChevronDown size={14} color="#64748b" /> : <ChevronUp size={14} color="#64748b" />}
              </div>
              {!collapsed.approach && (
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", minWidth: "80px" }}>Current:</span>
                      <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: "600" }}>{analysis.current_approach}</span>
                    </div>
                    {analysis.suggested_approach && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", minWidth: "80px" }}>Suggested:</span>
                        <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "700" }}>{analysis.suggested_approach}</span>
                      </div>
                    )}
                    {analysis.key_idea && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "12px", color: "#64748b", minWidth: "80px" }}>Key Idea:</span>
                        <span style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6" }}>{analysis.key_idea}</span>
                      </div>
                    )}
                    {analysis.consider && (
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <Lightbulb size={13} style={{ marginTop: "2px", flexShrink: 0, color: "#facc15" }} />
                        <span style={{ fontSize: "12px", color: "#fef3c7", lineHeight: "1.6", fontStyle: "italic" }}>{analysis.consider}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Code Style Section */}
            <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                onClick={() => sectionCollapse("style")}
                style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                  borderBottom: collapsed.style ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Code2 size={16} color="#38bdf8" />
                  <span style={{ color: "#38bdf8", fontWeight: "700", fontSize: "14px" }}>✂ Code Style</span>
                </div>
                {collapsed.style ? <ChevronDown size={14} color="#64748b" /> : <ChevronUp size={14} color="#64748b" />}
              </div>
              {!collapsed.style && (
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Readability", value: analysis.readability, color: "#4ade80" },
                      { label: "Structure", value: analysis.structure, color: "#38bdf8" },
                      { label: "Efficiency", value: analysis.efficiency_score, color: "#a78bfa" },
                      { label: "Best Practices", value: analysis.best_practices, color: "#fb923c" }
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "#94a3b8", minWidth: "100px" }}>{label}:</span>
                        <StarRating rating={Math.round(value || 0)} />
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{value || 0}/5</span>
                      </div>
                    ))}
                  </div>
                  {analysis.style_suggestion && (
                    <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", fontSize: "12px", color: "#bae6fd", lineHeight: "1.6" }}>
                      <span style={{ fontWeight: "700", color: "#38bdf8" }}>Suggestions: </span>{analysis.style_suggestion}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Improvements */}
            {analysis.improvements && analysis.improvements.length > 0 && (
              <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div
                  onClick={() => sectionCollapse("improvements")}
                  style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
                    borderBottom: collapsed.improvements ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <CheckCircle size={16} color="#4ade80" />
                    <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "14px" }}>🔧 Improvements</span>
                  </div>
                  {collapsed.improvements ? <ChevronDown size={14} color="#64748b" /> : <ChevronUp size={14} color="#64748b" />}
                </div>
                {!collapsed.improvements && (
                  <div style={{ padding: "18px" }}>
                    <ul style={{ margin: 0, paddingLeft: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {analysis.improvements.map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ color: "#a78bfa", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>→</span>
                          <span style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6" }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
