import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Ticket,
  Sparkles,
  Users,
  Search,
  ShieldCheck,
  Zap,
  QrCode,
  HeartHandshake,
  Star,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Music,
  GraduationCap,
  Briefcase,
  Trophy,
} from "lucide-react";
import { categoryImages } from "../services/eventImages";

const featuredEvents = [
  {
    id: 1,
    title: "Global Technology & AI Summit 2026",
    category: "Technology",
    date: "20 Nov 2026",
    time: "09:30 AM",
    location: "Convention Hall, Madurai",
    price: 499,
    availableTickets: 120,
    totalTickets: 250,
    image: categoryImages.Technology,
    badge: "Trending",
  },
  {
    id: 2,
    title: "Acoustic Live Music & Arts Festival",
    category: "Music",
    date: "25 Nov 2026",
    time: "06:00 PM",
    location: "Grand Amphitheater, Chennai",
    price: 799,
    availableTickets: 85,
    totalTickets: 300,
    image: categoryImages.Music,
    badge: "Selling Fast",
  },
  {
    id: 3,
    title: "Full-Stack Software Engineering Workshop",
    category: "Education",
    date: "05 Dec 2026",
    time: "10:00 AM",
    location: "Tech Hub Campus, Coimbatore",
    price: 299,
    availableTickets: 40,
    totalTickets: 100,
    image: categoryImages.Education,
    badge: "Limited Seats",
  },
];

const categoryPills = [
  { name: "Technology", icon: Cpu, count: "12 Events", color: "#6366f1" },
  { name: "Music", icon: Music, count: "8 Events", color: "#ec4899" },
  { name: "Education", icon: GraduationCap, count: "15 Events", color: "#10b981" },
  { name: "Business", icon: Briefcase, count: "10 Events", color: "#f59e0b" },
  { name: "Sports", icon: Trophy, count: "6 Events", color: "#06b6d4" },
];

const testimonials = [
  {
    name: "Dr. Ananya Raman",
    role: "AI Research Lead",
    avatar: "A",
    text: "EventSphere made reserving passes for our entire engineering delegation seamless. Instant QR ticketing and zero check-in delays at the gate.",
    rating: 5,
    event: "Global AI Summit",
  },
  {
    name: "Karthik Subramanian",
    role: "Independent Artist",
    avatar: "K",
    text: "As an event organizer, publishing ticket tiers and viewing real-time attendee counts transformed how we handled our Chennai concert tour.",
    rating: 5,
    event: "Acoustic Music Fest",
  },
  {
    name: "Pooja Varma",
    role: "Product Designer",
    avatar: "P",
    text: "The cleanest UI I've experienced on an Indian event booking site. Clean checkout, transparent pricing, and instant PDF ticket access.",
    rating: 5,
    event: "UX Design Conclave",
  },
];

