package com.example.eventsphere.dto;

import java.time.LocalDateTime;

import com.example.eventsphere.entity.Booking;

public class BookingResponse {

    private Long bookingId;
    private Long eventId;

    private String eventTitle;
    private String eventLocation;
    private LocalDateTime eventDate;

    private Long userId;
    private String userName;
    private String userEmail;

    private int numberOfTickets;
    private double totalAmount;

    private String status;

    private LocalDateTime bookingDate;

    public BookingResponse(Booking booking) {

        this.bookingId = booking.getId();

        this.eventId =
                booking.getEvent().getId();

        this.eventTitle =
                booking.getEvent().getTitle();

        this.eventLocation =
                booking.getEvent().getLocation();

        this.eventDate =
                booking.getEvent().getEventDate();

        this.userId =
                booking.getUser().getId();

        this.userName =
                booking.getUser().getName();

        this.userEmail =
                booking.getUser().getEmail();

        this.numberOfTickets =
                booking.getNumberOfTickets();

        this.totalAmount =
                booking.getTotalAmount();

        this.status =
                booking.getStatus();

        this.bookingDate =
                booking.getBookingDate();
    }

    public Long getBookingId() {
        return bookingId;
    }

    public Long getEventId() {
        return eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public String getEventLocation() {
        return eventLocation;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public int getNumberOfTickets() {
        return numberOfTickets;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }
}