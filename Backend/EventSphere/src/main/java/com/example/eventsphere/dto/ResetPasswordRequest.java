package com.example.eventsphere.dto;

public record ResetPasswordRequest(
        String email,
        String newPassword
) {
}