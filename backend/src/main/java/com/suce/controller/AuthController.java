package com.suce.controller;

import com.suce.dto.request.LoginRequest;
import com.suce.dto.request.OtpLoginRequest;
import com.suce.dto.request.RegisterRequest;
import com.suce.dto.response.AuthResponse;
import com.suce.dto.response.UserResponse;
import com.suce.entity.User;
import com.suce.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletResponse res) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req, res));
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse res) {
        return ResponseEntity.ok(authService.login(req, res));
    }

    /** POST /api/auth/login-otp — log in (or auto-register) using a verified OTP instead of a password */
    @PostMapping("/login-otp")
    public ResponseEntity<AuthResponse> loginOtp(
            @Valid @RequestBody OtpLoginRequest req,
            HttpServletResponse res) {
        return ResponseEntity.ok(authService.loginWithOtp(req.getIdentifier(), req.getOtp(), res));
    }

    /** POST /api/auth/refresh */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest req,
            HttpServletResponse res) {
        return ResponseEntity.ok(authService.refresh(req, res));
    }

    /** POST /api/auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Boolean>> logout(
            HttpServletRequest req,
            HttpServletResponse res) {
        authService.logout(req, res);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    /** GET /api/auth/me */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserResponse.from(user));
    }

    /** POST /api/auth/forgot-password */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Boolean>> forgotPassword(
            @RequestBody Map<String, String> body) {
        authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    /** POST /api/auth/reset-password */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Boolean>> resetPassword(
            @RequestBody Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }
}
