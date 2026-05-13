import { useState } from 'react';
import ListingCard from './ListingCard';

export default function ListingList({ listings, onClaim }) {
  const [sortBy, setSortBy] = useState('time');

  const sorted = [...listings].sort((a, b) => {
    if (sortBy === 'distance') return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    return new Date(a.expiryAt) - new Date(b.expiryAt);
  });

  return (
    <div className="listing-list">
      <div className="list-controls">
        <span>Sort by:</span>
        <button className={`sort-btn ${sortBy === 'time' ? 'active' : ''}`} onClick={() => setSortBy('time')}>⏱ Expiry</button>
        <button className={`sort-btn ${sortBy === 'distance' ? 'active' : ''}`} onClick={() => setSortBy('distance')}>📍 Distance</button>
      </div>
      {sorted.length === 0 && (
        <div className="empty-state">
          <span>🍽️</span>
          <p>No food listings available nearby right now.</p>
        </div>
      )}
      <div className="cards-grid">
        {sorted.map(l => <ListingCard key={l._id} listing={l} onClaim={onClaim} />)}
      </div>
    </div>
  );
}
