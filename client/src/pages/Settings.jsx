import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

function Settings() {
  const { logout, user } = useContext(AuthContext);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to change password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server error" });
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-sections">
        {/* Change Password */}
        <div className="settings-card">
          <h2>Change Password</h2>
          {message.text && (
            <div className={`alert ${message.type}`}>{message.text}</div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        </div>

        {/* Account Actions */}
        <div className="settings-card">
          <h2>Account</h2>
          <p className="text-secondary">Logged in as: {user?.email}</p>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <style>{`
        .settings-page { max-width: 700px; margin: 0 auto; }
        .page-header { margin-bottom: 30px; }
        .page-header h1 { font-size: 2rem; }
        .settings-sections { display: flex; flex-direction: column; gap: 25px; }
        .settings-card { background: var(--surface); padding: 30px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
        .settings-card h2 { margin-bottom: 20px; font-size: 1.25rem; }
        .alert { padding: 12px; border-radius: var(--radius-md); margin-bottom: 20px; }
        .alert.success { background: rgba(76, 175, 80, 0.1); color: #4CAF50; border: 1px solid #4CAF50; }
        .alert.error { background: rgba(244, 67, 54, 0.1); color: #f44336; border: 1px solid #f44336; }
        .text-secondary { color: var(--text-secondary); margin-bottom: 15px; }

        @media (max-width: 768px) {
          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .settings-card {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Settings;

