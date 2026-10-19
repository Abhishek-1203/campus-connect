
import { useState } from "react";
import "../styles/AvatarPicker.css";

const avatars = [
  { id: "avatar1", emoji: "👨🏻‍🎓", label: "Graduate 1" },
  { id: "avatar2", emoji: "👩🏻‍🎓", label: "Graduate 2" },
  { id: "avatar3", emoji: "👨🏽‍🎓", label: "Graduate 3" },
  { id: "avatar4", emoji: "👩🏽‍🎓", label: "Graduate 4" },
  { id: "avatar5", emoji: "👨🏿‍🎓", label: "Graduate 5" },
  { id: "avatar6", emoji: "👩🏿‍🎓", label: "Graduate 6" },
  { id: "avatar7", emoji: "🧑🏻‍💻", label: "Developer 1" },
  { id: "avatar8", emoji: "🧑🏽‍💻", label: "Developer 2" },
  { id: "avatar9", emoji: "🧑🏿‍💻", label: "Developer 3" },
  { id: "avatar10", emoji: "🧑🏻‍🎨", label: "Artist 1" },
  { id: "avatar11", emoji: "🧑🏽‍🎨", label: "Artist 2" },
  { id: "avatar12", emoji: "🧑🏿‍🎨", label: "Artist 3" },
];

export default function AvatarPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAvatar =
    avatars.find((avatar) => avatar.id === value) || avatars[0];

  return (
    <section className="avatar-picker">
      <h3>Profile Picture</h3>
      <p>Choose an avatar for your CampusConnect profile.</p>

      <button
        type="button"
        className="avatar-current"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Choose profile avatar"
      >
        <span className="avatar-preview">{selectedAvatar.emoji}</span>
        <span>{isOpen ? "Close avatars" : "Change avatar"}</span>
      </button>

      {isOpen && (
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <button
              type="button"
              key={avatar.id}
              className={`avatar-option ${
                value === avatar.id ? "selected" : ""
              }`}
              onClick={() => {
                onChange(avatar.id);
                setIsOpen(false);
              }}
              aria-label={avatar.label}
              aria-pressed={value === avatar.id}
              title={avatar.label}
            >
              <span>{avatar.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
