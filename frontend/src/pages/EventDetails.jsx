import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Ticket,
  ArrowLeft,
  Minus,
  Plus,
  CreditCard,
  CheckCircle,
  ShieldCheck,
  Info,
  Clock,
  QrCode,
  Tag,
  AlertCircle,
  Copy,
  Printer,
  Calendar,
  Share2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import {
  getEventById,
  createBooking,
  getCurrentUser,
} from "../services/eventService";
import { getEventImage } from "../services/eventImages";
import { useToast } from "../context/ToastContext";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("about"); // 'about' | 'venue' | 'guidelines'

  // Payment screen state
  const [showPayment, setShowPayment] = useState(false);

  // Payment completed state
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Booking result
  const [booking, setBooking] = useState(null);

  // =====================================================
  // LOAD EVENT
  // =====================================================
  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const data = await getEventById(id);
        setEvent(data);
      } catch (err) {
        console.error("Error loading event:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load event details. Please verify your backend server is active."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  // Format date helper
  function formatDate(dateValue) {
    if (!dateValue) return { full: "Date unavailable", dateOnly: "TBD", timeOnly: "" };

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return { full: "Date unavailable", dateOnly: "TBD", timeOnly: "" };

    const full = date.toLocaleString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const dateOnly = date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const timeOnly = date.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { full, dateOnly, timeOnly, rawDate: date };
  }

  // Copy address to clipboard
  function copyVenueAddress() {
    if (event?.location && navigator.clipboard) {
      navigator.clipboard.writeText(event.location);
      showToast("Venue address copied to clipboard!", "success");
    }
  }

  // Copy UPI ID
  function copyUpiId() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("eventsphere@upi");
      showToast("UPI ID copied to clipboard!", "success");
    }
  }

  // Share Event
  function handleShareEvent() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Event link copied to clipboard!", "success");
    }
  }

  // Generate Google Calendar Link
  function getGoogleCalendarUrl() {
    if (!event || !event.eventDate) return "#";
    const dateObj = new Date(event.eventDate);
    const startIso = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endDate = new Date(dateObj.getTime() + 3 * 60 * 60 * 1000);
    const endIso = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(event.title || "EventSphere Event");
    const details = encodeURIComponent(event.description || "");
    const location = encodeURIComponent(event.location || "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  }

  // Print Ticket Action
  function handlePrintTicket() {
    window.print();
  }

  // =====================================================
  // CONTINUE TO PAYMENT
  // =====================================================
  function handleContinueToPayment() {
    setError("");

    const currentUser = getCurrentUser();

    if (!currentUser) {
      showToast("Please log in to reserve tickets.", "info");
      navigate("/login");
      return;
    }

    const userId =
      currentUser.id ??
      currentUser.userId ??
      currentUser.user?.id;

    if (!userId) {
      setError("User profile was not found. Please log in again.");
      return;
    }

    if (!event || ticketCount < 1) {
      setError("Please select at least 1 ticket.");
      return;
    }

    if (ticketCount > event.availableTickets) {
      setError("Selected quantity exceeds remaining ticket inventory.");
      return;
    }

    setShowPayment(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // =====================================================
  // COMPLETE PAYMENT & CREATE BOOKING
  // =====================================================
  async function handlePaymentComplete() {
    setError("");

    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    const userId =
      currentUser.id ??
      currentUser.userId ??
      currentUser.user?.id;

    if (!userId) {
      setError("Your user identity was not found. Please re-login.");
      return;
    }

    try {
      setBookingLoading(true);

      const bookingData = await createBooking(
        userId,
        event.id,
        ticketCount
      );

      setBooking(bookingData);
      setPaymentCompleted(true);
      showToast("Payment verified! Your tickets are confirmed.", "success");

      // Reload event to refresh ticket counts
      try {
        const updatedEvent = await getEventById(id);
        setEvent(updatedEvent);
      } catch (reErr) {
        console.warn("Could not refresh event data after booking", reErr);
      }

      setTicketCount(1);
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Payment processing failed. Please verify your connection."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Ticket size={32} className="animate-spin" />
          </div>
          <h2>Loading Event Details</h2>
          <p>Connecting to secure event service to fetch seat capacity and schedules...</p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR STATE / NOT FOUND
  // =====================================================
  if (error && !event) {
    return (
      <main className="page-container">
        <div className="empty-state error-state">
          <div className="empty-state-icon">
            <AlertCircle size={32} />
          </div>
          <h2>Unable to Load Event</h2>
          <p>{error}</p>
          <Link to="/events" className="primary-btn" style={{ marginTop: "16px" }}>
            <ArrowLeft size={16} />
            <span>Back to All Events</span>
          </Link>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Ticket size={32} />
          </div>
          <h2>Event Not Found</h2>
          <p>The event you are looking for does not exist or may have been archived.</p>
          <Link to="/events" className="primary-btn" style={{ marginTop: "16px" }}>
            <ArrowLeft size={16} />
            <span>Browse Available Events</span>
          </Link>
        </div>
      </main>
    );
  }

  const totalAmount = (Number(event.ticketPrice) || 0) * ticketCount;
  const imageUrl = getEventImage(event);
  const isSoldOut = Number(event.availableTickets) <= 0;
  const isLowStock = !isSoldOut && Number(event.availableTickets) <= 15;
  const formattedDate = formatDate(event.eventDate);

  // =====================================================
  // PAYMENT SCREEN
  // =====================================================
  if (showPayment && !paymentCompleted) {
    return (
      <main className="page-container checkout-container">
        <div className="payment-page">
          <button
            type="button"
            className="back-nav-link"
            onClick={() => {
              setShowPayment(false);
              setError("");
            }}
          >
            <ArrowLeft size={16} />
            <span>Return to Event Details</span>
          </button>

          <div className="payment-header-center">
            <span className="section-label">
              <Sparkles size={13} /> SECURE CHECKOUT
            </span>
            <h1>Scan & Pay via UPI Demo</h1>
            <p>Scan with Google Pay, PhonePe, Paytm, or any UPI app to confirm your booking.</p>
          </div>

          <div className="payment-card-layout">
            {/* Left: QR Code & Payment Apps */}
            <div className="payment-left-card">
              <div className="qr-wrapper-enhanced">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                    `upi://pay?pa=eventsphere@upi&pn=EventSphere&am=${totalAmount}&cu=INR`
                  )}`}
                  alt="EventSphere UPI Payment QR Code"
                  className="payment-qr-img"
                />
                <span className="qr-scan-badge">Scan to Pay</span>
              </div>

              <div className="upi-details-box">
                <span className="upi-label">UPI ID:</span>
                <strong className="upi-vpa">eventsphere@upi</strong>
                <button
                  type="button"
                  className="copy-mini-btn"
                  onClick={copyUpiId}
                  title="Copy UPI ID"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>

              <div className="supported-apps-row">
                <span className="supported-app-badge">GPay</span>
                <span className="supported-app-badge">PhonePe</span>
                <span className="supported-app-badge">Paytm</span>
                <span className="supported-app-badge">BHIM</span>
              </div>

              {/* Demo Mode Notice */}
              <div className="demo-payment-alert">
                <Info size={18} className="demo-alert-icon" />
                <div>
                  <strong>Safe Demo Simulation Mode</strong>
                  <p>
                    This is a prototype sandbox payment. No real funds will be deducted. Click below to confirm reservation and generate your official digital pass.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Confirmation CTA */}
            <div className="payment-right-card">
              <div className="payment-summary-header">
                <h3>Order Summary</h3>
                <span className="badge-pill in-stock">100% Guaranteed</span>
              </div>

              <div className="checkout-event-info">
                <h4>{event.title}</h4>
                <div className="checkout-meta-row">
                  <CalendarDays size={14} />
                  <span>{formattedDate.full}</span>
                </div>
                <div className="checkout-meta-row">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="payment-breakdown-list">
                <div className="breakdown-item">
                  <span>Ticket Price (×{ticketCount})</span>
                  <span>₹{Number(event.ticketPrice || 0) * ticketCount}</span>
                </div>
                <div className="breakdown-item">
                  <span>Convenience & Booking Fee</span>
                  <span className="text-success font-semibold">FREE (Waived)</span>
                </div>
                <div className="breakdown-item">
                  <span>GST / Tax (Demo)</span>
                  <span className="text-success font-semibold">₹0</span>
                </div>
                <div className="breakdown-total">
                  <span>Total Payable</span>
                  <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {error && (
                <div className="form-error" role="alert" style={{ marginBottom: "16px" }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                className="primary-btn payment-confirm-btn"
                onClick={handlePaymentComplete}
                disabled={bookingLoading}
              >
                <CreditCard size={18} />
                <span>
                  {bookingLoading
                    ? "Authorizing & Generating Tickets..."
                    : `Confirm Payment (₹${totalAmount.toLocaleString("en-IN")})`}
                </span>
              </button>

              <div className="checkout-trust-badges">
                <span><ShieldCheck size={14} /> Encrypted Digital Voucher</span>
                <span><CheckCircle size={14} /> Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PAYMENT / BOOKING SUCCESS SCREEN (BOARDING PASS)
  // =====================================================
  if (paymentCompleted && booking) {
    return (
      <main className="page-container">
        <div className="payment-success-wrapper">
          <div className="success-header-banner">
            <div className="success-icon-burst">
              <CheckCircle size={44} />
            </div>
            <span className="section-label">PAYMENT VERIFIED</span>
            <h1>You're Going! Ticket Confirmed</h1>
            <p>
              Your digital e-ticket has been generated and securely registered to your EventSphere profile.
            </p>
          </div>

          {/* Boarding Pass / Ticket Stub Card */}
          <div className="ticket-boarding-pass" id="printable-ticket">
            {/* Main Pass Section */}
            <div className="pass-main">
              <div className="pass-header">
                <div className="pass-logo">
                  Event<span>Sphere</span> Digital Pass
                </div>
                <span className="status-badge confirmed">CONFIRMED</span>
              </div>

              <h2 className="pass-event-title">{event.title}</h2>

              <div className="pass-grid">
                <div className="pass-data-item">
                  <span className="pass-label">ATTENDEE NAME</span>
                  <strong className="pass-val">
                    {getCurrentUser()?.name || "Verified Attendee"}
                  </strong>
                </div>

                <div className="pass-data-item">
                  <span className="pass-label">BOOKING ID</span>
                  <strong className="pass-val font-mono">#{booking.bookingId}</strong>
                </div>

                <div className="pass-data-item">
                  <span className="pass-label">DATE & TIME</span>
                  <strong className="pass-val">{formattedDate.full}</strong>
                </div>

                <div className="pass-data-item">
                  <span className="pass-label">VENUE LOCATION</span>
                  <strong className="pass-val">{event.location}</strong>
                </div>

                <div className="pass-data-item">
                  <span className="pass-label">SEATS / TICKETS</span>
                  <strong className="pass-val">
                    {booking.numberOfTickets} {booking.numberOfTickets === 1 ? "Ticket" : "Tickets"} (General Admission)
                  </strong>
                </div>

                <div className="pass-data-item">
                  <span className="pass-label">AMOUNT PAID</span>
                  <strong className="pass-val text-navy">
                    ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="pass-footer-note">
                <ShieldCheck size={16} />
                <span>Present this digital pass at the entrance gate for quick barcode check-in.</span>
              </div>
            </div>

            {/* Tear-Off QR Stub */}
            <div className="pass-stub">
              <div className="stub-notch top" />
              <div className="stub-notch bottom" />
              <div className="stub-content">
                <span className="stub-title">GATE ADMISSION</span>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    `EVENTSPHERE-PASS-${booking.bookingId}-${event.id}`
                  )}`}
                  alt="Entry QR"
                  className="stub-qr"
                />
                <span className="stub-code">PASS #{booking.bookingId}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="success-action-bar">
            <button
              type="button"
              className="outline-btn"
              onClick={handlePrintTicket}
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>

            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="outline-btn"
            >
              <Calendar size={16} />
              <span>Add to Google Calendar</span>
            </a>

            <Link to="/my-bookings" className="primary-btn">
              <Ticket size={16} />
              <span>Go to My Bookings</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // EVENT DETAILS SCREEN
  // =====================================================
  return (
    <main className="page-container">
      {/* Breadcrumb Navigation */}
      <nav className="details-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/events">Events</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{event.title}</span>
      </nav>

      <div className="event-details-layout">
        {/* Main Details Column */}
        <div className="event-details-main">
          {/* Banner Container */}
          <div className="event-details-banner">
            <img
              src={imageUrl}
              alt={event.title}
              className="event-details-image"
            />
            <div className="banner-overlay-gradient" />
            <div className="banner-top-badges">
              <span className="event-category-badge">
                {event.category || "General Event"}
              </span>
              <button
                type="button"
                className="banner-share-btn"
                onClick={handleShareEvent}
                title="Share event link"
                aria-label="Share event"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="event-details-body">
            <h1 className="event-details-title">{event.title}</h1>

            {/* Quick Meta Cards */}
            <div className="event-meta-grid">
              <div className="event-meta-card">
                <div className="meta-icon-box">
                  <CalendarDays size={18} />
                </div>
                <div className="meta-text">
                  <span className="meta-title">Date & Time</span>
                  <strong>{formattedDate.dateOnly}</strong>
                  <span className="meta-sub">{formattedDate.timeOnly || "All-Day Event"}</span>
                </div>
              </div>

              <div className="event-meta-card">
                <div className="meta-icon-box">
                  <MapPin size={18} />
                </div>
                <div className="meta-text">
                  <span className="meta-title">Venue Location</span>
                  <strong>{event.location}</strong>
                  <button
                    type="button"
                    className="copy-link-text"
                    onClick={copyVenueAddress}
                  >
                    Copy Address
                  </button>
                </div>
              </div>

              <div className="event-meta-card">
                <div className="meta-icon-box">
                  <Ticket size={18} />
                </div>
                <div className="meta-text">
                  <span className="meta-title">Seat Availability</span>
                  <strong>
                    {isSoldOut ? "Sold Out" : `${event.availableTickets} Remaining`}
                  </strong>
                  <span className="meta-sub">Real-Time Inventory</span>
                </div>
              </div>

              <div className="event-meta-card">
                <div className="meta-icon-box">
                  <Tag size={18} />
                </div>
                <div className="meta-text">
                  <span className="meta-title">Admission Category</span>
                  <strong>{event.category || "General Pass"}</strong>
                  <span className="meta-sub">Digital Pass Included</span>
                </div>
              </div>
            </div>

            {/* Interactive Tabbed Content */}
            <div className="details-tab-nav" role="tablist">
              <button
                type="button"
                className={`details-tab-btn ${activeTab === "about" ? "active" : ""}`}
                onClick={() => setActiveTab("about")}
                role="tab"
                aria-selected={activeTab === "about"}
              >
                About Event
              </button>
              <button
                type="button"
                className={`details-tab-btn ${activeTab === "venue" ? "active" : ""}`}
                onClick={() => setActiveTab("venue")}
                role="tab"
                aria-selected={activeTab === "venue"}
              >
                Venue & Schedule
              </button>
              <button
                type="button"
                className={`details-tab-btn ${activeTab === "guidelines" ? "active" : ""}`}
                onClick={() => setActiveTab("guidelines")}
                role="tab"
                aria-selected={activeTab === "guidelines"}
              >
                Guidelines & FAQs
              </button>
            </div>

            {/* Tab 1: About Event */}
            {activeTab === "about" && (
              <div className="tab-pane">
                <div className="event-description-text">
                  {event.description || (
                    "Join us for an immersive and memorable experience. Connect with subject matter experts, industry practitioners, and like-minded enthusiasts in a collaborative setting."
                  )}
                </div>

                <div className="event-highlights-box">
                  <h3>Highlights of this experience</h3>
                  <div className="highlights-grid">
                    <div className="highlight-pill">
                      <CheckCircle size={15} />
                      <span>Live Q&A and networking sessions</span>
                    </div>
                    <div className="highlight-pill">
                      <CheckCircle size={15} />
                      <span>Verified digital participation pass</span>
                    </div>
                    <div className="highlight-pill">
                      <CheckCircle size={15} />
                      <span>Complimentary refreshments & welcome kit</span>
                    </div>
                    <div className="highlight-pill">
                      <CheckCircle size={15} />
                      <span>Interactive breakout groups</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Venue & Schedule */}
            {activeTab === "venue" && (
              <div className="tab-pane">
                <div className="venue-detail-card">
                  <div className="venue-map-placeholder">
                    <MapPin size={32} />
                    <span>{event.location}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-maps-btn"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className="schedule-timeline">
                    <h3>Tentative Program Schedule</h3>
                    <div className="timeline-item">
                      <div className="timeline-time">09:00 AM</div>
                      <div className="timeline-content">
                        <strong>Gate Check-In & Welcome Desk</strong>
                        <p>Scan your EventSphere QR ticket and collect your name badge.</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-time">10:00 AM</div>
                      <div className="timeline-content">
                        <strong>Keynote & Opening Session</strong>
                        <p>Plenary presentation and introductory address.</p>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-time">01:00 PM</div>
                      <div className="timeline-content">
                        <strong>Networking Lunch & Interactive Expo</strong>
                        <p>Meet organizers, speakers, and fellow attendees.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Guidelines & FAQs */}
            {activeTab === "guidelines" && (
              <div className="tab-pane">
                <div className="guidelines-list">
                  <div className="guideline-card">
                    <h4>What should I bring to the event?</h4>
                    <p>
                      Please carry your digital booking voucher with the QR code on your smartphone. A valid government photo ID (Aadhaar / Driving License / Student ID) may be requested at the check-in desk.
                    </p>
                  </div>
                  <div className="guideline-card">
                    <h4>What is the cancellation and refund policy?</h4>
                    <p>
                      You can cancel your booking anytime before the event start time directly from your <strong>My Bookings</strong> dashboard. Your reserved tickets will immediately be credited back to the platform inventory.
                    </p>
                  </div>
                  <div className="guideline-card">
                    <h4>Can I transfer my ticket to a friend?</h4>
                    <p>
                      Yes! Since EventSphere uses secure digital vouchers, you can share your digital ticket PDF or booking reference ID with the individual attending on your behalf.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Ticket Reservation Sidebar */}
        <aside className="event-details-sidebar">
          <div className="booking-sidebar-card">
            <div className="sidebar-price-header">
              <div>
                <span className="price-label">Standard Admission</span>
                <div className="sidebar-price-value">
                  ₹{Number(event.ticketPrice || 0).toLocaleString("en-IN")}
                  <span className="sidebar-price-unit"> / ticket</span>
                </div>
              </div>

              <div
                className={`availability-pill ${
                  isSoldOut ? "sold-out" : isLowStock ? "low-stock" : "in-stock"
                }`}
              >
                {isSoldOut
                  ? "Sold Out"
                  : isLowStock
                  ? `Only ${event.availableTickets} Left!`
                  : "Seats Available"}
              </div>
            </div>

            {!isSoldOut && (
              <>
                <div className="ticket-select-group">
                  <div className="stepper-label-row">
                    <label htmlFor="ticket-quantity">Quantity of Tickets</label>
                    <span className="stepper-subtext">Max {Math.min(event.availableTickets, 10)} per booking</span>
                  </div>

                  <div className="ticket-stepper">
                    <button
                      type="button"
                      className="step-btn"
                      onClick={() => setTicketCount((count) => Math.max(1, count - 1))}
                      disabled={ticketCount <= 1 || bookingLoading}
                      aria-label="Decrease ticket quantity"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="ticket-stepper-value" id="ticket-quantity">
                      {ticketCount}
                    </span>

                    <button
                      type="button"
                      className="step-btn"
                      onClick={() =>
                        setTicketCount((count) =>
                          Math.min(event.availableTickets, count + 1)
                        )
                      }
                      disabled={ticketCount >= event.availableTickets || bookingLoading}
                      aria-label="Increase ticket quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="quick-ticket-presets">
                    {[1, 2, 4].map((num) => {
                      if (num <= event.availableTickets) {
                        return (
                          <button
                            key={num}
                            type="button"
                            className={`preset-btn ${ticketCount === num ? "active" : ""}`}
                            onClick={() => setTicketCount(num)}
                          >
                            {num} {num === 1 ? "Ticket" : "Tickets"}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                {/* Price Breakdown Calculation */}
                <div className="price-summary-breakdown">
                  <div className="summary-row">
                    <span>Tickets (₹{Number(event.ticketPrice || 0).toLocaleString("en-IN")} × {ticketCount})</span>
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="summary-row">
                    <span>Convenience Fee</span>
                    <span className="text-success font-semibold">₹0 (Waived)</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="form-error" role="alert" style={{ marginBottom: "14px" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Continue to Payment CTA */}
            <button
              type="button"
              className={`payment-start-btn ${isSoldOut ? "disabled" : ""}`}
              onClick={handleContinueToPayment}
              disabled={bookingLoading || isSoldOut}
            >
              <CreditCard size={18} />
              <span>{isSoldOut ? "Event Sold Out" : "Continue to Payment"}</span>
            </button>

            {/* Guarantees & Reassurance Badges */}
            <div className="sidebar-guarantees">
              <div className="guarantee-item">
                <ShieldCheck size={16} />
                <span>100% Genuine Tickets & Verified Organizer</span>
              </div>
              <div className="guarantee-item">
                <Clock size={16} />
                <span>Instant QR Confirmation & Voucher</span>
              </div>
              <div className="guarantee-item">
                <QrCode size={16} />
                <span>Zero Booking Surcharge (UPI Demo)</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default EventDetails;