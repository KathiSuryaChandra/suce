package com.suce.controller;

import com.suce.dto.response.DashboardStatsResponse;
import com.suce.dto.response.OrderResponse;
import com.suce.dto.response.PageResponse;
import com.suce.dto.response.UserResponse;
import com.suce.entity.User;
import com.suce.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** GET /api/admin/dashboard/stats */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> dashboardStats() {
        return ResponseEntity.ok(adminService.dashboardStats());
    }

    /** GET /api/admin/orders?status=PENDING&page=0&size=20 */
    @GetMapping("/orders")
    public ResponseEntity<PageResponse<OrderResponse>> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<OrderResponse> result = adminService.listOrders(status, page, size);
        PageResponse<OrderResponse> resp = new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    /** PATCH /api/admin/orders/{id}/status  body: { status } */
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, body.get("status")));
    }

    /** GET /api/admin/users?search=&page=0&size=20 */
    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserResponse>> listUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<User> result = adminService.listUsers(search, page, size);
        Page<UserResponse> mapped = result.map(UserResponse::from);
        PageResponse<UserResponse> resp = new PageResponse<>(
                mapped.getContent(),
                mapped.getNumber(),
                mapped.getSize(),
                mapped.getTotalElements(),
                mapped.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    /** PATCH /api/admin/users/{id}  body: { enabled: true/false } */
    @PatchMapping("/users/{id}")
    public ResponseEntity<UserResponse> setUserEnabled(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        boolean enabled = Boolean.parseBoolean(body.get("enabled").toString());
        User updated = adminService.setUserEnabled(id, enabled);
        return ResponseEntity.ok(UserResponse.from(updated));
    }
}
