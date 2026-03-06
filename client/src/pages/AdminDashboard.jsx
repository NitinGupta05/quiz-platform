import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/user/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
      setRecentActivity(data.recentActivity || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <h3>{stats?.totalQuizzes || 0}</h3>
            <p>Active Quizzes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats?.totalAttempts || 0}</h3>
            <p>Total Attempts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats?.averageScore || 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/admin/quizzes" className="action-card">
          <span className="action-icon">📝</span>
          <h3>Manage Quizzes</h3>
          <p>Create, edit, and delete quizzes</p>
        </Link>
        <Link to="/admin/users" className="action-card">
          <span className="action-icon">👥</span>
          <h3>Manage Users</h3>
          <p>View and manage registered users</p>
        </Link>
        <Link to="/admin/analytics" className="action-card">
          <span className="action-icon">📈</span>
          <h3>Analytics</h3>
          <p>View detailed analytics and reports</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3>Recent Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-info">
                  <strong>{activity.user}</strong> attempted <strong>{activity.quiz}</strong>
                </div>
                <div className="activity-meta">
                  <span>Score: {activity.score}/{activity.total}</span>
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary">No recent activity</p>
        )}
      </div>

      {/* Most Attempted Quiz */}
      {stats?.mostAttemptedQuiz && (
        <div className="card">
          <h3>Most Popular Quiz</h3>
          <div className="popular-quiz">
            <h4>{stats.mostAttemptedQuiz.title}</h4>
            <p>{stats.mostAttemptedQuiz.attempts} attempts</p>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard { max-width: 1200px; margin: 0 auto; }
        .page-header { margin-bottom: 30px; }
        .page-header h1 { font-size: 2rem; }
        
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
        
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .action-card {
          background: var(--surface);
          padding: 25px;
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: var(--text);
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        
        .action-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        
        .action-icon { font-size: 2rem; display: block; margin-bottom: 10px; }
        .action-card h3 { margin-bottom: 5px; }
        .action-card p { color: var(--text-secondary); font-size: 0.9rem; }
        
        .card {
          background: var(--surface);
          padding: 25px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          margin-bottom: 25px;
        }
        
        .card h3 { margin-bottom: 20px; }
        
        .activity-list { display: flex; flex-direction: column; gap: 12px; }
        .activity-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: var(--background);
          border-radius: var(--radius-md);
        }
        .activity-meta { display: flex; gap: 15px; color: var(--text-secondary); font-size: 0.9rem; }
        
        .popular-quiz { padding: 15px; background: var(--background); border-radius: var(--radius-md); }
        .popular-quiz h4 { margin-bottom: 5px; }
        .popular-quiz p { color: var(--primary); font-weight: 500; }
        
        .text-secondary { color: var(--text-secondary); }

        @media (max-width: 768px) {
          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid,
          .quick-actions {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .stat-card,
          .action-card,
          .card {
            padding: 16px;
          }

          .activity-item,
          .activity-meta {
            flex-wrap: wrap;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;

