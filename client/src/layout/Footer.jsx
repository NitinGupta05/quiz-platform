import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>QuizPro</h3>
          <p>A modern quiz platform for learning and assessment.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/quizzes">Browse Quizzes</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@quizpro.com</p>
          <p>GitHub: github.com/quizpro</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} QuizPro. All rights reserved.</p>
        <p>Built with MERN Stack</p>
      </div>

      <style>{`
        .footer {
          background-color: var(--surface);
          border-top: 1px solid var(--border);
          padding: var(--spacing-xl) var(--spacing-lg) var(--spacing-md);
          margin-top: auto;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-xl);
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-section h3 {
          color: var(--primary);
          font-size: 1.5rem;
          margin-bottom: var(--spacing-sm);
        }

        .footer-section h4 {
          color: var(--text);
          font-size: 1rem;
          margin-bottom: var(--spacing-sm);
        }

        .footer-section p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .footer-section a {
          display: block;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: var(--spacing-xs);
          font-size: 0.875rem;
          transition: var(--transition);
        }

        .footer-section a:hover {
          color: var(--primary);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: var(--spacing-xl) auto 0;
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .footer-bottom {
            flex-direction: column;
            gap: var(--spacing-sm);
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;

