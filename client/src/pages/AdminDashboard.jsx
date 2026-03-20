import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminAnalytics } from "../services/adminService";
import { formatDateTimeDDMMYYYYHHMM } from "../utils/formatDate";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminAnalytics();
        setStats(data);
      } catch (fetchError) {
        console.error("Failed to fetch analytics:", fetchError);
        setError(fetchError.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const spotlight = useMemo(() => {
    if (!stats) return null;
    if (stats.hardestQuizzes?.length) {
      const quiz = stats.hardestQuizzes[0];
      return {
        title: "Needs Review",
        body: `${quiz.title} is underperforming at ${quiz.averageScore}% across ${quiz.attempts} attempts.`,
      };
    }

    if (stats.mostAttemptedQuiz) {
      return {
        title: "Top Traffic",
        body: `${stats.mostAttemptedQuiz.title} leads the platform with ${stats.mostAttemptedQuiz.attempts} attempts.`,
      };
    }

    return {
      title: "Early Stage",
      body: "The dashboard will become more useful once users submit more quizzes.",
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-card">
          <h2>Dashboard unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <span className="eyebrow">Admin Overview</span>
          <h1>Control Center</h1>
          <p>Keep an eye on platform quality, user activity, and quiz health.</p>
        </div>
      </div>

      <div className="hero-strip">
        <div className="hero-card">
          <span className="eyebrow">Spotlight</span>
          <h2>{spotlight?.title}</h2>
          <p>{spotlight?.body}</p>
        </div>
        <div className="hero-metrics">
          <div>
            <span>Engagement</span>
            <strong>{stats?.engagementRate || 0}%</strong>
          </div>
          <div>
            <span>Average Score</span>
            <strong>{stats?.averageScore || 0}%</strong>
          </div>
          <div>
            <span>Risk Rate</span>
            <strong>{stats?.tabSwitchRate || 0}%</strong>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: "Users", value: stats?.totalUsers || 0, hint: "Registered" },
          { label: "Active Users", value: stats?.activeUsers || 0, hint: "Attempted at least one quiz" },
          { label: "Quiz Library", value: stats?.totalQuizzes || 0, hint: "Active quizzes" },
          { label: "Attempts", value: stats?.totalAttempts || 0, hint: "Total submissions" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <div className="stat-icon">{item.label}</div>
            <div className="stat-info">
              <h3>{item.value}</h3>
              <p>{item.hint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <Link to="/admin/quizzes" className="action-card">
          <span className="action-icon">Quiz</span>
          <h3>Manage Quizzes</h3>
          <p>Create, refine, and retire quiz content.</p>
        </Link>
        <Link to="/admin/users" className="action-card">
          <span className="action-icon">Users</span>
          <h3>Manage Users</h3>
          <p>Track growth and moderate the user base.</p>
        </Link>
        <Link to="/admin/analytics" className="action-card highlight-card">
          <span className="action-icon">Intel</span>
          <h3>Deep Analytics</h3>
          <p>Inspect difficulty, risk, and category performance.</p>
        </Link>
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/admin/analytics">Open analytics</Link>
          </div>
          {stats?.recentActivity?.length ? (
            <div className="activity-list">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={`${activity.user}-${activity.date}-${index}`} className="activity-item">
                  <div className="activity-info">
                    <strong>{activity.user}</strong>
                    <p>{activity.quiz}</p>
                  </div>
                  <div className="activity-meta">
                    <span>{activity.score}/{activity.total}</span>
                    <span>{activity.accuracy}%</span>
                    <span>{formatDateTimeDDMMYYYYHHMM(activity.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary">No recent activity.</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Quality Watchlist</h3>
            <Link to="/admin/analytics">See all</Link>
          </div>
          {stats?.hardestQuizzes?.length ? (
            <div className="watch-list">
              {stats.hardestQuizzes.slice(0, 4).map((quiz) => (
                <div key={quiz.quizId} className="watch-item">
                  <div>
                    <strong>{quiz.title}</strong>
                    <p>{quiz.category} · {quiz.attempts} attempts</p>
                  </div>
                  <span className="watch-score">{quiz.averageScore}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary">No quiz quality data yet.</p>
          )}
        </div>
      </div>

      <style>{`
        .admin-dashboard { max-width: 1280px; margin: 0 auto; }
        .page-header { margin-bottom: 24px; }
        .eyebrow {
          display: inline-block;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 0.78rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .page-header h1 { font-size: clamp(2rem, 3vw, 2.8rem); margin-bottom: 8px; }
        .page-header p { color: var(--text-secondary); }
        .hero-strip {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 18px;
          margin-bottom: 24px;
        }
        .hero-card,
        .hero-metrics,
        .stat-card,
        .action-card,
        .card,
        .error-card {
          background: var(--surface);
          border-radius: 22px;
          box-shadow: var(--shadow-sm);
          border: 1px solid rgba(148, 163, 184, 0.15);
        }
        .hero-card,
        .hero-metrics,
        .card,
        .error-card,
        .action-card { padding: 22px; }
        .hero-card {
          background: linear-gradient(135deg, #0f172a, #1d4ed8);
          color: #f8fafc;
        }
        .hero-card .eyebrow,
        .hero-card p { color: rgba(248, 250, 252, 0.82); }
        .hero-card h2 { font-size: 1.6rem; margin-bottom: 8px; }
        .hero-metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
        }
        .hero-metrics div {
          padding: 16px;
          border-radius: 18px;
          background: var(--background);
        }
        .hero-metrics span { color: var(--text-secondary); font-size: 0.85rem; }
        .hero-metrics strong { display: block; font-size: 1.5rem; margin-top: 6px; }
        .stats-grid,
        .quick-actions,
        .content-grid {
          display: grid;
          gap: 18px;
          margin-bottom: 24px;
        }
        .stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .quick-actions { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .content-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .stat-card {
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .stat-icon,
        .action-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 58px;
          height: 36px;
          padding: 0 14px;
          border-radius: 999px;
          background: var(--background);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .stat-info h3 { font-size: 1.7rem; margin-bottom: 2px; }
        .stat-info p,
        .action-card p,
        .text-secondary,
        .watch-item p,
        .activity-info p { color: var(--text-secondary); }
        .action-card {
          text-decoration: none;
          color: var(--text);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .highlight-card {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 16px;
        }
        .activity-list,
        .watch-list {
          display: grid;
          gap: 12px;
        }
        .activity-item,
        .watch-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding: 14px 16px;
          border-radius: 18px;
          background: var(--background);
        }
        .activity-meta {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .activity-meta span,
        .watch-score {
          padding: 6px 10px;
          border-radius: 999px;
          background: white;
          border: 1px solid rgba(148, 163, 184, 0.18);
          font-size: 0.84rem;
          font-weight: 600;
        }
        .error-card { max-width: 520px; margin: 60px auto; text-align: center; }

        @media (max-width: 1024px) {
          .hero-strip,
          .content-grid,
          .quick-actions,
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .hero-metrics { grid-column: span 2; }
        }

        @media (max-width: 768px) {
          .hero-strip,
          .content-grid,
          .quick-actions,
          .stats-grid,
          .hero-metrics {
            grid-template-columns: 1fr;
          }
          .hero-card,
          .hero-metrics,
          .card,
          .action-card,
          .error-card { padding: 18px; }
          .card-header,
          .activity-item,
          .watch-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .activity-meta { justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
