import Link from 'next/link';
import { FiTarget, FiTrendingUp, FiActivity, FiBarChart2, FiZap, FiShield } from 'react-icons/fi';

export default function LandingPage() {
  return (
    <>
      {/* Navigation */}
      <nav className="landing-nav">
        <Link href="/" className="nav-brand">
          <span>⚡ FitPulse</span>
        </Link>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-actions">
          <Link href="/login" className="btn btn-secondary btn-sm">Log In</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge badge-green">🚀 Your Fitness Journey Starts Here</span>
          </div>
          <h1>
            Transform Your Body.<br />
            <span className="text-gradient">Track Everything.</span>
          </h1>
          <p>
            The most comprehensive fitness tracker. Monitor weight, food intake,
            calorie burn, walking & more. Set goals, track progress, and see
            detailed analysis reports.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Free Trial
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              Learn More
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <h3>10K+</h3>
              <p>Active Users</p>
            </div>
            <div className="hero-stat">
              <h3>500K+</h3>
              <p>Meals Tracked</p>
            </div>
            <div className="hero-stat">
              <h3>50K+</h3>
              <p>Goals Achieved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="features-header">
          <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-block' }}>Features</span>
          <h2 className="section-title">Everything You Need to<br /><span className="text-gradient">Reach Your Goals</span></h2>
          <p className="section-subtitle">
            Comprehensive tracking tools designed to help you understand your body
            and make progress towards your fitness goals.
          </p>
        </div>
        <div className="features-grid">
          <div className="card feature-card">
            <div className="feature-icon"><FiTarget /></div>
            <h3>Weight Tracking</h3>
            <p>Log daily weight entries and visualize your progress with beautiful charts. See trends and patterns over time.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon"><FiTrendingUp /></div>
            <h3>Food & Nutrition</h3>
            <p>Track every meal with detailed calorie and macro breakdowns. Log breakfast, lunch, dinner, and snacks.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon"><FiActivity /></div>
            <h3>Activity & Exercise</h3>
            <p>Monitor walking, running, cycling, gym sessions, and more. Track steps, distance, and calories burned.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon"><FiBarChart2 /></div>
            <h3>Detailed Reports</h3>
            <p>Get comprehensive analysis with charts and insights. Weekly and monthly summaries at your fingertips.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon"><FiZap /></div>
            <h3>Smart Goals</h3>
            <p>Set specific weight targets with timelines. Track your progress with visual indicators and milestones.</p>
          </div>
          <div className="card feature-card">
            <div className="feature-icon"><FiShield /></div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and secure. We never share your personal health information with third parties.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <div className="pricing-header">
          <span className="badge badge-green" style={{ marginBottom: 16, display: 'inline-block' }}>Pricing</span>
          <h2 className="section-title">Simple, <span className="text-gradient">Transparent</span> Pricing</h2>
          <p className="section-subtitle">
            Start for free and upgrade to Pro when you&apos;re ready for advanced features.
          </p>
        </div>
        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="card pricing-card">
            <h3>Free</h3>
            <div className="price" style={{ margin: '16px 0 4px' }}>৳0</div>
            <div className="price-period">forever</div>
            <div className="price-yearly">&nbsp;</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Weight Tracking</li>
              <li><span className="check">✓</span> Basic Food Logging</li>
              <li><span className="check">✓</span> Activity Tracking</li>
              <li><span className="check">✓</span> 1 Active Goal</li>
              <li><span className="cross">✗</span> Advanced Reports</li>
              <li><span className="cross">✗</span> Macro Breakdown</li>
              <li><span className="cross">✗</span> Export Data</li>
            </ul>
            <Link href="/register" className="btn btn-secondary" style={{ width: '100%' }}>
              Get Started Free
            </Link>
          </div>
          {/* Pro Plan */}
          <div className="card pricing-card featured pulse-glow">
            <h3>Pro</h3>
            <div className="price" style={{ margin: '16px 0 4px' }}>
              <span className="text-gradient">৳99</span>
            </div>
            <div className="price-period">per month</div>
            <div className="price-yearly">or ৳800/year — save 33%</div>
            <ul className="pricing-features">
              <li><span className="check">✓</span> Everything in Free</li>
              <li><span className="check">✓</span> Unlimited Goals</li>
              <li><span className="check">✓</span> Advanced Analytics</li>
              <li><span className="check">✓</span> Macro Breakdown</li>
              <li><span className="check">✓</span> Weekly/Monthly Reports</li>
              <li><span className="check">✓</span> Export Data (CSV)</li>
              <li><span className="check">✓</span> Priority Support</li>
            </ul>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%' }}>
              Start Pro Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <Link href="/" className="nav-brand">
            <span>⚡ FitPulse</span>
          </Link>
          <p>© 2026 FitPulse. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
