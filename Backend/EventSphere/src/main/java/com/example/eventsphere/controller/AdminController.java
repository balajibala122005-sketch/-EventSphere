package com.example.eventsphere.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.eventsphere.dto.AdminUserResponse;
import com.example.eventsphere.dto.BookingResponse;
import com.example.eventsphere.entity.ActivityLog;
import com.example.eventsphere.entity.AdminNotification;
import com.example.eventsphere.entity.Booking;
import com.example.eventsphere.entity.Event;
import com.example.eventsphere.entity.User;
import com.example.eventsphere.repository.ActivityLogRepository;
import com.example.eventsphere.repository.AdminNotificationRepository;
import com.example.eventsphere.repository.BookingRepository;
import com.example.eventsphere.repository.EventRepository;
import com.example.eventsphere.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AdminController {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final ActivityLogRepository activityLogRepository;
    private final AdminNotificationRepository adminNotificationRepository;

    // In-memory platform configuration defaults
    private static final Map<String, Object> platformSettings = new HashMap<>(Map.of(
            "platformName", "EventSphere Global Platform",
            "supportEmail", "support@eventsphere.com",
            "currency", "INR (₹)",
            "bookingFeePercent", 2.5,
            "allowRegistrations", true,
            "autoApproveEvents", true,
            "contactNumber", "+91 98765 43210"
    ));

    public AdminController(
            UserRepository userRepository,
            EventRepository eventRepository,
            BookingRepository bookingRepository,
            ActivityLogRepository activityLogRepository,
            AdminNotificationRepository adminNotificationRepository) {

        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.activityLogRepository = activityLogRepository;
        this.adminNotificationRepository = adminNotificationRepository;
    }

    // =========================================================
    // 1. STATS (8 KPI METRICS)
    // =========================================================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {

        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();

        long confirmedBookings = allBookings.stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();

        long cancelledBookings = allBookings.stream()
                .filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus()))
                .count();

        double totalRevenue = allBookings.stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        long activeOrganizers = userRepository.findAll().stream()
                .filter(u -> "ORGANIZER".equalsIgnoreCase(u.getRole()))
                .count();

        LocalDateTime now = LocalDateTime.now();
        long upcomingEvents = eventRepository.findAll().stream()
                .filter(e -> e.getEventDate() != null && e.getEventDate().isAfter(now))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalEvents", totalEvents);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("cancelledBookings", cancelledBookings);
        stats.put("activeOrganizers", activeOrganizers);
        stats.put("upcomingEvents", upcomingEvents);

        return ResponseEntity.ok(stats);
    }

    // =========================================================
    // 2. ANALYTICS
    // =========================================================
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {

        List<Booking> bookings = bookingRepository.findAll();
        List<Event> events = eventRepository.findAll();
        List<User> users = userRepository.findAll();

        // 1. Revenue & Bookings by Month
        Map<String, Double> monthlyRevenue = new TreeMap<>();
        Map<String, Integer> monthlyBookings = new TreeMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Booking b : bookings) {
            String monthKey = b.getBookingDate() != null ? b.getBookingDate().format(monthFormatter) : "Recent";
            if (!"CANCELLED".equalsIgnoreCase(b.getStatus())) {
                monthlyRevenue.put(monthKey, monthlyRevenue.getOrDefault(monthKey, 0.0) + b.getTotalAmount());
            }
            monthlyBookings.put(monthKey, monthlyBookings.getOrDefault(monthKey, 0) + 1);
        }

        List<Map<String, Object>> revenueTrends = new ArrayList<>();
        for (String m : monthlyRevenue.keySet()) {
            revenueTrends.add(Map.of(
                    "period", m,
                    "revenue", monthlyRevenue.get(m),
                    "bookings", monthlyBookings.getOrDefault(m, 0)
            ));
        }

        // 2. Booking status breakdown
        long confirmed = bookings.stream().filter(b -> !"CANCELLED".equalsIgnoreCase(b.getStatus())).count();
        long cancelled = bookings.stream().filter(b -> "CANCELLED".equalsIgnoreCase(b.getStatus())).count();

        // 3. User Breakdown
        long standardUsers = users.stream().filter(u -> "USER".equalsIgnoreCase(u.getRole())).count();
        long organizers = users.stream().filter(u -> "ORGANIZER".equalsIgnoreCase(u.getRole())).count();
        long admins = users.stream().filter(u -> "ADMIN".equalsIgnoreCase(u.getRole())).count();

        // 4. Event Breakdown
        LocalDateTime now = LocalDateTime.now();
        long upcoming = events.stream().filter(e -> e.getEventDate() != null && e.getEventDate().isAfter(now)).count();
        long completed = events.stream().filter(e -> e.getEventDate() != null && e.getEventDate().isBefore(now)).count();
        int totalCapacity = events.stream().mapToInt(Event::getTotalTickets).sum();
        int availableCapacity = events.stream().mapToInt(Event::getAvailableTickets).sum();

        // 5. Category breakdown
        Map<String, Long> categoryCounts = events.stream()
                .collect(Collectors.groupingBy(e -> e.getCategory() == null ? "General" : e.getCategory(), Collectors.counting()));

        List<Map<String, Object>> categoryAnalytics = new ArrayList<>();
        for (Map.Entry<String, Long> entry : categoryCounts.entrySet()) {
            categoryAnalytics.add(Map.of(
                    "category", entry.getKey(),
                    "eventsCount", entry.getValue()
            ));
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("revenueTrends", revenueTrends);
        analytics.put("bookingAnalytics", Map.of("confirmed", confirmed, "cancelled", cancelled, "total", bookings.size()));
        analytics.put("userAnalytics", Map.of("totalUsers", users.size(), "standardUsers", standardUsers, "organizers", organizers, "admins", admins));
        analytics.put("eventAnalytics", Map.of("totalEvents", events.size(), "upcoming", upcoming, "completed", completed, "totalCapacity", totalCapacity, "bookedCapacity", totalCapacity - availableCapacity));
        analytics.put("categoryAnalytics", categoryAnalytics);

        return ResponseEntity.ok(analytics);
    }

    // =========================================================
    // 3. USER MANAGEMENT
    // =========================================================
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository.findAll()
                .stream()
                .map(AdminUserResponse::new)
                .toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(new AdminUserResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long requestingAdminId) {

        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Prevent admin from removing their own admin status
        if (requestingAdminId != null && requestingAdminId.equals(id) && !"ADMIN".equalsIgnoreCase(newRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You cannot demote your own administrator account."));
        }

        String oldRole = user.getRole();
        user.setRole(newRole.toUpperCase().trim());
        userRepository.save(user);

        logActivity("Admin", "admin@eventsphere.com", "Changed User Role", "USER", id,
                "Updated role for " + user.getEmail() + " from " + oldRole + " to " + user.getRole(), "INFO");

        return ResponseEntity.ok(new AdminUserResponse(user));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long requestingAdminId) {

        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Prevent self suspension
        if (requestingAdminId != null && requestingAdminId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You cannot suspend your own administrator account."));
        }

        user.setStatus(status.toUpperCase().trim());
        userRepository.save(user);

        logActivity("Admin", "admin@eventsphere.com", "Updated User Status", "USER", id,
                "Set status of " + user.getEmail() + " to " + user.getStatus(), "WARNING");

        return ResponseEntity.ok(new AdminUserResponse(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false) Long requestingAdminId) {

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (requestingAdminId != null && requestingAdminId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You cannot delete your own active administrator account."));
        }

        // Check if user has bookings
        List<Booking> userBookings = bookingRepository.findByUserId(id);
        if (!userBookings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete user with active booking history. You may suspend them instead."));
        }

        userRepository.deleteById(id);

        logActivity("Admin", "admin@eventsphere.com", "Deleted User", "USER", id,
                "Permanently removed user account: " + user.getEmail(), "DANGER");

        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // =========================================================
    // 4. EVENT MANAGEMENT
    // =========================================================
    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<?> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {
        return eventRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(updatedEvent.getTitle());
                    existing.setDescription(updatedEvent.getDescription());
                    existing.setCategory(updatedEvent.getCategory());
                    existing.setLocation(updatedEvent.getLocation());
                    existing.setEventDate(updatedEvent.getEventDate());
                    existing.setTicketPrice(updatedEvent.getTicketPrice());
                    existing.setTotalTickets(updatedEvent.getTotalTickets());
                    existing.setImageUrl(updatedEvent.getImageUrl());
                    if (updatedEvent.getAvailableTickets() > 0) {
                        existing.setAvailableTickets(updatedEvent.getAvailableTickets());
                    }
                    Event saved = eventRepository.save(existing);

                    logActivity("Admin", "admin@eventsphere.com", "Updated Event", "EVENT", id,
                            "Modified catalog event: " + saved.getTitle(), "INFO");

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {

        if (!eventRepository.existsById(eventId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Event not found"));
        }

        if (bookingRepository.existsByEventId(eventId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete this event because bookings already exist"));
        }

        Event ev = eventRepository.findById(eventId).orElse(null);
        String title = ev != null ? ev.getTitle() : "Event #" + eventId;
        eventRepository.deleteById(eventId);

        logActivity("Admin", "admin@eventsphere.com", "Deleted Event", "EVENT", eventId,
                "Removed catalog event: " + title, "WARNING");

        return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
    }

    // =========================================================
    // 5. BOOKING MANAGEMENT
    // =========================================================
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingRepository.findAll()
                .stream()
                .map(BookingResponse::new)
                .toList();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id)
                .map(b -> ResponseEntity.ok(new BookingResponse(b)))
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // 6. ACTIVITY LOGS
    // =========================================================
    @GetMapping("/activity")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        ensureInitialActivitySeeded();
        return ResponseEntity.ok(activityLogRepository.findAllByOrderByTimestampDesc());
    }

    // =========================================================
    // 7. NOTIFICATIONS
    // =========================================================
    @GetMapping("/notifications")
    public ResponseEntity<List<AdminNotification>> getNotifications() {
        ensureInitialNotificationsSeeded();
        return ResponseEntity.ok(adminNotificationRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id) {
        return adminNotificationRepository.findById(id)
                .map(n -> {
                    n.setRead(true);
                    return ResponseEntity.ok(adminNotificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<?> markAllNotificationsRead() {
        List<AdminNotification> all = adminNotificationRepository.findAll();
        for (AdminNotification n : all) {
            n.setRead(true);
        }
        adminNotificationRepository.saveAll(all);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // =========================================================
    // 8. SETTINGS
    // =========================================================
    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings() {
        return ResponseEntity.ok(platformSettings);
    }

    @PutMapping("/settings")
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> updates) {
        platformSettings.putAll(updates);
        logActivity("Admin", "admin@eventsphere.com", "Updated Platform Settings", "PLATFORM", 1L,
                "Updated global platform configurations and preferences", "INFO");
        return ResponseEntity.ok(platformSettings);
    }

    // =========================================================
    // HELPERS FOR REAL AUDIT TRAIL & NOTIFICATIONS
    // =========================================================
    private void logActivity(String actorName, String actorEmail, String action, String entityType, Long entityId, String desc, String status) {
        try {
            ActivityLog log = new ActivityLog(actorName, actorEmail, action, entityType, entityId, desc, status);
            activityLogRepository.save(log);
        } catch (Exception ignored) {
        }
    }

    private synchronized void ensureInitialActivitySeeded() {
        if (activityLogRepository.count() > 0) return;

        List<ActivityLog> seeds = new ArrayList<>();
        seeds.add(new ActivityLog("System", "system@eventsphere.com", "Platform Initialized", "PLATFORM", 1L, "EventSphere SaaS platform initialized and database connected", "SUCCESS"));
        seeds.add(new ActivityLog("Admin", "admin@eventsphere.com", "Admin Initialized", "USER", 6L, "Platform Super Admin verified credentials", "INFO"));

        for (User u : userRepository.findAll()) {
            if ("ORGANIZER".equalsIgnoreCase(u.getRole())) {
                seeds.add(new ActivityLog(u.getName(), u.getEmail(), "Organizer Registered", "USER", u.getId(), "New organizer account activated: " + u.getName(), "SUCCESS"));
            }
        }

        for (Event e : eventRepository.findAll()) {
            seeds.add(new ActivityLog("Organizer", "organizer@eventsphere.com", "Created Event", "EVENT", e.getId(), "Published new event: " + e.getTitle(), "INFO"));
        }

        for (Booking b : bookingRepository.findAll()) {
            if (!"CANCELLED".equalsIgnoreCase(b.getStatus())) {
                seeds.add(new ActivityLog(b.getUser().getName(), b.getUser().getEmail(), "Booking Created", "BOOKING", b.getId(), "Reserved " + b.getNumberOfTickets() + " ticket(s) for " + b.getEvent().getTitle(), "SUCCESS"));
            } else {
                seeds.add(new ActivityLog(b.getUser().getName(), b.getUser().getEmail(), "Booking Cancelled", "BOOKING", b.getId(), "Cancelled reservation for " + b.getEvent().getTitle(), "WARNING"));
            }
        }

        activityLogRepository.saveAll(seeds);
    }

    private synchronized void ensureInitialNotificationsSeeded() {
        if (adminNotificationRepository.count() > 0) return;

        List<AdminNotification> list = new ArrayList<>();
        list.add(new AdminNotification("Welcome to EventSphere Admin Console", "Your comprehensive management dashboard is active and synced with MySQL database.", "ALERT"));
        list.add(new AdminNotification("New Organizer Joined", "Sam Organizer (organizer@eventsphere.com) registered to publish platform events.", "USER"));
        list.add(new AdminNotification("High Ticket Demand", "Technology Summit Madurai 2026 has reached over 90% booking capacity.", "EVENT"));
        list.add(new AdminNotification("Booking Confirmed", "Recent reservation verified for AI & Cloud Expo 2026.", "BOOKING"));

        adminNotificationRepository.saveAll(list);
    }
}