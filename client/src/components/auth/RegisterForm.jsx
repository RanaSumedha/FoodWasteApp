import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ROLES = [
  { value: 'restaurant', label: '🍽️ Restaurant', desc: 'I have surplus food to donate' },
  { value: 'ngo', label: '🏢 NGO', desc: 'We collect and redistribute food' },
  { value: 'volunteer', label: '🙋 Volunteer', desc: 'I help pick up and deliver food' },
];

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.role) { setError('Please select a role'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/map');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      } else if (err.response?.status === 503) {
        setError('Database not connected. Please start MongoDB and restart the server.');
      } else {
        setError(err.response?.data?.message || `Registration failed (${err.response?.status})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">🍛</div>
        <h1>Join FoodBridge</h1>
        <p className="auth-subtitle">Help reduce food waste and fight hunger</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-banner">{error}</div>}
          <div className="form-group">
            <label>Full Name / Organization Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password (min 8 characters)</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="••••••••" />
          </div>
          <div className="form-group">
            <label>I am a...</label>
            <div className="role-grid">
              {ROLES.map(r => (
                <button type="button" key={r.value}
                  className={`role-card ${form.role === r.value ? 'selected' : ''}`}
                  onClick={() => set('role', r.value)}>
                  <span className="role-label">{r.label}</span>
                  <span className="role-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
