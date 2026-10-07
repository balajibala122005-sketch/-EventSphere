import React from "react";
import { X, Ticket, Calendar, MapPin, User, Mail, QrCode, Printer, CheckCircle2, XCircle } from "lucide-react";

export default function BookingDetailModal({
  isOpen,
  booking,
  onClose,
}) {
  if (!isOpen || !booking) return null;

  const isConfirmed = booking.status === "CONFIRMED";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className={`admin-modal-icon-badge ${isConfirmed ? "success" : "danger"}`}>
              <Ticket size={20} />
            </div>
            <div>
              <h3>Booking #{booking.bookingId}</h3>
              <span className={`booking-status-pill ${isConfirmed ? "confirmed" : "cancelled"}`}>
                {isConfirmed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {booking.status}
              </span>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Summary Box */}
          <div className="admin-booking-summary-box">
            <div className="admin-summary-item">
              <span className="summary-label">Total Amount</span>
              <strong className="summary-value" style={{ color: "#0F172A", fontSize: "20px" }}>
                ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="admin-summary-item">
              <span className="summary-label">Tickets Reserved</span>
              <strong className="summary-value">
                {booking.numberOfTickets} Pass{booking.numberOfTickets > 1 ? "es" : ""}
              </strong>
            </div>
            <div className="admin-summary-item">
              <span className="summary-label">Booking Date</span>
              <strong className="summary-value" style={{ fontSize: "13px" }}>
                {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString("en-IN") : "N/A"}
              </strong>
            </div>
          </div>

          {/* Attendee Info */}
          <div className="admin-detail-section">
            <h4>Attendee Information</h4>
            <div className="admin-detail-row">
              <span className="detail-key"><User size={14} /> Full Name:</span>
              <span className="detail-val">{booking.userName || "Attendee"}</span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-key"><Mail size={14} /> Email Address:</span>
              <span className="detail-val">{booking.userEmail || "—"}</span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-key">User ID:</span>
              <span className="detail-val">#{booking.userId}</span>
            </div>
          </div>

          {/* Event Info */}
          <div className="admin-detail-section">
            <h4>Event Details</h4>
            <div className="admin-detail-row">
              <span className="detail-key">Event:</span>
              <strong className="detail-val">{booking.eventTitle}</strong>
            </div>
            <div className="admin-detail-row">
              <span className="detail-key"><Calendar size={14} /> Schedule:</span>
              <span className="detail-val">
                {booking.eventDate ? new Date(booking.eventDate).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }) : "TBD"}
              </span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-key"><MapPin size={14} /> Location:</span>
              <span className="detail-val">{booking.eventLocation || "Venue TBD"}</span>
            </div>
            <div className="admin-detail-row">
              <span className="detail-key">Event ID:</span>
              <span className="detail-val">#{booking.eventId}</span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="admin-ticket-verification-strip">
            <QrCode size={36} color="#635BFF" />
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1E293B" }}>
                TICKET CODE: ESPH-{booking.bookingId}-{booking.eventId}
              </span>
              <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
                Verified digital entry token registered in EventSphere blockchain ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="admin-btn-primary" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
