package com.example.eventsphere.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.eventsphere.entity.User;
import com.example.eventsphere.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register new user
    @Transactional
    public User register(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        if (user.getPassword() == null ||
                user.getPassword().length() < 8) {

            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters"
            );
        }

        // Assign role: allow ORGANIZER if specified, otherwise default to USER
        if (user.getRole() != null && "ORGANIZER".equalsIgnoreCase(user.getRole().trim())) {
            user.setRole("ORGANIZER");
        } else {
            user.setRole("USER");
        }

        // Encrypt password using BCrypt
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    // Login existing user
    @Transactional(readOnly = true)
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        // Compare entered password with BCrypt password
        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return user;
    }

    // Reset password
    @Transactional
    public void resetPassword(
            String email,
            String newPassword) {

        if (newPassword == null ||
                newPassword.length() < 8) {

            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters"
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        // Encrypt new password using BCrypt
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }

    // Reset organizer password
    @Transactional
    public void resetOrganizerPassword(
            String email,
            String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);
    }
}