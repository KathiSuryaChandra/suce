package com.suce.controller;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.suce.entity.Order;
import com.suce.entity.User;
import com.suce.enums.OrderStatus;
import com.suce.enums.PaymentStatus;
import com.suce.exception.ApiException;
import com.suce.repository.OrderRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final OrderRepository orderRepo;
    private final RazorpayClient razorpay;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public PaymentController(
            OrderRepository orderRepo,
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) throws RazorpayException {
        this.orderRepo = orderRepo;
        this.razorpay = new RazorpayClient(keyId, keySecret);
    }

    /**
     * POST /api/payments/create-order
     * Body: { orderId, gateway }
     * Creates a real Razorpay order and returns the gatewayOrderId
     * so the frontend can open the Razorpay checkout popup.
     */
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {

        Long orderId = Long.parseLong(body.get("orderId").toString());

        Order order = orderRepo.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        try {
            // Razorpay expects amount in paise (1 INR = 100 paise)
            int amountInPaise = order.getTotalAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .intValue();

            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", order.getOrderNumber());

            com.razorpay.Order rzpOrder = razorpay.orders.create(options);
            String gatewayOrderId = rzpOrder.get("id");

            // Save gateway order id to our order
            order.setGatewayOrderId(gatewayOrderId);
            orderRepo.save(order);

            Map<String, Object> resp = new HashMap<>();
            resp.put("orderId",        orderId);
            resp.put("gatewayOrderId", gatewayOrderId);
            resp.put("amount",         amountInPaise);
            resp.put("currency",       "INR");
            resp.put("orderNumber",    order.getOrderNumber());
            resp.put("status",         "created");

            return ResponseEntity.ok(resp);

        } catch (RazorpayException e) {
            throw new ApiException("Payment initiation failed: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    /**
     * POST /api/payments/verify
     * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
     * Verifies HMAC-SHA256 signature from Razorpay, then marks order as PAID.
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {

        String razorpayOrderId   = body.get("razorpay_order_id");
        String razorpayPaymentId = body.get("razorpay_payment_id");
        String razorpaySignature = body.get("razorpay_signature");

        // Verify HMAC-SHA256 signature
        if (!isValidSignature(razorpayOrderId + "|" + razorpayPaymentId, razorpaySignature)) {
            throw new ApiException("Payment verification failed — invalid signature", HttpStatus.BAD_REQUEST);
        }

        // Find order by gatewayOrderId
        Order order = orderRepo.findByGatewayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        // Security check — make sure this order belongs to the logged-in user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ApiException("Unauthorized", HttpStatus.FORBIDDEN);
        }

        // Mark as paid
        order.setGatewayPaymentId(razorpayPaymentId);
        order.setPaymentStatus(PaymentStatus.PAID);
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        orderRepo.save(order);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("status",  "PAID");

        return ResponseEntity.ok(resp);
    }

    // Verifies the payment signature using HMAC-SHA256
    // Razorpay signs: razorpay_order_id + "|" + razorpay_payment_id
    private boolean isValidSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            String generated = HexFormat.of().formatHex(hash);
            return generated.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}