function Home() {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");

  function handleHeroSearch(e) {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/events?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate("/events");
    }
  }

  return (
    <main className="home-wrapper">
      {/* =========================================================
          HERO SECTION WITH GLOW & SEARCH
          ========================================================= */}
      <section className="hero">
        <div className="hero-glow-blob" />
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <Sparkles size={14} className="hero-badge-icon" />
              <span>Next-Generation Event Experience</span>
            </div>

            <h1 className="hero-title">
              Discover Live Events.
              <br />
              <span className="text-gradient">Book Tickets Instantly.</span>
            </h1>

            <p className="hero-desc">
              Connect with extraordinary tech summits, acoustic concerts, hands-on masterclasses, and regional tournaments with zero hassle and verified tickets.
            </p>

            {/* Quick Interactive Search Bar */}
            <form className="hero-search-form" onSubmit={handleHeroSearch}>
              <div className="hero-search-input-group">
                <Search size={20} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search events, topics, or venues (e.g. AI, Chennai, Music)..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  aria-label="Search events by title or city"
                />
              </div>
              <button type="submit" className="hero-search-submit">
                <span>Find Events</span>
                <ArrowRight size={17} />
              </button>
            </form>

            {/* Hero Trust Proof Bar */}
            <div className="hero-trust-bar">
              <div className="trust-item">
                <div className="trust-number">50+</div>
                <div className="trust-label">Verified Gatherings</div>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <div className="trust-number">10,000+</div>
                <div className="trust-label">Tickets Reserved</div>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <div className="trust-number">100%</div>
                <div className="trust-label">Instant Confirmation</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Spotlight Preview Card */}
          <div className="hero-visual">
            <div className="hero-preview-card">
              <div className="preview-card-header">
                <div className="preview-card-title">
                  <Ticket size={18} className="preview-ticket-icon" />
                  <span>Featured Spotlight</span>
                </div>
                <div className="live-indicator">
                  <div className="live-dot" />
                  <span>Now Booking</span>
                </div>
              </div>

              <div className="preview-card-image-wrap">
                <img
                  src={categoryImages.Technology}
                  alt="Global Technology & AI Summit"
                  className="preview-card-img"
                />
                <span className="preview-floating-pill">Top Pick</span>
              </div>

              <div className="preview-card-body">
                <span className="section-label">Technology Conference</span>
                <h3 className="preview-card-heading">Global Technology & AI Summit</h3>

                <div className="preview-meta-row">
                  <span>
                    <CalendarDays size={14} /> 20 Nov 2026
                  </span>
                  <span>
                    <MapPin size={14} /> Madurai, TN
                  </span>
                  <span>
                    <Users size={14} /> 120 Seats Left
                  </span>
                </div>

                <div className="preview-card-footer">
                  <div className="event-price-wrapper">
                    <span className="price-label">Price per ticket</span>
                    <strong className="event-price-amount">₹499</strong>
                  </div>

                  <Link to="/events/1" className="book-btn">
                    <span>Reserve Pass</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY EXPLORATION CAROUSEL / GRID
          ========================================================= */}
      <section className="categories-section">
        <div className="section-header-centered">
          <span className="section-label">EXPLORE BY PASSION</span>
          <h2>Popular Event Categories</h2>
          <p>Browse handpicked experiences categorized by your personal interest.</p>
        </div>

        <div className="categories-grid">
          {categoryPills.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                className="category-tile"
              >
                <div className="category-tile-icon-wrap" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>
                  <Icon size={24} />
                </div>
                <div className="category-tile-info">
                  <h4>{cat.name}</h4>
                  <span>{cat.count}</span>
                </div>
                <div className="category-tile-arrow">
                  <ArrowRight size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          FEATURED EVENTS SECTION
          ========================================================= */}
      <section className="featured-section">
        <div className="section-header-row">
          <div>
            <span className="section-label">HIGH DEMAND</span>
            <h2>Spotlight Events</h2>
            <p>Upcoming flagship conferences and concerts filling up fast.</p>
          </div>

          <Link to="/events" className="view-all-link">
            <span>Explore all events</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="events-grid">
          {featuredEvents.map((event) => {
            const seatsRemaining = event.availableTickets;
            const isLowStock = seatsRemaining <= 50;

            return (
              <article className="event-card" key={event.id}>
                {/* Visual Art Container */}
                <div className="event-art">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="event-image"
                    loading="lazy"
                  />
                  <span className="event-category-badge">{event.category}</span>
                  {event.badge && (
                    <span className="event-hot-badge">
                      <Zap size={11} />
                      {event.badge}
                    </span>
                  )}

                  {/* Calendar Date Badge Overlaid */}
                  <div className="event-calendar-stamp">
                    <span className="stamp-month">
                      {event.date.split(" ")[1]?.toUpperCase() || "NOV"}
                    </span>
                    <span className="stamp-day">
                      {event.date.split(" ")[0] || "20"}
                    </span>
                  </div>
                </div>

                {/* Event Information */}
                <div className="event-info">
                  <h3>{event.title}</h3>

                  <div className="event-meta-list">
                    <div className="event-detail">
                      <CalendarDays size={15} />
                      <span>{event.date} • {event.time}</span>
                    </div>

                    <div className="event-detail">
                      <MapPin size={15} />
                      <span>{event.location}</span>
                    </div>

                    <div className="event-detail">
                      <Ticket size={15} />
                      <span className={isLowStock ? "text-warning font-semibold" : ""}>
                        {seatsRemaining} tickets remaining
                      </span>
                    </div>
                  </div>

                  <div className="event-bottom">
                    <div className="event-price-wrapper">
                      <span className="price-label">Admission from</span>
                      <strong className="event-price-amount">₹{event.price}</strong>
                    </div>

                    <Link to={`/events/${event.id}`} className="book-btn">
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          WHY EVENTSPHERE VALUE PILLARS
          ========================================================= */}
      <section className="value-pillars-section">
        <div className="section-header-centered">
          <span className="section-label">BUILT FOR ATTENDEES & HOSTS</span>
          <h2>The EventSphere Advantage</h2>
          <p>Everything you need for seamless registration, ticketing, and event day entry.</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ background: "#eef2ff", color: "#4f46e5" }}>
              <QrCode size={24} />
            </div>
            <h3>Instant Digital E-Tickets</h3>
            <p>
              Receive your confirmed ticket with an encrypted QR code immediately upon checkout. No printing required—just show your phone at the gate.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ background: "#ecfdf5", color: "#059669" }}>
              <ShieldCheck size={24} />
            </div>
            <h3>Guaranteed Ticket Validity</h3>
            <p>
              Direct integration with organizers means every ticket is 100% genuine and verified against real-time seat inventory.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Zap size={24} />
            </div>
            <h3>Swift UPI & Card Checkout</h3>
            <p>
              Enjoy transparent pricing with zero surprise service fees. Support for UPI QR scanning, debit cards, and simulated instant confirmation.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box" style={{ background: "#f0f9ff", color: "#0284c7" }}>
              <TrendingUp size={24} />
            </div>
            <h3>Real-Time Organizer Suite</h3>
            <p>
              Organizers get live sales analytics, ticket tier control, attendee check-in management, and automated revenue dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          TESTIMONIALS / SOCIAL PROOF
          ========================================================= */}
      <section className="testimonials-section">
        <div className="section-header-centered">
          <span className="section-label">COMMUNITY VOICES</span>
          <h2>Loved by Attendees & Creators</h2>
          <p>Read what our verified event attendees and organizers have to say.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="testimonial-rating">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-quote">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.avatar}</div>
                <div className="author-meta">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          ORGANIZER CTA BANNER
          ========================================================= */}
      <section className="cta-banner">
        <div className="cta-banner-content">
          <span className="section-label cta-tag">FOR ORGANIZERS & CREATORS</span>
          <h2>Planning a conference, concert, or workshop?</h2>
          <p>
            Publish your event to thousands of active attendees in minutes. Monitor registrations, manage capacity, and track sales revenue with comprehensive dashboards.
          </p>
          <div className="cta-banner-badges">
            <span><CheckCircle2 size={15} /> Instant Event Publishing</span>
            <span><CheckCircle2 size={15} /> Automated Attendee Passports</span>
            <span><CheckCircle2 size={15} /> Real-Time Analytics</span>
          </div>
        </div>

        <div className="cta-banner-actions">
          <Link to="/register" className="cta-primary-btn">
            <span>Create Organizer Account</span>
            <ArrowRight size={17} />
          </Link>
          <Link to="/events" className="cta-secondary-btn">
            <span>Browse Active Events</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;