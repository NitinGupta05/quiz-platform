import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    quizId,
    resultId,
    score,
    total,
    correct,
    wrong,
    accuracy,
    timeTaken,
    isTabSwitched,
  } = location.state || {};

  useEffect(() => {
    if (resultId) {
      fetchResultDetails();
    } else {
      setLoading(false);
    }
  }, [resultId]);

  const fetchResultDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/quizzes/results/${resultId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (error) {
      console.error("Failed to fetch result:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!location.state) {
    return (
      <div className="result-page">
        <div className="empty-state">
          <h2>No Result Data</h2>
          <p>Please complete a quiz to see your results.</p>
          <Link to="/quizzes" className="btn btn-primary">
            Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = () => {
    if (accuracy >= 80) return "#4CAF50";
    if (accuracy >= 60) return "#FF9800";
    return "#f44336";
  };

  return (
    <div className="result-page">
      <div className="result-card">
        <div className="result-header">
          <h1>Quiz Complete! 🎉</h1>
          {isTabSwitched && (
            <div className="tab-switch-warning">
              ⚠️ Tab switch detected during quiz
            </div>
          )}
        </div>

        {/* Score Circle */}
        <div className="score-circle" style={{ borderColor: getScoreColor() }}>
          <div className="score-value" style={{ color: getScoreColor() }}>
            {accuracy}%
          </div>
          <div className="score-label">Accuracy</div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <span className="stat-value">{score}</span>
            <span className="stat-label">Score</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">✅</span>
            <span className="stat-value correct">{correct}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">❌</span>
            <span className="stat-value wrong">{wrong}</span>
            <span className="stat-label">Wrong</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-value">{formatTime(timeTaken)}</span>
            <span className="stat-label">Time Taken</span>
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <Link to="/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
          <Link to={`/leaderboard/${quizId}`} className="btn btn-outline">
            View Leaderboard
          </Link>
          <Link to="/quizzes" className="btn btn-primary">
            Take Another Quiz
          </Link>
          {result && (
            <Link to="/progress" className="btn btn-outline">
              View Progress
            </Link>
          )}
        </div>
      </div>

      {/* Question Review */}
      {result && result.questions && (
        <div className="review-section">
          <h2>Question Review</h2>
          {result.questions.map((q, index) => (
            <div key={index} className={`review-item ${q.isCorrect ? "correct" : "wrong"}`}>
              <div className="review-header">
                <span className="question-num">Q{index + 1}</span>
                <span className={`status ${q.isCorrect ? "correct" : "wrong"}`}>
                  {q.isCorrect ? "✓ Correct" : "✗ Wrong"}
                </span>
              </div>
              <p className="question-text">{q.question}</p>
              <div className="options-review">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`option ${
                      i === q.correctAnswer
                        ? "correct-answer"
                        : i === q.selectedAnswer && !q.isCorrect
                        ? "wrong-answer"
                        : ""
                    }`}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="option-text">{opt}</span>
                    {i === q.correctAnswer && <span className="badge badge-success">Correct</span>}
                    {i === q.selectedAnswer && !q.isCorrect && (
                      <span className="badge badge-danger">Your Answer</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .result-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .result-card {
          background-color: var(--surface);
          border-radius: var(--radius-lg);
          padding: 40px;
          text-align: center;
          box-shadow: var(--shadow-lg);
          margin-bottom: 30px;
        }

        .result-header h1 {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .tab-switch-warning {
          background-color: var(--warning);
          color: white;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          display: inline-block;
          margin-bottom: 20px;
        }

        .score-circle {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 8px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 30px auto;
          background-color: var(--background);
        }

        .score-value {
          font-size: 3rem;
          font-weight: 700;
        }

        .score-label {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-item {
          background-color: var(--background);
          padding: 20px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .stat-value.correct {
          color: #4CAF50;
        }

        .stat-value.wrong {
          color: #f44336;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .result-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .review-section {
          background-color: var(--surface);
          border-radius: var(--radius-lg);
          padding: 30px;
          box-shadow: var(--shadow-md);
        }

        .review-section h2 {
          margin-bottom: 20px;
        }

        .review-item {
          padding: 20px;
          border-radius: var(--radius-md);
          margin-bottom: 15px;
          background-color: var(--background);
        }

        .review-item.correct {
          border-left: 4px solid #4CAF50;
        }

        .review-item.wrong {
          border-left: 4px solid #f44336;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .question-num {
          font-weight: 600;
        }

        .status {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status.correct {
          color: #4CAF50;
        }

        .status.wrong {
          color: #f44336;
        }

        .question-text {
          margin-bottom: 15px;
        }

        .options-review {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: var(--radius-sm);
          background-color: var(--surface);
        }

        .option.correct-answer {
          background-color: rgba(76, 175, 80, 0.1);
          border: 1px solid #4CAF50;
        }

        .option.wrong-answer {
          background-color: rgba(244, 67, 54, 0.1);
          border: 1px solid #f44336;
        }

        .option-letter {
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: var(--background);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .option-text {
          flex: 1;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

export default Result;

