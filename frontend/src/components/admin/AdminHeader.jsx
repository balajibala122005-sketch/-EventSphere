import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, Shield, Check, ExternalLink } from "lucide-react";

export default function AdminHeader({
  activeTab,
  user,
  setSidebarOpen,
  searchTerm,
  setSearchTerm,
  notifications = [],
  unreadCount = 0,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  setActiveTab,
}) {
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabTitles = {
    DASHBOARD: {
      title: "Dashboard Overview",
      subtitle: "System health, live transactional registers, and performance indicators",
    },
    USERS: {
      title: "User Management",
      subtitle: "Directory of registered attendees, organizers, and platform administrators",
    },
    EVENTS: {
      title: "Event Management",
      subtitle: "Catalog of published live conferences, workshops, and platform listings",
    },
    BOOKINGS: {
      title: "Booking Management",
      subtitle: "Verified attendee reservations, ticket counts, and settlement ledger",
    },
    ANALYTICS: {
      title: "Platform Analytics",
      subtitle: "Revenue trends, booking health, category volume, and attendee distribution",
    },
    NOTIFICATIONS: {
      title: "System Notifications",
      subtitle: "Real-time alerts, high-demand tickets, and operational updates",
    },
    ACTIVITY: {
      title: "Activity & Audit Logs",
      subtitle: "Complete tamper-resistant audit trail of administrative and user actions",
    },
    SETTINGS: {
      title: "Console Settings",
      subtitle: "Platform policies, configuration variables, and administrator profile",
    },
  };

  const current = tabTitles[activeTab] || tabTitles.DASHBOARD;

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="admin-header-title-box">
          <h1>{current.title}</h1>
          <p>{current.subtitle}</p>
        </div>
      </div>

      <div className="admin-header-right">
        {/* Global Search Filter */}
        {["USERS", "EVENTS", "BOOKINGS", "ACTIVITY"].includes(activeTab) && (
          <div className="admin-search-bar">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder={`Search in ${activeTab.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Notifications Button & Dropdown */}
        <div className="admin-notif-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="admin-notif-btn"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="admin-notif-dot">{unreadCount}</span>}
          </button>

          {notifDropdownOpen && (
            <div className="admin-notif-dropdown" role="menu">
              <div className="admin-notif-header">
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong>Notifications</strong>
                  {unreadCount > 0 && (
                    <span className="admin-badge-count">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="admin-notif-action-link"
                    onClick={() => onMarkAllNotificationsRead()}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="admin-notif-body">
                {notifications.length === 0 ? (
                  <div className="admin-notif-empty">No notifications available</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`admin-notif-item ${!n.isRead ? "unread" : ""}`}
                      onClick={() => onMarkNotificationRead(n.id)}
                    >
                      <div className="admin-notif-item-top">
                        <span className="admin-notif-item-title">{n.title}</span>
                        {!n.isRead && <span className="admin-notif-item-unread-dot" />}
                      </div>
                      <p className="admin-notif-item-desc">{n.message}</p>
                      <span className="admin-notif-item-time">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="admin-notif-footer">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("NOTIFICATIONS");
                    setNotifDropdownOpen(false);
                  }}
                  className="admin-notif-viewall"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Pill */}
        <div className="admin-profile-pill">
          <div className="admin-avatar">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
          </div>
          <div className="admin-profile-meta">
            <span className="admin-profile-name">{user?.name || "Administrator"}</span>
            <span className="admin-profile-role">
              <Shield size={10} />
              ADMIN
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
