import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { formatDateDDMMYYYY } from "../utils/formatDate";
import { getCurrentUserProfile, getProgress, updateCurrentUserProfile } from "../services/userService";

const MAX_PROFILE_IMAGE_BYTES = 1.5 * 1024 * 1024;

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
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: "",
    gender: "",
    dob: "",
    image: "",
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
      setErrorMessage("");
      const [profileData, progressData] = await Promise.all([getCurrentUserProfile(), getProgress()]);

      setProfile(profileData);
      setStats({
        totalQuizzesTaken: progressData?.totalQuizzesTaken || 0,
        averageScore: progressData?.averageScore || 0,
        overallAccuracy: progressData?.overallAccuracy || 0,
      });
      setFormData({
        name: profileData.name || "",
        phone: profileData.phone || "",
        country: profileData.country || "",
        gender: profileData.gender || "",
        dob: profileData.dob ? profileData.dob.split("T")[0] : "",
        image: profileData.image || "",
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setErrorMessage(error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setErrorMessage("Profile image must be smaller than 1.5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setErrorMessage("");
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read the selected image");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setErrorMessage("");
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      country: profile?.country || "",
      gender: profile?.gender || "",
      dob: profile?.dob ? profile.dob.split("T")[0] : "",
      image: profile?.image || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage("");
      const updatedProfile = await updateCurrentUserProfile(formData);
      updateUser(updatedProfile);
      setEditing(false);
      setProfile(updatedProfile);
      await refreshProfileData();
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrorMessage(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const previewImage = editing ? formData.image : profile?.image;

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Your account</span>
          <h1>Profile</h1>
        </div>
        <div className="header-actions">
          <Link to={dashboardPath} className="btn btn-outline">Back to Dashboard</Link>
          <button className="btn btn-outline" onClick={() => (editing ? handleCancelEdit() : setEditing(true))}>
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-hero">
            <div className="profile-avatar">
              {previewImage ? (
                <img src={previewImage} alt={profile?.name} />
              ) : (
                <span>{profile?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="profile-headline">
              <h2>{profile?.name}</h2>
              <p>{profile?.email}</p>
              <span className="role-pill">{profile?.role}</span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="image-upload-panel">
                <div>
                  <h3>Profile picture</h3>
                  <p>Upload a square image to show up in the leaderboard and app header.</p>
                </div>
                <div className="image-actions">
                  <label className="btn btn-outline upload-btn">
                    Choose Image
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                  {formData.image && (
                    <button type="button" className="btn btn-outline" onClick={handleRemoveImage}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="form-grid">
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
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
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
        .profile-page { max-width: 980px; margin: 0 auto; display: grid; gap: 24px; }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          padding: 7px 12px;
          border-radius: 999px;
          background: var(--primary-soft);
          color: var(--primary-dark);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .page-header { display: flex; justify-content: space-between; align-items: end; gap: 16px; }
        .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .page-header h1 { font-size: 2.2rem; }
        .profile-content { display: grid; gap: 24px; }
        .profile-card,
        .stats-card {
          background: linear-gradient(180deg, var(--surface), var(--background-elevated));
          padding: 28px;
          border-radius: 24px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.05);
        }
        .profile-hero {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 24px;
        }
        .profile-avatar {
          width: 128px;
          height: 128px;
          border-radius: 32px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 16px 28px rgba(15, 118, 110, 0.2);
        }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-avatar span { font-size: 3rem; color: white; font-weight: 700; }
        .profile-headline h2 { margin-bottom: 6px; }
        .profile-headline p { margin-bottom: 10px; }
        .role-pill {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--surface-muted);
          color: var(--text);
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: capitalize;
        }
        .image-upload-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px;
          margin-bottom: 18px;
          border-radius: 18px;
          background: var(--surface);
          border: 1px solid var(--border);
        }
        .image-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .upload-btn {
          cursor: pointer;
        }
        .profile-form { display: grid; gap: 16px; }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .profile-info { display: grid; gap: 4px; }
        .info-item {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }
        .info-item .label { color: var(--text-secondary); }
        .info-item .value { font-weight: 600; text-align: right; }
        .stats-card h3 { margin-bottom: 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .stat-item {
          text-align: center;
          padding: 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
        }
        .stat-value { display: block; font-size: 2rem; font-weight: 700; color: var(--primary-dark); }
        .stat-label { color: var(--text-secondary); font-size: 0.9rem; }
        @media (max-width: 768px) {
          .page-header,
          .profile-hero,
          .image-upload-panel {
            align-items: flex-start;
            flex-direction: column;
          }
          .form-grid,
          .stats-grid { grid-template-columns: 1fr; }
          .profile-card,
          .stats-card { padding: 18px; border-radius: 20px; }
          .profile-avatar { width: 108px; height: 108px; border-radius: 26px; }
          .info-item { flex-direction: column; }
          .info-item .value { text-align: left; }
        }
      `}</style>
    </div>
  );
}

export default Profile;
