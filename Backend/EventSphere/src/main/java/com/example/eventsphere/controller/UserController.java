package com.example.eventsphere.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.eventsphere.dto.LoginRequest;
import com.example.eventsphere.dto.LoginResponse;
import com.example.eventsphere.dto.ResetPasswordRequest;
import com.example.eventsphere.entity.User;
import com.example.eventsphere.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ==============================
    // REGISTER
    // ==============================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registered = userService.register(user);
            LoginResponse response = new LoginResponse(
                    registered.getId(),
                    registered.getName(),
                    registered.getEmail(),
                    registered.getRole()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }

    // ==============================
    // LOGIN
    // ==============================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        try {

            User user = userService.login(
                    request.email(),
                    request.password()
            );

            LoginResponse response = new LoginResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }

    // ==============================
    // RESET PASSWORD
    // ==============================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        try {

            userService.resetPassword(
                    request.email(),
                    request.newPassword()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Password reset successfully"
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
    }
}