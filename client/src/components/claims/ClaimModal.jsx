import { useState } from 'react';
import useListings from '../../hooks/useListings';

export default function ClaimModal({ listing, onClose, onSuccess }) {
  const { claimListing } = useListings();
  const [pickupTime, setPickupTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const minTime = new Date(listing.pickupWindowStart).toISOString().slice(0, 16);
  const maxTime = new Date(listing.expiryAt).toISOString().slice(0, 16);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await claimListing(listing._id, pickupTime);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Schedule Pickup</h2>
        <div className="claim-listing-info">
          <strong>{listing.foodName}</strong> — {listing.quantity} {listing.unit}
          <br /><span>📍 {listing.restaurantId?.name}</span>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-group">
            <label>Select Pickup Time</label>
            <input type="datetime-local" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
              min={minTime} max={maxTime} required />
            <small>Between {new Date(listing.pickupWindowStart).toLocaleString()} and {new Date(listing.expiryAt).toLocaleString()}</small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Claiming...' : 'Confirm Pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
