import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Ticket,
  CreditCard,
  CheckCircle2,
  XCircle,
  Briefcase,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit,
  Trash2,
  Shield,
  Eye,
  Filter,
  Activity,
  Bell,
  Check,
} from "lucide-react";

import {
  getAdminStats,
  getAdminAnalytics,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAdminEvents,
  updateAdminEvent,
  deleteAdminEvent,
  getAdminBookings,
  getAdminActivityLogs,
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAdminSettings,
  updateAdminSettings,
} from "../services/adminService";

import { getCurrentUser } from "../services/eventService";
import { useToast } from "../context/ToastContext";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import ConfirmModal from "../components/admin/ConfirmModal";
import EditUserModal from "../components/admin/EditUserModal";
import EditEventModal from "../components/admin/EditEventModal";
import BookingDetailModal from "../components/admin/BookingDetailModal";
import { AdminBarChart, DistributionBar } from "../components/admin/SimpleChart";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = getCurrentUser();

  // Navigation & Layout
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    activeOrganizers: 0,
    upcomingEvents: 0,
  });

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    platformName: "EventSphere Global Platform",
    supportEmail: "support@eventsphere.com",
    currency: "INR (₹)",
    bookingFeePercent: 2.5,
    allowRegistrations: true,
    autoApproveEvents: true,
    contactNumber: "+91 98765 43210",
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("ALL");
  const [eventStatusFilter, setEventStatusFilter] = useState("ALL");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");
  const [activityEntityFilter, setActivityEntityFilter] = useState("ALL");

  // Modals state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    confirmVariant: "danger",
    onConfirm: () => {},
  });
  const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null });
  const [editEventModal, setEditEventModal] = useState({ isOpen: false, event: null });
  const [viewBookingModal, setViewBookingModal] = useState({ isOpen: false, booking: null });
  const [actionLoading, setActionLoading] = useState(false);

  // =========================================================
  // LOAD DATA
  // =========================================================
  const loadAllData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [
        statsData,
        analyticsData,
        usersData,
        eventsData,
        bookingsData,
        activityData,
        notifData,
        settingsData,
      ] = await Promise.all([
        getAdminStats(),
        getAdminAnalytics().catch(() => null),
        getAdminUsers().catch(() => []),
        getAdminEvents().catch(() => []),
        getAdminBookings().catch(() => []),
        getAdminActivityLogs().catch(() => []),
        getAdminNotifications().catch(() => []),
        getAdminSettings().catch(() => null),
      ]);

      if (statsData) setStats(statsData);
      if (analyticsData) setAnalytics(analyticsData);
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(eventsData)) setEvents(eventsData);
      if (Array.isArray(bookingsData)) setBookings(bookingsData);
      if (Array.isArray(activityData)) setActivityLogs(activityData);
      if (Array.isArray(notifData)) setNotifications(notifData);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error("Error loading admin data:", err);
      showToast("Unable to refresh admin metrics. Check server status.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [user?.role, loadAllData]);

  // Unread notifications count
  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("eventsphere_user");
    showToast("Logged out from Admin Console.", "info");
    navigate("/login");
  }

  // =========================================================
  // ACTIONS: NOTIFICATIONS
  // =========================================================
  async function handleMarkNotificationRead(id) {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark notification error:", err);
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("All notifications marked as read.", "success");
    } catch (err) {
      console.error("Mark all notifications error:", err);
    }
  }

  // =========================================================
  // ACTIONS: USERS
  // =========================================================
  async function handleSaveRole(userId, newRole) {
    try {
      setActionLoading(true);
      await updateUserRole(userId, newRole, user.id);
      showToast(`User role updated to ${newRole}.`, "success");
      await loadAllData(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update role.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveStatus(userId, newStatus) {
    try {
      setActionLoading(true);
      await updateUserStatus(userId, newStatus, user.id);
      showToast(`User account status updated to ${newStatus}.`, "success");
      await loadAllData(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update status.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  }

  function promptDeleteUser(targetUser) {
    if (String(targetUser.id) === String(user.id)) {
      showToast("You cannot delete your own logged-in administrator account.", "error");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete ${targetUser.name} (${targetUser.email})? If they have active tickets, you must suspend the account instead.`,
      confirmText: "Delete User",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await deleteUser(targetUser.id, user.id);
          showToast(`User ${targetUser.email} has been deleted.`, "info");
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await loadAllData(true);
        } catch (err) {
          const msg = err.response?.data?.error || "Failed to delete user.";
          showToast(msg, "error");
        } finally {
          setActionLoading(false);
        }
      },
    });
  }

  function promptToggleStatus(targetUser) {
    if (String(targetUser.id) === String(user.id)) {
      showToast("You cannot suspend your own logged-in administrator account.", "error");
      return;
    }

    const nextStatus = targetUser.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const isSuspending = nextStatus === "SUSPENDED";

    setConfirmModal({
      isOpen: true,
      title: isSuspending ? "Suspend User Account" : "Activate User Account",
      message: isSuspending
        ? `Are you sure you want to suspend ${targetUser.name} (${targetUser.email})? Their platform login and reservation privileges will be temporarily blocked.`
        : `Re-activate ${targetUser.name} (${targetUser.email})? Normal platform privileges will be restored immediately.`,
      confirmText: isSuspending ? "Suspend Account" : "Activate Account",
      confirmVariant: isSuspending ? "warning" : "primary",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await updateUserStatus(targetUser.id, nextStatus, user.id);
          showToast(`Account status set to ${nextStatus}.`, "success");
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await loadAllData(true);
        } catch (err) {
          const msg = err.response?.data?.error || "Failed to update status.";
          showToast(msg, "error");
        } finally {
          setActionLoading(false);
        }
      },
    });
  }

  // =========================================================
  // ACTIONS: EVENTS
  // =========================================================
  async function handleSaveEvent(eventId, updatedData) {
    try {
      setActionLoading(true);
      await updateAdminEvent(eventId, updatedData);
      showToast("Event details updated successfully.", "success");
      await loadAllData(true);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update event.";
      showToast(msg, "error");
    } finally {
      setActionLoading(false);
    }
  }

  function promptDeleteEvent(targetEvent) {
    setConfirmModal({
      isOpen: true,
      title: "Delete Catalog Event",
      message: `Are you sure you want to delete "${targetEvent.title}"? Note: If attendee bookings exist, the database will preserve historical records and prevent deletion.`,
      confirmText: "Delete Event",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          setActionLoading(true);
          await deleteAdminEvent(targetEvent.id);
          showToast(`Event "${targetEvent.title}" deleted successfully.`, "info");
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await loadAllData(true);
        } catch (err) {
          const msg = err.response?.data?.error || "Failed to delete event. Active bookings may exist.";
          showToast(msg, "error");
        } finally {
          setActionLoading(false);
        }
      },
    });
  }

  // =========================================================
  // ACTIONS: SETTINGS
  // =========================================================
  async function handleSaveSettings(e) {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updateAdminSettings(settings);
      showToast("Platform configurations updated successfully.", "success");
      await loadAllData(true);
    } catch {
      showToast("Failed to update platform settings.", "error");
    } finally {
      setActionLoading(false);
    }
  }

  // =========================================================
  // FILTERED DATASETS
  // =========================================================
  const filteredUsers = useMemo(() => {
    let result = users;
    if (userRoleFilter !== "ALL") {
      result = result.filter((u) => u.role?.toUpperCase() === userRoleFilter);
    }
    if (userStatusFilter !== "ALL") {
      result = result.filter((u) => (u.status || "ACTIVE").toUpperCase() === userStatusFilter);
    }
    if (searchTerm.trim() && activeTab === "USERS") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          String(u.id).includes(q)
      );
    }
    return result;
  }, [users, userRoleFilter, userStatusFilter, searchTerm, activeTab]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (eventCategoryFilter !== "ALL") {
      result = result.filter((e) => e.category === eventCategoryFilter);
    }
    if (eventStatusFilter !== "ALL") {
      const now = new Date();
      result = result.filter((e) => {
        const d = e.eventDate ? new Date(e.eventDate) : null;
        if (eventStatusFilter === "UPCOMING") return d && d >= now;
        if (eventStatusFilter === "COMPLETED") return d && d < now;
        return true;
      });
    }
    if (searchTerm.trim() && activeTab === "EVENTS") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          String(e.id).includes(q)
      );
    }
    return result;
  }, [events, eventCategoryFilter, eventStatusFilter, searchTerm, activeTab]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (bookingStatusFilter !== "ALL") {
      result = result.filter((b) => b.status === bookingStatusFilter);
    }
    if (searchTerm.trim() && activeTab === "BOOKINGS") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.eventTitle?.toLowerCase().includes(q) ||
          b.userName?.toLowerCase().includes(q) ||
          b.userEmail?.toLowerCase().includes(q) ||
          String(b.bookingId).includes(q)
      );
    }
    return result;
  }, [bookings, bookingStatusFilter, searchTerm, activeTab]);

  const filteredActivityLogs = useMemo(() => {
    let result = activityLogs;
    if (activityEntityFilter !== "ALL") {
      result = result.filter((a) => a.entityType === activityEntityFilter);
    }
    if (searchTerm.trim() && activeTab === "ACTIVITY") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.action?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.actorName?.toLowerCase().includes(q) ||
          a.actorEmail?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activityLogs, activityEntityFilter, searchTerm, activeTab]);

  // =========================================================
  // ACCESS RESTRICTION & LOADING
  // =========================================================
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="admin-access-denied-wrapper">
        <div className="admin-access-card">
          <div className="admin-access-icon">
            <AlertCircle size={36} color="#EF4444" />
          </div>
          <h2>Admin Console Access Restricted</h2>
          <p>
            You must be authenticated with an authorized platform administrator account to view
            and manage EventSphere systems.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Link to="/login" className="admin-btn-primary">
              Admin Login
            </Link>
            <Link to="/" className="admin-btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <RefreshCw size={36} className="admin-spin-icon" />
        <h2>Initializing EventSphere Admin Console</h2>
        <p>Connecting to database, calculating transactional metrics, and loading registers...</p>
      </div>
    );
  }

  // =========================================================
  // MAIN SaaS LAYOUT RENDER
  // =========================================================
  return (
    <div className="admin-saas-layout">
      {/* 1. Left Fixed Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadNotifCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* 2. Main Workspace */}
      <div className="admin-workspace">
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          user={user}
          setSidebarOpen={setSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          notifications={notifications}
          unreadCount={unreadNotifCount}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content Body */}
        <main className="admin-main-content">
          {/* =====================================================
              TAB 1: DASHBOARD OVERVIEW
             ===================================================== */}
          {activeTab === "DASHBOARD" && (
            <div className="admin-tab-pane">
              {/* Top Quick Actions Bar */}
              <div className="admin-overview-action-bar">
                <div>
                  <span className="admin-section-sub">REAL-TIME HEALTH & KPI REGISTERS</span>
                  <h2 style={{ fontSize: "20px", color: "#0F172A", marginTop: "2px" }}>
                    Platform Performance Overview
                  </h2>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => loadAllData(true)}
                    disabled={refreshing}
                  >
                    <RefreshCw size={14} className={refreshing ? "admin-spin-icon" : ""} />
                    <span>{refreshing ? "Refreshing..." : "Sync Live Data"}</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => setActiveTab("USERS")}
                  >
                    <Users size={14} />
                    <span>Manage Users</span>
                  </button>
                </div>
              </div>

              {/* 8 KPI Cards Grid */}
              <div className="admin-kpi-grid">
                {/* 1. Registered Users */}
                <div className="admin-kpi-card" onClick={() => setActiveTab("USERS")}>
                  <div className="kpi-icon-box" style={{ background: "#EEF2FF", color: "#635BFF" }}>
                    <Users size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Registered Users</span>
                    <h3 className="kpi-value">{stats.totalUsers}</h3>
                    <span className="kpi-context">Verified accounts in system</span>
                  </div>
                </div>

                {/* 2. Platform Events */}
                <div className="admin-kpi-card" onClick={() => setActiveTab("EVENTS")}>
                  <div className="kpi-icon-box" style={{ background: "#ECFDF5", color: "#10B981" }}>
                    <CalendarDays size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Platform Events</span>
                    <h3 className="kpi-value">{stats.totalEvents}</h3>
                    <span className="kpi-context">Catalog listings published</span>
                  </div>
                </div>

                {/* 3. Total Bookings */}
                <div className="admin-kpi-card" onClick={() => setActiveTab("BOOKINGS")}>
                  <div className="kpi-icon-box" style={{ background: "#F0F9FF", color: "#0284C7" }}>
                    <Ticket size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Total Bookings</span>
                    <h3 className="kpi-value">{stats.totalBookings}</h3>
                    <span className="kpi-context">Lifetime reservation orders</span>
                  </div>
                </div>

                {/* 4. Total Revenue */}
                <div className="admin-kpi-card" onClick={() => setActiveTab("ANALYTICS")}>
                  <div className="kpi-icon-box" style={{ background: "#FEF3C7", color: "#D97706" }}>
                    <CreditCard size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Total Revenue</span>
                    <h3 className="kpi-value">₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}</h3>
                    <span className="kpi-context">Gross ticket sales volume</span>
                  </div>
                </div>

                {/* 5. Confirmed Bookings */}
                <div className="admin-kpi-card">
                  <div className="kpi-icon-box" style={{ background: "#ECFDF5", color: "#059669" }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Confirmed Bookings</span>
                    <h3 className="kpi-value">{stats.confirmedBookings}</h3>
                    <span className="kpi-context">Active tickets issued</span>
                  </div>
                </div>

                {/* 6. Cancelled Bookings */}
                <div className="admin-kpi-card">
                  <div className="kpi-icon-box" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                    <XCircle size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Cancelled Bookings</span>
                    <h3 className="kpi-value">{stats.cancelledBookings}</h3>
                    <span className="kpi-context">Refunded & tickets returned</span>
                  </div>
                </div>

                {/* 7. Active Organizers */}
                <div className="admin-kpi-card" onClick={() => { setUserRoleFilter("ORGANIZER"); setActiveTab("USERS"); }}>
                  <div className="kpi-icon-box" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                    <Briefcase size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Active Organizers</span>
                    <h3 className="kpi-value">{stats.activeOrganizers}</h3>
                    <span className="kpi-context">Authorized event publishers</span>
                  </div>
                </div>

                {/* 8. Upcoming Events */}
                <div className="admin-kpi-card" onClick={() => { setEventStatusFilter("UPCOMING"); setActiveTab("EVENTS"); }}>
                  <div className="kpi-icon-box" style={{ background: "#FFFBEB", color: "#B45309" }}>
                    <Clock size={22} />
                  </div>
                  <div className="kpi-info">
                    <span className="kpi-label">Upcoming Events</span>
                    <h3 className="kpi-value">{stats.upcomingEvents}</h3>
                    <span className="kpi-context">Future scheduled dates</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Recent Bookings & Audit Activity Preview */}
              <div className="admin-split-grid">
                {/* Recent Bookings Preview */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Recent Ticket Orders</h3>
                      <span className="admin-card-sub">Latest verified transactions</span>
                    </div>
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() => setActiveTab("BOOKINGS")}
                    >
                      View All ({bookings.length})
                    </button>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ref</th>
                          <th>Attendee</th>
                          <th>Event</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.bookingId}>
                            <td style={{ fontFamily: "monospace", fontWeight: 600 }}>#{b.bookingId}</td>
                            <td>{b.userName || "Attendee"}</td>
                            <td style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {b.eventTitle}
                            </td>
                            <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                            <td>
                              <span className={`booking-status-pill ${b.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activity Stream */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Recent Audit Activity</h3>
                      <span className="admin-card-sub">Tamper-resistant event trail</span>
                    </div>
                    <button
                      type="button"
                      className="admin-link-btn"
                      onClick={() => setActiveTab("ACTIVITY")}
                    >
                      All Logs ({activityLogs.length})
                    </button>
                  </div>
                  <div className="admin-activity-stream">
                    {activityLogs.slice(0, 6).map((log) => (
                      <div key={log.id} className="activity-item">
                        <div className={`activity-bullet ${log.status?.toLowerCase() || "info"}`} />
                        <div className="activity-content">
                          <div className="activity-top">
                            <strong>{log.action}</strong>
                            <span className="activity-time">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                            </span>
                          </div>
                          <p className="activity-desc">{log.description}</p>
                          <span className="activity-actor">by {log.actorName || "Admin"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 2: USERS MANAGEMENT
             ===================================================== */}
          {activeTab === "USERS" && (
            <div className="admin-tab-pane">
              {/* Controls & Filter Bar */}
              <div className="admin-controls-card">
                <div className="admin-filters-group">
                  <div className="filter-pill-group">
                    <span className="filter-label"><Filter size={13} /> Role:</span>
                    {["ALL", "USER", "ORGANIZER", "ADMIN"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`filter-chip ${userRoleFilter === r ? "active" : ""}`}
                        onClick={() => setUserRoleFilter(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="filter-pill-group">
                    <span className="filter-label">Status:</span>
                    {["ALL", "ACTIVE", "SUSPENDED"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`filter-chip ${userStatusFilter === s ? "active" : ""}`}
                        onClick={() => setUserStatusFilter(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-controls-summary">
                  Showing <strong>{filteredUsers.length}</strong> of {users.length} registered accounts
                </div>
              </div>

              {/* Users Table */}
              <div className="admin-card">
                {filteredUsers.length === 0 ? (
                  <div className="admin-empty-state">
                    <Users size={32} color="#94A3B8" />
                    <h4>No users found</h4>
                    <p>Try clearing your search query or adjusting role and status filters.</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User ID</th>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined Date</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => {
                          const isSelf = String(u.id) === String(user.id);
                          const isSuspended = u.status === "SUSPENDED";

                          return (
                            <tr key={u.id}>
                              <td style={{ fontFamily: "monospace", fontWeight: 600 }}>#{u.id}</td>
                              <td style={{ fontWeight: 600, color: "#0F172A" }}>
                                {u.name}
                                {isSelf && <span className="self-tag">(You)</span>}
                              </td>
                              <td style={{ color: "#475569" }}>{u.email}</td>
                              <td style={{ color: "#64748B" }}>{u.phone || "—"}</td>
                              <td>
                                <span className={`user-role-badge ${u.role?.toLowerCase()}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td>
                                <span className={`user-status-badge ${isSuspended ? "suspended" : "active"}`}>
                                  {isSuspended ? "SUSPENDED" : "ACTIVE"}
                                </span>
                              </td>
                              <td style={{ color: "#64748B", fontSize: "12px" }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "Earlier"}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div className="admin-table-actions">
                                  <button
                                    type="button"
                                    className="table-action-btn edit"
                                    title="Edit user role & status"
                                    onClick={() => setEditUserModal({ isOpen: true, user: u })}
                                  >
                                    <Edit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    className={`table-action-btn ${isSuspended ? "activate" : "suspend"}`}
                                    title={isSuspended ? "Activate account" : "Suspend account"}
                                    onClick={() => promptToggleStatus(u)}
                                    disabled={isSelf}
                                  >
                                    <span>{isSuspended ? "Activate" : "Suspend"}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="table-action-btn delete"
                                    title="Delete user account"
                                    onClick={() => promptDeleteUser(u)}
                                    disabled={isSelf}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 3: EVENTS MANAGEMENT
             ===================================================== */}
          {activeTab === "EVENTS" && (
            <div className="admin-tab-pane">
              {/* Category & Status Filters */}
              <div className="admin-controls-card">
                <div className="admin-filters-group">
                  <div className="filter-pill-group">
                    <span className="filter-label"><Filter size={13} /> Category:</span>
                    {["ALL", "Technology", "Music", "Business", "Design", "Sports"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`filter-chip ${eventCategoryFilter === c ? "active" : ""}`}
                        onClick={() => setEventCategoryFilter(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <div className="filter-pill-group">
                    <span className="filter-label">Timeline:</span>
                    {["ALL", "UPCOMING", "COMPLETED"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`filter-chip ${eventStatusFilter === s ? "active" : ""}`}
                        onClick={() => setEventStatusFilter(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-controls-summary">
                  Showing <strong>{filteredEvents.length}</strong> of {events.length} catalog listings
                </div>
              </div>

              {/* Events Table */}
              <div className="admin-card">
                {filteredEvents.length === 0 ? (
                  <div className="admin-empty-state">
                    <CalendarDays size={32} color="#94A3B8" />
                    <h4>No events found</h4>
                    <p>Adjust category or timeline filters to view platform events.</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Event Name</th>
                          <th>Category</th>
                          <th>Location</th>
                          <th>Date & Time</th>
                          <th>Price</th>
                          <th>Capacity</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.map((ev) => {
                          const now = new Date();
                          const eventDate = ev.eventDate ? new Date(ev.eventDate) : null;
                          const isUpcoming = eventDate && eventDate >= now;
                          const bookedCount = (ev.totalTickets || 0) - (ev.availableTickets || 0);
                          const occupancyPct = ev.totalTickets > 0 ? Math.round((bookedCount / ev.totalTickets) * 100) : 0;

                          return (
                            <tr key={ev.id}>
                              <td style={{ fontFamily: "monospace", fontWeight: 600 }}>#{ev.id}</td>
                              <td>
                                <strong style={{ color: "#0F172A", display: "block" }}>{ev.title}</strong>
                                <span style={{ fontSize: "11px", color: "#64748B" }}>
                                  Organizer ID: #{ev.organizerId || "Platform"}
                                </span>
                              </td>
                              <td>
                                <span className="admin-category-pill">{ev.category || "General"}</span>
                              </td>
                              <td style={{ color: "#475569", maxWidth: "160px" }}>{ev.location}</td>
                              <td style={{ color: "#334155", fontSize: "12px" }}>
                                {eventDate ? eventDate.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "TBD"}
                              </td>
                              <td style={{ fontWeight: 700, color: "#0F172A" }}>₹{ev.ticketPrice}</td>
                              <td>
                                <div style={{ fontSize: "12px", color: "#475569", marginBottom: "4px" }}>
                                  {ev.availableTickets} / {ev.totalTickets} left
                                </div>
                                <div className="mini-progress-track">
                                  <div className="mini-progress-fill" style={{ width: `${occupancyPct}%` }} />
                                </div>
                              </td>
                              <td>
                                <span className={`event-status-pill ${isUpcoming ? "upcoming" : "completed"}`}>
                                  {isUpcoming ? "UPCOMING" : "COMPLETED"}
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div className="admin-table-actions">
                                  <Link
                                    to={`/events/${ev.id}`}
                                    target="_blank"
                                    className="table-action-btn view"
                                    title="View public event page"
                                  >
                                    <Eye size={14} />
                                    <span>View</span>
                                  </Link>
                                  <button
                                    type="button"
                                    className="table-action-btn edit"
                                    title="Edit event details"
                                    onClick={() => setEditEventModal({ isOpen: true, event: ev })}
                                  >
                                    <Edit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="table-action-btn delete"
                                    title="Delete event"
                                    onClick={() => promptDeleteEvent(ev)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 4: BOOKINGS MANAGEMENT
             ===================================================== */}
          {activeTab === "BOOKINGS" && (
            <div className="admin-tab-pane">
              {/* Status Filter */}
              <div className="admin-controls-card">
                <div className="admin-filters-group">
                  <div className="filter-pill-group">
                    <span className="filter-label"><Filter size={13} /> Order Status:</span>
                    {["ALL", "CONFIRMED", "CANCELLED"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`filter-chip ${bookingStatusFilter === s ? "active" : ""}`}
                        onClick={() => setBookingStatusFilter(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-controls-summary">
                  Showing <strong>{filteredBookings.length}</strong> of {bookings.length} reservations
                </div>
              </div>

              {/* Bookings Table */}
              <div className="admin-card">
                {filteredBookings.length === 0 ? (
                  <div className="admin-empty-state">
                    <Ticket size={32} color="#94A3B8" />
                    <h4>No bookings found</h4>
                    <p>Adjust your search query or booking status filter.</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th>
                          <th>Attendee</th>
                          <th>Event Name</th>
                          <th>Passes</th>
                          <th>Total Paid</th>
                          <th>Order Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((b) => (
                          <tr key={b.bookingId}>
                            <td style={{ fontFamily: "monospace", fontWeight: 700 }}>#{b.bookingId}</td>
                            <td>
                              <strong style={{ color: "#0F172A", display: "block" }}>{b.userName || "Attendee"}</strong>
                              <span style={{ fontSize: "11px", color: "#64748B" }}>{b.userEmail}</span>
                            </td>
                            <td>
                              <strong style={{ color: "#334155" }}>{b.eventTitle}</strong>
                              <span style={{ display: "block", fontSize: "11px", color: "#64748B" }}>
                                Event ID #{b.eventId}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{b.numberOfTickets}</td>
                            <td style={{ fontWeight: 700, color: "#0F172A" }}>
                              ₹{Number(b.totalAmount || 0).toLocaleString("en-IN")}
                            </td>
                            <td style={{ color: "#64748B", fontSize: "12px" }}>
                              {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN") : "—"}
                            </td>
                            <td>
                              <span className={`booking-status-pill ${b.status === "CONFIRMED" ? "confirmed" : "cancelled"}`}>
                                {b.status}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <button
                                type="button"
                                className="table-action-btn view"
                                title="Inspect receipt & attendee details"
                                onClick={() => setViewBookingModal({ isOpen: true, booking: b })}
                              >
                                <Eye size={14} />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 5: ANALYTICS & INSIGHTS
             ===================================================== */}
          {activeTab === "ANALYTICS" && (
            <div className="admin-tab-pane">
              <div className="admin-analytics-grid">
                {/* 1. Revenue Trends Overview */}
                <div className="admin-card full-width">
                  <div className="admin-card-header">
                    <div>
                      <h3>Revenue Performance Trends</h3>
                      <span className="admin-card-sub">Gross booking revenue mapped over recording periods</span>
                    </div>
                    <span className="admin-pill-tag">Live Database Telemetry</span>
                  </div>
                  <div style={{ padding: "16px 0" }}>
                    <AdminBarChart
                      data={analytics?.revenueTrends || []}
                      xKey="period"
                      yKey="revenue"
                      height={260}
                      color="#635BFF"
                    />
                  </div>
                </div>

                {/* 2. Booking Settlement Health */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Booking Settlement Health</h3>
                      <span className="admin-card-sub">Ratio of confirmed vs cancelled reservations</span>
                    </div>
                  </div>
                  <div style={{ padding: "20px 0" }}>
                    <DistributionBar
                      segments={[
                        { label: "Confirmed", value: stats.confirmedBookings, color: "#10B981" },
                        { label: "Cancelled", value: stats.cancelledBookings, color: "#EF4444" },
                      ]}
                      height={16}
                    />
                  </div>
                </div>

                {/* 3. User Community Breakdown */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>User Directory Breakdown</h3>
                      <span className="admin-card-sub">Attendees, registered organizers, and admins</span>
                    </div>
                  </div>
                  <div style={{ padding: "20px 0" }}>
                    <DistributionBar
                      segments={[
                        { label: "Attendees", value: analytics?.userAnalytics?.standardUsers || 0, color: "#635BFF" },
                        { label: "Organizers", value: analytics?.userAnalytics?.organizers || 0, color: "#F59E0B" },
                        { label: "Administrators", value: analytics?.userAnalytics?.admins || 0, color: "#0F172A" },
                      ]}
                      height={16}
                    />
                  </div>
                </div>

                {/* 4. Event Category Volume */}
                <div className="admin-card full-width">
                  <div className="admin-card-header">
                    <div>
                      <h3>Category Catalog Distribution</h3>
                      <span className="admin-card-sub">Active events published per interest discipline</span>
                    </div>
                  </div>
                  <div style={{ padding: "16px 0" }}>
                    <AdminBarChart
                      data={analytics?.categoryAnalytics || []}
                      xKey="category"
                      yKey="eventsCount"
                      height={220}
                      color="#10B981"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 6: NOTIFICATIONS
             ===================================================== */}
          {activeTab === "NOTIFICATIONS" && (
            <div className="admin-tab-pane">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h3>Operational Notifications ({notifications.length})</h3>
                    <span className="admin-card-sub">System updates, order alerts, and operational signals</span>
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={handleMarkAllNotificationsRead}
                    >
                      <Check size={14} />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="admin-empty-state">
                    <Bell size={32} color="#94A3B8" />
                    <h4>All caught up!</h4>
                    <p>There are no unread operational alerts at this time.</p>
                  </div>
                ) : (
                  <div className="admin-notif-full-list">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`admin-notif-full-item ${!n.isRead ? "unread" : ""}`}
                        onClick={() => handleMarkNotificationRead(n.id)}
                      >
                        <div className="notif-type-icon">
                          <Bell size={18} />
                        </div>
                        <div className="notif-content">
                          <div className="notif-title-row">
                            <strong>{n.title}</strong>
                            <span className="notif-time">
                              {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : "Recent"}
                            </span>
                          </div>
                          <p>{n.message}</p>
                          <div className="notif-footer-row">
                            <span className={`notif-badge ${n.type?.toLowerCase() || "info"}`}>
                              {n.type || "INFO"}
                            </span>
                            {!n.isRead && <span className="notif-unread-tag">New</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 7: ACTIVITY & AUDIT LOGS
             ===================================================== */}
          {activeTab === "ACTIVITY" && (
            <div className="admin-tab-pane">
              {/* Entity Filter */}
              <div className="admin-controls-card">
                <div className="admin-filters-group">
                  <div className="filter-pill-group">
                    <span className="filter-label"><Filter size={13} /> Entity Type:</span>
                    {["ALL", "USER", "EVENT", "BOOKING", "PLATFORM"].map((e) => (
                      <button
                        key={e}
                        type="button"
                        className={`filter-chip ${activityEntityFilter === e ? "active" : ""}`}
                        onClick={() => setActivityEntityFilter(e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-controls-summary">
                  Showing <strong>{filteredActivityLogs.length}</strong> recorded audit trail events
                </div>
              </div>

              {/* Logs Table */}
              <div className="admin-card">
                {filteredActivityLogs.length === 0 ? (
                  <div className="admin-empty-state">
                    <Activity size={32} color="#94A3B8" />
                    <h4>No activity logs match your filter</h4>
                    <p>Audit records are populated automatically as administrative operations execute.</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Actor</th>
                          <th>Action</th>
                          <th>Entity</th>
                          <th>Details & Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivityLogs.map((log) => (
                          <tr key={log.id}>
                            <td style={{ color: "#64748B", fontSize: "12px", whiteSpace: "nowrap" }}>
                              {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "medium" }) : "—"}
                            </td>
                            <td>
                              <strong style={{ color: "#0F172A", display: "block" }}>{log.actorName || "Admin"}</strong>
                              <span style={{ fontSize: "11px", color: "#64748B" }}>{log.actorEmail}</span>
                            </td>
                            <td>
                              <span className="admin-action-tag">{log.action}</span>
                            </td>
                            <td>
                              <span className="admin-entity-tag">{log.entityType}</span>
                            </td>
                            <td style={{ color: "#334155", maxWidth: "280px" }}>{log.description}</td>
                            <td>
                              <span className={`activity-status-badge ${log.status?.toLowerCase() || "success"}`}>
                                {log.status || "SUCCESS"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              TAB 8: CONSOLE SETTINGS
             ===================================================== */}
          {activeTab === "SETTINGS" && (
            <div className="admin-tab-pane">
              <div className="admin-split-grid">
                {/* Platform Settings Form */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Platform Environment Settings</h3>
                      <span className="admin-card-sub">Global variables and checkout parameters</span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} style={{ marginTop: "16px" }}>
                    <div className="admin-form-group">
                      <label>Platform Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={settings.platformName || ""}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Support Email Address</label>
                      <input
                        type="email"
                        className="admin-form-input"
                        value={settings.supportEmail || ""}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Default Currency</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={settings.currency || ""}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>Platform Booking Fee (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="25"
                        className="admin-form-input"
                        value={settings.bookingFeePercent ?? 2.5}
                        onChange={(e) => setSettings({ ...settings, bookingFeePercent: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div className="admin-form-group checkbox-group">
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!settings.allowRegistrations}
                          onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                        />
                        <span>Allow open public attendee and organizer registrations</span>
                      </label>
                    </div>

                    <div style={{ marginTop: "24px" }}>
                      <button
                        type="submit"
                        className="admin-btn-primary"
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Saving Configurations..." : "Save Platform Settings"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Admin Profile Details */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h3>Administrator Profile</h3>
                      <span className="admin-card-sub">Identity and credentials summary</span>
                    </div>
                  </div>

                  <div className="admin-profile-summary-box">
                    <div className="admin-large-avatar">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
                    </div>
                    <h4>{user?.name}</h4>
                    <span className="admin-profile-role-badge">
                      <Shield size={12} />
                      PLATFORM SUPER ADMINISTRATOR
                    </span>
                  </div>

                  <div className="admin-profile-fields">
                    <div className="admin-detail-row">
                      <span className="detail-key">Account Email:</span>
                      <strong className="detail-val">{user?.email}</strong>
                    </div>
                    <div className="admin-detail-row">
                      <span className="detail-key">Admin User ID:</span>
                      <span className="detail-val">#{user?.id}</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="detail-key">Security Access Level:</span>
                      <span className="detail-val">Tier 1 (Root Access)</span>
                    </div>
                    <div className="admin-detail-row">
                      <span className="detail-key">Password:</span>
                      <span className="detail-val" style={{ fontFamily: "monospace" }}>••••••••••••</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "24px", padding: "14px", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: "12px", color: "#64748B", display: "block" }}>
                      Note: Passwords are protected via irreversible BCrypt salted encryption in the database and are never stored in browser memory.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          INTERACTIVE MODALS
         ===================================================== */}
      {/* 1. Destructive Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        loading={actionLoading}
      />

      {/* 2. Edit User Modal */}
      <EditUserModal
        isOpen={editUserModal.isOpen}
        user={editUserModal.user}
        currentAdminId={user.id}
        onSaveRole={handleSaveRole}
        onSaveStatus={handleSaveStatus}
        onClose={() => setEditUserModal({ isOpen: false, user: null })}
        loading={actionLoading}
      />

      {/* 3. Edit Event Modal */}
      <EditEventModal
        isOpen={editEventModal.isOpen}
        event={editEventModal.event}
        onSave={handleSaveEvent}
        onClose={() => setEditEventModal({ isOpen: false, event: null })}
        loading={actionLoading}
      />

      {/* 4. Booking Receipt Modal */}
      <BookingDetailModal
        isOpen={viewBookingModal.isOpen}
        booking={viewBookingModal.booking}
        onClose={() => setViewBookingModal({ isOpen: false, booking: null })}
      />
    </div>
  );
}