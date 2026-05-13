import { useState } from 'react';
import api from '../../services/api';
import StarRating from './StarRating';

export default function RatingPrompt({ claim, rateeId, onClose }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stars) { setError('Please select a star rating'); return; }
    setLoading(true);
    try {
      await api.post('/ratings', { claimId: claim._id, rateeId, stars, comment });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="success-msg"><span>⭐</span> Thank you for your rating!</div>
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Rate this Pickup</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-group">
            <label>Rating</label>
            <StarRating value={stars} onChange={setStars} />
          </div>
          <div className="form-group">
            <label>Comment (optional)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={500} rows={3} placeholder="Share your experience..." />
            <small>{comment.length}/500</small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Skip</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit Rating'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
