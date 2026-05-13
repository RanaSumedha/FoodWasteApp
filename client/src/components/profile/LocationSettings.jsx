import { useState } from 'react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import useGeolocation from '../../hooks/useGeolocation';

export default function LocationSettings({ user, onUpdate }) {
  const { requestLocation, loading: geoLoading, error: geoError } = useGeolocation();
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const saveAddress = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch(`/users/${user.id}/location`, { address });
      setSuccess('Location updated!');
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update location');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="location-settings">
      <h3>Location Settings</h3>
      {user.savedAddress && <p className="current-location">📍 Current: {user.savedAddress}</p>}
      <button className="btn-secondary" onClick={requestLocation} disabled={geoLoading}>
        {geoLoading ? 'Getting location...' : '📍 Use My GPS Location'}
      </button>
      {geoError && <div className="error-banner">{geoError}</div>}
      <div className="divider">or enter address manually</div>
      <form onSubmit={saveAddress} className="address-form">
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}
        <div className="form-group">
          <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your address..." required />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
      </form>
    </div>
  );
}
