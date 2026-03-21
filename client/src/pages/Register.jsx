import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await register(name, email, password);
      if (!result.success) {
        throw new Error(result.message || "Registration failed");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <input type="text" name="fake_username" autoComplete="username" style={{ display: "none" }} tabIndex={-1} />
      <input type="password" name="fake_password" autoComplete="new-password" style={{ display: "none" }} tabIndex={-1} />
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          name="register_name"
          autoComplete="off"
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          name="register_email"
          autoComplete="off"
          required
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password"
          name="register_password"
          autoComplete="new-password"
          required
        />
      </div>

      <div className="form-group">
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          name="register_confirm_password"
          autoComplete="new-password"
          required
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </button>

      <style>{`
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
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
          margin-top: 10px;
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

export default Register;
