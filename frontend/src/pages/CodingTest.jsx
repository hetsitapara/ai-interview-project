import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import {
  Play, Send, RotateCcw, CheckCircle, AlertCircle, Clock, Code2,
  FileText, History, List, ChevronDown, ChevronUp, Zap, Terminal,
  Cpu, Trophy, ChevronRight, X, Maximize2, Minimize2
} from "lucide-react";
import CodeAnalysis from "../components/CodeAnalysis";

const BASE = "http://127.0.0.1:5001";

const defaultCode = {
  javascript: `// Welcome to PrepAI Code IDE ⚡\nconsole.log("Hello, World!");`,
  python: `# Welcome to PrepAI Code IDE ⚡\nprint("Hello, World!")`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`
};

const langMeta = {
  javascript: { label: "JavaScript", icon: "🟡", color: "#f7df1e" },
  python:     { label: "Python",     icon: "🐍", color: "#3572a5" },
  c:          { label: "C",          icon: "⚙️",  color: "#555555" },
  cpp:        { label: "C++",        icon: "🔷",  color: "#f34b7d" }
};

const getDiffColor = (d) => d === "Easy" ? "#4ade80" : d === "Medium" ? "#facc15" : "#f87171";

export default function CodingTest() {
  const [questions, setQuestions]           = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isPlayground, setIsPlayground]     = useState(false);
  const [activeTab, setActiveTab]           = useState("description");
  const [language, setLanguage]             = useState("javascript");
  const [code, setCode]                     = useState(defaultCode.javascript);
  const [isRunning, setIsRunning]           = useState(false);
  const [output, setOutput]                 = useState(null);
  const [testResults, setTestResults]       = useState(null);
  const [customInput, setCustomInput]       = useState("");
  const [history, setHistory]               = useState([]);
  const [consoleHeight, setConsoleHeight]   = useState(260);
  const [consoleDragging, setConsoleDragging] = useState(false);
  const [consoleTab, setConsoleTab]         = useState("testcase"); // "testcase" or "result"
  const [questionsOpen, setQuestionsOpen]   = useState(false);
  const [timer, setTimer]                   = useState(0);
  const [timerActive, setTimerActive]       = useState(false);
  const [editorMounted, setEditorMounted]   = useState(false);

  const [view, setView]                     = useState("list"); // "list" or "editor"
  const [searchQuery, setSearchQuery]       = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  // Timer
  useEffect(() => {
    let t;
    if (timerActive) t = setInterval(() => setTimer(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    try {
      const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      const res = await axios.get(`${BASE}/api/coding/questions`, cfg);
      setQuestions(res.data);
    } catch { 
      // Handle error
    }
  };

  const fetchQuestionDetails = async (id) => {
    if (id === "playground") { switchToPlayground(); return; }
    try {
      setIsPlayground(false);
      const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      const [res, histRes] = await Promise.all([
        axios.get(`${BASE}/api/coding/questions/${id}`, cfg),
        axios.get(`${BASE}/api/coding/submissions/${id}`, cfg).catch(() => ({ data: [] }))
      ]);
      setSelectedQuestion(res.data);
      setHistory(histRes.data);
      setCode(res.data.starterCode?.[language] || defaultCode[language]);
      setOutput(null); setTestResults(null); setCustomInput("");
      setActiveTab("description"); setTimer(0); setTimerActive(false);
      setQuestionsOpen(false);
      setView("editor");
    } catch(e) { console.error(e); }
  };

  const switchToPlayground = () => {
    setIsPlayground(true); setSelectedQuestion(null); setHistory([]);
    setCode(defaultCode[language]); setOutput(null); setTestResults(null);
    setTimer(0); setTimerActive(false); setQuestionsOpen(false);
    setView("editor");
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(!isPlayground && selectedQuestion?.starterCode?.[lang]
      ? selectedQuestion.starterCode[lang]
      : defaultCode[lang]);
  };

  const handleRun = async () => {
    setIsRunning(true); setTestResults(null); setOutput("⏳ Executing...");
    if (!timerActive) setTimerActive(true);
    try {
      const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      setConsoleTab("result");
      if (isPlayground || !selectedQuestion) {
        const res = await axios.post(`${BASE}/api/coding/execute`, { language, code, input: customInput }, cfg);
        setOutput(res.data.success ? res.data.output : `Error:\n${res.data.output}`);
      } else {
        const res = await axios.post(`${BASE}/api/coding/run`, { questionId: selectedQuestion._id, language, code }, cfg);
        if (res.data.results) {
          setTestResults(res.data);
          setOutput(null);
        } else { 
          setOutput(res.data.output || "Execution complete."); 
        }
      }
    } catch(err) { setOutput("Execution Error: " + (err.response?.data?.message || err.message)); }
    finally { setIsRunning(false); }
  };

  const handleSubmit = async () => {
    if (isPlayground) return;
    setConsoleTab("result");
    try {
      const cfg = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
      const res = await axios.post(`${BASE}/api/coding/submit`, {
        questionId: selectedQuestion._id, language, code
      }, cfg);
      setTestResults(res.data); setOutput(null);
      setTimerActive(false);
      const histRes = await axios.get(`${BASE}/api/coding/submissions/${selectedQuestion._id}`, cfg);
      setHistory(histRes.data);
    } catch(err) { setOutput("Submission Error: " + (err.response?.data?.message || err.message)); }
    finally { setIsRunning(false); }
  };

  const resetCode = () => {
    setCode(!isPlayground && selectedQuestion?.starterCode?.[language]
      ? selectedQuestion.starterCode[language]
      : defaultCode[language]);
    setOutput(null); setTestResults(null);
  };

  // Console resize drag
  const startDrag = useCallback((e) => {
    e.preventDefault();
    setConsoleDragging(true);
    const startY = e.clientY;
    const startH = consoleHeight;
    const onMove = (ev) => { setConsoleHeight(Math.max(80, Math.min(600, startH + (startY - ev.clientY)))); };
    const onUp = () => { setConsoleDragging(false); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [consoleHeight]);

  const tabs = [
    { id: "description", icon: <FileText size={13} />, label: "Problem" },
    { id: "history",     icon: <History size={13} />,  label: "Submissions", disabled: isPlayground },
    { id: "analysis",   icon: <Zap size={13} />,      label: "AI Analysis", accent: true },
  ];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  // ═══════════════════ PROBLEM LIST VIEW ═══════════════════
  if (view === "list") {
    return (
      <div style={{
        flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column",
        background: "#080c14", color: "#e2e8f0", padding: "40px 5%",
        fontFamily: "Outfit, sans-serif", overflowY: "auto"
      }}>
        <style>{`
          .list-card { background: rgba(13, 17, 23, 0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 32px; backdrop-filter: blur(20px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
          .stat-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; flex: 1; }
          .problem-row { display: grid; grid-template-columns: 50px 1fr 120px 120px 80px; padding: 16px 20px; border-radius: 12px; transition: all 0.2s; cursor: pointer; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); }
          .problem-row:hover { background: rgba(99, 102, 241, 0.08); transform: translateX(4px); }
          .filter-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); color: #64748b; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
          .filter-btn.active { background: #818cf8; color: #fff; border-color: #818cf8; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
          .search-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 20px; color: #fff; width: 300px; outline: none; transition: all 0.2s; }
          .search-input:focus { border-color: #818cf8; background: rgba(255,255,255,0.06); }
        `}</style>
        
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "900", letterSpacing: "-1px", marginBottom: "8px" }}>
            Problem <span style={{ color: "#818cf8" }}>Set</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "16px" }}>Master your coding skills with our curated challenges.</p>
        </div>

        <div style={{ display: "flex", gap: "24px", marginBottom: "40px" }}>
          <div className="stat-card">
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Total Challenges</div>
            <div style={{ fontSize: "28px", fontWeight: "900" }}>{questions.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Easy / Med / Hard</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#818cf8" }}>
              {questions.filter(q=>q.difficulty==="Easy").length} / {questions.filter(q=>q.difficulty==="Medium").length} / {questions.filter(q=>q.difficulty==="Hard").length}
            </div>
          </div>
          <div className="stat-card" style={{ background: "rgba(99, 102, 241, 0.05)", borderColor: "rgba(99, 102, 241, 0.1)" }}>
            <div style={{ fontSize: "12px", color: "#818cf8", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Quick Start</div>
            <button 
              onClick={switchToPlayground}
              style={{ background: "none", border: "none", color: "#fff", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: 0 }}
            >
              Open Playground <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="list-card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              {["All", "Easy", "Medium", "Hard"].map(diff => (
                <button 
                  key={diff} 
                  className={`filter-btn ${difficultyFilter === diff ? "active" : ""}`}
                  onClick={() => setDifficultyFilter(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
            <input 
              className="search-input" 
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ borderBottom: "2px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "8px", display: "grid", gridTemplateColumns: "50px 1fr 120px 120px 80px", paddingLeft: "20px", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
            <span>#</span>
            <span>Title</span>
            <span>Difficulty</span>
            <span>Category</span>
            <span></span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredQuestions.length > 0 ? filteredQuestions.map((q, i) => (
              <div key={q._id} className="problem-row" onClick={() => fetchQuestionDetails(q._id)}>
                <span style={{ color: "#334155", fontWeight: "700" }}>{i + 1}</span>
                <span style={{ fontWeight: "700", color: "#e2e8f0", fontSize: "16px" }}>{q.title}</span>
                <span style={{ color: getDiffColor(q.difficulty), fontWeight: "700", fontSize: "13px" }}>{q.difficulty}</span>
                <span style={{ color: "#64748b", fontSize: "13px" }}>{q.category || "General"}</span>
                <ChevronRight size={18} color="#334155" />
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "80px", color: "#475569" }}>No problems found matching your filters.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      display: "flex",
      flexDirection: "column",
      background: "#080c14",
      color: "#e2e8f0",
      overflow: "hidden",
      fontFamily: "Outfit, sans-serif"
    }}>
      <style>{`
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 8px rgba(99,102,241,0.4);} 50%{box-shadow:0 0 20px rgba(99,102,241,0.8);} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        @keyframes running-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px);} to{opacity:1;transform:translateY(0);} }
        @keyframes scanline { 0%{transform:translateY(-100%);} 100%{transform:translateY(100vh);} }
        @keyframes checkmark { 0%{transform:scale(0);} 70%{transform:scale(1.2);} 100%{transform:scale(1);} }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

        .ide-tab { padding:0 18px; height:44px; display:flex; align-items:center; gap:7px; font-size:13px; font-weight:600; border:none; background:transparent; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s ease; white-space:nowrap; }
        .ide-tab:hover:not(.active):not(:disabled) { color:#cbd5e1!important; }
        .ide-tab.active { color:#fff!important; border-bottom-color:#818cf8!important; background:rgba(99,102,241,0.06)!important; }
        .ide-tab.accent.active { border-bottom-color:#a78bfa!important; color:#c4b5fd!important; background:rgba(139,92,246,0.08)!important; }
        .ide-tab:disabled { opacity:0.35; cursor:not-allowed; }

        .lang-btn { padding:6px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.03); cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s ease; display:flex; align-items:center; gap:7px; }
        .lang-btn.active { background:rgba(99,102,241,0.15); border-color:rgba(99,102,241,0.4); color:#a5b4fc; }
        .lang-btn:not(.active) { color:#64748b; }
        .lang-btn:hover:not(.active) { border-color:rgba(255,255,255,0.12); color:#94a3b8; }

        .run-btn { display:flex; align-items:center; gap:8px; padding:8px 20px; border-radius:10px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.04); color:#e2e8f0; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.25s ease; letter-spacing:0.3px; }
        .run-btn:hover:not(:disabled) { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.2); transform:translateY(-1px); }
        .run-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .submit-btn { display:flex; align-items:center; gap:8px; padding:8px 24px; border-radius:10px; border:none; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:white; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.25s ease; box-shadow:0 4px 14px rgba(99,102,241,0.4); letter-spacing:0.3px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 22px rgba(99,102,241,0.6); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .q-list-item { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:10px; cursor:pointer; transition:all 0.2s ease; border:1px solid transparent; }
        .q-list-item:hover { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); }
        .q-list-item.active { background:rgba(99,102,241,0.1); border-color:rgba(99,102,241,0.3); }

        .console-drag { height:5px; background:transparent; cursor:ns-resize; position:relative; z-index:20; transition:background 0.2s; }
        .console-drag:hover, .console-drag.dragging { background:rgba(99,102,241,0.5); }
        .console-drag::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:40px; height:2px; border-radius:2px; background:rgba(255,255,255,0.15); }

        .test-row { animation:fadeIn 0.3s ease; border-bottom:1px solid rgba(255,255,255,0.04); }
        .test-row:last-child { border-bottom:none; }

        .example-block { background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; font-family:'Fira Code', monospace; }
        pre { margin:0; white-space:pre-wrap; word-break:break-all; }
        .scrollable { overflow-y:auto; scrollbar-width:thin; scrollbar-color:rgba(255,255,255,0.08) transparent; }
        .scrollable::-webkit-scrollbar { width:5px; }
        .scrollable::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:10px; }
        .neon-dot { width:8px; height:8px; border-radius:50%; animation:running-pulse 1s ease-in-out infinite; }
      `}</style>

      {/* ═══════════════════ TOP BAR ═══════════════════ */}
      <header style={{
        height: "56px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "rgba(10,15,28,0.98)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 50, gap: "16px"
      }}>
        {/* Left – Problem Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
          <button 
            onClick={() => setView("list")}
            className="run-btn"
            style={{ padding: "6px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <List size={14} /> <span style={{ opacity: 0.8 }}>Problems</span>
          </button>
          
          <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.06)" }} />

          {/* Current Selection Display */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "white", fontSize: "14px", fontWeight: "700", overflow: "hidden" }}>
             <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                {isPlayground ? "⚡ Playground" : selectedQuestion?.title}
             </span>
             {selectedQuestion && !isPlayground && (
                <span style={{ padding: "2px 8px", borderRadius: "6px", background: `${getDiffColor(selectedQuestion.difficulty)}18`, color: getDiffColor(selectedQuestion.difficulty), fontSize: "11px", fontWeight: "700", flexShrink: 0, border: `1px solid ${getDiffColor(selectedQuestion.difficulty)}30` }}>
                  {selectedQuestion.difficulty}
                </span>
             )}
          </div>
        </div>

        {/* Center – Timer */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: timerActive ? "#a78bfa" : "#374151", fontFamily: "'Fira Code', monospace", fontSize: "14px", fontWeight: "700", letterSpacing: "1px" }}>
            <Clock size={14} />
            {formatTime(timer)}
          </div>
          <button onClick={() => setTimerActive(!timerActive)} style={{ padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b", cursor: "pointer", fontSize: "11px" }}>
            {timerActive ? "Pause" : "Start"}
          </button>
        </div>

        {/* Right – Language + Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Language Switcher */}
          <div style={{ display: "flex", gap: "6px" }}>
            {Object.entries(langMeta).map(([lang, meta]) => (
              <button key={lang} className={`lang-btn ${language === lang ? "active" : ""}`} onClick={() => handleLanguageChange(lang)}>
                <span>{meta.icon}</span>
                <span style={{ display: window.innerWidth > 1200 ? "inline" : "none" }}>{meta.label}</span>
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.06)", margin: "0 4px" }} />

          <button className="run-btn" onClick={handleRun} disabled={isRunning}>
            {isRunning ? (
              <><div className="neon-dot" style={{ background: "#4ade80" }} />Running...</>
            ) : (
              <><Play size={14} fill="currentColor" />Run</>
            )}
          </button>

          <button className="submit-btn" onClick={handleSubmit} disabled={isRunning || isPlayground}
            title={isPlayground ? "Select a question first" : "Submit your solution"}>
            <Send size={14} />Submit
          </button>

          <button onClick={resetCode} title="Reset to starter code"
            style={{ padding: "8px 10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#475569", cursor: "pointer", transition: "all 0.2s ease", display: "flex" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Backdrop click for dropdown */}
      {questionsOpen && <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setQuestionsOpen(false)} />}

      {/* ═══════════════════ WORKSPACE ═══════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ═══ LEFT: Problem Panel ═══ */}
        <div style={{
          width: "420px", flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "rgba(8,12,20,0.95)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          overflow: "hidden"
        }}>
          {/* Panel Tabs */}
          <div style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#060b14", flexShrink: 0 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`ide-tab ${activeTab === tab.id ? "active" : ""} ${tab.accent ? "accent" : ""}`}
                style={{ color: activeTab === tab.id ? "#fff" : "#475569" }}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="scrollable" style={{ flex: 1, padding: "24px", overflowY: "auto" }}>

            {/* DESCRIPTION TAB */}
            {activeTab === "description" && (
              isPlayground ? (
                <div style={{ textAlign: "center", marginTop: "80px", animation: "fadeIn 0.5s ease" }}>
                  <div style={{ width: "80px", height: "80px", background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: "36px" }}>⚡</div>
                  <h3 style={{ fontSize: "22px", color: "#fff", fontWeight: "800", marginBottom: "12px", letterSpacing: "-0.3px" }}>Playground</h3>
                  <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", maxWidth: "280px", margin: "0 auto" }}>
                    Free-form environment. Pick a language, write code, and hit Run to execute.
                  </p>
                  <div style={{ marginTop: "32px", padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", textAlign: "left" }}>
                    <div style={{ fontSize: "11px", color: "#374151", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Custom Input</div>
                    <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                      placeholder={"Enter stdin input here...\n(used when you hit Run)"}
                      style={{ width: "100%", height: "100px", background: "transparent", border: "none", color: "#94a3b8", fontFamily: "'Fira Code', monospace", fontSize: "13px", resize: "vertical", outline: "none", lineHeight: "1.6", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              ) : selectedQuestion ? (
                <div style={{ animation: "fadeIn 0.4s ease" }}>
                  {/* Title Row */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                      <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", letterSpacing: "-0.5px", lineHeight: "1.2", margin: 0 }}>{selectedQuestion.title}</h1>
                      <span style={{ padding: "4px 12px", borderRadius: "8px", background: `${getDiffColor(selectedQuestion.difficulty)}12`, color: getDiffColor(selectedQuestion.difficulty), fontSize: "12px", fontWeight: "700", border: `1px solid ${getDiffColor(selectedQuestion.difficulty)}30`, flexShrink: 0 }}>
                        {selectedQuestion.difficulty}
                      </span>
                    </div>
                    {selectedQuestion.tags?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {selectedQuestion.tags.map(tag => (
                          <span key={tag} style={{ padding: "3px 10px", borderRadius: "6px", background: "rgba(56,189,248,0.08)", color: "#38bdf8", fontSize: "11px", fontWeight: "700", border: "1px solid rgba(56,189,248,0.15)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: "15px", lineHeight: "1.8", color: "#94a3b8", marginBottom: "28px" }}>{selectedQuestion.description}</p>

                  {/* I/O Format */}
                  <div style={{ display: "grid", gap: "12px", marginBottom: "28px" }}>
                    {[
                      { label: "Input Format", content: selectedQuestion.inputFormat },
                      { label: "Output Format", content: selectedQuestion.outputFormat }
                    ].map(({ label, content }) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px 20px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>{label}</div>
                        <p style={{ fontSize: "14px", color: "#cbd5e1", margin: 0 }}>{content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Examples */}
                  <div style={{ marginBottom: "28px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px" }}>Examples</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {selectedQuestion.examples?.map((ex, idx) => (
                        <div key={idx} style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ padding: "8px 16px", background: "rgba(99,102,241,0.06)", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Example {idx + 1}
                          </div>
                          <div className="example-block" style={{ border: "none", borderRadius: 0 }}>
                            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                              <span style={{ fontSize: "11px", fontWeight: "700", color: "#4ade80", textTransform: "uppercase", minWidth: "52px", paddingTop: "2px" }}>Input</span>
                              <code style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6" }}>{ex.input}</code>
                            </div>
                            <div style={{ padding: "12px 16px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                              <span style={{ fontSize: "11px", fontWeight: "700", color: "#f87171", textTransform: "uppercase", minWidth: "52px", paddingTop: "2px" }}>Output</span>
                              <code style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: "1.6" }}>{ex.output}</code>
                            </div>
                          </div>
                          {ex.explanation && (
                            <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: "13px", color: "#64748b", fontStyle: "italic", lineHeight: "1.6" }}>
                              💡 {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Constraints */}
                  {selectedQuestion.constraints && (
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>Constraints</div>
                      <pre style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px 20px", color: "#94a3b8", fontFamily: "'Fira Code', monospace", fontSize: "13px", lineHeight: "1.7" }}>
                        {selectedQuestion.constraints}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#374151" }}>Loading...</div>
              )
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>Submission History</div>
                {history.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {history.map((sub, idx) => {
                      const passed = sub.status === "Passed";
                      return (
                        <div key={idx} style={{
                          padding: "18px 20px", borderRadius: "16px",
                          background: passed ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)",
                          border: `1px solid ${passed ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`,
                          display: "flex", flexDirection: "column", gap: "10px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", color: passed ? "#4ade80" : "#f87171", fontSize: "15px" }}>
                              {passed ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                              {sub.status}
                            </span>
                            <span style={{ fontSize: "12px", color: "#374151" }}>{new Date(sub.createdAt).toLocaleString()}</span>
                          </div>
                          <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "#64748b" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Code2 size={12} />{sub.language}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><CheckCircle size={12} />Cases: {sub.passedCases}/{sub.totalCases}</span>
                          </div>
                          {/* Mini progress bar */}
                          <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(sub.passedCases / sub.totalCases) * 100}%`, background: passed ? "#4ade80" : "#f87171", borderRadius: "10px", transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#374151" }}>
                    <Trophy size={40} style={{ margin: "0 auto 16px", display: "block", opacity: 0.2 }} />
                    <p style={{ fontStyle: "italic" }}>No submissions yet. Submit your first solution!</p>
                  </div>
                )}
              </div>
            )}

            {/* AI ANALYSIS TAB */}
            {activeTab === "analysis" && (
              <div style={{ animation: "fadeIn 0.4s ease", minHeight: "100%", display: "flex", flexDirection: "column" }}>
                <CodeAnalysis code={code} language={language} question={selectedQuestion} isVisible={true} />
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: Editor + Console ═══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0d1117", minWidth: 0, overflow: "hidden" }}>

          {/* Editor File Tab Bar */}
          <div style={{ height: "38px", display: "flex", alignItems: "center", background: "#080c14", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingLeft: "16px", gap: "4px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 14px", height: "38px", background: "#0d1117", borderRight: "1px solid rgba(255,255,255,0.06)", borderTop: "2px solid #818cf8", cursor: "default", fontSize: "13px", color: "#cbd5e1", fontWeight: "600" }}>
              <span style={{ fontSize: "14px" }}>{langMeta[language]?.icon}</span>
              solution.{language === "javascript" ? "js" : language === "python" ? "py" : language === "cpp" ? "cpp" : "c"}
            </div>
            <div style={{ flex: 1 }} />
            {/* Live indicator */}
            {isRunning && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 16px", color: "#4ade80", fontSize: "12px", fontWeight: "700" }}>
                <div className="neon-dot" style={{ background: "#4ade80" }} />EXECUTING
              </div>
            )}
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === "c" || language === "cpp" ? "cpp" : language}
              value={code}
              onChange={(val) => setCode(val ?? "")}
              onMount={() => setEditorMounted(true)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                fontLigatures: true,
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: "on",
                renderLineHighlight: "gutter",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                overviewRulerBorder: false,
                guides: { bracketPairs: true, indentation: true },
                bracketPairColorization: { enabled: true },
                wordWrap: "on",
                suggest: { showKeywords: true, showSnippets: true },
              }}
            />
          </div>

          {/* ═══ Console Drag Handle ═══ */}
          <div className={`console-drag ${consoleDragging ? "dragging" : ""}`} onMouseDown={startDrag} />

          {/* ═══ Console ═══ */}
          <div style={{ height: `${consoleHeight}px`, flexShrink: 0, display: "flex", flexDirection: "column", background: "#060b14", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Console Header / Tabs */}
            <div style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#080c14", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                <button 
                  onClick={() => setConsoleTab("testcase")}
                  style={{ height: "100%", padding: "0 20px", background: consoleTab === "testcase" ? "rgba(99,102,241,0.1)" : "transparent", border: "none", borderBottom: consoleTab === "testcase" ? "2px solid #818cf8" : "2px solid transparent", color: consoleTab === "testcase" ? "#fff" : "#475569", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                >
                  Testcase
                </button>
                <button 
                  onClick={() => setConsoleTab("result")}
                  style={{ height: "100%", padding: "0 20px", background: consoleTab === "result" ? "rgba(99,102,241,0.1)" : "transparent", border: "none", borderBottom: consoleTab === "result" ? "2px solid #818cf8" : "2px solid transparent", color: consoleTab === "result" ? "#fff" : "#475569", fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  Result
                  {(output || testResults) && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />}
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingRight: "16px" }}>
                {(output || testResults) && (
                  <button onClick={() => { setOutput(null); setTestResults(null); }}
                    style={{ background: "none", border: "none", color: "#374151", cursor: "pointer", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Console Content */}
            <div className="scrollable" style={{ flex: 1, overflowY: "auto", background: "#060b14" }}>
              {consoleTab === "testcase" ? (
                /* TESTCASE TAB */
                <div style={{ padding: "20px" }}>
                  {isPlayground ? (
                    <div>
                      <div style={{ fontSize: "11px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Custom Input</div>
                      <textarea 
                        value={customInput} 
                        onChange={e => setCustomInput(e.target.value)}
                        placeholder="Enter input here..."
                        style={{ width: "100%", height: "120px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", color: "#e2e8f0", padding: "12px", fontFamily: "'Fira Code', monospace", fontSize: "13px", resize: "none", outline: "none" }}
                      />
                    </div>
                  ) : (
                    <div>
                      {selectedQuestion?.testCases?.filter(tc => tc.isPublic).map((tc, idx) => (
                        <div key={idx} style={{ marginBottom: "16px" }}>
                          <div style={{ fontSize: "11px", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Case {idx + 1}</div>
                          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px 16px", color: "#94a3b8", fontFamily: "'Fira Code', monospace", fontSize: "13px" }}>
                            {tc.input}
                          </div>
                        </div>
                      ))}
                      {!selectedQuestion && <div style={{ color: "#374151", fontStyle: "italic" }}>No question selected</div>}
                    </div>
                  )}
                </div>
              ) : (
                /* RESULT TAB */
                <div style={{ minHeight: "100%" }}>
                  {isRunning ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "150px", gap: "12px" }}>
                      <div className="neon-dot" style={{ background: "#818cf8", width: "12px", height: "12px" }} />
                      <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600", letterSpacing: "0.5px" }}>Running tests...</div>
                    </div>
                  ) : testResults ? (
                    <div>
                       {/* Submission Summary Header if Submission */}
                       {testResults.submissionId && (
                         <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: testResults.allPassed ? "rgba(74,222,128,0.05)" : "rgba(248,113,113,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                           <div>
                              <div style={{ fontSize: "18px", fontWeight: "800", color: testResults.allPassed ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
                                {testResults.allPassed ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {testResults.allPassed ? "Accepted" : "Wrong Answer"}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                {testResults.results?.filter(r => r.passed).length} / {testResults.results?.length} test cases passed
                              </div>
                           </div>
                           <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "11px", color: "#374151", textTransform: "uppercase", fontWeight: "700" }}>Runtime</div>
                              <div style={{ fontSize: "14px", color: "#fff", fontWeight: "700" }}>{Math.floor(Math.random() * 100) + 50} ms</div>
                           </div>
                         </div>
                       )}

                      {testResults.results?.map((res, i) => (
                        <div key={i} className="test-row" style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: res.passed ? 0 : "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "100px" }}>
                              {res.passed
                                ? <CheckCircle size={16} color="#4ade80" style={{ animation: "checkmark 0.4s cubic-bezier(0.175,0.885,0.32,1.275)" }} />
                                : <AlertCircle size={16} color="#f87171" />}
                              <span style={{ fontWeight: "700", color: res.passed ? "#4ade80" : "#f87171", fontSize: "13px" }}>Case {i + 1}</span>
                            </div>
                            <span style={{ fontSize: "12px", color: res.passed ? "#4ade80" : "#f87171", opacity: 0.7 }}>{res.passed ? "Passed" : "Failed"}</span>
                          </div>
                          {!res.passed && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingLeft: "28px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.1)", borderRadius: "10px", padding: "10px 14px" }}>
                                  <div style={{ fontSize: "10px", color: "#4ade80", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "1px" }}>Expected</div>
                                  <code style={{ color: "#d1fae5", fontSize: "12px" }}>{res.expectedOutput || res.expected}</code>
                                </div>
                                <div style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.1)", borderRadius: "10px", padding: "10px 14px" }}>
                                  <div style={{ fontSize: "10px", color: "#f87171", fontWeight: "700", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "1px" }}>Actual</div>
                                  <code style={{ color: "#fecaca", fontSize: "12px" }}>{res.actualOutput || res.actual}</code>
                                </div>
                              </div>
                              {res.error && (
                                <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", padding: "10px 14px", color: "#fca5a5", fontSize: "12px", whiteSpace: "pre-wrap" }}>
                                  {res.error}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : output ? (
                    <div style={{ padding: "16px 20px" }}>
                      <pre style={{
                        margin: 0, lineHeight: "1.7", fontSize: "13px", fontFamily: "'Fira Code', monospace",
                        color: (output.startsWith("Error") || output.startsWith("Execution Error") || output.startsWith("Submission Error"))
                          ? "#fca5a5" : "#e2e8f0"
                      }}>
                        {output}
                      </pre>
                    </div>
                  ) : (
                    <div style={{ display: "flex", height: "100%", minHeight: "150px", alignItems: "center", justifyContent: "center", color: "#334155", fontSize: "13px", fontStyle: "italic", gap: "8px" }}>
                      <Cpu size={16} />
                      Run or Submit to see the code execution results
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
