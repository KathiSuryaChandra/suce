package com.suce.service;


import com.suce.dto.request.PlaceOrderRequest;
import com.suce.dto.response.OrderResponse;
import com.suce.entity.Order;
import com.suce.entity.OrderItem;
import com.suce.entity.Product;
import com.suce.entity.User;
import com.suce.enums.OrderStatus;
import com.suce.enums.PaymentStatus;
import com.suce.exception.ApiException;
import com.suce.repository.OrderRepository;
import com.suce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.suce.dto.request.PlaceOrderRequest;
import com.suce.dto.response.OrderResponse;
import com.suce.entity.Order;
import com.suce.entity.OrderItem;
import com.suce.entity.Product;
import com.suce.entity.User;
import com.suce.enums.OrderStatus;
import com.suce.enums.PaymentStatus;
import com.suce.exception.ApiException;
import com.suce.repository.OrderRepository;
import com.suce.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class OrderService {

    
    private final OrderRepository   orderRepo;
    private final ProductRepository productRepo;
    private final JavaMailSender    mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        JavaMailSender mailSender) {
        this.orderRepo   = orderRepo;
        this.productRepo = productRepo;
        this.mailSender  = mailSender;
    }

    // ── Place a new order ─────────────────────────────────────────────
    @Transactional
    public OrderResponse place(User user, PlaceOrderRequest req) {
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (PlaceOrderRequest.OrderLineRequest line : req.getItems()) {
            Product p = productRepo.findById(line.getProductId())
                    .orElseThrow(() -> new ApiException(
                            "Product " + line.getProductId() + " not found", HttpStatus.NOT_FOUND));

            if (!p.isActive())
                throw new ApiException(p.getName() + " is no longer available", HttpStatus.CONFLICT);

            if (p.getStockQuantity() < line.getQuantity())
                throw new ApiException(p.getName() + " does not have enough stock", HttpStatus.CONFLICT);

            BigDecimal unitPrice = (p.getDiscountPrice() != null)
                    ? p.getDiscountPrice() : p.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(line.getQuantity()));
            total = total.add(subtotal);

            // Reduce stock
            p.setStockQuantity(p.getStockQuantity() - line.getQuantity());
            productRepo.save(p);

            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setProductName(p.getName());
            oi.setProductSku(p.getSku());
            oi.setQuantity(line.getQuantity());
            oi.setPriceAtPurchase(unitPrice);
            oi.setSelectedSize(line.getSelectedSize());
            orderItems.add(oi);
        }

        PlaceOrderRequest.ShippingAddress addr = req.getShippingAddress();

        Order order = new Order();
        order.setOrderNumber("SUCE" + (100000 + (int)(Math.random() * 900000)));
        order.setUser(user);
        // COD has no payment to verify before fulfillment can start, so
        // it goes straight to CONFIRMED. Online payment methods (Razorpay,
        // etc.) stay PENDING until PaymentController/payment webhook
        // confirms the transaction succeeded.
        boolean isCod = "COD".equalsIgnoreCase(req.getPaymentMethod());
        order.setStatus(isCod ? OrderStatus.CONFIRMED : OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setPaymentMethod(req.getPaymentMethod());
        order.setTotalAmount(total);
        order.setShippingFullName(addr.getFullName());
        order.setShippingLine1(addr.getLine1());
        order.setShippingLine2(addr.getLine2());
        order.setShippingCity(addr.getCity());
        order.setShippingState(addr.getState());
        order.setShippingPostalCode(addr.getPostalCode());
        order.setShippingPhone(addr.getPhone());

        // Link items to order
        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
        }
        order.setItems(orderItems);

        Order saved = orderRepo.save(order);
        if (saved.getStatus() == OrderStatus.CONFIRMED) {
            sendOrderConfirmationEmail(user, saved);
        }
        return OrderResponse.from(saved);
    }

    // ── List orders for a customer ────────────────────────────────────
    @Transactional
    public Page<OrderResponse> listForUser(User user, int page, int size) {
        return orderRepo
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(OrderResponse::from);
    }

    // ── Get single order for a customer ──────────────────────────────
    @Transactional
    public OrderResponse getForUser(Long id, User user) {
        Order o = orderRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        return OrderResponse.from(o);
    }

    // ── Cancel an order ───────────────────────────────────────────────
    @Transactional
    public OrderResponse cancel(Long id, User user) {
        Order o = orderRepo.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));

        List<OrderStatus> cancellable = Arrays.asList(OrderStatus.PENDING, OrderStatus.CONFIRMED);
        if (!cancellable.contains(o.getStatus()))
            throw new ApiException("This order cannot be cancelled", HttpStatus.CONFLICT);

        o.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepo.save(o);
        sendCancellationEmail(user, saved);
        return OrderResponse.from(saved);
    }
    private void sendOrderConfirmationEmail(User user, Order order) {
        try {
            StringBuilder itemLines = new StringBuilder();
            for (OrderItem item : order.getItems()) {
                itemLines.append("  - ")
                         .append(item.getProductName())
                         .append(" x").append(item.getQuantity())
                         .append(" @ ₹").append(item.getPriceAtPurchase())
                         .append("\n");
            }

            String body = "Hi " + user.getFirstName() + ",\n\n"
                    + "Great news! Your SUCE order has been confirmed.\n\n"
                    + "Order Number : " + order.getOrderNumber() + "\n"
                    + "Payment      : " + order.getPaymentMethod() + "\n"
                    + "Total        : ₹" + order.getTotalAmount() + "\n\n"
                    + "Items ordered:\n"
                    + itemLines
                    + "\nDelivery Address:\n"
                    + "  " + order.getShippingFullName() + "\n"
                    + "  " + order.getShippingLine1() + "\n"
                    + (order.getShippingLine2() != null ? "  " + order.getShippingLine2() + "\n" : "")
                    + "  " + order.getShippingCity() + " - " + order.getShippingPostalCode() + "\n"
                    + "  " + order.getShippingState() + "\n\n"
                    + "We'll notify you once your order is shipped.\n\n"
                    + "Thank you for shopping with SUCE!\n"
                    + "— The SUCE Team";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Order Confirmed — " + order.getOrderNumber());
            message.setText(body);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("[SUCE] Order confirmation email failed: " + e.getMessage());
        }
    }
    private void sendCancellationEmail(User user, Order order) {
        try {
            String body = "Hi " + user.getFirstName() + ",\n\n"
                    + "Your SUCE order " + order.getOrderNumber() + " has been cancelled as requested.\n\n"
                    + "Order Number : " + order.getOrderNumber() + "\n"
                    + "Total        : ₹" + order.getTotalAmount() + "\n\n"
                    + "If you have any questions, please contact us.\n\n"
                    + "— The SUCE Team";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail());
            message.setSubject("Order Cancelled — " + order.getOrderNumber());
            message.setText(body);
            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("[SUCE] Cancellation email failed for order "
                    + order.getOrderNumber() + ": " + e.getMessage());
        }
    }
}
