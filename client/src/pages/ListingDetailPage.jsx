import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/listings/ListingCard';
import ClaimModal from '../components/claims/ClaimModal';
import RatingPrompt from '../components/ratings/RatingPrompt';
import useAuth from '../hooks/useAuth';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [claim, setClaim] = useState(null);
  const [showClaim, setShowClaim] = useState(false);
  const [showRate, setShowRate] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`).then(r => setListing(r.data)).catch(() => {});
    if (user) {
      api.get(`/users/${user.id}/claims`).then(r => {
        const c = r.data.find(c => c.listingId?._id === id || c.listingId === id);
        if (c) setClaim(c);
      }).catch(() => {});
    }
  }, [id, user]);

  if (!listing) return <div className="loading">Loading...</div>;

  return (
    <div className="detail-page">
      <ListingCard listing={listing} showClaimButton={false} />
      <div className="detail-actions">
        {listing.status === 'available' && user?.role !== 'restaurant' && (
          <button className="btn-primary" onClick={() => setShowClaim(true)}>Claim This Pickup</button>
        )}
        {claim?.status === 'completed' && (
          <button className="btn-secondary" onClick={() => setShowRate(true)}>Rate This Pickup</button>
        )}
        {claim?.status === 'active' && (
          <div className="claim-info">
            <p>✅ You've claimed this listing</p>
            <p>📅 Pickup: {new Date(claim.scheduledPickupTime).toLocaleString()}</p>
            <button className="btn-primary" onClick={async () => {
              await api.patch(`/claims/${claim._id}/complete`);
              window.location.reload();
            }}>Mark as Completed</button>
          </div>
        )}
      </div>
      {showClaim && <ClaimModal listing={listing} onClose={() => setShowClaim(false)} onSuccess={() => window.location.reload()} />}
      {showRate && claim && <RatingPrompt claim={claim} rateeId={listing.restaurantId?._id} onClose={() => setShowRate(false)} />}
    </div>
  );
}
