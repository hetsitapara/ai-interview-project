import React, { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { Play, Send, RotateCcw, CheckCircle, AlertCircle, Clock, Code2, FileText, History, List, ChevronDown, ChevronUp, Zap } from "lucide-react";
import "../styles/interview.css";
import CodeAnalysis from "../components/CodeAnalysis";

export default function CodingTest() {
  // --- STATE ---
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // null means Playground
  const [isPlayground, setIsPlayground] = useState(false);

  const [activeTab, setActiveTab] = useState("description"); // 'description' | 'history'
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Select a question or use Playground to start coding");

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null); // Raw string output
  const [testResults, setTestResults] = useState(null); // Structured results object
  const [customInput, setCustomInput] = useState("");
  const [history, setHistory] = useState([]);

  // UI State
  const [showConsole, setShowConsole] = useState(true);

  // --- CONSTANTS ---
  const defaultCode = {
    javascript: `console.log("Hello, World!");`,
    python: `print("Hello, World!")`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!";\n    return 0;\n}`
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return '#4ade80';
    if (diff === 'Medium') return '#facc15';
    if (diff === 'Hard') return '#f87171';
    return '#cbd5e1';
  };

  // --- EFFECT: Fetch Questions on Mount ---
  useEffect(() => {
    fetchQuestions();
  }, []);

  // --- API CALLS ---
  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Fallback url if environment var not set
      const baseUrl = "http://localhost:5001";

      const res = await axios.get(`${baseUrl}/api/coding/questions`, config);
      setQuestions(res.data);

      if (res.data.length > 0) {
        fetchQuestionDetails(res.data[0]._id);
      } else {
        switchToPlayground();
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      switchToPlayground();
    }
  };

  const fetchQuestionDetails = async (id) => {
    if (id === "playground") {
      switchToPlayground();
      return;
    }

    try {
      setIsPlayground(false);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = "http://localhost:5001";

      const [res, historyRes] = await Promise.all([
        axios.get(`${baseUrl}/api/coding/questions/${id}`, config),
        axios.get(`${baseUrl}/api/coding/submissions/${id}`, config)
          .catch(() => ({ data: [] })) // Handle if history fails
      ]);

      setSelectedQuestion(res.data);
      setHistory(historyRes.data);

      // Load starter code if available, else default
      if (res.data.starterCode?.[language]) {
        setCode(res.data.starterCode[language]);
      } else {
        setCode(defaultCode[language]);
      }

      // Reset Outputs
      setOutput(null);
      setTestResults(null);
      setCustomInput("");
      setActiveTab("description");

    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  const switchToPlayground = () => {
    setIsPlayground(true);
    setSelectedQuestion(null);
    setHistory([]);
    setCode(defaultCode[language]);
    setOutput(null);
    setTestResults(null);
  };

  // --- ACTIONS ---
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (!isPlayground && selectedQuestion?.starterCode?.[newLang]) {
      setCode(selectedQuestion.starterCode[newLang]);
    } else {
      setCode(defaultCode[newLang]);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowConsole(true);
    setTestResults(null);
    setOutput("Running...");

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = "http://localhost:5001";

      if (isPlayground || !selectedQuestion) {
        // Playground execution
        const res = await axios.post(`${baseUrl}/api/coding/execute`, {
          language,
          code,
          input: customInput
        }, config);

        if (res.data.success) {
          setOutput(res.data.output);
        } else {
          setOutput(`Error:\n${res.data.output}`);
        }
      } else {
        // Run against test cases (Draft Run)
        const res = await axios.post(`${baseUrl}/api/coding/run`, {
          questionId: selectedQuestion._id,
          language,
          code
        }, config);

        // We can display structured results for 'Run' too, if backend returns them
        // For now, let's create a text summary if specific results exist
        if (res.data.results) {
          let logOutput = "";
          res.data.results.forEach((r, i) => {
            logOutput += `Test Case ${i + 1}: ${r.passed ? "PASSED" : "FAILED"}\n`;
            if (!r.passed) {
              logOutput += `Expected: ${r.expectedOutput}\nActual:   ${r.actualOutput}\n`;
            }
            logOutput += `--------------------------------\n`;
          });
          setOutput(logOutput);
          setTestResults(null); // Ensure we don't show submission UI for a run
        } else {
          setOutput(res.data.output || "Execution completed.");
        }
      }
    } catch (err) {
      setOutput("Execution Error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isPlayground) return;
    setIsRunning(true);
    setShowConsole(true);
    setOutput("Submitting...");

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const baseUrl = "http://localhost:5001";

      const res = await axios.post(`${baseUrl}/api/coding/submit`, {
        questionId: selectedQuestion._id,
        language,
        code
      }, config);

      setTestResults(res.data); // { allPassed, results: [] }
      setOutput(null); // Clear text output to show structured results

      // Refresh history
      const histRes = await axios.get(`${baseUrl}/api/coding/submissions/${selectedQuestion._id}`, config);
      setHistory(histRes.data);

    } catch (err) {
      setOutput("Submission Error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      marginTop: '85px',
      height: 'calc(100vh - 85px)',
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a', /* Dark slate background */
      color: '#e2e8f0',
      overflow: 'hidden'
    }}>

      {/* --- TOP TOOLBAR --- */}
      <header style={{
        height: '60px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        {/* Left: Problem Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
            <List size={18} />
          </div>
          <select
            className="ide-select"
            value={isPlayground ? "playground" : (selectedQuestion?._id || "playground")}
            onChange={(e) => fetchQuestionDetails(e.target.value)}
            style={{
              background: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none',
              maxWidth: '300px',
              textOverflow: 'ellipsis'
            }}
          >
            <option value="playground" style={{ background: '#1e293b' }}>⚡ Playground</option>
            {questions.map(q => (
              <option key={q._id} value={q._id} style={{ background: '#1e293b' }}>
                {q.title}
              </option>
            ))}
          </select>
        </div>

        {/* Center/Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={language}
              onChange={handleLanguageChange}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)'
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>

          <button
            onClick={handleRun}
            disabled={isRunning}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isRunning ? 'wait' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <Play size={14} fill="currentColor" /> Run
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isPlayground}
            title={isPlayground ? "Not available in Playground" : "Submit Solution"}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isPlayground ? 'rgba(99, 102, 241, 0.2)' : 'var(--primary)',
              border: 'none',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: (isPlayground || isRunning) ? 'not-allowed' : 'pointer',
              opacity: (isPlayground || isRunning) ? 0.6 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </header>

      {/* --- WORKSPACE --- */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* === LEFT PANEL: Problem Description === */}
        <div style={{
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.95)',
          minWidth: '300px',
          maxWidth: '50%'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0f172a' }}>
            <button
              onClick={() => setActiveTab('description')}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'description' ? '2px solid #818cf8' : '2px solid transparent',
                color: activeTab === 'description' ? 'white' : '#94a3b8',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s'
              }}
            >
              <FileText size={14} /> Description
            </button>
            <button
              onClick={() => setActiveTab('history')}
              disabled={isPlayground}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'history' ? '2px solid #818cf8' : '2px solid transparent',
                color: activeTab === 'history' ? 'white' : '#94a3b8',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isPlayground ? 'not-allowed' : 'pointer',
                opacity: isPlayground ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s'
              }}
            >
              <History size={14} /> Submissions
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'analysis' ? '2px solid #a78bfa' : '2px solid transparent',
                color: activeTab === 'analysis' ? '#a78bfa' : '#94a3b8',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s',
                background: activeTab === 'analysis' ? 'rgba(167,139,250,0.05)' : 'transparent'
              }}
            >
              <Zap size={14} /> AI Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {activeTab === 'description' && (
              isPlayground ? (
                <div style={{ textAlign: 'center', marginTop: '60px', color: '#94a3b8' }}>
                  <Code2 size={64} style={{ marginBottom: '20px', opacity: 0.2 }} />
                  <h3 style={{ fontSize: '20px', color: '#e2e8f0', marginBottom: '8px' }}>Playground Mode</h3>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', maxWidth: '300px', margin: '0 auto' }}>
                    Select a language and start coding. <br />
                    This is a free space to experiment without test cases.
                  </p>
                </div>
              ) : selectedQuestion ? (
                <div className="markdown-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        {selectedQuestion.title}
                      </h1>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {selectedQuestion.tags && selectedQuestion.tags.map(tag => (
                          <span key={tag} style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            textTransform: 'uppercase'
                          }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: `${getDifficultyColor(selectedQuestion.difficulty)}20`,
                      color: getDifficultyColor(selectedQuestion.difficulty),
                      border: `1px solid ${getDifficultyColor(selectedQuestion.difficulty)}40`
                    }}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>

                  <div style={{ fontSize: '15px', lineHeight: '1.7', color: '#cbd5e1', marginBottom: '32px' }}>
                    {selectedQuestion.description}
                  </div>

                  {/* Input/Output Formats */}
                  <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Input Format</h4>
                      <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0 }}>{selectedQuestion.inputFormat}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>Output Format</h4>
                      <p style={{ fontSize: '14px', color: '#e2e8f0', margin: 0 }}>{selectedQuestion.outputFormat}</p>
                    </div>
                  </div>

                  {/* Examples */}
                  <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Examples</h3>
                    {selectedQuestion.examples.map((ex, idx) => (
                      <div key={idx} style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#a5b4fc', marginBottom: '10px' }}>Example {idx + 1}</div>
                        <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', gap: '16px' }}>
                            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', minWidth: '60px' }}>Input</span>
                            <code style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '13px' }}>{ex.input}</code>
                          </div>
                          <div style={{ padding: '12px 16px', display: 'flex', gap: '16px' }}>
                            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '600', minWidth: '60px' }}>Output</span>
                            <code style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '13px' }}>{ex.output}</code>
                          </div>
                        </div>
                        {ex.explanation && (
                          <div style={{ marginTop: '10px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', paddingLeft: '4px' }}>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  {selectedQuestion.constraints && (
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Constraints</h3>
                      <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#cbd5e1',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedQuestion.constraints}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div className="loader"></div>
                </div>
              )
            )}

            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Recent Submissions</h3>
                {history.length > 0 ? history.map((sub, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    borderLeft: sub.status === 'Passed' ? '4px solid #4ade80' : '4px solid #f87171',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: sub.status === 'Passed' ? '#4ade80' : '#f87171', fontSize: '15px' }}>{sub.status}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Code2 size={12} color="#94a3b8" /> {sub.language}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={12} color="#94a3b8" /> Cases: {sub.passedCases}/{sub.totalCases}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px', fontStyle: 'italic' }}>
                    No submissions recorded yet for this problem.
                  </div>
                )}
              </div>
            )}
            {activeTab === 'analysis' && (
              <div style={{ flex: 1, height: '100%', overflow: 'auto' }}>
                <CodeAnalysis
                  code={code}
                  language={language}
                  question={selectedQuestion}
                  isVisible={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT PANEL: Editor & Output === */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          background: '#1e1e1e',
          minWidth: 0
        }}>
          {/* Editor Area */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(val) => setCode(val)}
              options={{
                minimap: { enabled: false }, // Disable minimap to save space
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                fontLigatures: true,
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastColumn: 0,
                overviewRulerBorder: false,
              }}
            />
          </div>

          {/* Console / Output Area */}
          <div style={{
            height: showConsole ? '40%' : '40px',
            background: '#0f172a',
            borderTop: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
            zIndex: 5
          }}>
            {/* Console Header */}
            <div
              onClick={() => setShowConsole(!showConsole)}
              style={{
                height: '40px',
                padding: '0 20px',
                borderBottom: showConsole ? '1px solid #1e293b' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: '#1e293b',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>
                <span>Console</span>
                {testResults && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: testResults.allPassed ? '#4ade80' : '#f87171',
                    background: testResults.allPassed ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                    padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {testResults.allPassed ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {testResults.allPassed ? "All Test Cases Passed" : "Tests Failed"}
                  </span>
                )}
              </div>
              <div style={{ color: '#64748b' }}>
                {showConsole ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </div>
            </div>

            {/* Console Content */}
            {showConsole && (
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Input Tab (Only for Playground for now) */}
                {isPlayground && (
                  <div style={{ width: '220px', borderRight: '1px solid #1e293b', padding: '0', display: 'flex', flexDirection: 'column', background: '#020617' }}>
                    <div style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #1e293b' }}>StdIn / Input</div>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', color: '#e2e8f0', padding: '16px', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
                      placeholder="Enter custom input here..."
                    />
                  </div>
                )}

                {/* Main Output */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0', fontFamily: 'monospace', fontSize: '13px', color: '#cbd5e1', background: '#0b1120' }}>
                  {testResults ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
                        Test Results
                      </div>
                      {testResults.results.map((res, i) => (
                        <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', gap: '20px' }}>
                          <div style={{ minWidth: '80px', fontWeight: '700', color: res.passed ? '#4ade80' : '#f87171' }}>
                            Case {i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            {res.passed ? (
                              <span style={{ color: '#94a3b8' }}>Passed</span>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ color: '#f87171', fontWeight: '600' }}>Failed</div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px', fontSize: '12px', color: '#e2e8f0' }}>
                                  <span style={{ color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Expected:</span>
                                  {res.expectedOutput}
                                </div>
                                <div style={{ background: 'rgba(248, 113, 113, 0.1)', padding: '8px', borderRadius: '4px', fontSize: '12px', color: '#fca5a5' }}>
                                  <span style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>Actual:</span>
                                  {res.actualOutput}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : output ? (
                    <div style={{ padding: '20px' }}>
                      <div style={{ color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>Output Terminal</div>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: output.startsWith('Error') || output.startsWith('Execution Error') ? '#f87171' : '#e2e8f0', fontFamily: "'Fira Code', monospace" }}>
                        {output}
                      </pre>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#475569', fontStyle: 'italic' }}>
                      Run your code to see output here...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
