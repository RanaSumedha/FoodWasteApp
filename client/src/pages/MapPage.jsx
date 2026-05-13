import { useState, useEffect } from 'react';
import useListings from '../hooks/useListings';
import useGeolocation from '../hooks/useGeolocation';
import ListingMap from '../components/listings/ListingMap';
import ListingList from '../components/listings/ListingList';
import ListingForm from '../components/listings/ListingForm';
import ClaimModal from '../components/claims/ClaimModal';
import useAuth from '../hooks/useAuth';

export default function MapPage() {
  const { user } = useAuth();
  const { listings, fetchListings, loading } = useListings();
  const { coords, requestLocation } = useGeolocation();
  const [view, setView] = useState('map');
  const [radius, setRadius] = useState(10);
  const [claimTarget, setClaimTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchListings(coords?.[1], coords?.[0], radius);
  }, [coords, radius]);

  const mapCenter = coords ? [coords[1], coords[0]] : undefined;

  return (
    <div className="map-page">
      <div className="map-toolbar">
        <div className="toolbar-left">
          <button className={`view-btn ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>🗺️ Map</button>
          <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>📋 List</button>
          <select value={radius} onChange={e => setRadius(Number(e.target.value))} className="radius-select">
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
          </select>
          <button className="btn-secondary btn-sm" onClick={requestLocation}>📍 My Location</button>
        </div>
        <div className="toolbar-right">
          <span className="listing-count">{listings.length} listings</span>
          {user?.role === 'restaurant' && (
            <button className="btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
              {showForm ? '✕ Close' : '+ Post Food'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="form-panel">
          <ListingForm onSuccess={() => { setShowForm(false); fetchListings(coords?.[1], coords?.[0], radius); }} />
        </div>
      )}

      {loading && <div className="loading-bar">Loading listings...</div>}

      {view === 'map' ? (
        <ListingMap listings={listings} onClaim={setClaimTarget} center={mapCenter} />
      ) : (
        <div className="list-panel">
          <ListingList listings={listings} onClaim={setClaimTarget} />
        </div>
      )}

      {claimTarget && (
        <ClaimModal
          listing={claimTarget}
          onClose={() => setClaimTarget(null)}
          onSuccess={() => fetchListings(coords?.[1], coords?.[0], radius)}
        />
      )}
    </div>
  );
}
