package com.example.quiz.controller;

import com.example.quiz.entity.User;
import com.example.quiz.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.quiz.service.EmailService;   

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User u) {
        if (u.getEmail() == null || u.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "email_required"));
        }

        if (userRepository.findByUsername(u.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "username_taken"));
        }

        // NOTE: for production, hash password before saving (use PasswordEncoder)
        if (u.getRole() == null) u.setRole("PARTICIPANT");
        userRepository.save(u);

        // send welcome/confirmation email (non-blocking if EmailService uses @Async)
        try {
            String to = u.getEmail();
            String subject = "Welcome to Quiz App, " + u.getUsername() + "!";
            String text = "Hi " + u.getUsername() + ",\n\n"
                        + "Thanks for registering on Quiz App. Your account is ready.\n"
                        + "Username: " + u.getUsername() + "\n\n"
                        + "You can now login and start taking quizzes.\n\n"
                        + "Regards,\nQuiz App Team";
            // emailService method should exist and be annotated @Async (optional)
            emailService.sendSimpleMail(to, subject, text);
        } catch (Exception ex) {
            // Log but don't fail registration if mail sending fails
            ex.printStackTrace();
        }

        return ResponseEntity.ok(Map.of("message","registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body) {
        var userOpt = userRepository.findByUsername(body.get("username"));
        if (userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error","invalid_credentials"));
        var user = userOpt.get();
        if (!user.getPassword().equals(body.get("password"))) return ResponseEntity.status(401).body(Map.of("error","invalid_credentials"));
        // In a full implementation return JWT. For this starter we return a simple token (username).
        return ResponseEntity.ok(Map.of("token", "token-"+user.getUsername(), "role", user.getRole()));
    }
}
