import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AdminLogin() {
  const { adminLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await adminLogin(email, password);

    if (result.success) {
      navigate("/admin");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Login</h1>
          <p>Enter your admin credentials</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">Back to Home</a>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          padding: 20px;
        }

        .login-card {
          background: var(--surface);
          padding: 40px;
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-lg);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          font-size: 1.75rem;
          margin-bottom: 5px;
        }

        .login-header p {
          color: var(--text-secondary);
        }

        .alert {
          padding: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
        }

        .alert-error {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
          border: 1px solid #f44336;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
        }

        .login-footer a {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;

