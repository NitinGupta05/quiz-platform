import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function About() {
  const { user } = useContext(AuthContext);

  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About QuizPro</h1>
        <p className="hero-subtitle">A modern quiz platform for learning and assessment</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>What is QuizPro?</h2>
          <p>
            QuizPro is a comprehensive online quiz platform built with the MERN stack (MongoDB, Express.js, React, Node.js). 
            It provides an interactive environment for creating, taking, and managing quizzes with advanced features like 
            timed tests, progress tracking, and competitive leaderboards.
          </p>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📝</span>
              <h3>Interactive Quizzes</h3>
              <p>Create and take quizzes with multiple question types</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏱️</span>
              <h3>Timed Tests</h3>
              <p>Challenge yourself with time-limited quizzes</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h3>Progress Tracking</h3>
              <p>Monitor your performance with detailed analytics</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <h3>Leaderboards</h3>
              <p>Compete with others and climb the rankings</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👤</span>
              <h3>User Profiles</h3>
              <p>Manage your profile and view quiz history</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <h3>Dark Mode</h3>
              <p>Toggle between light and dark themes</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <h3>Frontend</h3>
              <ul>
                <li>React 18</li>
                <li>React Router DOM</li>
                <li>Chart.js</li>
                <li>Vite</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Backend</h3>
              <ul>
                <li>Node.js</li>
                <li>Express.js</li>
                <li>MongoDB</li>
                <li>JWT</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Authentication</h3>
              <ul>
                <li>JWT Tokens</li>
                <li>bcryptjs</li>
                <li>Protected Routes</li>
                <li>Role-based Access</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Developer Information</h2>
          <div className="dev-info">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:nitinkumargupta515@gmail.com" className="dev-link email-link">
                nitinkumargupta515@gmail.com
              </a>
            </p>
            <p>
              <strong>LinkedIn:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/nitin-kumar-gupta-0a5567373/"
                target="_blank"
                rel="noreferrer"
                className="dev-link icon-link"
                aria-label="LinkedIn Profile"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9h4v12H3V9zm7 0h3.8v1.71h.05c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94V21h-4V9z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </p>
            <p>
              <strong>GitHub:</strong>{" "}
              <a
                href="https://github.com/NitinGupta05"
                target="_blank"
                rel="noreferrer"
                className="dev-link icon-link"
                aria-label="GitHub Profile"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 .5a12 12 0 00-3.79 23.39c.6.11.82-.26.82-.57v-2.23c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 00-1.33-1.75c-1.08-.74.08-.73.08-.73a2.52 2.52 0 011.84 1.23 2.55 2.55 0 003.48 1 2.56 2.56 0 01.76-1.6c-2.66-.3-5.47-1.33-5.47-5.93A4.64 4.64 0 015.6 8.5a4.3 4.3 0 01.12-3.17s1-.32 3.3 1.22a11.3 11.3 0 016 0c2.3-1.54 3.3-1.22 3.3-1.22a4.3 4.3 0 01.12 3.17 4.63 4.63 0 011.23 3.2c0 4.61-2.82 5.62-5.5 5.92a2.87 2.87 0 01.82 2.22v3.29c0 .32.22.69.83.57A12 12 0 0012 .5z" />
                </svg>
                <span>GitHub</span>
              </a>
            </p>
          </div>
        </section>

        <section className="about-cta">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of learners and test your knowledge today!</p>
          <div className="cta-buttons">
            <Link to="/quizzes" className="btn btn-primary">Browse Quizzes</Link>
            {!user ? (
              <>
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-outline">Create Account</Link>
              </>
            ) : (
              <Link
                to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="btn btn-outline"
              >
                {user.role === "admin" ? "Go to Admin Dashboard" : "Go to Dashboard"}
              </Link>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .about-page { max-width: 1000px; margin: 0 auto; }
        .about-hero { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border-radius: var(--radius-lg); margin-bottom: 40px; }
        .about-hero h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .hero-subtitle { font-size: 1.2rem; opacity: 1; color: #f7fffd; font-weight: 500; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }
        .about-section { margin-bottom: 50px; }
        .about-section h2 { font-size: 1.8rem; margin-bottom: 20px; color: var(--primary); }
        .about-section p { line-height: 1.8; color: var(--text-secondary); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; }
        .feature-item { background: var(--surface); padding: 25px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); }
        .feature-icon { font-size: 2.5rem; display: block; margin-bottom: 15px; }
        .feature-item h3 { margin-bottom: 10px; }
        .feature-item p { font-size: 0.9rem; color: var(--text-secondary); }
        .tech-stack { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 25px; }
        .tech-item { background: var(--surface); padding: 25px; border-radius: var(--radius-lg); }
        .tech-item h3 { margin-bottom: 15px; color: var(--primary); }
        .tech-item ul { list-style: disc; padding-left: 20px; color: var(--text-secondary); }
        .tech-item li { margin-bottom: 5px; }
        .dev-info { background: var(--surface); padding: 25px; border-radius: var(--radius-lg); }
        .dev-info p { margin-bottom: 10px; }
        .dev-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }
        .dev-link:hover {
          text-decoration: underline;
        }
        .icon-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .icon-link svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        .about-cta { text-align: center; padding: 50px 20px; background: var(--surface); border-radius: var(--radius-lg); }
        .about-cta h2 { margin-bottom: 10px; }
        .about-cta p { margin-bottom: 25px; color: var(--text-secondary); }
        .cta-buttons { display: flex; gap: 15px; justify-content: center; }
      `}</style>
    </div>
  );
}

export default About;

