import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [loginType, setLoginType] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, adminLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state (where user was trying to go)
  const from = location.state?.from || "/dashboard";
  const isQuizAttempt = location.state?.quizAttempt;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = loginType === "admin"
        ? await adminLogin(email, password)
        : await login(email, password);

      if (!result.success) {
        throw new Error(result.message || "Login failed");
      }

      // Set session storage for redirect after login (user flow only).
      if (loginType === "user" && isQuizAttempt) {
        sessionStorage.setItem("redirectAfterLogin", "true");
        sessionStorage.setItem("quizAttemptPath", from);
      } else {
        sessionStorage.setItem("redirectAfterLogin", "false");
      }

      // The AuthHandler component in App.jsx will handle the redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="login-type-tabs">
        <button
          type="button"
          className={`tab-btn ${loginType === "user" ? "active" : ""}`}
          onClick={() => setLoginType("user")}
        >
          User Login
        </button>
        <button
          type="button"
          className={`tab-btn ${loginType === "admin" ? "active" : ""}`}
          onClick={() => setLoginType("admin")}
        >
          Admin Login
        </button>
      </div>

      <p className="login-hint">
        {loginType === "admin"
          ? "Use admin credentials to access /admin/dashboard."
          : "Use your student account credentials."}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Logging in..." : loginType === "admin" ? "Login as Admin" : "Login"}
      </button>

      <style>{`
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .login-type-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 4px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--background);
        }

        .tab-btn {
          padding: 10px 12px;
          border: none;
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .tab-btn.active {
          background: var(--primary);
          color: #fff;
        }

        .login-hint {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text);
        }

        .form-group input {
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          background: var(--background);
          color: var(--text);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .btn-primary {
          padding: 12px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .alert {
          padding: 12px;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
        }

        .alert-danger {
          background: #fee;
          color: var(--danger);
          border: 1px solid var(--danger);
        }
      `}</style>
    </form>
  );
}

export default Login;
