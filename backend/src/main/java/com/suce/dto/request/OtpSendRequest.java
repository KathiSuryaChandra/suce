package com.suce.dto.request;

import jakarta.validation.constraints.NotBlank;

public class OtpSendRequest {

    // Email or 10-digit phone number
    @NotBlank
    private String identifier;

    // e.g. "REGISTER", "LOGIN"
    @NotBlank
    private String purpose;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
