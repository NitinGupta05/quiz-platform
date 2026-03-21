import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getQuizzes, getLeaderboard } from "../services/quizService";
import { getPublicStats } from "../services/userService";

function Landing() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalQuizzes: 0, totalAttempts: 0 });
  const [quizzes, setQuizzes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicData() {
      try {
        const [statsData, quizzesData, leaderboardData] = await Promise.all([
          getPublicStats(),
          getQuizzes("limit=3"),
          getLeaderboard("", 5),
        ]);

        if (statsData.success) {
          setStats(statsData.stats);
        }

        setQuizzes(quizzesData.quizzes || []);
        setLeaderboard(leaderboardData.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch public data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, []);

  const handleStartQuiz = (quizId) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: `/quiz/${quizId}/start`,
          quizAttempt: true,
        },
      });
      return;
    }

    navigate(`/quiz/${quizId}/start`);
  };

  const handleRegisterClick = () => {
    closeMobileMenu();
    navigate("/register");
  };

  const handleLoginClick = () => {
    closeMobileMenu();
    navigate("/login");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleMobileLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <h1>QuizPro</h1>
          </div>
          <nav className="header-nav">
            <Link to="/">Home</Link>
            <Link to="/quizzes">Quizzes</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/about">About</Link>
          </nav>
          <div className="header-right">
            <div className="header-actions">
              {user ? (
                <Link to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} className="btn btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <button className="btn btn-ghost" onClick={handleLoginClick}>Login</button>
                  <button className="btn btn-primary" onClick={handleRegisterClick}>Sign Up</button>
                </>
              )}
            </div>
            <button
              className="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile navigation"
            >
              {mobileMenuOpen ? "X" : "Menu"}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav className="mobile-nav-links">
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
              <Link to="/quizzes" onClick={closeMobileMenu}>Quizzes</Link>
              <Link to="/leaderboard" onClick={closeMobileMenu}>Leaderboard</Link>
              <Link to="/about" onClick={closeMobileMenu}>About</Link>
            </nav>
            <div className="mobile-menu-actions">
              {!user ? (
                <>
                  <button className="btn btn-ghost" onClick={handleLoginClick}>Login</button>
                  <button className="btn btn-primary" onClick={handleRegisterClick}>Register</button>
                </>
              ) : (
                <>
                  <Link
                    to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                    className="btn btn-primary"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <button className="btn btn-ghost" onClick={handleMobileLogout}>Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Master Your Knowledge with Interactive Quizzes</h1>
          <p>
            Challenge yourself with timed quizzes, track your progress, compete on the leaderboard,
            and build real learning momentum.
          </p>
          <div className="hero-buttons">
            <Link to="/quizzes" className="btn btn-primary btn-lg browse-btn">
              Browse Quizzes
            </Link>
            <button className="btn btn-outline btn-lg" onClick={handleRegisterClick}>
              Get Started Free
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">Quiz</div>
          <div className="floating-card card-2">Rank</div>
          <div className="floating-card card-3">Track</div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">{stats.totalUsers.toLocaleString()}+</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{stats.totalQuizzes}+</span>
            <span className="stat-label">Quizzes</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{stats.totalAttempts.toLocaleString()}+</span>
            <span className="stat-label">Quiz Attempts</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose QuizPro?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">Time</span>
            <h3>Timed Quizzes</h3>
            <p>Practice under pressure with real countdown-based quiz sessions.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">Stats</span>
            <h3>Track Progress</h3>
            <p>Review your results, accuracy, and category performance over time.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">Rank</span>
            <h3>Compete & Lead</h3>
            <p>Climb the leaderboard and compare your results against other learners.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">Admin</span>
            <h3>Admin Control</h3>
            <p>Manage users, quizzes, and performance insights from one dashboard.</p>
          </div>
        </div>
      </section>

      <section className="featured-quizzes">
        <div className="section-header">
          <h2>Featured Quizzes</h2>
          <Link to="/quizzes" className="view-all">View All</Link>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : quizzes.length > 0 ? (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="quiz-card">
                <div className="quiz-card-header">
                  <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                  <span className="quiz-time">Time {quiz.timeLimit}s</span>
                </div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description || "No description available"}</p>
                <div className="quiz-meta">
                  <span className="quiz-category">{quiz.category}</span>
                  <span className="quiz-attempts">{quiz.totalAttempts || 0} attempts</span>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => handleStartQuiz(quiz._id)}>
                  {user ? "Start Quiz" : "Login to Start"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No quizzes available yet. Check back soon.</p>
          </div>
        )}
      </section>

      <section className="leaderboard-preview">
        <div className="section-header">
          <h2>Top Performers</h2>
          <Link to="/leaderboard" className="view-all">View Full Leaderboard</Link>
        </div>
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : leaderboard.length > 0 ? (
          <div className="leaderboard-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={index} className={index < 3 ? `top-${index + 1}` : ""}>
                    <td>
                      <span className={`rank rank-${index + 1}`}>
                        {index === 0 ? "#1" : index === 1 ? "#2" : index === 2 ? "#3" : `#${index + 1}`}
                      </span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {entry.userImage ? (
                            <img src={entry.userImage} alt={entry.userName} />
                          ) : (
                            <span>{entry.userName?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="user-name">{entry.userName}</span>
                      </div>
                    </td>
                    <td><span className="score">{entry.score}/{entry.total}</span></td>
                    <td><span className="accuracy">{entry.accuracy}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No leaderboard data yet. Be the first to take a quiz.</p>
          </div>
        )}
      </section>

      <section className="cta">
        <h2>Ready to Start Your Journey?</h2>
        <p>Join the platform, take quizzes, and track your growth for free.</p>
        <div className="cta-buttons">
          <button className="btn btn-primary btn-lg" onClick={handleRegisterClick}>
            Create Free Account
          </button>
          <Link to="/quizzes" className="btn btn-outline btn-lg">
            Explore Quizzes
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>QuizPro</h3>
            <p>Your ultimate quiz platform</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Platform</h4>
              <Link to="/quizzes">Quizzes</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div className="footer-column">
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 QuizPro. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .landing-page { min-height: 100vh; background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%); }
        .landing-header { position: fixed; top: 0; left: 0; right: 0; background: var(--surface); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); z-index: 1000; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
        .logo h1 { font-size: 1.5rem; color: var(--primary); margin: 0; }
        .header-nav { display: flex; gap: 30px; }
        .header-nav a { color: var(--text); text-decoration: none; font-weight: 500; transition: color 0.2s; }
        .header-nav a:hover { color: var(--primary); }
        .header-actions { display: flex; gap: 10px; }
        .header-actions .btn-primary { background: var(--primary); color: #ffffff; border: 1px solid transparent; }
        .header-actions .btn-primary:hover { background: var(--primary-dark, var(--primary)); color: #ffffff; opacity: 1; }
        .header-right { display: flex; align-items: center; gap: 12px; }
        .mobile-menu-trigger { display: none; width: 56px; height: 40px; border-radius: 10px; border: 1px solid var(--border); background: var(--background); color: var(--text); font-size: 0.95rem; cursor: pointer; }
        .mobile-menu { display: none; }
        .btn-ghost { background: var(--background); border: 1px solid var(--border); color: var(--text); }
        .btn-ghost:hover { background: var(--surface-hover); }
        .hero { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; padding: 140px 20px 80px; gap: 50px; }
        .hero-content { flex: 1; }
        .hero h1 { font-size: 3.5rem; margin-bottom: 20px; color: var(--text); line-height: 1.2; }
        .hero p { font-size: 1.25rem; margin-bottom: 30px; color: var(--text-secondary); line-height: 1.6; }
        .hero-buttons { display: flex; gap: 15px; }
        .browse-btn:hover { background: var(--primary-dark); color: #ffffff; opacity: 1; }
        .btn-lg { padding: 15px 30px; font-size: 1.1rem; }
        .hero-visual { position: relative; width: 400px; height: 300px; }
        .floating-card {
          position: absolute; width: 100px; height: 100px; background: var(--surface); border-radius: var(--radius-lg);
          display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 700;
          box-shadow: var(--shadow-lg); animation: float 3s ease-in-out infinite;
        }
        .card-1 { top: 20px; left: 20px; animation-delay: 0s; }
        .card-2 { top: 80px; right: 20px; animation-delay: 1s; }
        .card-3 { bottom: 20px; left: 100px; animation-delay: 2s; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .stats-section { background: var(--primary); padding: 40px 20px; }
        .stats-container { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-around; align-items: center; }
        .stat-item { text-align: center; }
        .stat-number { display: block; font-size: 2.5rem; font-weight: 700; color: white; }
        .stat-label { color: rgba(255, 255, 255, 0.9); font-size: 1rem; }
        .stat-divider { width: 1px; height: 50px; background: rgba(255, 255, 255, 0.3); }
        .features { background: var(--surface); padding: 80px 20px; }
        .features h2 { text-align: center; font-size: 2.5rem; margin-bottom: 50px; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; }
        .feature-card { text-align: center; padding: 30px; background: var(--background); border-radius: var(--radius-lg); transition: transform 0.3s; }
        .feature-card:hover { transform: translateY(-5px); }
        .feature-icon {
          font-size: 0.9rem; display: inline-flex; align-items: center; justify-content: center; min-width: 84px; height: 38px;
          padding: 0 14px; border-radius: 999px; background: var(--surface); margin-bottom: 20px; font-weight: 700; text-transform: uppercase;
        }
        .feature-card h3 { margin-bottom: 10px; }
        .feature-card p { color: var(--text-secondary); }
        .featured-quizzes, .leaderboard-preview { padding: 80px 20px; max-width: 1200px; margin: 0 auto; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; gap: 12px; }
        .section-header h2 { font-size: 2rem; }
        .view-all { color: var(--primary); text-decoration: none; font-weight: 500; }
        .quizzes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        .quiz-card { background: var(--surface); padding: 25px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); transition: transform 0.3s, box-shadow 0.3s; }
        .quiz-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
        .quiz-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .badge-easy { background: #4CAF50; color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.8rem; }
        .badge-medium { background: #FF9800; color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.8rem; }
        .badge-hard { background: #f44336; color: white; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 0.8rem; }
        .quiz-time { color: var(--text-secondary); font-size: 0.9rem; }
        .quiz-card h3 { margin-bottom: 10px; }
        .quiz-card p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 15px; }
        .quiz-meta { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px; }
        .quiz-category { background: var(--background); padding: 4px 12px; border-radius: var(--radius-full); }
        .leaderboard-preview { background: var(--surface); }
        .leaderboard-table { background: var(--background); border-radius: var(--radius-lg); overflow: hidden; }
        .rank { font-weight: 600; font-size: 1.1rem; }
        .rank-1 { color: #FFD700; }
        .rank-2 { color: #C0C0C0; }
        .rank-3 { color: #CD7F32; }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .user-avatar span { color: white; font-weight: 600; }
        .user-name { font-weight: 500; }
        .score { font-weight: 600; color: var(--primary); }
        .accuracy { color: var(--text-secondary); }
        tr.top-1, tr.top-2, tr.top-3 { background: rgba(255, 215, 0, 0.05); }
        .cta { text-align: center; padding: 80px 20px; background: var(--surface); }
        .cta h2 { font-size: 2.5rem; margin-bottom: 15px; }
        .cta p { font-size: 1.25rem; margin-bottom: 30px; color: var(--text-secondary); }
        .cta-buttons { display: flex; gap: 15px; justify-content: center; }
        .landing-footer { background: var(--background); padding: 60px 20px 20px; border-top: 1px solid var(--border); }
        .footer-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; gap: 40px; }
        .footer-brand h3 { color: var(--primary); margin-bottom: 5px; }
        .footer-brand p { color: var(--text-secondary); }
        .footer-links { display: flex; gap: 60px; }
        .footer-column h4 { margin-bottom: 15px; }
        .footer-column a { display: block; color: var(--text-secondary); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
        .footer-column a:hover { color: var(--primary); }
        .footer-bottom { max-width: 1200px; margin: 40px auto 0; padding-top: 20px; border-top: 1px solid var(--border); text-align: center; }
        .footer-bottom p { color: var(--text-secondary); }
        .empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
        @media (max-width: 768px) {
          .hero { flex-direction: column; text-align: center; padding: 120px 20px 40px; }
          .hero h1 { font-size: 2.5rem; }
          .hero-visual { display: none; }
          .hero-buttons { flex-direction: column; }
          .header-nav { display: none; }
          .header-actions { display: none; }
          .mobile-menu-trigger { display: inline-flex; align-items: center; justify-content: center; }
          .mobile-menu { display: block; border-top: 1px solid var(--border); padding: 14px 20px 18px; background: var(--surface); }
          .mobile-nav-links { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
          .mobile-nav-links a { color: var(--text); text-decoration: none; font-weight: 500; }
          .mobile-menu-actions { display: flex; flex-direction: column; gap: 10px; }
          .stats-container { flex-direction: column; gap: 20px; }
          .stat-divider { width: 50px; height: 1px; }
          .footer-content { flex-direction: column; }
          .footer-links { flex-direction: column; gap: 30px; }
          .cta-buttons { flex-direction: column; }
          .section-header { flex-direction: column; align-items: flex-start; }
          .quizzes-grid { grid-template-columns: 1fr; }
        }
        .btn { padding: 10px 20px; border-radius: var(--radius-md); font-weight: 500; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; border: none; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); }
        .btn-outline:hover { background: var(--primary); color: white; }
        .btn-block { width: 100%; text-align: center; }
        .loading { display: flex; justify-content: center; padding: 40px; }
        .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Landing;
