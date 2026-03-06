import { useState } from "react";
import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import Header from "./Header";

function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const userLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "🏠" },
    { path: "/quizzes", label: "Quizzes", icon: "📝" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { path: "/progress", label: "Progress", icon: "📊" },
    { path: "/profile", label: "Profile", icon: "👤" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/about", label: "About", icon: "ℹ️" },
  ];

  const adminLinks = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/quizzes", label: "Manage Quizzes", icon: "📝" },
    { path: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { path: "/settings", label: "Settings", icon: "⚙️" },
    { path: "/about", label: "About", icon: "ℹ️" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-layout">
      <Header />

      <div className="layout-container">
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="sidebar-nav">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="link-icon">{link.icon}</span>
                <span className="link-label">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </div>

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .layout-container {
          display: flex;
          flex: 1;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 80px;
          left: 15px;
          z-index: 200;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          width: 45px;
          height: 45px;
          font-size: 1.25rem;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
        }

        .sidebar {
          width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 60px;
          height: calc(100vh - 60px);
          overflow-y: auto;
        }

        .sidebar-nav {
          padding: 20px 15px;
          flex: 1;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-md);
          margin-bottom: 5px;
          transition: var(--transition);
        }

        .sidebar-link:hover {
          background: var(--background);
          color: var(--text);
        }

        .sidebar-link.active {
          background: var(--primary);
          color: white;
        }

        .link-icon {
          font-size: 1.25rem;
        }

        .link-label {
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 15px;
          border-top: 1px solid var(--border);
        }

        .theme-toggle-btn,
        .logout-btn {
          width: 100%;
          padding: 12px 15px;
          text-align: left;
          background: none;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.95rem;
          color: var(--text-secondary);
          transition: var(--transition);
          margin-bottom: 8px;
        }

        .theme-toggle-btn:hover,
        .logout-btn:hover {
          background: var(--background);
          color: var(--text);
        }

        .main-content {
          flex: 1;
          padding: 30px;
          background: var(--background);
          min-height: calc(100vh - 60px);
        }

        @media (max-width: 900px) {
          .mobile-menu-btn {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            height: 100vh;
            z-index: 150;
            transition: left 0.3s ease;
            padding-top: 60px;
          }

          .sidebar.open {
            left: 0;
          }

          .main-content {
            padding: 20px 15px;
            padding-top: 80px;
          }
        }
      `}</style>
    </div>
  );
}

export default AppLayout;

