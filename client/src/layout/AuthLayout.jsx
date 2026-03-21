import { useContext } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>QuizPro</h1>
            <p>{isRegister ? "Create your account" : "Welcome back!"}</p>
          </div>
          <div key={location.pathname}>
            <Outlet />
          </div>
          <div className="auth-footer">
            <p>
              {isRegister ? (
                <>
                  Already have an account?{" "}
                  <Link to="/login">Login</Link>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link to="/register">Register</Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-layout {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%);
          padding: 20px;
        }

        .auth-container {
          width: 100%;
          max-width: 450px;
        }

        .auth-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-header h1 {
          color: var(--primary);
          margin-bottom: 10px;
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-footer {
          text-align: center;
          margin-top: 20px;
        }

        .auth-footer p {
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default AuthLayout;
