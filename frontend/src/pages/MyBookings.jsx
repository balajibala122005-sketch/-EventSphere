import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  XCircle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Search,
  Printer,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import {
  getBookings,
  getCurrentUser,
  cancelBooking,
} from "../services/eventService";
import { useToast } from "../context/ToastContext";

function MyBookings() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // 'ALL' | 'CONFIRMED' | 'CANCELLED'

  // Cancellation Modal State
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellingLoading, setCancellingLoading] = useState(false);

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================
  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const user = getCurrentUser();

      if (!user) {
        setError("Please log in to view your bookings and tickets.");
        setLoading(false);
        return;
      }

      const userId = user.id ?? user.userId ?? user.user?.id;

      if (!userId) {
        setError("User identity could not be verified. Please log in again.");
        setLoading(false);
        return;
      }

      const data = await getBookings(userId);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("Unable to load your bookings. Please verify that your backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Format date helper
  function formatDate(dateValue) {
    if (!dateValue) return { full: "Date not specified", dateOnly: "TBD", timeOnly: "" };

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return { full: "Date not specified", dateOnly: "TBD", timeOnly: "" };

    const full = date.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
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

  // =====================================================
  // CANCEL BOOKING
  // =====================================================
  async function confirmCancelBooking() {
    if (!bookingToCancel) return;

    const user = getCurrentUser();
    const userId = user?.id ?? user?.userId ?? user?.user?.id;

    try {
      setCancellingLoading(true);
      await cancelBooking(bookingToCancel.bookingId, userId);

      showToast(`Booking #${bookingToCancel.bookingId} cancelled successfully.`, "info");
      setBookingToCancel(null);

      // Refresh bookings
      const updated = await getBookings(userId);
      setBookings(Array.isArray(updated) ? updated : []);
    } catch (err) {
      console.error("Cancel booking error:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Unable to cancel booking. Please try again.";
      showToast(msg, "error");
    } finally {
      setCancellingLoading(false);
    }
  }

  // Calendar Link Generator
  function getGoogleCalendarUrl(b) {
    const title = encodeURIComponent(b.eventTitle || "EventSphere Pass");
    const location = encodeURIComponent(b.eventLocation || "");
    const dateObj = b.eventDate ? new Date(b.eventDate) : new Date();
    const startIso = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = new Date(dateObj.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&location=${location}`;
  }

  // Print single ticket
  function handlePrintPass() {
    window.print();
  }

  // Stats calculation
  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const totalSpent = bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    return { total, confirmed, cancelled, totalSpent };
  }, [bookings]);

  // Tab & search filtering
  const filteredBookings = useMemo(() => {
    let result = bookings;

    if (activeTab === "CONFIRMED") {
      result = result.filter((b) => b.status === "CONFIRMED");
    } else if (activeTab === "CANCELLED") {
      result = result.filter((b) => b.status === "CANCELLED");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          (b.eventTitle && b.eventTitle.toLowerCase().includes(q)) ||
          (b.eventLocation && b.eventLocation.toLowerCase().includes(q)) ||
          String(b.bookingId).includes(q)
      );
    }

    return result;
  }, [bookings, activeTab, searchQuery]);

  return (
    <main className="bookings-page-wrapper">
      {/* Page Heading */}
      <section className="bookings-header-banner">
        <div className="bookings-header-content">
          <span className="section-label">
            <Ticket size={14} /> ATTENDEE PASSPORT
          </span>
          <h1>My Bookings & Tickets</h1>
          <p>
            Access your confirmed admission QR codes, view digital event receipts, or manage ticket reservations.
          </p>
        </div>

        {/* Stats Summary Row */}
        <div className="bookings-stats-grid">
          <div className="booking-stat-card">
            <span className="stat-label">Total Bookings</span>
            <strong className="stat-value">{stats.total}</strong>
          </div>
          <div className="booking-stat-card">
            <span className="stat-label">Active Passes</span>
            <strong className="stat-value text-success">{stats.confirmed}</strong>
          </div>
          <div className="booking-stat-card">
            <span className="stat-label">Total Spent</span>
            <strong className="stat-value">₹{stats.totalSpent.toLocaleString("en-IN")}</strong>
          </div>
          <div className="booking-stat-card">
            <span className="stat-label">Cancelled</span>
            <strong className="stat-value text-muted">{stats.cancelled}</strong>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bookings-controls-card">
        <div className="bookings-tabs" role="tablist">
          <button
            type="button"
            className={`booking-tab-btn ${activeTab === "ALL" ? "active" : ""}`}
            onClick={() => setActiveTab("ALL")}
            role="tab"
            aria-selected={activeTab === "ALL"}
          >
            All Bookings ({stats.total})
          </button>
          <button
            type="button"
            className={`booking-tab-btn ${activeTab === "CONFIRMED" ? "active" : ""}`}
            onClick={() => setActiveTab("CONFIRMED")}
            role="tab"
            aria-selected={activeTab === "CONFIRMED"}
          >
            Active Passes ({stats.confirmed})
          </button>
          <button
            type="button"
            className={`booking-tab-btn ${activeTab === "CANCELLED" ? "active" : ""}`}
            onClick={() => setActiveTab("CANCELLED")}
            role="tab"
            aria-selected={activeTab === "CANCELLED"}
          >
            Cancelled ({stats.cancelled})
          </button>
        </div>

        <div className="bookings-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by event, location, or #ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search bookings"
          />
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <RefreshCw size={28} className="animate-spin" />
          </div>
          <h3>Loading Your Bookings</h3>
          <p>Retrieving your confirmed tickets and admission codes...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="empty-state error-state">
          <div className="empty-state-icon">
            <AlertCircle size={28} />
          </div>
          <h3>Unable to Load Bookings</h3>
          <p>{error}</p>
          <button
            type="button"
            className="primary-btn"
            onClick={loadBookings}
            style={{ marginTop: "16px" }}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Bookings List (Boarding Pass Cards) */}
      {!loading && !error && (
        <>
          <div className="bookings-pass-list">
            {filteredBookings.map((b) => {
              const isConfirmed = b.status === "CONFIRMED";
              const isCancelled = b.status === "CANCELLED";
              const dateInfo = formatDate(b.eventDate);

              return (
                <div
                  className={`ticket-boarding-pass ${isCancelled ? "pass-cancelled" : ""}`}
                  key={b.bookingId}
                >
                  {/* Left: Main Ticket Details */}
                  <div className="pass-main">
                    <div className="pass-header">
                      <div className="pass-logo">
                        Event<span>Sphere</span> E-Pass
                      </div>
                      <span
                        className={`status-badge ${
                          isConfirmed ? "confirmed" : "cancelled"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h2 className="pass-event-title">{b.eventTitle || "Reserved Event"}</h2>

                    <div className="pass-grid">
                      <div className="pass-data-item">
                        <span className="pass-label">BOOKING ID</span>
                        <strong className="pass-val font-mono">#{b.bookingId}</strong>
                      </div>

                      <div className="pass-data-item">
                        <span className="pass-label">TICKETS</span>
                        <strong className="pass-val">
                          {b.numberOfTickets} {b.numberOfTickets === 1 ? "Seat" : "Seats"}
                        </strong>
                      </div>

                      <div className="pass-data-item">
                        <span className="pass-label">EVENT DATE</span>
                        <strong className="pass-val">{dateInfo.full}</strong>
                      </div>

                      <div className="pass-data-item">
                        <span className="pass-label">VENUE LOCATION</span>
                        <strong className="pass-val">{b.eventLocation || "Venue on Voucher"}</strong>
                      </div>

                      <div className="pass-data-item">
                        <span className="pass-label">TOTAL PAID</span>
                        <strong className="pass-val text-navy">
                          ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <div className="pass-data-item">
                        <span className="pass-label">PURCHASED ON</span>
                        <strong className="pass-val">{formatDate(b.bookingDate).dateOnly}</strong>
                      </div>
                    </div>

                    {/* Pass Footer Actions */}
                    <div className="pass-actions-row">
                      {isConfirmed && (
                        <>
                          <button
                            type="button"
                            className="pass-btn-action"
                            onClick={() => handlePrintPass(b.bookingId)}
                            title="Print this pass"
                          >
                            <Printer size={14} />
                            <span>Print / PDF</span>
                          </button>

                          <a
                            href={getGoogleCalendarUrl(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pass-btn-action"
                            title="Add to Google Calendar"
                          >
                            <Calendar size={14} />
                            <span>Add to Calendar</span>
                          </a>

                          <button
                            type="button"
                            className="pass-btn-cancel"
                            onClick={() => setBookingToCancel(b)}
                          >
                            <XCircle size={14} />
                            <span>Cancel Ticket</span>
                          </button>
                        </>
                      )}

                      {isCancelled && (
                        <div className="cancellation-stamp">
                          <XCircle size={15} />
                          <span>This ticket has been cancelled. Released to seat inventory.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Tear-Off QR Stub */}
                  <div className="pass-stub">
                    <div className="stub-notch top" />
                    <div className="stub-notch bottom" />
                    <div className="stub-content">
                      <span className="stub-title">GATE ACCESS</span>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                          `EVENTSPHERE-BOOKING-${b.bookingId}`
                        )}`}
                        alt={`QR Code for Booking #${b.bookingId}`}
                        className={`stub-qr ${isCancelled ? "qr-void" : ""}`}
                      />
                      <span className="stub-code">PASS #{b.bookingId}</span>
                      {isCancelled && <span className="stub-void-label">VOID</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search / No Bookings */}
          {filteredBookings.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Ticket size={32} />
              </div>
              <h3>No Bookings Found</h3>
              <p>
                {searchQuery
                  ? `No bookings matched your search query "${searchQuery}".`
                  : activeTab === "CONFIRMED"
                  ? "You do not have any active upcoming event passes."
                  : activeTab === "CANCELLED"
                  ? "You have not cancelled any bookings."
                  : "You haven't reserved tickets for any events yet."}
              </p>
              <Link to="/events" className="primary-btn" style={{ marginTop: "16px" }}>
                <span>Explore Upcoming Events</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </>
      )}

      {/* Cancellation Confirmation Modal */}
      {bookingToCancel && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <div className="modal-warning-icon">
                <AlertTriangle size={24} />
              </div>
              <h3>Cancel Ticket Reservation?</h3>
            </div>

            <p className="modal-text">
              Are you sure you want to cancel your booking for{" "}
              <strong>{bookingToCancel.eventTitle}</strong> (Booking #{bookingToCancel.bookingId})?
            </p>
            <p className="modal-subtext">
              Your {bookingToCancel.numberOfTickets} reserved ticket(s) will be released back to the event capacity.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setBookingToCancel(null)}
                disabled={cancellingLoading}
              >
                Keep My Booking
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={confirmCancelBooking}
                disabled={cancellingLoading}
              >
                {cancellingLoading ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyBookings;