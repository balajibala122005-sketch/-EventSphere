package com.example.eventsphere.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.eventsphere.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEventOrganizerId(Long organizerId);

    boolean existsByEventId(Long eventId);
}