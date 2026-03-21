import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const featureItems = [
  {
    label: "Quiz",
    title: "Interactive quizzes",
    description: "Create and attempt structured quizzes with a flow designed for clarity and speed.",
  },
  {
    label: "Timer",
    title: "Timed assessments",
    description: "Simulate real test pressure with countdown-based sessions and automatic submission.",
  },
  {
    label: "Track",
    title: "Progress tracking",
    description: "Review history, accuracy, and category performance from a personal dashboard.",
  },
  {
    label: "Rank",
    title: "Leaderboard competition",
    description: "Compare results with other users and keep pushing for stronger quiz performance.",
  },
  {
    label: "Theme",
    title: "Theme support",
    description: "Switch between light and dark mode without sacrificing readability or consistency.",
  },
  {
    label: "Admin",
    title: "Admin workflows",
    description: "Manage quizzes, users, and analytics from an admin-facing dashboard interface.",
  },
];

const stackGroups = [
  {
    title: "Frontend",
    items: ["React 18", "React Router", "Vite", "Chart.js"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express.js", "MongoDB", "REST APIs"],
  },
  {
    title: "Security & auth",
    items: ["JWT auth", "bcryptjs", "Protected routes", "Role-based access"],
  },
];

function About() {
  const { user } = useContext(AuthContext);

  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="section-kicker">About the project</span>
        <h1>QuizPro is a MERN-based quiz platform built for learning and assessment.</h1>
        <p>
          It combines public quiz discovery, secure authentication, timed quiz attempts, student progress
          views, and admin-side content management in one deployed full-stack application.
        </p>
      </section>

      <section className="about-grid">
        <article className="card about-story">
          <span className="section-kicker subdued">What it does</span>
          <h2>From quick practice to admin operations</h2>
          <p>
            QuizPro is designed to handle the full flow: users sign in, discover quizzes, take timed
            assessments, review results, and track growth. Admins can manage the quiz library and monitor
            platform usage through analytics.
          </p>
          <div className="story-pills">
            <span className="meta-pill">Role-based auth</span>
            <span className="meta-pill">Timed quiz engine</span>
            <span className="meta-pill">Analytics dashboard</span>
          </div>
        </article>

        <article className="card contact-card">
          <span className="section-kicker subdued">Developer</span>
          <h2>Nitin Kumar Gupta</h2>
          <p>Built and deployed as a full-stack student project using Vercel, Render, and MongoDB Atlas.</p>
          <div className="contact-list">
            <a href="mailto:nitinkumargupta515@gmail.com" className="contact-link">nitinkumargupta515@gmail.com</a>
            <a
              href="https://www.linkedin.com/in/nitin-kumar-gupta-0a5567373/"
              target="_blank"
              rel="noreferrer"
              className="contact-link with-icon"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9h4v12H3V9zm7 0h3.8v1.71h.05c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.56c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.13 1.45-2.13 2.94V21h-4V9z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="https://github.com/NitinGupta05"
              target="_blank"
              rel="noreferrer"
              className="contact-link with-icon"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 .5a12 12 0 00-3.79 23.39c.6.11.82-.26.82-.57v-2.23c-3.34.73-4.04-1.61-4.04-1.61a3.18 3.18 0 00-1.33-1.75c-1.08-.74.08-.73.08-.73a2.52 2.52 0 011.84 1.23 2.55 2.55 0 003.48 1 2.56 2.56 0 01.76-1.6c-2.66-.3-5.47-1.33-5.47-5.93A4.64 4.64 0 015.6 8.5a4.3 4.3 0 01.12-3.17s1-.32 3.3 1.22a11.3 11.3 0 016 0c2.3-1.54 3.3-1.22 3.3-1.22a4.3 4.3 0 01.12 3.17 4.63 4.63 0 011.23 3.2c0 4.61-2.82 5.62-5.5 5.92a2.87 2.87 0 01.82 2.22v3.29c0 .32.22.69.83.57A12 12 0 0012 .5z" />
              </svg>
              GitHub
            </a>
          </div>
        </article>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Core features</span>
            <h2>What the platform supports</h2>
          </div>
          <p>Each part of the product is built around a real user flow instead of placeholder pages.</p>
        </div>
        <div className="feature-grid">
          {featureItems.map((feature) => (
            <article key={feature.title} className="card feature-card">
              <span className="icon-chip">{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="stack-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Tech stack</span>
            <h2>What powers the app</h2>
          </div>
        </div>
        <div className="stack-grid">
          {stackGroups.map((group) => (
            <article key={group.title} className="card stack-card">
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="card about-cta">
        <div>
          <span className="section-kicker subdued">Next step</span>
          <h2>Ready to explore the platform?</h2>
          <p>Browse the quiz library or sign in to start tracking attempts and scores.</p>
        </div>
        <div className="cta-buttons">
          <Link to="/quizzes" className="btn btn-primary">Browse quizzes</Link>
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-outline">Create account</Link>
            </>
          ) : (
            <Link
              to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
              className="btn btn-outline"
            >
              {user.role === "admin" ? "Go to admin dashboard" : "Go to dashboard"}
            </Link>
          )}
        </div>
      </section>

      <style>{`
        .about-page {
          max-width: var(--page-width);
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }
        .section-kicker {
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
        .subdued {
          background: var(--surface-muted);
          color: var(--text-secondary);
        }
        .about-hero {
          padding: 36px;
          border-radius: 30px;
          background:
            linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(217, 119, 6, 0.08)),
            var(--surface);
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .about-hero h1 {
          font-size: clamp(2rem, 4vw, 3.4rem);
          max-width: 18ch;
          margin-bottom: 12px;
        }
        .about-hero p {
          max-width: 64ch;
          font-size: 1rem;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 20px;
        }
        .about-story,
        .contact-card,
        .feature-card,
        .stack-card,
        .about-cta {
          border-radius: 26px;
        }
        .about-story h2,
        .contact-card h2,
        .about-cta h2,
        .section-heading h2 {
          margin-bottom: 10px;
        }
        .story-pills,
        .cta-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }
        .meta-pill {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--surface-muted);
          color: var(--text);
          font-size: 0.88rem;
          font-weight: 600;
          border: 1px solid rgba(15, 23, 42, 0.06);
        }
        .contact-list {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }
        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 16px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: var(--background-elevated);
          color: var(--text);
          font-weight: 600;
        }
        .contact-link:hover {
          color: var(--primary-dark);
          border-color: rgba(15, 118, 110, 0.2);
        }
        .with-icon svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        .feature-section,
        .stack-section {
          display: grid;
          gap: 20px;
        }
        .section-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 20px;
        }
        .section-heading p {
          max-width: 46ch;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .feature-card h3,
        .stack-card h3 {
          margin: 16px 0 10px;
        }
        .stack-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .stack-card ul {
          list-style: none;
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }
        .stack-card li {
          padding: 10px 12px;
          border-radius: 14px;
          background: var(--background-elevated);
          color: var(--text-secondary);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }
        .about-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .about-grid,
          .feature-grid,
          .stack-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .about-hero,
          .about-story,
          .contact-card,
          .feature-card,
          .stack-card,
          .about-cta {
            padding: 18px;
            border-radius: 20px;
          }
          .about-grid,
          .feature-grid,
          .stack-grid {
            grid-template-columns: 1fr;
          }
          .section-heading,
          .about-cta {
            flex-direction: column;
            align-items: flex-start;
          }
          .about-hero h1 {
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}

export default About;
