package com.suce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OtpLoginRequest {

    // Email or 10-digit phone number — same value originally sent to /otp/send
    @NotBlank
    private String identifier;

    @NotBlank
    @Size(min = 6, max = 6)
    private String otp;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
