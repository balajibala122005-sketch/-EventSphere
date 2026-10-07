package com.example.eventsphere.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.eventsphere.entity.Booking;
import com.example.eventsphere.entity.Event;
import com.example.eventsphere.entity.User;
import com.example.eventsphere.repository.BookingRepository;
import com.example.eventsphere.repository.EventRepository;
import com.example.eventsphere.repository.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE BOOKING
    // =====================================================

    @Transactional
    public Booking createBooking(
            Long userId,
            Long eventId,
            int numberOfTickets) {

        if (numberOfTickets <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Number of tickets must be greater than zero"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"
                ));

        if (event.getAvailableTickets() < numberOfTickets) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Not enough tickets available"
            );
        }

        // Reduce available tickets
        event.setAvailableTickets(
                event.getAvailableTickets() - numberOfTickets
        );

        Booking booking = new Booking();

        booking.setUser(user);
        booking.setEvent(event);
        booking.setNumberOfTickets(numberOfTickets);

        booking.setTotalAmount(
                event.getTicketPrice() * numberOfTickets
        );

        booking.setStatus("CONFIRMED");

        eventRepository.save(event);

        return bookingRepository.save(booking);
    }

    // =====================================================
    // CANCEL BOOKING
    // =====================================================

    @Transactional
    public Booking cancelBooking(
            Long bookingId,
            Long userId) {

        // Find booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Booking not found"
                ));

        // Check whether booking belongs to logged-in user
        if (!booking.getUser().getId().equals(userId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot cancel this booking"
            );
        }

        // Prevent cancelling twice
        if ("CANCELLED".equalsIgnoreCase(
                booking.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Booking is already cancelled"
            );
        }

        // Get event
        Event event = booking.getEvent();

        // Return tickets to event
        event.setAvailableTickets(
                event.getAvailableTickets()
                        + booking.getNumberOfTickets()
        );

        // Change booking status
        booking.setStatus("CANCELLED");

        // Save event
        eventRepository.save(event);

        // Save booking
        return bookingRepository.save(booking);
    }
}