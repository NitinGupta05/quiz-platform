import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-shell">
      <div className="footer-content">
        <div className="footer-section brand-block">
          <span className="footer-kicker">Quiz Platform</span>
          <h3>QuizPro</h3>
          <p>A polished MERN quiz platform for practice, assessment, and performance tracking.</p>
        </div>

        <div className="footer-section">
          <h4>Explore</h4>
          <Link to="/quizzes">Browse Quizzes</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="footer-section">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} QuizPro. All rights reserved.</p>
        <p>Built with MERN Stack</p>
      </div>

      <style>{`
        .footer-shell {
          background: linear-gradient(180deg, var(--surface), var(--background-elevated));
          border-top: 1px solid var(--border);
          padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-md);
          margin-top: auto;
        }
        .footer-content {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: var(--spacing-xl);
          max-width: var(--page-width);
          margin: 0 auto;
        }
        .footer-kicker {
          display: inline-block;
          margin-bottom: 10px;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-secondary);
          font-weight: 700;
        }
        .footer-section h3 {
          color: var(--primary);
          font-size: 1.6rem;
          margin-bottom: var(--spacing-sm);
        }
        .footer-section h4 {
          color: var(--text);
          font-size: 1rem;
          margin-bottom: var(--spacing-sm);
        }
        .footer-section p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .footer-section a {
          display: block;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 10px;
          font-size: 0.92rem;
          transition: var(--transition);
        }
        .footer-section a:hover {
          color: var(--primary);
          transform: translateX(2px);
        }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: var(--page-width);
          margin: var(--spacing-xl) auto 0;
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.875rem;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .footer-content { grid-template-columns: 1fr; gap: var(--spacing-lg); }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
