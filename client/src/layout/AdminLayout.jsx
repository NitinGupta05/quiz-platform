import { useState, useContext, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const TABLET_BREAKPOINT = 1024;

function getViewportWidth() {
  if (typeof window === "undefined") return 1440;
  return window.innerWidth;
}

function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);
  const [sidebarOpen, setSidebarOpen] = useState(getViewportWidth() > TABLET_BREAKPOINT);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const wasDesktopRef = useRef(viewportWidth > TABLET_BREAKPOINT);

  const isDesktop = viewportWidth > TABLET_BREAKPOINT;
  const isCompactLayout = !isDesktop;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(true);
    } else if (wasDesktopRef.current) {
      setSidebarOpen(false);
    }

    wasDesktopRef.current = isDesktop;
  }, [isDesktop]);

  useEffect(() => {
    if (!isCompactLayout) return undefined;

    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCompactLayout, sidebarOpen]);

  useEffect(() => {
    if (!isCompactLayout || !sidebarOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCompactLayout, sidebarOpen]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/quizzes", label: "Manage Quizzes", icon: "📝" },
    { path: "/admin/users", label: "Manage Students", icon: "👥" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
    { path: "/admin/about", label: "About", icon: "ℹ️" },
  ];

  const handleNavItemClick = () => {
    if (isCompactLayout) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {isCompactLayout && sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>QuizPro Admin</h2>
          {isCompactLayout && (
            <button
              className="sidebar-close-btn"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={handleNavItemClick}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            {isCompactLayout && (
              <button
                className="menu-btn"
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>
            )}
            <NavLink to="/admin/dashboard" className="brand">
              QuizPro
            </NavLink>
            <span className="mode-pill">Admin Mode</span>
          </div>

          <div className="topbar-right">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? "☀️" : "🌙"}
            </button>

            <div className="profile-wrap" ref={dropdownRef}>
              <button
                className="profile-trigger"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Admin profile menu"
              >
                <span className="avatar admin-avatar">A</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-head">
                    <p>{user?.name}</p>
                    <span>Administrator</span>
                  </div>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/profile");
                    }}
                  >
                    Admin Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/admin/settings");
                    }}
                  >
                    Settings
                  </button>
                  <button
                    className="danger"
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
          overflow-x: clip;
        }

        .sidebar {
          width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          transition: transform 0.25s ease;
          z-index: 120;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }

        .sidebar-header h2 {
          color: var(--primary);
          font-size: 1.1rem;
        }

        .sidebar-close-btn,
        .menu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--text);
          font-size: 1.2rem;
          cursor: pointer;
        }

        .sidebar-nav {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
        }

        .nav-link {
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

        .nav-link:hover {
          background: var(--surface-hover);
          color: var(--text);
        }

        .nav-link.active {
          background: var(--primary);
          color: white;
        }

        .main-content {
          flex: 1;
          min-width: 0;
          margin-left: 260px;
          transition: margin-left 0.25s ease;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px clamp(12px, 2.4vw, 20px);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .brand {
          text-decoration: none;
          color: var(--text);
          font-weight: 700;
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mode-pill {
          border: 1px solid #f59e0b55;
          background: #f59e0b22;
          color: #b45309;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--background);
          cursor: pointer;
        }

        .profile-wrap {
          position: relative;
        }

        .profile-trigger {
          border: none;
          background: none;
          cursor: pointer;
          padding: 0;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 700;
          color: #fff;
        }

        .admin-avatar {
          background: linear-gradient(135deg, #f97316, #ea580c);
          border: 2px solid #fed7aa;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          min-width: min(220px, calc(100vw - 24px));
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 110;
        }

        .dropdown-head {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
        }

        .dropdown-head p {
          margin: 0;
          font-weight: 600;
        }

        .dropdown-head span {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .profile-dropdown button {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          color: var(--text);
          padding: 10px 12px;
          cursor: pointer;
        }

        .profile-dropdown button:hover {
          background: var(--surface-hover);
        }

        .profile-dropdown .danger {
          color: var(--danger);
        }

        .menu-btn {
          display: none;
        }

        .sidebar-backdrop {
          display: none;
        }

        .content {
          padding: clamp(16px, 2.5vw, 25px);
          min-width: 0;
          overflow-x: hidden;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            width: min(280px, 82vw);
            box-shadow: none;
          }

          .sidebar.open {
            transform: translateX(0);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
          }

          .main-content {
            margin-left: 0;
          }

          .menu-btn {
            display: inline-flex;
          }

          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.35);
            border: none;
            cursor: pointer;
            z-index: 110;
          }
        }

        @media (min-width: 1025px) {
          .sidebar-close-btn {
            display: none;
          }
        }

        @media (max-width: 620px) {
          .mode-pill {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .brand {
            max-width: 96px;
          }

          .topbar {
            padding-inline: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
