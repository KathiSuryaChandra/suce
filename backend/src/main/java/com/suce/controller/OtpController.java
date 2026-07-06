package com.suce.controller;

import com.suce.dto.request.OtpSendRequest;
import com.suce.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    /** POST /api/otp/send — sends a 6-digit OTP to an email or phone for the given purpose (e.g. LOGIN, REGISTER). */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Boolean>> send(@Valid @RequestBody OtpSendRequest req) {
        otpService.sendOtp(req.getIdentifier(), req.getPurpose());
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }
}
