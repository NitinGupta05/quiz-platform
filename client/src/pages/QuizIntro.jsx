import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ModalContext } from "../context/ModalContext";

const API_URL = "http://localhost:5000/api";

function QuizIntro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { openLogin } = useContext(ModalContext);
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/quizzes/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Quiz not found");
        return;
      }

      setQuiz(data);
    } catch (error) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (!user) {
      // Redirect to login with return URL to the quiz start page
      navigate("/login", { 
        state: { 
          from: `/quiz/${id}/start`,
          quizAttempt: true 
        } 
      });
      return;
    }
    // Navigate to quiz start page with timer
    navigate(`/quiz/${id}/start`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-intro-page">
        <div className="error-card">
          <h2>{error || "Quiz not found"}</h2>
          <Link to="/quizzes" className="btn btn-primary">Back to Quizzes</Link>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="quiz-intro-page">
      <div className="intro-card">
        <div className="intro-header">
          <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
          <span className="quiz-category">{quiz.category}</span>
        </div>

        <h1>{quiz.title}</h1>
        <p className="quiz-description">{quiz.description || "No description available"}</p>

        <div className="quiz-info">
          <div className="info-item">
            <span className="info-icon">⏱</span>
            <span className="info-label">Time Limit</span>
            <span className="info-value">{formatTime(quiz.timeLimit)}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📝</span>
            <span className="info-label">Questions</span>
            <span className="info-value">{quiz.questions?.length || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">👥</span>
            <span className="info-label">Attempts</span>
            <span className="info-value">{quiz.totalAttempts || 0}</span>
          </div>
        </div>

        <div className="intro-instructions">
          <h3>Instructions</h3>
          <ul>
            <li>You will have <strong>{formatTime(quiz.timeLimit)}</strong> to complete this quiz</li>
            <li>There are <strong>{quiz.questions?.length || 0} questions</strong> in total</li>
            <li>Each question has <strong>4 options</strong> with only 1 correct answer</li>
            <li>You cannot go back to previous questions once answered</li>
            <li>The quiz will auto-submit when the timer expires</li>
            <li>Switching tabs during the quiz will be recorded</li>
          </ul>
        </div>

        <div className="intro-actions">
          <button className="btn btn-primary btn-lg btn-block" onClick={handleStartQuiz}>
            {user ? "Start Quiz" : "Login to Start"}
          </button>
          <Link to="/quizzes" className="btn btn-outline btn-block">
            Back to Quizzes
          </Link>
        </div>
      </div>

      <style>{`
        .quiz-intro-page {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .intro-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-lg);
        }

        .intro-header {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .badge-easy { background: #4CAF50; color: white; }
        .badge-medium { background: #FF9800; color: white; }
        .badge-hard { background: #f44336; color: white; }

        .quiz-category {
          background: var(--background);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
        }

        .intro-card h1 {
          font-size: 2rem;
          margin-bottom: 15px;
        }

        .quiz-description {
          color: var(--text-secondary);
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .quiz-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-item {
          text-align: center;
          padding: 20px;
          background: var(--background);
          border-radius: var(--radius-md);
        }

        .info-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 8px;
        }

        .info-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: block;
        }

        .info-value {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 5px;
        }

        .intro-instructions {
          background: var(--background);
          padding: 25px;
          border-radius: var(--radius-md);
          margin-bottom: 30px;
        }

        .intro-instructions h3 {
          margin-bottom: 15px;
        }

        .intro-instructions ul {
          list-style: none;
          padding: 0;
        }

        .intro-instructions li {
          padding: 8px 0;
          color: var(--text-secondary);
          position: relative;
          padding-left: 20px;
        }

        .intro-instructions li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
        }

        .intro-actions {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .btn-lg {
          padding: 15px 30px;
          font-size: 1.1rem;
        }

        .error-card {
          text-align: center;
          padding: 60px 20px;
          background: var(--surface);
          border-radius: var(--radius-lg);
        }

        .error-card h2 {
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .quiz-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default QuizIntro;

