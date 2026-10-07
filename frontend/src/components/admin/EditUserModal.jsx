import React, { useState } from "react";
import { X, Shield, UserCheck } from "lucide-react";

export default function EditUserModal({
  isOpen,
  user,
  currentAdminId,
  onSaveRole,
  onSaveStatus,
  onClose,
  loading = false,
}) {
  const [role, setRole] = useState("USER");
  const [status, setStatus] = useState("ACTIVE");

  React.useEffect(() => {
    if (user) {
      setRole(user.role || "USER");
      setStatus(user.status || "ACTIVE");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const isSelf = String(user.id) === String(currentAdminId);

  async function handleSubmit(e) {
    e.preventDefault();
    if (role !== user.role) {
      await onSaveRole(user.id, role);
    }
    if (status !== user.status) {
      await onSaveStatus(user.id, status);
    }
    onClose();
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="admin-modal-icon-badge primary">
              <UserCheck size={20} />
            </div>
            <div>
              <h3>Edit User Account</h3>
              <span style={{ fontSize: "12px", color: "#64748B" }}>
                {user.email} (ID #{user.id})
              </span>
            </div>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose} disabled={loading}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="admin-form-input disabled"
                value={user.name || "N/A"}
                disabled
              />
            </div>

            <div className="admin-form-group">
              <label>User Role</label>
              <select
                className="admin-form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSelf}
              >
                <option value="USER">USER (Attendee)</option>
                <option value="ORGANIZER">ORGANIZER (Event Creator)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
              {isSelf && (
                <span className="admin-form-hint warning">
                  You cannot change the role of your own logged-in admin account.
                </span>
              )}
            </div>

            <div className="admin-form-group">
              <label>Account Status</label>
              <select
                className="admin-form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSelf}
              >
                <option value="ACTIVE">ACTIVE (Normal Access)</option>
                <option value="SUSPENDED">SUSPENDED (Access Blocked)</option>
              </select>
              {isSelf && (
                <span className="admin-form-hint warning">
                  You cannot suspend your own admin account.
                </span>
              )}
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
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={loading || (role === user.role && status === user.status)}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
