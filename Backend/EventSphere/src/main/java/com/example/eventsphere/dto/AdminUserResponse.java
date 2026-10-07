package com.example.eventsphere.dto;

import java.time.LocalDateTime;
import com.example.eventsphere.entity.User;

public class AdminUserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    public AdminUserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.role = user.getRole();
        this.status = user.getStatus();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}