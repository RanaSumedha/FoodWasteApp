import { useState, useEffect } from 'react';

function getTimeRemaining(expiryAt) {
  const diff = new Date(expiryAt) - new Date();
  if (diff <= 0) return { text: 'Expired', urgent: true, expired: true };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { text: `${h}h ${m}m`, urgent: h < 2, expired: false };
}

export default function ListingCard({ listing, onClaim, showClaimButton = true }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(listing.expiryAt));

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(getTimeRemaining(listing.expiryAt)), 60000);
    return () => clearInterval(t);
  }, [listing.expiryAt]);

  const photoUrl = listing.photoUrls?.[0]
    ? `${import.meta.env.VITE_API_BASE_URL}${listing.photoUrls[0]}`
    : null;

  return (
    <div className={`listing-card ${timeLeft.urgent ? 'urgent' : ''}`}>
      {photoUrl && <img src={photoUrl} alt={listing.foodName} className="listing-photo" />}
      {!photoUrl && <div className="listing-photo-placeholder">🍱</div>}
      <div className="listing-body">
        <div className="listing-header">
          <h3>{listing.foodName}</h3>
          {timeLeft.urgent && !timeLeft.expired && <span className="badge-urgent">⚡ Expiring Soon</span>}
          {timeLeft.expired && <span className="badge-expired">Expired</span>}
        </div>
        <p className="listing-qty">{listing.quantity} {listing.unit}</p>
        {listing.description && <p className="listing-desc">{listing.description}</p>}
        <div className="listing-meta">
          <span>🏪 {listing.restaurantId?.name || 'Restaurant'}</span>
          {listing.distance != null && <span>📍 {listing.distance.toFixed(1)} km</span>}
          <span className={`timer ${timeLeft.urgent ? 'timer-urgent' : ''}`}>⏱ {timeLeft.text}</span>
        </div>
        {listing.restaurantId?.averageRating > 0 && (
          <div className="listing-rating">⭐ {listing.restaurantId.averageRating.toFixed(1)}</div>
        )}
        {showClaimButton && listing.status === 'available' && !timeLeft.expired && onClaim && (
          <button className="btn-claim" onClick={() => onClaim(listing)}>Claim Pickup</button>
        )}
        {listing.status === 'claimed' && <span className="badge-claimed">Claimed</span>}
      </div>
    </div>
  );
}
