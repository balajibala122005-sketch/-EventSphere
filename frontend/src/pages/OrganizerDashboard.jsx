import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Ticket,
  Users,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

import {
  getEvents,
  createEvent,
  deleteEvent,
  getCurrentUser,
  getOrganizerBookings,
} from "../services/eventService";
import { useToast } from "../context/ToastContext";

function OrganizerDashboard() {
  const { showToast } = useToast();
  const user = getCurrentUser();
  const userId = user?.id ?? user?.userId;

  // States
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("EVENTS"); // 'EVENTS' | 'CREATE' | 'BOOKINGS'

  // Create event form
  const [form, setForm] = useState({
    title: "",
    category: "Technology",
    description: "",
    date: "",
    location: "",
    price: "",
    availableTickets: "",
  });

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const eventData = await getEvents();
        setEvents(Array.isArray(eventData) ? eventData : []);

        if (userId) {
          try {
            const bookingData = await getOrganizerBookings(userId);
            setBookings(Array.isArray(bookingData) ? bookingData : []);
          } catch (bookingError) {
            console.error("Organizer booking loading error:", bookingError);
            setBookings([]);
          }
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Unable to load organizer dashboard. Please verify backend connectivity.");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Form handler
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // ==========================================
  // CREATE EVENT
  // ==========================================
  async function handleCreateEvent(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.title.trim()) {
      setError("Please enter an event name.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter an event description.");
      return;
    }

    if (!form.date) {
      setError("Please select an event date and time.");
      return;
    }

    if (new Date(form.date) <= new Date()) {
      setError("Please select a future date and time for the event.");
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter an event location.");
      return;
    }

    if (Number(form.price) < 0) {
      setError("Ticket price cannot be negative.");
      return;
    }

    if (Number(form.availableTickets) < 1) {
      setError("Available tickets must be at least 1.");
      return;
    }

    try {
      const eventData = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        eventDate: form.date,
        location: form.location.trim(),
        ticketPrice: Number(form.price),
        totalTickets: Number(form.availableTickets),
        organizerId: userId,
      };

      const savedEvent = await createEvent(eventData);

      setEvents((previousEvents) => [...previousEvents, savedEvent]);

      setForm({
        title: "",
        category: "Technology",
        description: "",
        date: "",
        location: "",
        price: "",
        availableTickets: "",
      });

      setMessage("Event created successfully! It is now live for reservations.");
      showToast("Event created successfully! It is now live.", "success");
      setActiveTab("EVENTS");
    } catch (err) {
      console.error("Create event error:", err);
      setError("Failed to create event. Please verify backend status and try again.");
      showToast("Failed to create event. Please check inputs.", "error");
    }
  }

  // ==========================================
  // DELETE EVENT
  // ==========================================
  async function handleDeleteEvent(id) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this event? This action cannot be undone."
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await deleteEvent(id);

      setEvents((previousEvents) => previousEvents.filter((event) => event.id !== id));
      setMessage("Event deleted successfully.");
      showToast("Event deleted successfully.", "info");
    } catch (err) {
      console.error("Delete event error:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to delete event. Active bookings may exist.";
      setError(errMsg);
      showToast(errMsg, "error");
    }
  }

  // Filter events belonging to this organizer
  const myEvents = useMemo(() => {
    return events.filter((event) => {
      return (
        String(event.organizerId) === String(userId) ||
        (!event.organizerId && event.organizer === user?.name)
      );
    });
  }, [events, userId, user?.name]);

  const myBookings = bookings;

  // Aggregate stats
  const stats = useMemo(() => {
    const totalTicketsSold = myBookings.reduce(
      (sum, b) => sum + (Number(b.numberOfTickets) || 0),
      0
    );
    const totalRevenue = myBookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    return {
      eventsCount: myEvents.length,
      bookingsCount: myBookings.length,
      totalTicketsSold,
      totalRevenue,
    };
  }, [myEvents, myBookings]);

  // ==========================================
  // ORGANIZER ACCESS GATE
  // ==========================================
  if (!user || user.role?.toUpperCase() !== "ORGANIZER") {
    return (
      <main className="page-container">
        <div className="empty-state" style={{ borderColor: "var(--warning-border)", background: "var(--warning-bg)" }}>
          <AlertCircle size={32} color="var(--warning)" />
          <h2 style={{ color: "var(--warning)" }}>Organizer Portal Restricted</h2>
          <p>
            You must be logged in with an Organizer account to access this portal. Please sign in or register with an Organizer profile.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <Link to="/login" className="primary-btn">
              Sign In
            </Link>
            <Link to="/register" className="secondary-btn">
              Create Organizer Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <RefreshCw size={32} className="animate-spin" />
          <h2>Loading Organizer Dashboard</h2>
          <p>Retrieving your published events and attendee reservations...</p>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN VIEW
  // ==========================================
  return (
    <main className="page-container">
      {/* Page Header */}
      <div className="page-heading">
        <span className="section-label">ORGANIZER PORTAL</span>
        <h1>Organizer Dashboard</h1>
        <p>Welcome back, {user.name}. Manage your published events, inventory, and track registrations.</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="form-error" role="alert" style={{ marginBottom: "20px" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="success-message" role="status" style={{ marginBottom: "20px" }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-info">
            <span>My Events</span>
            <h2>{stats.eventsCount}</h2>
          </div>
          <div className="stat-icon">
            <CalendarDays size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span>Bookings Received</span>
            <h2>{stats.bookingsCount}</h2>
          </div>
          <div className="stat-icon">
            <Ticket size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span>Tickets Sold</span>
            <h2>{stats.totalTicketsSold}</h2>
          </div>
          <div className="stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span>Confirmed Revenue</span>
            <h2>₹{stats.totalRevenue.toLocaleString("en-IN")}</h2>
          </div>
          <div className="stat-icon">
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs" role="tablist">
        <button
          type="button"
          className={`tab-btn ${activeTab === "EVENTS" ? "active" : ""}`}
          onClick={() => setActiveTab("EVENTS")}
          role="tab"
          aria-selected={activeTab === "EVENTS"}
        >
          My Events ({myEvents.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "CREATE" ? "active" : ""}`}
          onClick={() => setActiveTab("CREATE")}
          role="tab"
          aria-selected={activeTab === "CREATE"}
        >
          Create New Event
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === "BOOKINGS" ? "active" : ""}`}
          onClick={() => setActiveTab("BOOKINGS")}
          role="tab"
          aria-selected={activeTab === "BOOKINGS"}
        >
          Attendee Bookings ({myBookings.length})
        </button>
      </div>

      {/* TAB 1: MY EVENTS */}
      {activeTab === "EVENTS" && (
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Published Events ({myEvents.length})</h2>
            <button
              type="button"
              className="primary-btn"
              onClick={() => setActiveTab("CREATE")}
            >
              <Plus size={16} />
              <span>Create New Event</span>
            </button>
          </div>

          {myEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FolderOpen size={28} />
              </div>
              <h3>No Events Created Yet</h3>
              <p>You haven't published any events yet. Create your first event to start accepting registrations.</p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => setActiveTab("CREATE")}
                style={{ marginTop: "12px" }}
              >
                <Plus size={16} />
                <span>Create an Event</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {myEvents.map((event) => (
                <article className="organizer-event-card" key={event.id}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="section-label" style={{ fontSize: "11px" }}>
                        {event.category || "General"}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "18px", color: "var(--navy)", marginTop: "4px" }}>
                      {event.title}
                    </h3>

                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px", maxWidth: "600px" }}>
                      {event.description}
                    </p>

                    <div className="organizer-event-meta">
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <CalendarDays size={14} color="var(--text-muted)" />
                        {event.eventDate ? new Date(event.eventDate).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "N/A"}
                      </span>

                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        {event.location}
                      </span>

                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Ticket size={14} color="var(--text-muted)" />
                        {event.availableTickets} tickets remaining
                      </span>

                      <span style={{ fontWeight: 700, color: "var(--navy)" }}>
                        ₹{event.ticketPrice} / ticket
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link to={`/events/${event.id}`} className="outline-btn" style={{ minHeight: "36px" }}>
                      View Live
                    </Link>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDeleteEvent(event.id)}
                      aria-label={`Delete event ${event.title}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: CREATE EVENT */}
      {activeTab === "CREATE" && (
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Create New Event</h2>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              All fields are required
            </span>
          </div>

          <form className="event-form" onSubmit={handleCreateEvent}>
            {/* Event Title */}
            <label>
              Event Title
              <input
                className="form-input"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Next-Gen Tech Summit 2026"
                required
              />
            </label>

            {/* Category */}
            <label>
              Category
              <select
                className="form-input"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Education">Education & Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Business">Business & Networking</option>
              </select>
            </label>

            {/* Date & Time */}
            <label>
              Event Date & Time
              <input
                className="form-input"
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </label>

            {/* Location */}
            <label>
              Venue / Location
              <input
                className="form-input"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Grand Convention Center, Chennai"
                required
              />
            </label>

            {/* Price */}
            <label>
              Ticket Price (₹)
              <input
                className="form-input"
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="499"
                required
              />
            </label>

            {/* Available Tickets */}
            <label>
              Available Tickets / Seats
              <input
                className="form-input"
                type="number"
                name="availableTickets"
                min="1"
                value={form.availableTickets}
                onChange={handleChange}
                placeholder="100"
                required
              />
            </label>

            {/* Description */}
            <label className="full-width">
              Event Description & Schedule
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe key speakers, agenda, entry requirements, and what attendees can expect..."
                rows="4"
                required
              />
            </label>

            {/* Form Actions */}
            <div className="event-form-actions">
              <button type="submit" className="primary-btn">
                <Plus size={16} />
                <span>Publish Event</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* TAB 3: ATTENDEE BOOKINGS */}
      {activeTab === "BOOKINGS" && (
        <section className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Attendee Registrations ({myBookings.length})</h2>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Bookings made across all your published events
            </span>
          </div>

          {myBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Ticket size={28} />
              </div>
              <h3>No Registrations Yet</h3>
              <p>As attendees register for your events, their ticket orders and contact information will appear here.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Event</th>
                    <th>Attendee</th>
                    <th>Email</th>
                    <th>Tickets</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booked On</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b.bookingId}>
                      <td style={{ fontFamily: "monospace", fontWeight: 600 }}>#{b.bookingId}</td>
                      <td style={{ fontWeight: 600 }}>{b.eventTitle || "Special Event"}</td>
                      <td>{b.userName || "Attendee"}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{b.userEmail || "—"}</td>
                      <td>{b.numberOfTickets}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`booking-status ${b.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                          {b.status || "CONFIRMED"}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                        {b.bookingDate
                          ? new Date(b.bookingDate).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default OrganizerDashboard;