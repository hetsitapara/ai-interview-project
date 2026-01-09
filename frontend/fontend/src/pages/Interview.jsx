import { useState, useEffect, useRef } from "react";
import "../styles/interview.css";
// Navbar handled by MainLayout

export default function Interview() {
  console.log("Interview component rendering");
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  // Store the text that was already in the box before the CURRENT speech session started
  const baseTextRef = useRef("");
  const recognitionRef = useRef(null); 
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Simpler approach for React state:
        // Re-construct the WHOLE transcript of the current session
        const currentSessionTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        setAnswer(baseTextRef.current + (baseTextRef.current && currentSessionTranscript ? " " : "") + currentSessionTranscript);
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Browser does not support Speech Recognition.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Capture current text so we append to it, rather than replacing it
      baseTextRef.current = answer; 
      recognitionRef.current.start();
    }
  };

  return (
    <>
      <div className="interview-page">
        <div className="interview-card">
          <div className="interview-header">
            <span>Question 1 of 5</span>
            <span>00:00 / 15:00</span>
          </div>

          <div className="progress-track">
            <div className="progress-fill"></div>
          </div>

          <div className="question-box">
            <p>
              <strong>Question 1:</strong> Describe a challenging project you led
              and how you overcame any obstacles.
            </p>
          </div>

          <div className="answer-box">
            <textarea
              placeholder="Type or speak your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div 
                className={`mic-icon ${isListening ? "active" : ""}`} 
                onClick={toggleMic}
                title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn primary">Submit Answer</button>
            <button className="btn secondary">Start Interview</button>
          </div>
        </div>
      </div>
    </>
  );
}
