import api from "./api";

// =========================
// 1. STATS & ANALYTICS
// =========================
export async function getAdminStats() {
  const response = await api.get("/admin/stats");
  return response.data;
}

export async function getAdminAnalytics() {
  const response = await api.get("/admin/analytics");
  return response.data;
}

// =========================
// 2. USER MANAGEMENT
// =========================
export async function getAdminUsers() {
  const response = await api.get("/admin/users");
  return response.data;
}

export async function updateUserRole(userId, role, requestingAdminId) {
  const response = await api.put(
    `/admin/users/${userId}/role`,
    { role },
    { params: { requestingAdminId } }
  );
  return response.data;
}

export async function updateUserStatus(userId, status, requestingAdminId) {
  const response = await api.put(
    `/admin/users/${userId}/status`,
    { status },
    { params: { requestingAdminId } }
  );
  return response.data;
}

export async function deleteUser(userId, requestingAdminId) {
  const response = await api.delete(`/admin/users/${userId}`, {
    params: { requestingAdminId },
  });
  return response.data;
}

// =========================
// 3. EVENT MANAGEMENT
// =========================
export async function getAdminEvents() {
  const response = await api.get("/admin/events");
  return response.data;
}

export async function updateAdminEvent(eventId, eventData) {
  const response = await api.put(`/admin/events/${eventId}`, eventData);
  return response.data;
}

export async function deleteAdminEvent(eventId) {
  const response = await api.delete(`/admin/events/${eventId}`);
  return response.data;
}

// =========================
// 4. BOOKINGS MANAGEMENT
// =========================
export async function getAdminBookings() {
  const response = await api.get("/admin/bookings");
  return response.data;
}

// =========================
// 5. ACTIVITY LOGS
// =========================
export async function getAdminActivityLogs() {
  const response = await api.get("/admin/activity");
  return response.data;
}

// =========================
// 6. NOTIFICATIONS
// =========================
export async function getAdminNotifications() {
  const response = await api.get("/admin/notifications");
  return response.data;
}

export async function markNotificationAsRead(id) {
  const response = await api.put(`/admin/notifications/${id}/read`);
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await api.put("/admin/notifications/read-all");
  return response.data;
}

// =========================
// 7. SETTINGS
// =========================
export async function getAdminSettings() {
  const response = await api.get("/admin/settings");
  return response.data;
}

export async function updateAdminSettings(settings) {
  const response = await api.put("/admin/settings", settings);
  return response.data;
}