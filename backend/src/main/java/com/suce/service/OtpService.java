package com.suce.service;

import com.suce.entity.OtpVerification;
import com.suce.exception.ApiException;
import com.suce.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepo;
    private final EmailService emailService;

   
    private String fromEmail;
   
    // Set to true to print OTP in console instead of sending real SMS
    // Change to false and plug in a real SMS provider (Twilio / MSG91)
    @Value("${app.sms.mock:true}")
    private boolean smsMock;

    public OtpService(OtpVerificationRepository otpRepo, EmailService emailService) {
        this.otpRepo = otpRepo;
        this.emailService = emailService;
    }

    // ── Send OTP ──────────────────────────────────────────────────────
    @Transactional
    public void sendOtp(String identifier, String purpose) {
        // identifier can be email or phone (10-digit)
        String otp = generateOtp();

        // Delete previous OTPs for this identifier + purpose
        otpRepo.deleteAllFor(identifier, purpose);

        // Save new OTP (expires in 10 minutes)
        OtpVerification record = new OtpVerification();
        record.setIdentifier(identifier);
        record.setOtp(otp);
        record.setPurpose(purpose);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepo.save(record);

        if (isEmail(identifier)) {
            sendEmail(identifier, otp, purpose);
        } else {
            sendSms(identifier, otp, purpose);
        }
    }

    // ── Verify OTP ────────────────────────────────────────────────────
    @Transactional
    public void verifyOtp(String identifier, String otp, String purpose) {
        OtpVerification record = otpRepo.findLatestActive(identifier, purpose)
                .orElseThrow(() -> new ApiException("Invalid OTP", HttpStatus.BAD_REQUEST));

        if (record.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new ApiException("OTP has expired — request a new one", HttpStatus.BAD_REQUEST);

        if (!record.getOtp().equals(otp))
            throw new ApiException("Incorrect OTP — please try again", HttpStatus.BAD_REQUEST);

        record.setVerified(true);
        otpRepo.save(record);
    }

    // ── Email sender ──────────────────────────────────────────────────
    private void sendEmail(String toEmail, String otp, String purpose) {
        String subject;
        String body;

        if ("REGISTER".equals(purpose)) {
            subject = "Welcome to SUCE — Verify your account";
            body = "Hi there,\n\n" +
                   "Welcome to SUCE — your destination for curated fashion.\n\n" +
                   "Your verification code is:\n\n" +
                   "  " + otp + "\n\n" +
                   "This code is valid for 10 minutes. Do not share it with anyone.\n\n" +
                   "Once verified, you can explore our latest collections, save favourites to your wishlist " +
                   "and enjoy a seamless checkout experience.\n\n" +
                   "— The SUCE Team";
        } else {
            subject = "SUCE — Your login OTP";
            body = "Hi,\n\n" +
                   "You requested a one-time password to sign in to your SUCE account.\n\n" +
                   "Your OTP is:\n\n" +
                   "  " + otp + "\n\n" +
                   "Valid for 10 minutes. If you did not request this, please ignore this email " +
                   "and your account will remain safe.\n\n" +
                   "— The SUCE Team";
        }

        emailService.send(toEmail, subject, body);
    }

    // ── SMS sender ────────────────────────────────────────────────────
    private void sendSms(String phone, String otp, String purpose) {
        String actionWord = "REGISTER".equals(purpose) ? "registration" : "login";
        String smsText = "Your SUCE " + actionWord + " OTP is: " + otp +
                         ". Valid for 10 mins. Do not share this code. - SUCE Fashion";

        if (smsMock) {
            // MOCK MODE — prints to Spring Boot console
            System.out.println("============================================");
            System.out.println("[SUCE SMS MOCK] To: " + phone);
            System.out.println("[SUCE SMS MOCK] Message: " + smsText);
            System.out.println("============================================");
            return;
        }

        // ── REAL SMS — uncomment and configure one provider ──────────
        //
        // OPTION A: Twilio
        // Twilio.init(accountSid, authToken);
        // Message.creator(new PhoneNumber("+91" + phone),
        //         new PhoneNumber(twilioFromNumber), smsText).create();
        //
        // OPTION B: MSG91 (India)
        // Call MSG91 REST API with your auth key
        //
        // OPTION C: Fast2SMS (India, cheapest)
        // Call Fast2SMS API
    }    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public boolean isEmail(String identifier) {
        return identifier != null && identifier.contains("@");
    }
}
