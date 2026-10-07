import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
  Bell,
  Activity,
  Settings,
  ArrowLeft,
  LogOut,
  X,
} from "lucide-react";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) {
  const navItems = [
    { id: "DASHBOARD", label: "Dashboard", icon: LayoutDashboard },
    { id: "USERS", label: "Users", icon: Users },
    { id: "EVENTS", label: "Events", icon: CalendarDays },
    { id: "BOOKINGS", label: "Bookings", icon: Ticket },
    { id: "ANALYTICS", label: "Analytics", icon: BarChart3 },
    { id: "NOTIFICATIONS", label: "Notifications", icon: Bell, badge: unreadCount },
    { id: "ACTIVITY", label: "Activity Logs", icon: Activity },
    { id: "SETTINGS", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`} aria-label="Admin Navigation">
        {/* Brand Header */}
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">
            <CalendarDays size={20} color="#FFFFFF" />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">EventSphere</span>
            <span className="admin-brand-badge">ADMIN CONSOLE</span>
          </div>
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="admin-nav-list" role="navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className="admin-nav-icon" />
                <span className="admin-nav-label">{item.label}</span>
                {item.badge > 0 && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-footer-btn" title="Return to EventSphere platform">
            <ArrowLeft size={16} />
            <span>Back to EventSphere</span>
          </Link>
          <button
            type="button"
            className="admin-footer-btn logout"
            onClick={onLogout}
            title="Log out from Admin Console"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
