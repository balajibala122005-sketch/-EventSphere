package com.example.eventsphere.dto;

public record LoginRequest(
        String email,
        String password
) {
}