import "../styles/interview.css";
import "../components/navbar"
export default function Interview() {
  return (
    < >
      
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
          <textarea placeholder="Type or speak your answer here..." />
          <span className="mic-icon">🎤</span>
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
