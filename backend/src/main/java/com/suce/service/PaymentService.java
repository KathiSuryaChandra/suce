package com.suce.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.suce.entity.Order;
import com.suce.enums.PaymentStatus;
import com.suce.exception.ApiException;
import com.suce.repository.OrderRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.HexFormat;
import java.util.Map;

@Service
public class PaymentService {

    private final OrderRepository orderRepo;
    private final RazorpayClient razorpay;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public PaymentService(OrderRepository orderRepo,
                          @Value("${razorpay.key.id}") String keyId,
                          @Value("${razorpay.key.secret}") String keySecret) throws RazorpayException {
        this.orderRepo = orderRepo;
        this.razorpay = new RazorpayClient(keyId, keySecret);
    }

    // Step 1: Create Razorpay order for a SUCE order
    public Map<String, Object> createRazorpayOrder(Long orderId) {
        Order order = orderRepo.findById(orderId)
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

            // Save gateway order id
            order.setGatewayOrderId(gatewayOrderId);
            orderRepo.save(order);

            return Map.of(
                "gatewayOrderId", gatewayOrderId,
                "amount", amountInPaise,
                "currency", "INR",
                "orderNumber", order.getOrderNumber()
            );
        } catch (RazorpayException e) {
            throw new ApiException("Payment initiation failed: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    // Step 2: Verify payment signature after frontend completes payment
    public void verifyAndConfirm(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        // Verify HMAC-SHA256 signature
        String payload = razorpayOrderId + "|" + razorpayPaymentId;
        if (!isValidSignature(payload, razorpaySignature)) {
            throw new ApiException("Payment verification failed", HttpStatus.BAD_REQUEST);
        }

        // Update order payment status
        Order order = orderRepo.findByGatewayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        order.setGatewayPaymentId(razorpayPaymentId);
        order.setPaymentStatus(PaymentStatus.PAID);
        orderRepo.save(order);
    }

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