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

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "D" },
    { path: "/admin/quizzes", label: "Manage Quizzes", icon: "Q" },
    { path: "/admin/users", label: "Manage Students", icon: "U" },
    { path: "/admin/analytics", label: "Analytics", icon: "A" },
    { path: "/admin/settings", label: "Settings", icon: "S" },
    { path: "/admin/about", label: "About", icon: "I" },
  ];

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

  const handleNavItemClick = () => {
    if (isCompactLayout) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout-shell">
      {isCompactLayout && sidebarOpen && (
        <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`app-sidebar admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div>
            <span className="sidebar-kicker">Admin Console</span>
            <h2>QuizPro</h2>
          </div>
          {isCompactLayout && (
            <button className="sidebar-close-btn" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
              Close
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
              <span className="nav-icon icon-chip">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar admin-topbar">
          <div className="topbar-left">
            {isCompactLayout && (
              <button className="menu-btn" onClick={() => setSidebarOpen((prev) => !prev)} aria-label="Toggle navigation menu">
                Menu
              </button>
            )}
            <NavLink to="/admin/dashboard" className="brand">QuizPro</NavLink>
            <span className="mode-pill">Admin Mode</span>
          </div>

          <div className="topbar-right">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? "Light" : "Dark"}
            </button>

            <div className="profile-wrap" ref={dropdownRef}>
              <button className="profile-trigger" onClick={() => setProfileOpen((prev) => !prev)} aria-label="Admin profile menu">
                <span className="avatar admin-avatar">A</span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-head">
                    <p>{user?.name}</p>
                    <span>Administrator</span>
                  </div>
                  <button onClick={() => { setProfileOpen(false); navigate("/admin/profile"); }}>Admin Profile</button>
                  <button onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}>Settings</button>
                  <button className="danger" onClick={() => { setProfileOpen(false); handleLogout(); }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content"><Outlet /></div>
      </main>

      <style>{`
        .admin-layout-shell { display: flex; min-height: 100vh; background: var(--background); overflow-x: clip; }
        .app-sidebar {
          width: 286px; background: linear-gradient(180deg, var(--surface), var(--background-elevated)); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; position: fixed; left: 0; top: 0; height: 100vh; transition: transform 0.25s ease; z-index: 120;
        }
        .admin-sidebar { box-shadow: inset -1px 0 0 rgba(15, 23, 42, 0.03); }
        .sidebar-header { padding: 24px 20px 18px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); }
        .sidebar-kicker { display: inline-block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--secondary); margin-bottom: 8px; font-weight: 700; }
        .sidebar-header h2 { color: var(--primary); font-size: 1.4rem; }
        .sidebar-close-btn, .menu-btn {
          display: inline-flex; align-items: center; justify-content: center; min-width: 70px; height: 40px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--background-elevated); color: var(--text); font-size: 0.82rem; font-weight: 700; cursor: pointer;
        }
        .sidebar-nav { flex: 1; padding: 18px 14px; overflow-y: auto; }
        .nav-link {
          display: flex; align-items: center; gap: 12px; padding: 12px 14px; color: var(--text-secondary); text-decoration: none;
          border-radius: var(--radius-md); margin-bottom: 6px; transition: var(--transition);
        }
        .nav-link:hover { background: var(--surface-hover); color: var(--text); }
        .nav-link.active {
          background: linear-gradient(135deg, #d97706, #b45309); color: white; box-shadow: 0 12px 24px rgba(180, 83, 9, 0.2);
        }
        .nav-link.active .nav-icon { background: rgba(255,255,255,0.16); color: white; }
        .nav-icon {
          min-width: 38px;
          width: 38px;
          height: 38px;
          padding: 0;
          font-size: 0.82rem;
          letter-spacing: 0;
        }
        .nav-label {
          font-weight: 600;
        }
        .main-content { flex: 1; min-width: 0; margin-left: 286px; transition: margin-left 0.25s ease; }
        .topbar {
          display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px clamp(14px, 2.4vw, 24px);
          background: var(--chrome-bg); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 90;
        }
        .admin-topbar { background: var(--chrome-admin-bg); }
        .topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
        .brand { text-decoration: none; color: var(--text); font-weight: 800; letter-spacing: 0.02em; }
        .mode-pill {
          border: 1px solid rgba(217, 119, 6, 0.3); background: rgba(217, 119, 6, 0.12); color: #9a3412; font-weight: 700;
          font-size: 0.75rem; padding: 6px 10px; border-radius: 999px; white-space: nowrap;
        }
        .topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .icon-btn {
          min-width: 72px; height: 40px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; color: var(--text); font-weight: 700;
        }
        .profile-wrap { position: relative; }
        .profile-trigger { border: none; background: none; cursor: pointer; padding: 0; }
        .avatar { width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; color: #fff; }
        .admin-avatar { background: linear-gradient(135deg, #d97706, #b45309); box-shadow: 0 10px 20px rgba(180, 83, 9, 0.22); }
        .profile-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px); min-width: min(240px, calc(100vw - 24px)); background: var(--surface);
          border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.16); overflow: hidden; z-index: 110;
        }
        .dropdown-head { padding: 12px 14px; border-bottom: 1px solid var(--border); }
        .dropdown-head p { margin: 0; font-weight: 700; color: var(--text); }
        .dropdown-head span { font-size: 0.8rem; color: var(--text-secondary); }
        .profile-dropdown button { width: 100%; text-align: left; border: none; background: transparent; color: var(--text); padding: 11px 14px; cursor: pointer; }
        .profile-dropdown button:hover { background: var(--surface-hover); }
        .profile-dropdown .danger { color: var(--danger); }
        .menu-btn { display: none; }
        .sidebar-backdrop { display: none; }
        .content { padding: clamp(16px, 2.5vw, 28px); min-width: 0; overflow-x: hidden; }
        @media (max-width: 1024px) {
          .app-sidebar { transform: translateX(-100%); width: min(300px, 84vw); }
          .app-sidebar.open { transform: translateX(0); box-shadow: 0 16px 36px rgba(15, 23, 42, 0.22); }
          .main-content { margin-left: 0; }
          .menu-btn { display: inline-flex; }
          .sidebar-backdrop { display: block; position: fixed; inset: 0; background: rgba(9, 16, 24, 0.42); border: none; cursor: pointer; z-index: 110; }
        }
        @media (min-width: 1025px) { .sidebar-close-btn { display: none; } }
        @media (max-width: 620px) { .mode-pill { display: none; } }
        @media (max-width: 480px) { .brand { max-width: 96px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .topbar { padding-inline: 10px; } }
      `}</style>
    </div>
  );
}

export default AdminLayout;
