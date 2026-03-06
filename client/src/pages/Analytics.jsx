import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    activeUsers: 0,
    averageScore: 0,
    attemptsOverTime: [],
    popularQuizzes: [],
    scoreTrend: [],
    userActivityTrends: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats({
        totalUsers: data.totalUsers || 0,
        totalQuizzes: data.totalQuizzes || 0,
        totalAttempts: data.totalAttempts || 0,
        activeUsers: data.activeUsers || 0,
        averageScore: data.averageScore || 0,
        attemptsOverTime: data.attemptsOverTime || [],
        popularQuizzes: data.popularQuizzes || [],
        scoreTrend: data.scoreTrend || [],
        userActivityTrends: data.userActivityTrends || [],
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxAttempts = Math.max(1, ...stats.attemptsOverTime.map((item) => item.attempts || 0));
  const maxPopularity = Math.max(1, ...stats.popularQuizzes.map((item) => item.attempts || 0));
  const maxActivity = Math.max(1, ...stats.userActivityTrends.map((item) => item.activeUsers || 0));

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Platform metrics and activity trends</p>
        </div>
        <Link to="/admin/dashboard" className="btn btn-outline">
          Back to Dashboard
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Users</p>
          <h3>{stats.totalUsers}</h3>
        </div>
        <div className="stat-card">
          <p>Total Quizzes</p>
          <h3>{stats.totalQuizzes}</h3>
        </div>
        <div className="stat-card">
          <p>Total Attempts</p>
          <h3>{stats.totalAttempts}</h3>
        </div>
        <div className="stat-card">
          <p>Active Users</p>
          <h3>{stats.activeUsers}</h3>
        </div>
      </div>

      <div className="charts-grid">
        <section className="chart-card">
          <h2>Quiz Attempts Over Time</h2>
          <div className="bar-list">
            {stats.attemptsOverTime.length > 0 ? (
              stats.attemptsOverTime.map((item) => (
                <div key={item.date} className="bar-row">
                  <span className="bar-label">{item.date}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max(6, (item.attempts / maxAttempts) * 100)}%` }}
                    />
                  </div>
                  <span className="bar-value">{item.attempts}</span>
                </div>
              ))
            ) : (
              <p className="empty">No attempt data available.</p>
            )}
          </div>
        </section>

        <section className="chart-card">
          <h2>Most Popular Quizzes</h2>
          <div className="bar-list">
            {stats.popularQuizzes.length > 0 ? (
              stats.popularQuizzes.map((item) => (
                <div key={item.quizId || item.title} className="bar-row">
                  <span className="bar-label">{item.title}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill alt"
                      style={{ width: `${Math.max(6, (item.attempts / maxPopularity) * 100)}%` }}
                    />
                  </div>
                  <span className="bar-value">{item.attempts}</span>
                </div>
              ))
            ) : (
              <p className="empty">No quiz popularity data available.</p>
            )}
          </div>
        </section>
      </div>

      <div className="charts-grid">
        <section className="chart-card">
          <h2>Average Score Trend</h2>
          <div className="trend-grid">
            {stats.scoreTrend.length > 0 ? (
              stats.scoreTrend.map((point) => (
                <div key={point.date} className="trend-item">
                  <span className="trend-date">{point.date}</span>
                  <span className="trend-value">{point.averageScore}%</span>
                </div>
              ))
            ) : (
              <p className="empty">No score trend data available.</p>
            )}
          </div>
        </section>

        <section className="chart-card">
          <h2>User Activity Trends</h2>
          <div className="bar-list">
            {stats.userActivityTrends.length > 0 ? (
              stats.userActivityTrends.map((item) => (
                <div key={item.date} className="bar-row">
                  <span className="bar-label">{item.date}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill warning"
                      style={{ width: `${Math.max(6, (item.activeUsers / maxActivity) * 100)}%` }}
                    />
                  </div>
                  <span className="bar-value">{item.activeUsers}</span>
                </div>
              ))
            ) : (
              <p className="empty">No activity trend data available.</p>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .analytics-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .page-header h1 {
          margin-bottom: 6px;
        }

        .page-header p {
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: 18px;
        }

        .stat-card p {
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .stat-card h3 {
          font-size: 2rem;
          color: var(--primary);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .chart-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: 18px;
        }

        .chart-card h2 {
          font-size: 1.1rem;
          margin-bottom: 14px;
        }

        .bar-list {
          display: grid;
          gap: 10px;
        }

        .bar-row {
          display: grid;
          grid-template-columns: minmax(90px, 1fr) 2fr auto;
          gap: 10px;
          align-items: center;
        }

        .bar-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bar-track {
          height: 10px;
          border-radius: 999px;
          background: var(--background);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: inherit;
          background: var(--primary);
        }

        .bar-fill.alt {
          background: #2563eb;
        }

        .bar-fill.warning {
          background: #ea580c;
        }

        .bar-value {
          font-weight: 600;
          font-size: 0.85rem;
        }

        .trend-grid {
          display: grid;
          gap: 8px;
        }

        .trend-item {
          display: flex;
          justify-content: space-between;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          background: var(--background);
        }

        .trend-date {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .trend-value {
          font-weight: 600;
        }

        .empty {
          color: var(--text-secondary);
          margin: 6px 0 0;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 1.5rem;
          }

          .page-header .btn {
            width: 100%;
          }

          .stats-grid,
          .charts-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .stat-card,
          .chart-card {
            padding: 14px;
          }

          .bar-row {
            grid-template-columns: 1fr;
            gap: 6px;
            align-items: stretch;
          }

          .bar-track {
            height: 8px;
          }

          .bar-value {
            justify-self: end;
          }
        }
      `}</style>
    </div>
  );
}

export default Analytics;
