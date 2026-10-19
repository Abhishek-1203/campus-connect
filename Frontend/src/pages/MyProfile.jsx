
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import AvatarPicker from "../components/AvatarPicker";
import "../styles/Dashboard.css";

const DEFAULT_AVATAR = "avatar1";

export default function MyProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/profile/me");
      const data =
        response.data.profile ||
        response.data.user ||
        response.data;

      setProfile({
        ...data,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
      });

      const savedAvatar = localStorage.getItem("campusconnect_avatar");
      setAvatar(savedAvatar || DEFAULT_AVATAR);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.put("/profile/me", {
        name: profile.name,
      });

      const data =
        response.data.profile ||
        response.data.user ||
        response.data;

      setProfile((current) => ({
        ...current,
        ...data,
        name: data.name || current.name,
        email: data.email || current.email,
      }));

      localStorage.setItem("campusconnect_avatar", avatar);

      setEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading your profile...</p>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-brand">My Profile</h1>
          <p className="dashboard-welcome">
            Manage your personal information and avatar.
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            className="dashboard-button"
            onClick={() => {
              setMessage("");
              setEditing(true);
            }}
          >
            Edit Profile
          </button>
        )}
      </header>

      <div className="dashboard-content">
        {error && <p className="dashboard-error">{error}</p>}
        {message && <p className="dashboard-success">{message}</p>}

        <section className="dashboard-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div
              aria-label="Selected profile avatar"
              style={{
                width: "92px",
                height: "92px",
                borderRadius: "50%",
                background: "#d9f1e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "54px",
              }}
            >
              {({
                avatar1: "👨🏻‍🎓",
                avatar2: "👩🏻‍🎓",
                avatar3: "👨🏽‍🎓",
                avatar4: "👩🏽‍🎓",
                avatar5: "👨🏿‍🎓",
                avatar6: "👩🏿‍🎓",
                avatar7: "🧑🏻‍💻",
                avatar8: "🧑🏽‍💻",
                avatar9: "🧑🏿‍💻",
                avatar10: "🧑🏻‍🎨",
                avatar11: "🧑🏽‍🎨",
                avatar12: "🧑🏿‍🎨",
              })[avatar] || "👨🏻‍🎓"}
            </div>

            <div>
              <h2>{profile.name || "Student"}</h2>
              <p>{profile.email || "Email not available"}</p>
              {profile.role && <p>Account type: {profile.role}</p>}
            </div>
          </div>
        </section>

        {editing ? (
          <form className="dashboard-form" onSubmit={handleSave}>
            <div className="dashboard-card">
              <h2>Edit Personal Information</h2>

              <AvatarPicker value={avatar} onChange={setAvatar} />

              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                required
                maxLength={100}
              />

              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                disabled
              />

              <div className="dashboard-form-actions">
                <button
                  type="submit"
                  className="dashboard-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="dashboard-button"
                  disabled={saving}
                  onClick={() => {
                    setEditing(false);
                    setError("");
                    loadProfile();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <section className="dashboard-card">
            <h2>Personal Information</h2>
            <p>
              <strong>Full Name:</strong> {profile.name || "Not provided"}
            </p>
            <p>
              <strong>Email Address:</strong> {profile.email || "Not provided"}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
