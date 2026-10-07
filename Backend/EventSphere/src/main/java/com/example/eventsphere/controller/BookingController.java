package com.example.eventsphere.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.eventsphere.dto.BookingResponse;
import com.example.eventsphere.entity.Booking;
import com.example.eventsphere.repository.BookingRepository;
import com.example.eventsphere.service.BookingService;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private static final Logger logger =
            LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;

    private final BookingRepository bookingRepository;

    public BookingController(
            BookingService bookingService,
            BookingRepository bookingRepository) {

        this.bookingService = bookingService;

        this.bookingRepository = bookingRepository;
    }

    // =====================================================
    // CREATE BOOKING
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody Map<String, Object> request) {

        try {

            Long userId = Long.valueOf(
                    request.get("userId").toString()
            );

            Long eventId = Long.valueOf(
                    request.get("eventId").toString()
            );

            int numberOfTickets = Integer.parseInt(
                    request.get("numberOfTickets").toString()
            );

            Booking booking =
                    bookingService.createBooking(
                            userId,
                            eventId,
                            numberOfTickets
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "bookingId",
                                    booking.getId(),

                                    "eventId",
                                    booking.getEvent().getId(),

                                    "userId",
                                    booking.getUser().getId(),

                                    "numberOfTickets",
                                    booking.getNumberOfTickets(),

                                    "totalAmount",
                                    booking.getTotalAmount(),

                                    "status",
                                    booking.getStatus()
                            )
                    );

        } catch (NumberFormatException |
                 NullPointerException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "error",
                                    "Provide valid userId, eventId and numberOfTickets"
                            )
                    );

        } catch (ResponseStatusException ex) {

            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(
                            Map.of(
                                    "error",
                                    ex.getReason()
                            )
                    );

        } catch (Exception ex) {

            logger.error(
                    "Error creating booking",
                    ex
            );

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "error",
                                    ex.getMessage() == null
                                            ? ex.getClass().getName()
                                            : ex.getMessage()
                            )
                    );
        }
    }

    // =====================================================
    // GET ALL BOOKINGS
    // =====================================================

    @GetMapping
    public List<BookingResponse> getAllBookings() {

        return bookingRepository
                .findAll()
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET USER BOOKINGS
    // =====================================================

    @GetMapping("/user/{userId}")
    public List<BookingResponse> getBookingsByUser(
            @PathVariable Long userId) {

        return bookingRepository
                .findByUserId(userId)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    // =====================================================
    // GET ORGANIZER BOOKINGS
    // =====================================================

    @GetMapping("/organizer/{organizerId}")
    public List<BookingResponse> getBookingsByOrganizer(
            @PathVariable Long organizerId) {

        return bookingRepository
                .findByEventOrganizerId(organizerId)
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    // =====================================================
    // CANCEL BOOKING
    // =====================================================

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @RequestParam Long userId) {

        try {

            Booking booking =
                    bookingService.cancelBooking(
                            bookingId,
                            userId
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "bookingId",
                            booking.getId(),

                            "status",
                            booking.getStatus(),

                            "message",
                            "Booking cancelled successfully"
                    )
            );

        } catch (ResponseStatusException ex) {

            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(
                            Map.of(
                                    "error",
                                    ex.getReason()
                            )
                    );

        } catch (Exception ex) {

            logger.error(
                    "Error cancelling booking",
                    ex
            );

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "error",
                                    ex.getMessage() == null
                                            ? "Unable to cancel booking"
                                            : ex.getMessage()
                            )
                    );
        }
    }
}