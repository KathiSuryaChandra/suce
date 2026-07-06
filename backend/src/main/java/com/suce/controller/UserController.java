package com.suce.controller;

import com.suce.dto.response.UserResponse;
import com.suce.entity.User;
import com.suce.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** PUT /api/users/me */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        User updated = userService.updateProfile(user, body);
        return ResponseEntity.ok(UserResponse.from(updated));
    }

    /** PUT /api/users/me/password */
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, Boolean>> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        userService.changePassword(user, body);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }
}
