import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotificationBell from './components/notifications/NotificationBell';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">🍛 FoodBridge</Link>
      <div className="nav-links">
        {user && <Link to="/map">Browse Food</Link>}
        {user && <Link to="/profile">Profile</Link>}
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>
      <div className="nav-right">
        {user && <NotificationBell />}
        {user ? (
          <button className="btn-secondary btn-sm" onClick={logout}>Sign Out</button>
        ) : (
          <>
            <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
            <Link to="/register" className="btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppRoutes() {
  const { init, loading } = useAuth();

  useEffect(() => { init(); }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading FoodBridge...</span>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
