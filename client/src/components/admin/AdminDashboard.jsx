import { useState, useEffect } from 'react';
import api from '../../services/api';
import UserTable from './UserTable';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [tab, setTab] = useState('overview');

  const fetchAll = async () => {
    const [s, u, l, r] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/listings'),
      api.get('/admin/ratings')
    ]);
    setStats(s.data); setUsers(u.data); setListings(l.data); setRatings(r.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const deleteItem = async (type, id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/admin/${type}/${id}`);
    fetchAll();
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-icon">📋</span><span className="stat-value">{stats.activeListings}</span><span className="stat-label">Active Listings</span></div>
          <div className="stat-card"><span className="stat-icon">🤝</span><span className="stat-value">{stats.pickupsToday}</span><span className="stat-label">Pickups Today</span></div>
          <div className="stat-card"><span className="stat-icon">🥗</span><span className="stat-value">{(stats.totalWeightRescued || 0).toFixed(1)} kg</span><span className="stat-label">Total Rescued</span></div>
          <div className="stat-card"><span className="stat-icon">👥</span><span className="stat-value">{Object.values(stats.usersByRole || {}).reduce((a, b) => a + b, 0)}</span><span className="stat-label">Total Users</span></div>
        </div>
      )}
      <div className="tab-bar">
        {['overview', 'users', 'listings', 'ratings'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {tab === 'users' && <UserTable users={users} onUpdate={fetchAll} />}
      {tab === 'listings' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>Food</th><th>Restaurant</th><th>Status</th><th>Expiry</th><th>Action</th></tr></thead>
            <tbody>
              {listings.map(l => (
                <tr key={l._id}>
                  <td>{l.foodName}</td><td>{l.restaurantId?.name}</td>
                  <td><span className={`status-badge ${l.status}`}>{l.status}</span></td>
                  <td>{new Date(l.expiryAt).toLocaleString()}</td>
                  <td><button className="btn-sm btn-danger" onClick={() => deleteItem('listings', l._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'ratings' && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead><tr><th>From</th><th>To</th><th>Stars</th><th>Comment</th><th>Action</th></tr></thead>
            <tbody>
              {ratings.map(r => (
                <tr key={r._id}>
                  <td>{r.raterId?.name}</td><td>{r.rateeId?.name}</td>
                  <td>{'★'.repeat(r.stars)}</td><td>{r.comment}</td>
                  <td><button className="btn-sm btn-danger" onClick={() => deleteItem('ratings', r._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'overview' && stats && (
        <div className="overview-roles">
          <h3>Users by Role</h3>
          {Object.entries(stats.usersByRole || {}).map(([role, count]) => (
            <div key={role} className="role-row"><span className={`role-badge ${role}`}>{role}</span><strong>{count}</strong></div>
          ))}
        </div>
      )}
    </div>
  );
}
