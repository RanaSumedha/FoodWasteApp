export default function ImpactStats({ user }) {
  return (
    <div className="impact-stats">
      <h3>Your Impact</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🥗</span>
          <span className="stat-value">{(user.totalWeightRescued || 0).toFixed(1)} kg</span>
          <span className="stat-label">Food Rescued</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🤝</span>
          <span className="stat-value">{user.completedPickups || 0}</span>
          <span className="stat-label">Pickups Completed</span>
        </div>
        {user.role === 'restaurant' && (
          <div className="stat-card">
            <span className="stat-icon">📋</span>
            <span className="stat-value">{user.totalListingsCreated || 0}</span>
            <span className="stat-label">Listings Created</span>
          </div>
        )}
      </div>
    </div>
  );
}
