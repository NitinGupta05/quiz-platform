import { useState, useContext } from "react";
import { ModalContext } from "../context/ModalContext";
import { AuthContext } from "../context/AuthContext";

function LoginModal() {
  const { showLogin, closeLogin, switchToRegister } = useContext(ModalContext);
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!showLogin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      closeLogin();
      setEmail("");
      setPassword("");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={closeLogin}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeLogin}>
          &times;
        </button>

        <div className="modal-header">
          <h2>Welcome Back</h2>
          <p>Login to continue your quiz journey</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="modal-footer">
          <p>
            Don't have an account?{" "}
            <button className="link-btn" onClick={switchToRegister}>
              Register
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-card {
          background: var(--surface);
          border-radius: var(--radius-lg);
          padding: 30px;
          width: 100%;
          max-width: 400px;
          position: relative;
          animation: slideUp 0.3s ease;
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          line-height: 1;
        }

        .modal-close:hover {
          color: var(--text);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .modal-header h2 {
          margin-bottom: 5px;
        }

        .modal-header p {
          color: var(--text-secondary);
        }

        .modal-footer {
          text-align: center;
          margin-top: 20px;
        }

        .modal-footer p {
          color: var(--text-secondary);
        }

        .link-btn {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          font-weight: 500;
        }

        .link-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default LoginModal;

