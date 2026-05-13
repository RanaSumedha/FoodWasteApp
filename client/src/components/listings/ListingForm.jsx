import { useState } from 'react';
import useListings from '../../hooks/useListings';
import useGeolocation from '../../hooks/useGeolocation';

export default function ListingForm({ onSuccess }) {
  const { createListing } = useListings();
  const { coords, requestLocation, loading: geoLoading } = useGeolocation();
  const [form, setForm] = useState({
    foodName: '', quantity: '', unit: 'kg', description: '',
    pickupWindowStart: '', expiryAt: '', lng: '', lat: ''
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const useMyLocation = () => {
    requestLocation();
    if (coords) { set('lng', coords[0]); set('lat', coords[1]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.lng || !form.lat) { setError('Please set your location'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach(p => fd.append('photos', p));
      await createListing(fd);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="success-msg">
      <span>✅</span> Listing created! Nearby NGOs and volunteers have been notified.
      <button className="btn-secondary" onClick={() => setSuccess(false)}>Add Another</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="listing-form">
      <h2>Post Surplus Food</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="form-row">
        <div className="form-group">
          <label>Food Name *</label>
          <input value={form.foodName} onChange={e => set('foodName', e.target.value)} required placeholder="e.g. Biryani, Bread" />
        </div>
        <div className="form-group">
          <label>Quantity *</label>
          <input type="number" min="0.1" step="0.1" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Unit *</label>
          <select value={form.unit} onChange={e => set('unit', e.target.value)}>
            <option>kg</option><option>portions</option><option>boxes</option><option>litres</option><option>items</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Any details about the food..." />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Pickup Window Start *</label>
          <input type="datetime-local" value={form.pickupWindowStart} onChange={e => set('pickupWindowStart', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Expires At *</label>
          <input type="datetime-local" value={form.expiryAt} onChange={e => set('expiryAt', e.target.value)} required />
        </div>
      </div>
      <div className="form-group">
        <label>Location *</label>
        <div className="location-row">
          <button type="button" className="btn-secondary" onClick={useMyLocation} disabled={geoLoading}>
            {geoLoading ? 'Getting location...' : '📍 Use My Location'}
          </button>
          {coords && <span className="location-set">✅ Location set</span>}
          {!coords && (
            <div className="manual-coords">
              <input placeholder="Longitude" value={form.lng} onChange={e => set('lng', e.target.value)} />
              <input placeholder="Latitude" value={form.lat} onChange={e => set('lat', e.target.value)} />
            </div>
          )}
        </div>
      </div>
      <div className="form-group">
        <label>Photos (optional)</label>
        <input type="file" accept="image/*" multiple onChange={e => setPhotos(Array.from(e.target.files))} />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Posting...' : 'Post Food Listing'}
      </button>
    </form>
  );
}
