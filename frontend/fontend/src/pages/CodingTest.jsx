import React, { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import "../styles/interview.css"; // Reusing the glassmorphism styles

export default function CodingTest() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // null means Playground if loaded
  const [isPlayground, setIsPlayground] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Select a question or use Playground to start coding");
  const [output, setOutput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("problem"); // 'problem' or 'history'

  const defaultCode = {
    javascript: `console.log("Hello, World!");`,
    python: `print("Hello, World!")`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!";\n    return 0;\n}`
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get("http://localhost:5001/api/coding/questions", config);
      setQuestions(res.data);
      if (res.data.length > 0) {
        fetchQuestionDetails(res.data[0]._id);
      } else {
        // No questions, default to playground
        switchToPlayground();
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      switchToPlayground();
    }
  };

  const switchToPlayground = () => {
    setIsPlayground(true);
    setSelectedQuestion(null);
    setHistory([]);
    setCode(defaultCode[language]);
    setOutput("");
    setTestResults(null);
  };

  const fetchQuestionDetails = async (id) => {
    if (id === "playground") {
      switchToPlayground();
      return;
    }

    try {
      setLoading(true);
      setIsPlayground(false);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [res, historyRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/coding/questions/${id}`, config),
        axios.get(`http://localhost:5001/api/coding/submissions/${id}`, config)
      ]);

      setSelectedQuestion(res.data);
      setHistory(historyRes.data);

      // Set starter code
      setCode(res.data.starterCode[language] || "// Start coding...");
      setOutput("");
      setTestResults(null);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching question details:", err);
      setLoading(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (!isPlayground && selectedQuestion) {
      setCode(selectedQuestion.starterCode[newLang] || "");
    } else {
      setCode(defaultCode[newLang]);
    }
  };

  const handleRun = async () => {
    try {
      setSubmitting(true);
      setOutput("Running...");
      setTestResults(null);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isPlayground) {
        // Playground Execution
        const payload = {
          language,
          code,
          input: customInput
        };
        const res = await axios.post("http://localhost:5001/api/coding/execute", payload, config);

        if (res.data.success) {
          setOutput(res.data.output);
        } else {
          setOutput("Error:\n" + res.data.output);
        }

      } else {
        // Question Test Case Execution
        const payload = {
          questionId: selectedQuestion._id,
          language,
          code
        };

        const res = await axios.post("http://localhost:5001/api/coding/run", payload, config);

        // Format output
        let consoleOut = "";
        res.data.results.forEach((r, i) => {
          consoleOut += `Test Case ${i + 1}: ${r.passed ? "PASSED" : "FAILED"}\n`;
          consoleOut += `Input: ${r.input}\n`;
          consoleOut += `Expected: ${r.expectedOutput}\n`;
          consoleOut += `Actual: ${r.actualOutput}\n`;
          if (r.error) consoleOut += `Error: ${r.error}\n`;
          consoleOut += "----------------------------\n";
        });

        setOutput(consoleOut);
      }
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setOutput("Execution Error: " + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isPlayground) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        questionId: selectedQuestion._id,
        language,
        code
      };

      const res = await axios.post("http://localhost:5001/api/coding/submit", payload, config);
      setTestResults(res.data); // { allPassed, results: [] }
      setSubmitting(false);

      // Refresh history
      if (selectedQuestion) {
        const histRes = await axios.get(`http://localhost:5001/api/coding/submissions/${selectedQuestion._id}`, config);
        setHistory(histRes.data);
        setActiveTab("history"); // Switch to history to show result
      }
    } catch (err) {
      console.error(err);
      alert("Submission Failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="interview-page" style={{ alignItems: 'flex-start', paddingTop: '80px', height: '100vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: '100vw', height: '90vh', gap: '20px', padding: '0 20px' }}>

        {/* LEFT PANEL: PROBLEM & LIST */}
        <div className="interview-card" style={{ flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxWidth: '40%' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ marginRight: '10px', color: '#ccc' }}>Select Problem:</label>
            <select
              className="input-field"
              onChange={(e) => fetchQuestionDetails(e.target.value)}
              value={isPlayground ? "playground" : (selectedQuestion?._id || "")}
              style={{ padding: '5px', borderRadius: '5px' }}
            >
              <option value="playground">⚡ Playground (Custom Code)</option>
              {questions.map(q => <option key={q._id} value={q._id}>{q.title} ({q.difficulty})</option>)}
            </select>
          </div>

          {/* TABS */}
          {!isPlayground && selectedQuestion && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #444' }}>
              <button
                onClick={() => setActiveTab("problem")}
                style={{
                  background: 'none', border: 'none', color: activeTab === 'problem' ? '#4ade80' : '#aaa',
                  padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'problem' ? '2px solid #4ade80' : 'none'
                }}
              >
                Problem
              </button>
              <button
                onClick={() => setActiveTab("history")}
                style={{
                  background: 'none', border: 'none', color: activeTab === 'history' ? '#4ade80' : '#aaa',
                  padding: '10px', cursor: 'pointer', borderBottom: activeTab === 'history' ? '2px solid #4ade80' : 'none'
                }}
              >
                Submissions ({history.length})
              </button>
            </div>
          )}

          {/* CONTENT */}
          {loading ? <div>Loading Question...</div> : (
            isPlayground ? (
              <div style={{ color: '#ccc', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'white' }}>Playground Mode</h3>
                <p>Write and run code in any language without constraints.</p>

                <div style={{ marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '5px', color: '#aaa' }}>Custom Input (Stdin):</label>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    style={{
                      width: '100%',
                      flex: 1,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid #444',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '5px',
                      fontFamily: 'monospace'
                    }}
                    placeholder="Enter input here..."
                  />
                </div>
              </div>
            ) : selectedQuestion ? (
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: '10px' }}>
                {activeTab === 'problem' ? (
                  <>
                    <h2 style={{ color: 'white' }}>{selectedQuestion.title}</h2>
                    <span className={`badge ${selectedQuestion.difficulty.toLowerCase()}`}
                      style={{
                        background: selectedQuestion.difficulty === 'Easy' ? '#4ade80' : selectedQuestion.difficulty === 'Medium' ? '#facc15' : '#f87171',
                        color: 'black',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}>
                      {selectedQuestion.difficulty}
                    </span>
                    {selectedQuestion.tags && selectedQuestion.tags.map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#ccc',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginRight: '5px'
                      }}>
                        {tag}
                      </span>
                    ))}

                    <div style={{ marginTop: '20px', lineHeight: '1.6', color: '#ddd', whiteSpace: 'pre-wrap' }}>
                      {selectedQuestion.description}
                    </div>

                    <h4 style={{ marginTop: '20px', color: 'white' }}>Input Format</h4>
                    <p style={{ color: '#aaa' }}>{selectedQuestion.inputFormat}</p>

                    <h4 style={{ marginTop: '10px', color: 'white' }}>Output Format</h4>
                    <p style={{ color: '#aaa' }}>{selectedQuestion.outputFormat}</p>

                    <h4 style={{ marginTop: '20px', color: 'white' }}>Constraints</h4>
                    <pre style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '5px' }}>{selectedQuestion.constraints}</pre>

                    {selectedQuestion.examples.map((ex, idx) => (
                      <div key={idx} style={{ marginTop: '15px' }}>
                        <h5 style={{ color: 'white' }}>Example {idx + 1}</h5>
                        <div style={{ background: '#1e1e1e', padding: '10px', borderRadius: '5px', fontSize: '0.9rem' }}>
                          <div><strong>Input:</strong> {ex.input}</div>
                          <div><strong>Output:</strong> {ex.output}</div>
                          <div style={{ color: '#888', fontStyle: 'italic' }}>{ex.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div>
                    {history.length === 0 ? (
                      <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>No submissions yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {history.map((sub, idx) => (
                          <div key={idx} style={{
                            background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '5px',
                            borderLeft: sub.status === 'Passed' ? '4px solid #4ade80' : '4px solid #f87171'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: sub.status === 'Passed' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                                {sub.status}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                {new Date(sub.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '5px' }}>
                              Passed: {sub.passedCases} / {sub.totalCases}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                              Language: {sub.language}
                            </div>
                            <pre style={{
                              background: '#000', padding: '5px', borderRadius: '3px',
                              marginTop: '5px', fontSize: '0.7rem', overflowX: 'auto', maxHeight: '100px'
                            }}>
                              {sub.code}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>

        {/* RIGHT PANEL: EDITOR & CONSOLE */}
        <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '60%' }}>

          {/* EDITOR CARD */}
          <div className="interview-card" style={{ flex: '2', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select
                className="input-field"
                value={language}
                onChange={handleLanguageChange}
                style={{ padding: '5px', borderRadius: '5px', background: '#333', color: 'white', border: 'none' }}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="c">C (GCC)</option>
                <option value="cpp">C++ (G++)</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn secondary" onClick={handleRun} disabled={submitting}>
                  {submitting ? "..." : "▶ Run Code"}
                </button>
                <button
                  className="btn primary"
                  onClick={handleSubmit}
                  disabled={submitting || isPlayground}
                  title={isPlayground ? "Submit is only for solving questions" : "Submit Solution"}
                  style={{ opacity: isPlayground ? 0.5 : 1, cursor: isPlayground ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(val) => setCode(val)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* OUTPUT/RESULTS CARD */}
          <div className="interview-card" style={{ flex: '1', overflowY: 'auto', padding: '15px', background: '#1e1e1e', fontFamily: 'monospace' }}>
            <h4 style={{ color: '#aaa', marginTop: 0 }}>Console Output / Results</h4>

            {testResults ? (
              <div>
                <h3 style={{ color: testResults.allPassed ? '#4ade80' : '#f87171' }}>
                  {testResults.allPassed ? "🎉 All Test Cases Passed!" : "❌ Some Test Cases Failed"}
                </h3>
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {testResults.results.map((r, i) => (
                    <div key={i} style={{
                      padding: '10px',
                      borderRadius: '5px',
                      background: r.passed ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                      border: r.passed ? '1px solid #4ade80' : '1px solid #f87171',
                      minWidth: '100px'
                    }}>
                      <div style={{ fontWeight: 'bold', color: r.passed ? '#4ade80' : '#f87171' }}>
                        Test Case {i + 1}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                        {r.isPublic ? "Visible" : "Hidden"}
                      </div>
                      {!r.passed && r.isPublic && (
                        <div style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                          Expected: {r.expectedOutput}<br />
                          Actual: {r.actualOutput}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <pre style={{ whiteSpace: 'pre-wrap', color: output.startsWith('Error') || output.includes('FAILED') ? '#f87171' : '#ddd' }}>
                {output || "Run code to see output..."}
              </pre>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
