package com.example.eventsphere.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.eventsphere.entity.Event;
import com.example.eventsphere.repository.EventRepository;

import java.util.Map;
import com.example.eventsphere.repository.BookingRepository;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    public EventController(EventRepository eventRepository, BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
    }

    // Get all events
    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Get event by ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Optional<Event> event = eventRepository.findById(id);

        return event.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new event
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {

        if (event.getTotalTickets() <= 0 ||
                event.getTicketPrice() < 0 ||
                event.getTitle() == null ||
                event.getTitle().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        event.setId(null);
        event.setAvailableTickets(event.getTotalTickets());

        Event savedEvent = eventRepository.save(event);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    // Update an existing event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody Event updatedEvent) {

        return eventRepository.findById(id)
            .map(existingEvent -> {
                existingEvent.setTitle(updatedEvent.getTitle());
                existingEvent.setDescription(updatedEvent.getDescription());
                existingEvent.setCategory(updatedEvent.getCategory());
                existingEvent.setLocation(updatedEvent.getLocation());
                existingEvent.setEventDate(updatedEvent.getEventDate());
                existingEvent.setTicketPrice(updatedEvent.getTicketPrice());
                existingEvent.setTotalTickets(updatedEvent.getTotalTickets());
                existingEvent.setImageUrl(updatedEvent.getImageUrl());

                // Preserve ticket counts when total capacity changes.
                int bookedTickets = existingEvent.getTotalTickets()
                        - existingEvent.getAvailableTickets();

                if (updatedEvent.getTotalTickets() < bookedTickets) {
                    return ResponseEntity.badRequest().<Event>build();
                }

                existingEvent.setAvailableTickets(
                    updatedEvent.getTotalTickets() - bookedTickets
                );

                return ResponseEntity.ok(eventRepository.save(existingEvent));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete an event
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        if (bookingRepository.existsByEventId(id)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete this event because bookings already exist for it."));
        }

        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}