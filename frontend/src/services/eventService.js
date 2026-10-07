import api from "./api";

// =====================================================
// EVENTS
// =====================================================

export async function getEvents() {
  const response = await api.get("/events");
  return response.data;
}

export async function getEventById(eventId) {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
}

export async function createEvent(eventData) {
  const response = await api.post("/events", eventData);
  return response.data;
}

export async function updateEvent(eventId, eventData) {
  const response = await api.put(`/events/${eventId}`, eventData);
  return response.data;
}

export async function deleteEvent(eventId) {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
}

// =====================================================
// CREATE BOOKING
// =====================================================

export async function createBooking(
  userId,
  eventId,
  numberOfTickets
) {
  console.log("API BOOKING:", {
    userId,
    eventId,
    numberOfTickets,
  });

  const response = await api.post("/bookings", {
    userId,
    eventId,
    numberOfTickets,
  });

  console.log("API RESPONSE:", response.data);

  return response.data;
}

// =====================================================
// GET USER BOOKINGS
// =====================================================

export async function getBookings(userId) {
  const response = await api.get(
    `/bookings/user/${userId}`
  );

  return response.data;
}

// =====================================================
// GET ORGANIZER BOOKINGS
// =====================================================

export async function getOrganizerBookings(
  organizerId
) {
  const response = await api.get(
    `/bookings/organizer/${organizerId}`
  );

  return response.data;
}

// =====================================================
// CANCEL BOOKING
// =====================================================

export async function cancelBooking(
  bookingId,
  userId
) {
  console.log("CANCEL BOOKING:", {
    bookingId,
    userId,
  });

  const response = await api.put(
    `/bookings/${bookingId}/cancel`,
    null,
    {
      params: {
        userId: userId,
      },
    }
  );

  console.log(
    "CANCEL RESPONSE:",
    response.data
  );

  return response.data;
}

// =====================================================
// CURRENT USER
// =====================================================

export function getCurrentUser() {
  return JSON.parse(
    localStorage.getItem(
      "eventsphere_user"
    ) || "null"
  );
}

// =====================================================
// LOCAL EVENTS
// =====================================================

export function getLocalEvents() {
  return JSON.parse(
    localStorage.getItem(
      "eventsphere_events"
    ) || "[]"
  );
}

export function saveEvents(events) {
  localStorage.setItem(
    "eventsphere_events",
    JSON.stringify(events)
  );
}

// =====================================================
// LOCAL BOOKINGS
// =====================================================

export function getLocalBookings() {
  return JSON.parse(
    localStorage.getItem(
      "eventsphere_bookings"
    ) || "[]"
  );
}

export function saveBookings(bookings) {
  localStorage.setItem(
    "eventsphere_bookings",
    JSON.stringify(bookings)
  );
}