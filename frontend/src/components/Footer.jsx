import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, ShieldCheck, ArrowRight, CheckCircle2, Heart } from "lucide-react";
import { useToast } from "../context/ToastContext";

function Footer() {
  const { showToast } = useToast();
  const location = useLocation();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  function handleNewsletter(e) {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast("Thank you for subscribing to EventSphere updates!", "success");
      setNewsletterEmail("");
    }
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Newsletter CTA Strip */}
        <div className="footer-newsletter-box">
          <div className="newsletter-text">
            <h3>Stay ahead with trending events</h3>
            <p>Subscribe to receive weekly curated event digests, speaker announcements, and early bird tickets.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              aria-label="Email address for event newsletter"
            />
            <button type="submit" className="newsletter-submit">
              <span>Subscribe</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-badge">
                <CalendarDays size={20} />
              </div>
              <div className="logo-text">
                Event<span>Sphere</span>
              </div>
            </div>
            <p>
              The premier platform for discovering world-class summits, music festivals, hands-on masterclasses, and local gatherings with instant digital ticketing.
            </p>
            <div className="footer-status-pill">
              <span className="status-dot-pulse" />
              <span>All Systems Operational • Instant Booking Active</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <Link to="/">Home Overview</Link>
              </li>
              <li>
                <Link to="/events">Explore Events</Link>
              </li>
              <li>
                <Link to="/my-bookings">My Tickets & Bookings</Link>
              </li>
              <li>
                <Link to="/register">Create Free Account</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li>
                <Link to="/events?category=Technology">Technology & AI</Link>
              </li>
              <li>
                <Link to="/events?category=Music">Live Music & Arts</Link>
              </li>
              <li>
                <Link to="/events?category=Education">Engineering Workshops</Link>
              </li>
              <li>
                <Link to="/events?category=Business">Business & Startups</Link>
              </li>
              <li>
                <Link to="/events?category=Sports">Sports & Fitness</Link>
              </li>
            </ul>
          </div>

          {/* Portal Links */}
          <div className="footer-col">
            <h4>For Creators</h4>
            <ul>
              <li>
                <Link to="/register">Host Your Event</Link>
              </li>
              <li>
                <Link to="/organizer/dashboard">Organizer Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/dashboard">Admin Console</Link>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© 2026 EventSphere Inc. All rights reserved. Next-Gen Event Ticketing Architecture.</p>
          <div className="footer-bottom-links">
            <span>Crafted with precision & modern web standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;