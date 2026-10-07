import React from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  confirmVariant = "danger", // "danger" | "warning" | "primary"
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className={`admin-modal-icon-badge ${confirmVariant}`}>
              <AlertTriangle size={20} />
            </div>
            <h3>{title}</h3>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          <p>{message}</p>
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
            type="button"
            className={`admin-btn-${confirmVariant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
