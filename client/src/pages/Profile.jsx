import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { formatDateDDMMYYYY } from "../utils/formatDate";
import { API_BASE_URL } from "../config/api";

function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    overallAccuracy: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: "",
    gender: "",
    dob: "",
  });

  useEffect(() => {
    refreshProfileData();

    const handleQuizSubmitted = () => {
      refreshProfileData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshProfileData();
      }
    };

    const handleWindowFocus = () => {
      refreshProfileData();
    };

    window.addEventListener("quiz-submitted", handleQuizSubmitted);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("quiz-submitted", handleQuizSubmitted);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const refreshProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [profileRes, progressRes] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/user/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const data = await profileRes.json();
      const progressData = await progressRes.json();

      setProfile(data);
      setStats({
        totalQuizzesTaken: progressData?.totalQuizzesTaken || 0,
        averageScore: progressData?.averageScore || 0,
        overallAccuracy: progressData?.overallAccuracy || 0,
      });
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        country: data.country || "",
        gender: data.gender || "",
        dob: data.dob ? data.dob.split("T")[0] : "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        updateUser(formData);
        setEditing(false);
        refreshProfileData();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <div className="header-actions">
          <Link to={dashboardPath} className="btn btn-outline">Back to Dashboard</Link>
          <button className="btn btn-outline" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {profile?.image ? (
              <img src={profile.image} alt={profile.name} />
            ) : (
              <span>{profile?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={profile?.email || ""} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="label">Name</span>
                <span className="value">{profile?.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone</span>
                <span className="value">{profile?.phone || "Not set"}</span>
              </div>
              <div className="info-item">
                <span className="label">Country</span>
                <span className="value">{profile?.country || "Not set"}</span>
              </div>
              <div className="info-item">
                <span className="label">Gender</span>
                <span className="value">{profile?.gender || "Not set"}</span>
              </div>
              <div className="info-item">
                <span className="label">Date of Birth</span>
                <span className="value">{profile?.dob ? formatDateDDMMYYYY(profile.dob) : "Not set"}</span>
              </div>
              <div className="info-item">
                <span className="label">Role</span>
                <span className="value badge">{profile?.role}</span>
              </div>
              <div className="info-item">
                <span className="label">Member Since</span>
                <span className="value">{formatDateDDMMYYYY(profile?.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="stats-card">
          <h3>Quiz Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.totalQuizzesTaken}</span>
              <span className="stat-label">Total Attempts</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.averageScore}%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.overallAccuracy}%</span>
              <span className="stat-label">Overall Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page { max-width: 900px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .header-actions { display: flex; gap: 10px; }
        .page-header h1 { font-size: 2rem; }
        .profile-content { display: grid; gap: 25px; }
        .profile-card { background: var(--surface); padding: 30px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
        .profile-avatar { width: 120px; height: 120px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; overflow: hidden; }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-avatar span { font-size: 3rem; color: white; font-weight: 600; }
        .profile-form { max-width: 400px; margin: 0 auto; }
        .profile-info { max-width: 400px; margin: 0 auto; }
        .info-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .info-item .label { color: var(--text-secondary); }
        .info-item .value { font-weight: 500; }
        .info-item .badge { background: var(--primary); color: white; padding: 2px 10px; border-radius: var(--radius-full); font-size: 0.85rem; text-transform: capitalize; }
        .stats-card { background: var(--surface); padding: 25px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
        .stats-card h3 { margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
        .stat-item { text-align: center; padding: 20px; background: var(--background); border-radius: var(--radius-md); }
        .stat-value { display: block; font-size: 2rem; font-weight: 600; color: var(--primary); }
        .stat-label { color: var(--text-secondary); font-size: 0.9rem; }

        @media (max-width: 768px) {
          .page-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 1.5rem;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .header-actions .btn {
            flex: 1;
            min-width: 140px;
          }

          .profile-card,
          .stats-card {
            padding: 16px;
          }

          .profile-form,
          .profile-info {
            max-width: 100%;
          }

          .info-item {
            gap: 12px;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;

