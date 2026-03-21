import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getQuizzes } from "../services/quizService";
import { getHistory, getProgress } from "../services/userService";

const quickStats = [
  { key: "taken", label: "Quizzes taken", accent: "Progress" },
  { key: "accuracy", label: "Overall accuracy", accent: "Score" },
  { key: "average", label: "Average result", accent: "Avg" },
  { key: "best", label: "Best score", accent: "Peak" },
];

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [progressData, historyData, quizzesData] = await Promise.all([
          getProgress(),
          getHistory(5),
          getQuizzes("limit=6"),
        ]);

        setStats(progressData);
        setRecentAttempts(historyData.history || []);
        setRecentQuizzes(quizzesData.quizzes || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const statValues = {
    taken: stats?.totalQuizzesTaken || 0,
    accuracy: `${stats?.overallAccuracy || 0}%`,
    average: `${stats?.averageScore || 0}%`,
    best: `${stats?.bestScore || 0}%`,
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
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">Student dashboard</span>
          <h1>Welcome back, {user?.name || "Learner"}</h1>
          <p>
            Pick up where you left off, review your recent attempts, and jump back into the next quiz.
          </p>
        </div>
        <div className="dashboard-hero-actions">
          <Link to="/progress" className="btn btn-outline">View progress</Link>
          <Link to="/quizzes" className="btn btn-primary">Browse quizzes</Link>
        </div>
      </section>

      <section className="stats-grid">
        {quickStats.map((item) => (
          <article key={item.key} className="stat-card">
            <span className="icon-chip">{item.accent}</span>
            <strong>{statValues[item.key]}</strong>
            <h3>{item.label}</h3>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel card recent-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Recent attempts</span>
              <h2>Latest activity</h2>
            </div>
            <Link to="/progress" className="view-all">Full history</Link>
          </div>

          {recentAttempts.length > 0 ? (
            <div className="attempts-list">
              {recentAttempts.map((attempt) => (
                <article key={attempt._id} className="attempt-item">
                  <div>
                    <h3>{attempt.quiz?.title || "Quiz"}</h3>
                    <p>{new Date(attempt.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="attempt-summary">
                    <span className={`attempt-score ${attempt.accuracy >= 60 ? "good" : "bad"}`}>
                      {attempt.accuracy}%
                    </span>
                    <span className="attempt-label">Accuracy</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No attempts yet</h3>
              <p>Your recent quiz submissions will appear here once you complete a quiz.</p>
              <Link to="/quizzes" className="btn btn-primary">Take a quiz</Link>
            </div>
          )}
        </div>

        <aside className="panel card dashboard-aside">
          <div className="panel-header compact-header">
            <div>
              <span className="panel-kicker">Snapshot</span>
              <h2>At a glance</h2>
            </div>
          </div>
          <div className="snapshot-list">
            <div className="snapshot-item">
              <span>Questions answered</span>
              <strong>{stats?.totalQuestionsAnswered || 0}</strong>
            </div>
            <div className="snapshot-item">
              <span>Correct answers</span>
              <strong>{stats?.totalCorrect || 0}</strong>
            </div>
            <div className="snapshot-item">
              <span>Categories attempted</span>
              <strong>{stats?.categoryPerformance?.length || 0}</strong>
            </div>
          </div>
          <div className="dashboard-note">
            <span className="icon-chip">Focus</span>
            <p>
              Your strongest improvement comes from retaking quizzes where your accuracy is still below 70%.
            </p>
          </div>
        </aside>
      </section>

      <section className="card quiz-panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Continue learning</span>
            <h2>Available quizzes</h2>
          </div>
          <Link to="/quizzes" className="view-all">See all</Link>
        </div>

        <div className="quizzes-grid">
          {recentQuizzes.map((quiz) => (
            <article key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                <span className="meta-pill">{quiz.timeLimit}s</span>
              </div>
              <h3>{quiz.title}</h3>
              <p>{quiz.description || "Open this quiz to start a timed assessment and track your result."}</p>
              <div className="quiz-meta-row">
                <span>{quiz.category}</span>
                <span>{quiz.totalAttempts || 0} attempts</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => handleStartQuiz(quiz._id)}>
                Start quiz
              </button>
            </article>
          ))}
        </div>
      </section>

      <style>{`
        .dashboard-page {
          max-width: var(--page-width);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }
        .dashboard-hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          padding: 30px;
          border-radius: 28px;
          background:
            linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(15, 118, 110, 0.04)),
            var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .dashboard-kicker,
        .panel-kicker {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary-dark);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .dashboard-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 8px;
        }
        .dashboard-hero p {
          max-width: 60ch;
          font-size: 1rem;
        }
        .dashboard-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .stat-card {
          padding: 24px;
          border-radius: 22px;
          background: var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
        }
        .stat-card strong {
          display: block;
          margin: 16px 0 8px;
          font-size: 2rem;
          color: var(--text);
        }
        .stat-card h3 {
          font-size: 1rem;
          color: var(--text-secondary);
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.65fr;
          gap: 20px;
        }
        .panel {
          border-radius: 26px;
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }
        .compact-header {
          margin-bottom: 18px;
        }
        .panel-header h2 {
          font-size: 1.5rem;
          margin: 0;
        }
        .view-all {
          font-weight: 700;
        }
        .attempts-list,
        .snapshot-list {
          display: grid;
          gap: 14px;
        }
        .attempt-item,
        .snapshot-item,
        .dashboard-note,
        .quiz-card {
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: var(--background-elevated);
        }
        .attempt-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-radius: 18px;
          padding: 16px 18px;
        }
        .attempt-item h3 {
          margin-bottom: 4px;
          font-size: 1.05rem;
        }
        .attempt-summary {
          text-align: right;
        }
        .attempt-score {
          display: block;
          font-size: 1.35rem;
          font-weight: 800;
        }
        .attempt-score.good {
          color: var(--success);
        }
        .attempt-score.bad {
          color: var(--danger);
        }
        .attempt-label {
          font-size: 0.82rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .dashboard-aside {
          display: grid;
          gap: 16px;
          align-content: start;
        }
        .snapshot-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px;
          border-radius: 16px;
        }
        .snapshot-item strong {
          font-size: 1.15rem;
        }
        .dashboard-note {
          border-radius: 18px;
          padding: 18px;
          display: grid;
          gap: 12px;
        }
        .dashboard-note p {
          margin: 0;
        }
        .quiz-panel {
          border-radius: 26px;
        }
        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .quiz-card {
          border-radius: 22px;
          padding: 20px;
        }
        .quiz-card-header,
        .quiz-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .quiz-card-header {
          margin-bottom: 14px;
        }
        .meta-pill {
          display: inline-flex;
          align-items: center;
          padding: 7px 11px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.08);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
        .quiz-card h3 {
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        .quiz-card p {
          min-height: 66px;
          margin-bottom: 14px;
        }
        .quiz-meta-row {
          margin-bottom: 16px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        @media (max-width: 1100px) {
          .stats-grid,
          .quizzes-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .dashboard-hero,
          .panel,
          .quiz-panel,
          .stat-card,
          .quiz-card {
            padding: 18px;
            border-radius: 20px;
          }
          .dashboard-hero,
          .panel-header,
          .attempt-item,
          .quiz-card-header,
          .quiz-meta-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .dashboard-hero-actions,
          .stats-grid,
          .quizzes-grid {
            grid-template-columns: 1fr;
            width: 100%;
          }
          .dashboard-hero-actions {
            display: flex;
            align-items: stretch;
          }
          .dashboard-hero-actions .btn {
            width: 100%;
          }
          .attempt-summary {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
