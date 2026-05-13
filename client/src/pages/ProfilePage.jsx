import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import ImpactStats from '../components/profile/ImpactStats';
import LocationSettings from '../components/profile/LocationSettings';
import RatingDisplay from '../components/ratings/RatingDisplay';
import ClaimHistory from '../components/claims/ClaimHistory';
import MyListings from '../components/listings/MyListings';

export default function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  const fetchProfile = async () => {
    if (!authUser) return;
    const res = await api.get(`/users/${authUser.id}`);
    setProfile(res.data);
  };

  useEffect(() => { fetchProfile(); }, [authUser]);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/users/${authUser.id}`);
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  if (!profile) return <div className="loading">Loading profile...</div>;

  const tabs = ['overview', 'history', 'location'];
  if (profile.role === 'restaurant') tabs.splice(1, 0, 'my listings');

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{profile.name?.[0]?.toUpperCase()}</div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <span className={`role-badge ${profile.role}`}>{profile.role}</span>
          <RatingDisplay averageRating={profile.averageRating} ratingCount={profile.ratingCount} completedPickups={profile.completedPickups} />
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <ImpactStats user={profile} />
          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>Permanently delete your account and all your data. This cannot be undone.</p>
            {!showDeleteConfirm ? (
              <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                🗑️ Delete My Account
              </button>
            ) : (
              <div className="delete-confirm">
                <p><strong>Are you sure?</strong> This will delete your account{profile.role === 'restaurant' ? ' and all your food listings' : ''}.</p>
                {deleteError && <div className="error-banner">{deleteError}</div>}
                <div className="delete-actions">
                  <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}>
                    Cancel
                  </button>
                  <button className="btn-danger" onClick={handleDeleteAccount} disabled={deleteLoading}>
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {tab === 'my listings' && <MyListings userId={authUser.id} />}
      {tab === 'history' && <ClaimHistory />}
      {tab === 'location' && <LocationSettings user={authUser} onUpdate={fetchProfile} />}
    </div>
  );
}
