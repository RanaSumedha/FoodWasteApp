import { useState, useEffect } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import RatingPrompt from '../ratings/RatingPrompt';

export default function ClaimHistory() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/users/${user.id}/claims`).then(r => { setClaims(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="history-list">
      <h3>My Pickup History</h3>
      {claims.length === 0 && <p className="empty-state">No pickups yet.</p>}
      {claims.map(claim => (
        <div key={claim._id} className={`history-item status-${claim.status}`}>
          <div className="history-header">
            <strong>{claim.listingId?.foodName || 'Food'}</strong>
            <span className={`status-badge ${claim.status}`}>{claim.status}</span>
          </div>
          <p>🏪 {claim.listingId?.restaurantId?.name}</p>
          <p>📅 Pickup: {new Date(claim.scheduledPickupTime).toLocaleString()}</p>
          {claim.completedAt && <p>✅ Completed: {new Date(claim.completedAt).toLocaleString()}</p>}
          {claim.status === 'completed' && (
            <button className="btn-secondary btn-sm" onClick={() => setRatingTarget(claim)}>Rate Restaurant</button>
          )}
        </div>
      ))}
      {ratingTarget && (
        <RatingPrompt
          claim={ratingTarget}
          rateeId={ratingTarget.listingId?.restaurantId?._id}
          onClose={() => setRatingTarget(null)}
        />
      )}
    </div>
  );
}
