package com.suce.dto.response;

import com.suce.entity.Order;
import com.suce.entity.OrderItem;
import com.suce.enums.OrderStatus;
import com.suce.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private String customerName;
    private String customerEmail;
    private ShippingAddress shippingAddress;
    private List<ItemDto> items;

    public static OrderResponse from(Order o) {
        OrderResponse r = new OrderResponse();
        r.id = o.getId();
        r.orderNumber = o.getOrderNumber();
        r.status = o.getStatus();
        r.paymentStatus = o.getPaymentStatus();
        r.paymentMethod = o.getPaymentMethod();
        r.totalAmount = o.getTotalAmount();
        r.createdAt = o.getCreatedAt();

        if (o.getUser() != null) {
            r.customerName = (o.getUser().getFirstName() + " " + o.getUser().getLastName()).trim();
            r.customerEmail = o.getUser().getEmail();
        }

        ShippingAddress addr = new ShippingAddress();
        addr.fullName   = o.getShippingFullName();
        addr.line1      = o.getShippingLine1();
        addr.line2      = o.getShippingLine2();
        addr.city       = o.getShippingCity();
        addr.state      = o.getShippingState();
        addr.postalCode = o.getShippingPostalCode();
        addr.phone      = o.getShippingPhone();
        r.shippingAddress = addr;

        List<ItemDto> dtos = new ArrayList<>();
        for (OrderItem oi : o.getItems()) {
            ItemDto dto = new ItemDto();
            dto.id              = oi.getId();
            dto.productName     = oi.getProductName();
            dto.quantity        = oi.getQuantity();
            dto.priceAtPurchase = oi.getPriceAtPurchase();
            dtos.add(dto);
        }
        r.items = dtos;
        return r;
    }

    // ── Getters ───────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public OrderStatus getStatus() { return status; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public ShippingAddress getShippingAddress() { return shippingAddress; }
    public List<ItemDto> getItems() { return items; }

    // ── Nested ────────────────────────────────────────────────────────
    public static class ShippingAddress {
        private String fullName, line1, line2, city, state, postalCode, phone;

        public String getFullName()   { return fullName; }
        public String getLine1()      { return line1; }
        public String getLine2()      { return line2; }
        public String getCity()       { return city; }
        public String getState()      { return state; }
        public String getPostalCode() { return postalCode; }
        public String getPhone()      { return phone; }
    }

    public static class ItemDto {
        private Long id;
        private String productName;
        private Integer quantity;
        private BigDecimal priceAtPurchase;

        public Long getId()                     { return id; }
        public String getProductName()          { return productName; }
        public Integer getQuantity()            { return quantity; }
        public BigDecimal getPriceAtPurchase()  { return priceAtPurchase; }
    }
}
