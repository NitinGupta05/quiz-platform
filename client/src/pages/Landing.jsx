import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getQuizzes, getLeaderboard } from "../services/quizService";
import { getPublicStats } from "../services/userService";

const featureItems = [
  {
    label: "Timer",
    title: "Timed quiz sessions",
    description: "Practice with countdown-based rounds that feel closer to real assessments.",
  },
  {
    label: "Track",
    title: "Progress you can follow",
    description: "Review history, accuracy, and category-wise performance from one account.",
  },
  {
    label: "Rank",
    title: "Competitive leaderboard",
    description: "See how you compare with other learners and keep improving your position.",
  },
  {
    label: "Admin",
    title: "Admin-ready controls",
    description: "Create quizzes, manage content, and monitor platform activity from the dashboard.",
  },
];

const heroHighlights = ["Role-based auth", "Timed exams", "Instant scoring"];

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
        <div className="landing-shell header-content">
          <div className="logo-block">
            <span className="logo-mark">QP</span>
            <div>
              <h1>QuizPro</h1>
              <p>Interactive quiz platform</p>
            </div>
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
                  <button className="btn btn-outline" onClick={handleLoginClick}>Login</button>
                  <button className="btn btn-primary" onClick={handleRegisterClick}>Sign Up</button>
                </>
              )}
            </div>
            <button
              className="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile navigation"
            >
              {mobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="mobile-menu landing-shell">
            <nav className="mobile-nav-links">
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
              <Link to="/quizzes" onClick={closeMobileMenu}>Quizzes</Link>
              <Link to="/leaderboard" onClick={closeMobileMenu}>Leaderboard</Link>
              <Link to="/about" onClick={closeMobileMenu}>About</Link>
            </nav>
            <div className="mobile-menu-actions">
              {!user ? (
                <>
                  <button className="btn btn-outline" onClick={handleLoginClick}>Login</button>
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
                  <button className="btn btn-outline" onClick={handleMobileLogout}>Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <section className="landing-shell hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">Full-stack learning platform</span>
          <h2>Take quizzes that feel purposeful, fast, and easy to revisit.</h2>
          <p>
            QuizPro brings together timed assessments, rankings, progress history, and admin tools in one
            clean MERN application that works for practice as well as portfolio demos.
          </p>
          <div className="hero-highlights">
            {heroHighlights.map((item) => (
              <span key={item} className="hero-highlight">{item}</span>
            ))}
          </div>
          <div className="hero-buttons">
            <Link to="/quizzes" className="btn btn-primary btn-lg">Browse Quizzes</Link>
            <button className="btn btn-outline btn-lg" onClick={handleRegisterClick}>Get Started Free</button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-card hero-card-primary">
            <div className="hero-card-header">
              <span className="icon-chip">Live</span>
              <span>Student workflow</span>
            </div>
            <h3>Practice, submit, and review results instantly</h3>
            <p>
              Start a quiz, track time pressure, and keep a running history of scores and accuracy.
            </p>
          </div>
          <div className="hero-card-grid">
            <div className="hero-card stat-card-mini">
              <span className="mini-label">Users</span>
              <strong>{stats.totalUsers.toLocaleString()}+</strong>
              <p>Active learners</p>
            </div>
            <div className="hero-card stat-card-mini">
              <span className="mini-label">Attempts</span>
              <strong>{stats.totalAttempts.toLocaleString()}+</strong>
              <p>Total submissions</p>
            </div>
            <div className="hero-card hero-card-accent">
              <span className="icon-chip warm">Admin</span>
              <strong>{stats.totalQuizzes} quizzes available</strong>
              <p>Create, manage, and monitor from one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-shell metric-strip">
        <div className="metric-item">
          <span className="metric-value">{stats.totalUsers.toLocaleString()}+</span>
          <span className="metric-label">Registered users</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{stats.totalQuizzes}+</span>
          <span className="metric-label">Available quizzes</span>
        </div>
        <div className="metric-item">
          <span className="metric-value">{stats.totalAttempts.toLocaleString()}+</span>
          <span className="metric-label">Attempts submitted</span>
        </div>
      </section>

      <section className="landing-shell feature-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Why it feels complete</span>
            <h2>Built for both learning flow and admin control</h2>
          </div>
          <p>
            The project combines user-side quiz experience with admin-side content management and analytics.
          </p>
        </div>
        <div className="feature-grid">
          {featureItems.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="icon-chip">{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-shell showcase-grid">
        <div className="showcase-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Featured content</span>
              <h2>Popular quizzes to start with</h2>
            </div>
            <Link to="/quizzes" className="view-all">View all quizzes</Link>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : quizzes.length > 0 ? (
            <div className="landing-quizzes-grid">
              {quizzes.map((quiz) => (
                <article key={quiz._id} className="landing-quiz-card">
                  <div className="landing-quiz-topline">
                    <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                    <span className="meta-pill">{quiz.timeLimit}s</span>
                  </div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description || "Practice with this quiz and track your score instantly."}</p>
                  <div className="landing-quiz-meta">
                    <span>{quiz.category}</span>
                    <span>{quiz.totalAttempts || 0} attempts</span>
                  </div>
                  <button className="btn btn-primary btn-block" onClick={() => handleStartQuiz(quiz._id)}>
                    {user ? "Start quiz" : "Login to start"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No quizzes available yet</h3>
              <p>Populate the quiz library from the admin dashboard and they will appear here.</p>
            </div>
          )}
        </div>

        <div className="showcase-panel leaderboard-panel">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">Leaderboard</span>
              <h2>Current top performers</h2>
            </div>
            <Link to="/leaderboard" className="view-all">Full leaderboard</Link>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : leaderboard.length > 0 ? (
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div key={`${entry.userName}-${index}`} className="leaderboard-row">
                  <div className="leaderboard-user">
                    <span className={`leader-rank leader-rank-${index + 1}`}>#{index + 1}</span>
                    <div className="user-avatar">
                      {entry.userImage ? (
                        <img src={entry.userImage} alt={entry.userName} />
                      ) : (
                        <span>{entry.userName?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <strong>{entry.userName}</strong>
                      <p>{entry.score}/{entry.total} score</p>
                    </div>
                  </div>
                  <span className="leader-accuracy">{entry.accuracy}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state compact-state">
              <h3>No leaderboard data yet</h3>
              <p>Once quiz attempts start coming in, the ranking table will fill automatically.</p>
            </div>
          )}
        </div>
      </section>

      <section className="landing-shell cta-section">
        <div>
          <span className="section-kicker">Ready to try it?</span>
          <h2>Create an account and take your first quiz today.</h2>
          <p>
            Students can start in seconds, and admins can manage content from a dedicated dashboard.
          </p>
        </div>
        <div className="cta-actions">
          <button className="btn btn-primary btn-lg" onClick={handleRegisterClick}>Create Free Account</button>
          <Link to="/quizzes" className="btn btn-outline btn-lg">Explore Quizzes</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-shell footer-grid">
          <div>
            <div className="logo-block footer-brand">
              <span className="logo-mark">QP</span>
              <div>
                <h3>QuizPro</h3>
                <p>MERN-based quiz platform for learning and assessment.</p>
              </div>
            </div>
          </div>
          <div className="footer-column">
            <h4>Platform</h4>
            <Link to="/quizzes">Quizzes</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="footer-column">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
        <div className="landing-shell footer-bottom">
          <p>&copy; 2026 QuizPro. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 28%),
            radial-gradient(circle at 85% 12%, rgba(217, 119, 6, 0.12), transparent 24%),
            var(--background);
        }
        .landing-shell {
          width: min(var(--page-width), calc(100% - 32px));
          margin: 0 auto;
        }
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(12px);
          background: rgba(251, 248, 242, 0.88);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          min-height: 82px;
        }
        .logo-block {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .logo-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          font-weight: 800;
          letter-spacing: 0.06em;
          box-shadow: 0 14px 24px rgba(15, 118, 110, 0.22);
        }
        .logo-block h1,
        .footer-brand h3 {
          margin: 0;
          color: var(--text);
          font-size: 1.3rem;
        }
        .logo-block p,
        .footer-brand p {
          margin: 0;
          font-size: 0.92rem;
        }
        .header-nav,
        .header-actions,
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-nav {
          gap: 24px;
        }
        .header-nav a {
          color: var(--text);
          font-weight: 600;
        }
        .mobile-menu-trigger {
          display: none;
          min-width: 72px;
          height: 42px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          cursor: pointer;
        }
        .mobile-menu {
          display: none;
          padding: 12px 0 18px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }
        .mobile-nav-links,
        .mobile-menu-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mobile-nav-links {
          margin-bottom: 12px;
        }
        .mobile-nav-links a {
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--text);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }
        .hero-section {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          padding: 56px 0 28px;
          align-items: center;
        }
        .hero-copy,
        .hero-panel,
        .showcase-panel,
        .cta-section {
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 22px 50px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(10px);
        }
        .hero-copy {
          padding: 42px;
          border-radius: 32px;
        }
        .hero-kicker,
        .section-kicker {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary-dark);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .hero-copy h2 {
          font-size: clamp(2.4rem, 5vw, 4.4rem);
          line-height: 1.06;
          margin-bottom: 18px;
          max-width: 11ch;
        }
        .hero-copy p {
          font-size: 1.05rem;
          max-width: 60ch;
          margin-bottom: 22px;
        }
        .hero-highlights,
        .hero-buttons,
        .landing-quiz-meta,
        .cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .hero-highlight,
        .meta-pill {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: var(--text);
          font-size: 0.88rem;
          font-weight: 600;
        }
        .btn-lg {
          padding: 14px 24px;
          font-size: 1rem;
        }
        .hero-panel {
          padding: 24px;
          border-radius: 28px;
          display: grid;
          gap: 18px;
        }
        .hero-card,
        .feature-card,
        .landing-quiz-card,
        .leaderboard-row,
        .metric-item {
          background: var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
        }
        .hero-card {
          border-radius: 22px;
          padding: 22px;
        }
        .hero-card-primary {
          background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(15, 118, 110, 0.04));
        }
        .hero-card-accent {
          background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.04));
        }
        .hero-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
          color: var(--text-secondary);
          font-size: 0.92rem;
        }
        .hero-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .stat-card-mini strong {
          display: block;
          font-size: 1.7rem;
          margin: 6px 0;
        }
        .mini-label {
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .warm {
          background: rgba(217, 119, 6, 0.14);
          color: #b45309;
        }
        .metric-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin: 8px auto 44px;
        }
        .metric-item {
          border-radius: 22px;
          padding: 24px;
          text-align: center;
        }
        .metric-value {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 6px;
        }
        .metric-label {
          color: var(--text-secondary);
        }
        .feature-section,
        .showcase-grid {
          margin-bottom: 44px;
        }
        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }
        .section-heading h2 {
          margin: 0;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
        }
        .section-heading.compact h2 {
          font-size: 1.6rem;
        }
        .section-heading p {
          max-width: 46ch;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .feature-card {
          border-radius: 24px;
          padding: 24px;
        }
        .feature-card h3 {
          margin: 16px 0 10px;
          font-size: 1.15rem;
        }
        .showcase-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 22px;
        }
        .showcase-panel {
          border-radius: 28px;
          padding: 28px;
        }
        .view-all {
          font-weight: 700;
        }
        .landing-quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 18px;
        }
        .landing-quiz-card {
          border-radius: 24px;
          padding: 22px;
        }
        .landing-quiz-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }
        .landing-quiz-card h3 {
          margin-bottom: 10px;
          font-size: 1.15rem;
        }
        .landing-quiz-card p {
          min-height: 72px;
          margin-bottom: 16px;
        }
        .landing-quiz-meta {
          margin-bottom: 16px;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .leaderboard-panel {
          display: flex;
          flex-direction: column;
        }
        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .leaderboard-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-radius: 18px;
          padding: 16px;
        }
        .leaderboard-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .leader-rank {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          background: var(--surface-muted);
          color: var(--text);
        }
        .leader-rank-1 {
          background: rgba(217, 119, 6, 0.16);
          color: #b45309;
        }
        .leader-rank-2 {
          background: rgba(15, 118, 110, 0.16);
          color: var(--primary-dark);
        }
        .leader-rank-3 {
          background: rgba(59, 130, 246, 0.16);
          color: #1d4ed8;
        }
        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #fff;
          font-weight: 800;
        }
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .leader-accuracy {
          font-weight: 800;
          color: var(--primary-dark);
        }
        .compact-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .cta-section {
          border-radius: 30px;
          padding: 32px;
          margin-bottom: 46px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .landing-footer {
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(10px);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.4fr 0.4fr;
          gap: 24px;
          padding: 30px 0 22px;
        }
        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-column h4 {
          margin-bottom: 4px;
        }
        .footer-bottom {
          padding: 16px 0 28px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }
        .footer-bottom p {
          margin: 0;
          text-align: center;
        }
        @media (max-width: 1100px) {
          .hero-section,
          .showcase-grid,
          .feature-grid,
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 900px) {
          .header-nav,
          .header-actions {
            display: none;
          }
          .mobile-menu-trigger,
          .mobile-menu {
            display: block;
          }
          .hero-section,
          .showcase-grid,
          .metric-strip,
          .cta-section,
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .cta-section {
            align-items: flex-start;
          }
        }
        @media (max-width: 768px) {
          .landing-shell {
            width: min(var(--page-width), calc(100% - 20px));
          }
          .header-content {
            min-height: 72px;
          }
          .hero-section {
            padding-top: 28px;
          }
          .hero-copy,
          .hero-panel,
          .showcase-panel,
          .cta-section,
          .metric-item,
          .feature-card,
          .landing-quiz-card,
          .hero-card {
            padding: 18px;
            border-radius: 20px;
          }
          .hero-card-grid,
          .feature-grid {
            grid-template-columns: 1fr;
          }
          .section-heading,
          .landing-quiz-topline,
          .leaderboard-row,
          .leaderboard-user {
            flex-direction: column;
            align-items: flex-start;
          }
          .leaderboard-row {
            align-items: stretch;
          }
          .leader-accuracy {
            align-self: flex-start;
          }
          .hero-copy h2 {
            max-width: none;
          }
          .hero-buttons,
          .cta-actions {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default Landing;
