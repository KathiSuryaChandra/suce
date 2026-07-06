package com.suce.service;

import com.suce.dto.request.LoginRequest;
import com.suce.dto.request.RegisterRequest;
import com.suce.dto.response.AuthResponse;
import com.suce.dto.response.UserResponse;
import com.suce.entity.RefreshToken;
import com.suce.entity.User;
import com.suce.enums.Role;
import com.suce.exception.ApiException;
import com.suce.repository.RefreshTokenRepository;
import com.suce.repository.UserRepository;
import com.suce.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository rtRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final OtpService otpService;
    private final JavaMailSender mailSender;

    @Value("${app.jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public AuthService(UserRepository userRepo,
                       RefreshTokenRepository rtRepo,
                       PasswordEncoder encoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authManager,
                       OtpService otpService,
                       JavaMailSender mailSender) {
        this.userRepo = userRepo;
        this.rtRepo = rtRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
        this.otpService = otpService;
        this.mailSender = mailSender;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req, HttpServletResponse res) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new ApiException("An account with this email already exists", HttpStatus.CONFLICT);

        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);
        userRepo.save(user);

        return issueTokens(user, res);
    }

    @Transactional
    public AuthResponse login(LoginRequest req, HttpServletResponse res) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        if (!user.isEnabled())
            throw new ApiException("Your account has been disabled", HttpStatus.FORBIDDEN);

        return issueTokens(user, res);
    }

    @Transactional
    public AuthResponse refresh(HttpServletRequest req, HttpServletResponse res) {
        String rawToken = extractRefreshCookie(req);
        if (rawToken == null)
            throw new ApiException("No refresh token", HttpStatus.UNAUTHORIZED);

        RefreshToken rt = rtRepo.findByTokenAndRevokedFalse(rawToken)
                .orElseThrow(() -> new ApiException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED));

        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            rt.setRevoked(true);
            rtRepo.save(rt);
            throw new ApiException("Refresh token expired, please log in again", HttpStatus.UNAUTHORIZED);
        }

        User user = rt.getUser();
        if (!user.isEnabled())
            throw new ApiException("Account disabled", HttpStatus.FORBIDDEN);

        return issueTokens(user, res);
    }

    @Transactional
    public AuthResponse loginWithOtp(String identifier, String otp, HttpServletResponse res) {
        // This single endpoint serves both "log in with OTP" and "sign up
        // with OTP" — a first-time verification auto-creates the account,
        // a repeat one just logs in. The OTP may have been requested under
        // either purpose, since the frontend's login and signup flows both
        // ask /otp/send for one, with different `purpose` values, so we
        // accept either here and try LOGIN first since it's the common case.
        try {
            otpService.verifyOtp(identifier, otp, "LOGIN");
        } catch (ApiException e) {
            otpService.verifyOtp(identifier, otp, "REGISTER");
        }

        User user = otpService.isEmail(identifier)
                ? userRepo.findByEmail(identifier).orElseGet(() -> createUserFromIdentifier(identifier, true))
                : userRepo.findByPhone(identifier).orElseGet(() -> createUserFromIdentifier(identifier, false));

        if (!user.isEnabled())
            throw new ApiException("Your account has been disabled", HttpStatus.FORBIDDEN);

        return issueTokens(user, res);
    }

    private User createUserFromIdentifier(String identifier, boolean isEmail) {
        User user = new User();
        user.setFirstName("New");
        user.setLastName("User");
        if (isEmail) {
            user.setEmail(identifier);
        } else {
            // Phone-only signups still need a unique placeholder email since
            // the column is NOT NULL + UNIQUE; user can set a real one later
            // from their profile.
            user.setEmail(identifier + "@suce.otp.local");
            user.setPhone(identifier);
        }
        // OTP login proves identity, so no password is needed to sign in —
        // but the column is NOT NULL, so store a random unusable hash.
        user.setPassword(encoder.encode(UUID.randomUUID().toString()));
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);
        return userRepo.save(user);
    }

    @Transactional
    public void logout(HttpServletRequest req, HttpServletResponse res) {
        String raw = extractRefreshCookie(req);
        if (raw != null) {
            rtRepo.findByTokenAndRevokedFalse(raw).ifPresent(rt -> {
                rt.setRevoked(true);
                rtRepo.save(rt);
            });
        }
        clearRefreshCookie(res);
    }

    public void forgotPassword(String email) {
        userRepo.findByEmail(email).ifPresent(user -> {
            user.setResetToken(UUID.randomUUID().toString());
            user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepo.save(user);
            sendResetEmail(user);
        });
        // Always returns successfully regardless of whether the email
        // exists, so the endpoint can't be used to probe which emails
        // are registered.
    }

    private void sendResetEmail(User user) {
        String resetLink = frontendUrl + "/reset-password?token=" + user.getResetToken();
        String body = "Hi " + user.getFirstName() + ",\n\n" +
                "We received a request to reset your SUCE account password.\n\n" +
                "Click the link below to set a new password. This link is valid for 1 hour:\n\n" +
                "  " + resetLink + "\n\n" +
                "If you didn't request this, you can safely ignore this email — " +
                "your password will remain unchanged.\n\n" +
                "— The SUCE Team";

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Reset your SUCE password");
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log but don't crash — admin can still issue a reset manually
            // if email delivery is down.
            System.err.println("[SUCE] Reset-password email failed to " + user.getEmail() + ": " + e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepo.findByResetToken(token)
                .orElseThrow(() -> new ApiException("Invalid or expired token", HttpStatus.BAD_REQUEST));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now()))
            throw new ApiException("Reset token has expired", HttpStatus.BAD_REQUEST);

        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);
    }

    // ── helpers ───────────────────────────────────────────────────────
    private AuthResponse issueTokens(User user, HttpServletResponse res) {
        rtRepo.revokeAllByUser(user);

        String rawRt = UUID.randomUUID().toString();
        RefreshToken rt = new RefreshToken();
        rt.setToken(rawRt);
        rt.setUser(user);
        rt.setExpiresAt(LocalDateTime.now().plusSeconds(refreshExpiryMs / 1000));
        rt.setRevoked(false);
        rtRepo.save(rt);

        Cookie cookie = new Cookie("refreshToken", rawRt);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (refreshExpiryMs / 1000));
        res.addCookie(cookie);

        String accessToken = jwtUtil.generateAccessToken(user.getEmail());
        return new AuthResponse(accessToken, UserResponse.from(user));
    }

    private String extractRefreshCookie(HttpServletRequest req) {
        if (req.getCookies() == null) return null;
        return Arrays.stream(req.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private void clearRefreshCookie(HttpServletResponse res) {
        Cookie c = new Cookie("refreshToken", "");
        c.setHttpOnly(true);
        c.setPath("/");
        c.setMaxAge(0);
        res.addCookie(c);
    }
}
