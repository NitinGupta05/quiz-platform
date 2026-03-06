import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const userLinks = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/quizzes", icon: "📝", label: "Quizzes" },
    { path: "/leaderboard", icon: "🏆", label: "Leaderboard" },
    { path: "/progress", icon: "📊", label: "Progress" },
    { path: "/profile", icon: "👤", label: "Profile" },
    { path: "/about", icon: "ℹ️", label: "About" },
  ];

  const adminLinks = [
    { path: "/admin", icon: "📊", label: "Dashboard" },
    { path: "/admin/quizzes", icon: "📝", label: "Manage Quizzes" },
    { path: "/admin/users", icon: "👥", label: "Manage Users" },
    { path: "/admin/analytics", icon: "📈", label: "Analytics" },
    { path: "/admin/settings", icon: "⚙️", label: "Settings" },
    { path: "/about", icon: "ℹ️", label: "About" },
  ];

  const links = user?.role === "admin" ? adminLinks : userLinks;

  return (
    <>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>{user?.role === "admin" ? "Admin Panel" : "Menu"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? "active" : ""}`}
              onClick={onClose}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        {user && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                {user.image ? (
                  <img src={user.image} alt={user.name} />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="user-details">
                <p className="user-name">{user.name}</p>
                <p className="user-role">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <style>{`
        .sidebar {
          width: 260px;
          background-color: var(--surface);
          border-right: 1px solid var(--border);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          z-index: 200;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md) var(--spacing-lg);
          border-bottom: 1px solid var(--border);
        }

        .sidebar-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--primary);
        }

        .close-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--text);
          padding: var(--spacing-xs);
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--spacing-md);
          overflow-y: auto;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          color: var(--text);
          text-decoration: none;
          transition: var(--transition);
          margin-bottom: var(--spacing-xs);
        }

        .nav-link:hover {
          background-color: var(--surface-hover);
          color: var(--primary);
        }

        .nav-link.active {
          background-color: var(--primary);
          color: white;
        }

        .nav-icon {
          font-size: 1.25rem;
        }

        .nav-label {
          font-weight: 500;
        }

        .sidebar-footer {
          padding: var(--spacing-md);
          border-top: 1px solid var(--border);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-avatar span {
          color: white;
          font-weight: 600;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .close-btn {
            display: block;
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;

