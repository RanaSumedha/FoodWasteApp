import { useState } from 'react';
import api from '../../services/api';

export default function UserTable({ users, onUpdate }) {
  const [loading, setLoading] = useState(null);

  const toggle = async (user) => {
    setLoading(user._id);
    try {
      await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive });
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Pickups</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className={!u.isActive ? 'row-inactive' : ''}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
              <td>{u.completedPickups}</td>
              <td><span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button className={`btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => toggle(u)} disabled={loading === u._id}>
                  {loading === u._id ? '...' : u.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
