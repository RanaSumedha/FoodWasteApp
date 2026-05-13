import { useState, useEffect } from 'react';
import api from '../../services/api';

function getTimeRemaining(expiryAt) {
  const diff = new Date(expiryAt) - new Date();
  if (diff <= 0) return { text: 'Expired', urgent: false };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { text: `${h}h ${m}m`, urgent: h < 2 };
}

export default function MyListings({ userId }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const fetchListings = async () => {
    try {
      const res = await api.get(`/users/${userId}/listings`);
      setListings(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [userId]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(l => l._id !== id));
      setConfirmId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="loading">Loading your listings...</div>;

  return (
    <div className="my-listings">
      <div className="my-listings-header">
        <h3>My Food Listings</h3>
        <span className="listing-count">{listings.length} total</span>
      </div>

      {listings.length === 0 && (
        <div className="empty-state">
          <span>📋</span>
          <p>You haven't posted any food listings yet.</p>
        </div>
      )}

      <div className="my-listings-grid">
        {listings.map(listing => {
          const time = getTimeRemaining(listing.expiryAt);
          const photoUrl = listing.photoUrls?.[0]
            ? `${import.meta.env.VITE_API_BASE_URL}${listing.photoUrls[0]}`
            : null;

          return (
            <div key={listing._id} className={`my-listing-card status-${listing.status}`}>
              {photoUrl && <img src={photoUrl} alt={listing.foodName} className="my-listing-photo" />}
              {!photoUrl && <div className="listing-photo-placeholder">🍱</div>}

              <div className="my-listing-body">
                <div className="my-listing-top">
                  <h4>{listing.foodName}</h4>
                  <span className={`status-badge ${listing.status}`}>{listing.status}</span>
                </div>
                <p className="listing-qty">{listing.quantity} {listing.unit}</p>
                {listing.description && <p className="listing-desc">{listing.description}</p>}
                <div className="listing-meta">
                  <span>⏱ {time.text}</span>
                  <span>📅 {new Date(listing.expiryAt).toLocaleDateString()}</span>
                  {listing.claimId?.claimantId && (
                    <span>👤 Claimed by: {listing.claimId.claimantId.name}</span>
                  )}
                </div>

                {/* Delete button — only for available/expired listings */}
                {['available', 'expired'].includes(listing.status) && (
                  <>
                    {confirmId === listing._id ? (
                      <div className="delete-confirm-inline">
                        <span>Delete this listing?</span>
                        <div className="delete-actions">
                          <button className="btn-secondary btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
                          <button className="btn-danger btn-sm" onClick={() => handleDelete(listing._id)} disabled={deletingId === listing._id}>
                            {deletingId === listing._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => setConfirmId(listing._id)}>
                        🗑️ Delete Listing
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
