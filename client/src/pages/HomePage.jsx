import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌍 Fighting Food Waste</div>
          <h1>Turn Surplus Food<br /><span>Into Hope</span></h1>
          <p>FoodBridge connects restaurants with surplus food to NGOs and volunteers who redistribute it to people in need. Together we reduce waste and fight hunger.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/map" className="btn-primary btn-lg">Browse Available Food →</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary btn-lg">Get Started Free</Link>
                <Link to="/login" className="btn-secondary btn-lg">Sign In</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-visual">🍛</div>
      </section>

      <section className="stats-section">
        <div className="stat-item"><span className="big-num">500+</span><span>Restaurants</span></div>
        <div className="stat-item"><span className="big-num">2,000+</span><span>Meals Rescued</span></div>
        <div className="stat-item"><span className="big-num">150+</span><span>NGOs & Volunteers</span></div>
        <div className="stat-item"><span className="big-num">10+</span><span>Cities</span></div>
      </section>

      <section className="how-it-works">
        <div className="section-label">How It Works</div>
        <h2>Simple. Fast. Impactful.</h2>
        <p className="section-subtitle">From surplus food to someone's plate in four easy steps.</p>
        <div className="steps-grid">
          <div className="step">
            <span className="step-num">1</span>
            <span className="step-icon">🍽️</span>
            <h3>Restaurants Post</h3>
            <p>Upload surplus food with quantity, expiry time, and pickup window in under a minute.</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <span className="step-icon">🔔</span>
            <h3>NGOs Get Alerted</h3>
            <p>Nearby NGOs and volunteers receive instant in-app notifications about available food.</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <span className="step-icon">📅</span>
            <h3>Schedule Pickup</h3>
            <p>Claim the listing and schedule a convenient pickup time within the available window.</p>
          </div>
          <div className="step">
            <span className="step-num">4</span>
            <span className="step-icon">🤝</span>
            <h3>Food Reaches People</h3>
            <p>Food gets collected and redistributed to those who need it most in your city.</p>
          </div>
        </div>
      </section>

      <section className="roles-section">
        <div className="section-label">Join As</div>
        <h2>Who Is FoodBridge For?</h2>
        <p className="section-subtitle">Whether you have food to give or people to feed, there's a role for you.</p>
        <div className="roles-grid">
          <div className="role-info-card">
            <span>🍽️</span>
            <h3>Restaurant</h3>
            <p>Post surplus food, track pickups, and see your real environmental impact.</p>
            <Link to="/register" className="btn-secondary">Register as Restaurant</Link>
          </div>
          <div className="role-info-card featured">
            <span>🏢</span>
            <h3>NGO</h3>
            <p>Get alerts for nearby food, schedule pickups, and feed more people every day.</p>
            <Link to="/register" className="btn-primary">Register as NGO</Link>
          </div>
          <div className="role-info-card">
            <span>🙋</span>
            <h3>Volunteer</h3>
            <p>Help collect and deliver food in your neighborhood on your own schedule.</p>
            <Link to="/register" className="btn-secondary">Register as Volunteer</Link>
          </div>
        </div>
      </section>

      {!user && (
        <section className="footer-cta">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of restaurants, NGOs, and volunteers already using FoodBridge to fight hunger and reduce waste.</p>
          <Link to="/register" className="btn-white">Start for Free →</Link>
        </section>
      )}
    </div>
  );
}
