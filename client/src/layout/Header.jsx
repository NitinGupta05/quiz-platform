import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

function Header() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/register");

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">Quiz</span>
          <span className="logo-text">QuizPro</span>
        </Link>

        <nav className="header-nav">
          <Link to="/quizzes" className="nav-link">Quizzes</Link>
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
          <Link to="/about" className="nav-link">About</Link>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {isDark ? "Light" : "Dark"}
          </button>

          {user ? (
            <div className="user-menu">
              <Link to={user.role === "admin" ? "/admin/profile" : "/profile"} className="user-btn">
                <div className="user-avatar">
                  {user.image ? (
                    <img src={user.image} alt={user.name} />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="user-name">{user.name}</span>
              </Link>
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-sm btn-outline" onClick={handleLogin}>Login</button>
              <button className="btn btn-sm btn-primary" onClick={handleRegister}>Register</button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 54px;
          height: 32px;
          border-radius: 999px;
          background: var(--background);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .header-nav {
          display: flex;
          gap: 25px;
        }

        .nav-link {
          color: var(--text-secondary);
          font-weight: 500;
          transition: var(--transition);
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .theme-toggle {
          background: none;
          border: 1px solid var(--border);
          font-size: 0.85rem;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          transition: var(--transition);
        }

        .theme-toggle:hover {
          background: var(--background);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-name {
          color: var(--text);
          font-weight: 500;
        }

        .auth-buttons {
          display: flex;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .header-nav {
            display: none;
          }

          .user-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
