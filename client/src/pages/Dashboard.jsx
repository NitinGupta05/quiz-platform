import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const [progressRes, historyRes, quizzesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/user/history?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/quizzes?limit=6`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const progressData = await progressRes.json();
      const historyData = await historyRes.json();
      const quizzesData = await quizzesRes.json();

      setStats(progressData);
      setRecentAttempts(historyData.history || []);
      setRecentQuizzes(quizzesData.quizzes || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    // Force intro-first flow: /quiz/:id -> /quiz/:id/start
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Welcome back, {user?.name}! 👋</h1>
        <p>Here's your quiz activity overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div className="stat-info">
            <h3>{stats?.totalQuizzesTaken || 0}</h3>
            <p>Quizzes Taken</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div className="stat-info">
            <h3>{stats?.overallAccuracy || 0}%</h3>
            <p>Overall Accuracy</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div className="stat-info">
            <h3>{stats?.averageScore || 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <h3>{stats?.bestScore || 0}%</h3>
            <p>Best Score</p>
          </div>
        </div>
      </div>

      {/* Recent Attempts */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Attempts</h3>
          <Link to="/progress" className="view-all">View All</Link>
        </div>
        {recentAttempts.length > 0 ? (
          <div className="attempts-list">
            {recentAttempts.map((attempt) => (
              <div key={attempt._id} className="attempt-item">
                <div className="attempt-info">
                  <h4>{attempt.quiz?.title || "Quiz"}</h4>
                  <p>{new Date(attempt.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="attempt-score">
                  <span className={`score ${attempt.accuracy >= 60 ? "good" : "bad"}`}>
                    {attempt.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No quiz attempts yet.</p>
            <Link to="/quizzes" className="btn btn-primary">Take a Quiz</Link>
          </div>
        )}
      </div>

      {/* Available Quizzes */}
      <div className="section">
        <div className="section-header">
          <h3>Available Quizzes</h3>
          <Link to="/quizzes" className="view-all">View All</Link>
        </div>
        <div className="quizzes-grid">
          {recentQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                <span className="quiz-time">{quiz.timeLimit}s</span>
              </div>
              <h4>{quiz.title}</h4>
              <p>{quiz.description || "No description"}</p>
              <div className="quiz-meta">
                <span>{quiz.category}</span>
                <span>{quiz.totalAttempts || 0} attempts</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => handleStartQuiz(quiz._id)}>
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-page { max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: 30px; }
        .page-header h1 { font-size: 2rem; margin-bottom: 5px; }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: var(--surface);
          padding: 25px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: var(--shadow-sm);
        }
        
        .stat-icon { font-size: 2.5rem; }
        .stat-info h3 { font-size: 1.75rem; margin-bottom: 2px; }
        .stat-info p { color: var(--text-secondary); font-size: 0.9rem; }
        
        .card {
          background: var(--surface);
          padding: 25px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: 30px;
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .view-all {
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .attempts-list { display: flex; flex-direction: column; gap: 12px; }
        .attempt-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: var(--background);
          border-radius: var(--radius-md);
        }
        
        .attempt-info h4 { font-size: 1rem; margin-bottom: 3px; }
        .attempt-info p { font-size: 0.85rem; color: var(--text-secondary); }
        
        .score { font-weight: 600; font-size: 1.1rem; }
        .score.good { color: var(--success); }
        .score.bad { color: var(--danger); }
        
        .section { margin-bottom: 30px; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .quiz-card {
          background: var(--surface);
          padding: 20px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }
        
        .quiz-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .badge-easy { background: #4CAF50; color: white; }
        .badge-medium { background: #FF9800; color: white; }
        .badge-hard { background: #f44336; color: white; }
        
        .quiz-time { color: var(--text-secondary); font-size: 0.9rem; }
        .quiz-card h4 { margin-bottom: 8px; }
        .quiz-card p { font-size: 0.9rem; margin-bottom: 15px; }
        .quiz-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 15px;
        }
        .quiz-card .btn.btn-primary:hover {
          background: var(--primary-dark);
          color: #ffffff;
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .quizzes-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            max-width: 100%;
          }

          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 1.5rem;
            line-height: 1.3;
          }

          .stats-grid,
          .quizzes-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .stat-card,
          .card,
          .quiz-card {
            padding: 16px;
          }

          .card-header,
          .section-header,
          .attempt-item {
            flex-wrap: wrap;
            gap: 8px;
          }

          .quiz-meta {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

