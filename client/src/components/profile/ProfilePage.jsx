import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ImpactStats from "./ImpactStats";
import LocationSettings from "./LocationSettings";
import RatingDisplay from "../ratings/RatingDisplay";

/**
 * ProfilePage component — user info, location, ImpactStats, RatingDisplay, history link.
 */
function ProfilePageComponent() {
  const { user, logout, setUser } = useAuth();
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  if (!user) return null;

  const roleLabel = {
    restaurant: "Restaurant",
    ngo: "NGO",
    volunteer: "Volunteer",
    admin: "Administrator",
  }[user.role] || user.role;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {user.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <span className={`role-badge role-badge--${user.role}`}>{roleLabel}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={logout}>
          Sign out
        </button>
      </div>

      <RatingDisplay user={user} />

      <ImpactStats user={user} />

      <div className="profile-section">
        <div className="profile-section__header">
          <h2 className="section-title">Location</h2>
          <button
            className="btn-link"
            onClick={() => setShowLocationSettings((prev) => !prev)}
          >
            {showLocationSettings ? "Hide" : "Edit"}
          </button>
        </div>

        {user.savedAddress ? (
          <p className="profile-location">📍 {user.savedAddress}</p>
        ) : user.location?.coordinates ? (
          <p className="profile-location">
            📍 {user.location.coordinates[1].toFixed(4)},{" "}
            {user.location.coordinates[0].toFixed(4)}
          </p>
        ) : (
          <p className="text-muted">No location set</p>
        )}

        {showLocationSettings && (
          <LocationSettings onUpdate={(updatedUser) => setUser(updatedUser)} />
        )}
      </div>

      <div className="profile-section">
        <h2 className="section-title">History</h2>
        <Link to="/history" className="btn btn-secondary">
          View {user.role === "restaurant" ? "listing" : "claim"} history
        </Link>
      </div>

      <div className="profile-meta">
        <p className="text-muted">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default ProfilePageComponent;
