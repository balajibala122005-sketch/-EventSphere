import React, { useState } from "react";
import { X, CalendarDays } from "lucide-react";

export default function EditEventModal({
  isOpen,
  event,
  onSave,
  onClose,
  loading = false,
}) {
  const [form, setForm] = useState({
    title: "",
    category: "Technology",
    description: "",
    eventDate: "",
    location: "",
    ticketPrice: 0,
    totalTickets: 100,
    availableTickets: 100,
  });

  React.useEffect(() => {
    if (event) {
      setForm({
        title: event.title || "",
        category: event.category || "Technology",
        description: event.description || "",
        eventDate: event.eventDate ? event.eventDate.slice(0, 16) : "",
        location: event.location || "",
        ticketPrice: event.ticketPrice || 0,
        totalTickets: event.totalTickets || 100,
        availableTickets: event.availableTickets || 100,
      });
    }
  }, [event]);

  if (!isOpen || !event) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(event.id, {
      ...event,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      eventDate: form.eventDate,
      location: form.location.trim(),
      ticketPrice: Number(form.ticketPrice),
      totalTickets: Number(form.totalTickets),
      availableTickets: Number(form.availableTickets),
    });
    onClose();
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-card large">
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="admin-modal-icon-badge primary">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3>Edit Catalog Event</h3>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                Event ID #{event.id}
              </span>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body grid-2">
            <div className="admin-form-group full-width">
              <label>Event Title</label>
              <input
                type="text"
                name="title"
                className="admin-form-input"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Category</label>
              <select
                name="category"
                className="admin-form-input"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Sports">Sports</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Event Date & Time</label>
              <input
                type="datetime-local"
                name="eventDate"
                className="admin-form-input"
                value={form.eventDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group full-width">
              <label>Location / Venue</label>
              <input
                type="text"
                name="location"
                className="admin-form-input"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Ticket Price (₹)</label>
              <input
                type="number"
                name="ticketPrice"
                min="0"
                step="0.01"
                className="admin-form-input"
                value={form.ticketPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Available Tickets</label>
              <input
                type="number"
                name="availableTickets"
                min="0"
                max={form.totalTickets}
                className="admin-form-input"
                value={form.availableTickets}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="3"
                className="admin-form-input"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
