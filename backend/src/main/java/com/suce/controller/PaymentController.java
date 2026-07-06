package com.suce.controller;

import com.suce.entity.Order;
import com.suce.entity.User;
import com.suce.enums.OrderStatus;
import com.suce.enums.PaymentStatus;
import com.suce.exception.ApiException;
import com.suce.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderRepository orderRepo;

    public PaymentController(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    /**
     * POST /api/payments/create-order
     * Body: { orderId, gateway }
     * Returns a gateway reference so the frontend can open the payment modal.
     * Replace the stub with real Razorpay / Stripe SDK in production.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {

        Long orderId = Long.parseLong(body.get("orderId").toString());
        String gateway = (String) body.get("gateway");

        Order order = orderRepo.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        // TODO: replace with real gateway SDK call
        String gatewayOrderId = "demo_" + gateway.toLowerCase() + "_" + orderId;
        order.setGatewayOrderId(gatewayOrderId);
        orderRepo.save(order);

        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId",        orderId);
        resp.put("gateway",        gateway);
        resp.put("gatewayOrderId", gatewayOrderId);
        resp.put("status",         "created");
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/payments/verify
     * Body: { orderId, gatewayPaymentId, ... }
     * Marks the order as PAID.
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {

        Long orderId = Long.parseLong(body.get("orderId").toString());

        Order order = orderRepo.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        // TODO: verify payment signature with gateway SDK
        order.setPaymentStatus(PaymentStatus.PAID);
        // Payment succeeded, so there's nothing left to wait on — move the
        // order itself out of PENDING too, the same way COD orders skip
        // straight to CONFIRMED at checkout.
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        if (body.containsKey("gatewayPaymentId")) {
            order.setGatewayPaymentId(body.get("gatewayPaymentId").toString());
        }
        orderRepo.save(order);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("status",  "PAID");
        return ResponseEntity.ok(resp);
    }
}
