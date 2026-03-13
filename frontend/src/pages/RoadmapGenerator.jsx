import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Rocket, Map, ChevronRight, BookOpen, Clock, 
  ChevronDown, ChevronUp, Copy, Check, Download,
  Brain, Code, Server, Layout, Database, Shield, Smartphone, Terminal
} from "lucide-react";

export default function RoadmapGenerator() {
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(0);
  const [copied, setCopied] = useState(false);

  const popularRoles = [
    { name: "Frontend Developer", icon: <Layout size={16} /> },
    { name: "Backend Developer", icon: <Server size={16} /> },
    { name: "Full Stack Developer", icon: <Code size={16} /> },
    { name: "DevOps Engineer", icon: <Terminal size={16} /> },
    { name: "AI/ML Engineer", icon: <Brain size={16} /> },
    { name: "Mobile Developer", icon: <Smartphone size={16} /> },
    { name: "Data Scientist", icon: <Database size={16} /> },
    { name: "Cybersecurity Analyst", icon: <Shield size={16} /> },
  ];

  const handleGenerate = async (selectedRole = role) => {
    if (!selectedRole) return;
    setLoading(true);
    setRoadmap(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post("http://localhost:5001/api/roadmap/generate", {
        role: selectedRole,
        level
      }, config);
      setRoadmap(res.data);
      setExpandedPhase(0);
    } catch (err) {
      console.error("Error generating roadmap:", err);
      alert("Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!roadmap) return;
    let text = `AI Roadmap for ${roadmap.role} (${roadmap.level})\n\n`;
    roadmap.phases.forEach(p => {
      text += `Phase ${p.phase}: ${p.title} (${p.duration})\n`;
      text += `${p.description}\n\n`;
      p.topics.forEach(t => {
        text += `- ${t.name}\n  Subtopics: ${t.subtopics.join(", ")}\n  Resources: ${t.resources.join(", ")}\n`;
      });
      text += "\n";
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      marginTop: "85px",
      minHeight: "calc(100vh - 85px)",
      background: "#0f172a",
      color: "#e2e8f0",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            background: "rgba(99, 102, 241, 0.1)", padding: "8px 16px",
            borderRadius: "30px", color: "#818cf8", fontSize: "14px",
            fontWeight: "700", marginBottom: "16px", border: "1px solid rgba(99, 102, 241, 0.2)"
          }}>
            <Brain size={18} /> AI-POWERED CAREER GUIDANCE
          </div>
          <h1 style={{ fontSize: "42px", fontWeight: "800", marginBottom: "16px", color: "white" }}>
            Build Your <span style={{ color: "var(--primary)" }}>Success Roadmap</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
            Describe your goal or pick a popular role, and our AI will generate a personalized path for your career growth.
          </p>
        </div>

        {/* Input Card */}
        <div style={{
          background: "rgba(30, 41, 59, 0.5)",
          backdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "32px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          marginBottom: "40px"
        }}>
          {/* Quick Select */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#94a3b8", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Popular Learning Paths
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {popularRoles.map((r) => (
                <button
                  key={r.name}
                  onClick={() => {
                    setRole(r.name);
                    handleGenerate(r.name);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 18px", borderRadius: "12px",
                    background: role === r.name ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.04)",
                    border: role === r.name ? "2px solid #818cf8" : "2px solid transparent",
                    color: role === r.name ? "white" : "#cbd5e1",
                    fontSize: "14px", fontWeight: "600", cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {r.icon} {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "300px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>Custom Role / Skill</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Flutter Developer, Cloud Architect..."
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white", fontSize: "16px", outline: "none", transition: "border 0.2s"
                }}
              />
            </div>
            <div style={{ width: "200px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#94a3b8", marginBottom: "8px" }}>Your Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white", fontSize: "16px", outline: "none", cursor: "pointer"
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !role}
                style={{
                  padding: "14px 30px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white", border: "none", fontWeight: "700", fontSize: "16px",
                  cursor: (loading || !role) ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: "10px",
                  boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
                  transition: "transform 0.2s", opacity: (loading || !role) ? 0.7 : 1
                }}
                onMouseOver={e => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseOut={e => !loading && (e.currentTarget.style.transform = "translateY(0)")}
              >
                {loading ? "Generating..." : <><Rocket size={20} /> Generate Roadmap</>}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{
              width: "60px", height: "60px", border: "5px solid rgba(99, 102, 241, 0.1)",
              borderTopColor: "#818cf8", borderRadius: "50%",
              animation: "spin 1s linear infinite", margin: "0 auto 20px"
            }} />
            <h3 style={{ fontSize: "20px", color: "white" }}>Crafting your personalized roadmap...</h3>
            <p style={{ color: "#94a3b8" }}>This might take a few seconds exploring career paths.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Roadmap Output */}
        {roadmap && !loading && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
              <div>
                <h2 style={{ fontSize: "28px", color: "white", marginBottom: "4px" }}>{roadmap.role} Journey</h2>
                <p style={{ color: "#94a3b8" }}>Level: <span style={{ color: "#818cf8", fontWeight: "700" }}>{roadmap.level}</span></p>
              </div>
              <button
                onClick={copyToClipboard}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1", fontSize: "14px", fontWeight: "600", cursor: "pointer"
                }}
              >
                {copied ? <><Check size={16} color="#4ade80" /> Copied!</> : <><Copy size={16} /> Copy Roadmap</>}
              </button>
            </div>

            {/* Visual Roadmap Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
              
              {/* Left: Interactive Timeline */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {roadmap.phases.map((phase, idx) => (
                  <div key={idx} style={{ position: "relative", marginBottom: "10px" }}>
                    {/* Connection Line */}
                    {idx < roadmap.phases.length - 1 && (
                      <div style={{
                        position: "absolute", left: "22px", top: "50px", bottom: "-10px",
                        width: "2px", background: "linear-gradient(to bottom, #818cf8, rgba(129, 140, 248, 0.1))",
                        zIndex: 0
                      }} />
                    )}
                    
                    <div 
                      onClick={() => setExpandedPhase(idx)}
                      style={{
                        display: "flex", gap: "24px", padding: "24px",
                        background: expandedPhase === idx ? "rgba(99, 102, 241, 0.1)" : "rgba(30, 41, 59, 0.4)",
                        borderRadius: "20px", border: expandedPhase === idx ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.05)",
                        cursor: "pointer", transition: "all 0.3s", position: "relative", zIndex: 1
                      }}
                    >
                      <div style={{
                        width: "46px", height: "46px", borderRadius: "50%",
                        background: expandedPhase === idx ? "#818cf8" : "rgba(148, 163, 184, 0.2)",
                        color: expandedPhase === idx ? "white" : "#94a3b8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", fontWeight: "800", flexShrink: 0,
                        boxShadow: expandedPhase === idx ? "0 0 15px rgba(129, 140, 248, 0.5)" : "none"
                      }}>
                        {phase.phase}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "18px", fontWeight: "700", color: expandedPhase === idx ? "white" : "#cbd5e1", marginBottom: "4px" }}>
                          {phase.title}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontSize: "13px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> {phase.duration}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><BookOpen size={14} /> {phase.topics.length} Topics</span>
                        </div>
                      </div>
                      <div style={{ marginLeft: "auto", color: expandedPhase === idx ? "#818cf8" : "#475569" }}>
                        <ChevronRight size={24} style={{ transform: expandedPhase === idx ? "rotate(90deg)" : "none", transition: "transform 0.3s" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Phase Details Card */}
              <div style={{
                position: "sticky", top: "120px",
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "32px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}>
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", marginBottom: "8px" }}>
                    Phase {roadmap.phases[expandedPhase].phase} Details
                  </div>
                  <h3 style={{ fontSize: "24px", color: "white", fontWeight: "700", marginBottom: "12px" }}>
                    {roadmap.phases[expandedPhase].title}
                  </h3>
                  <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "15px" }}>
                    {roadmap.phases[expandedPhase].description}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {roadmap.phases[expandedPhase].topics.map((topic, tIdx) => (
                    <div key={tIdx} style={{
                      padding: "20px", background: "rgba(255,255,255,0.03)",
                      borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <h4 style={{ color: "white", fontWeight: "700", fontSize: "16px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "6px", height: "6px", background: "#818cf8", borderRadius: "50%" }} />
                        {topic.name}
                      </h4>
                      
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>Subtopics</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {topic.subtopics.map((st, sidx) => (
                            <span key={sidx} style={{
                              fontSize: "12px", padding: "4px 10px", borderRadius: "6px",
                              background: "rgba(99, 102, 241, 0.1)", color: "#c7d2fe", border: "1px solid rgba(99, 102, 241, 0.2)"
                            }}>{st}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>Learning Resources</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {topic.resources.map((res, ridx) => (
                            <div key={ridx} style={{ fontSize: "13px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Rocket size={12} color="#818cf8" /> {res}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
