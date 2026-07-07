package com.suce.service;

import com.suce.dto.response.DashboardStatsResponse;
import com.suce.dto.response.OrderResponse;
import com.suce.entity.Order;
import com.suce.entity.User;
import com.suce.enums.OrderStatus;
import com.suce.enums.Role;
import com.suce.exception.ApiException;
import com.suce.repository.OrderRepository;
import com.suce.repository.ProductRepository;
import com.suce.repository.UserRepository;
import com.suce.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    private final OrderRepository    orderRepo;
    private final ProductRepository  productRepo;
    private final UserRepository     userRepo;
    private final WishlistRepository wishlistRepo;
    private final EmailService       emailService;

    
    public AdminService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        UserRepository userRepo,
                        WishlistRepository wishlistRepo,
                        EmailService emailService) {
        this.orderRepo    = orderRepo;
        this.productRepo  = productRepo;
        this.userRepo     = userRepo;
        this.wishlistRepo = wishlistRepo;
        this.emailService = emailService;
    }

    // ── Dashboard stats ───────────────────────────────────────────────
    public DashboardStatsResponse dashboardStats() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        Double revenue   = orderRepo.sumRevenueFrom(thirtyDaysAgo);
        long orderCount  = orderRepo.countByCreatedAtAfter(thirtyDaysAgo);
        long customers   = userRepo.countByRole(Role.CUSTOMER);
        long lowStock    = productRepo.countByActiveTrueAndStockQuantityLessThan(10);

        // Recent 5 orders
        List<DashboardStatsResponse.RecentOrderDto> recentOrders = new ArrayList<>();
        for (Order o : orderRepo.findTop5ByOrderByCreatedAtDesc()) {
            DashboardStatsResponse.RecentOrderDto dto = new DashboardStatsResponse.RecentOrderDto();
            dto.setId(o.getId());
            dto.setOrderNumber(o.getOrderNumber());
            dto.setCustomerName(o.getShippingFullName());
            dto.setStatus(o.getStatus().name());
            dto.setTotalAmount(o.getTotalAmount().doubleValue());
            recentOrders.add(dto);
        }

        // Top 5 products by units sold
        List<DashboardStatsResponse.TopProductDto> topProducts = new ArrayList<>();
        List<Object[]> rows = orderRepo.topProductsSold(PageRequest.of(0, 5));
        for (Object[] row : rows) {
            DashboardStatsResponse.TopProductDto dto = new DashboardStatsResponse.TopProductDto();
            dto.setName((String) row[0]);
            dto.setUnitsSold(((Number) row[1]).longValue());
            topProducts.add(dto);
        }

        // Wishlist stats
        long totalWishlistAdds      = wishlistRepo.count();
        long usersWithWishlistItems = wishlistRepo.countDistinctUsers();

        List<DashboardStatsResponse.TopWishlistedDto> topWishlisted = new ArrayList<>();
        for (Object[] row : wishlistRepo.topWishlistedProducts(PageRequest.of(0, 5))) {
            DashboardStatsResponse.TopWishlistedDto dto = new DashboardStatsResponse.TopWishlistedDto();
            dto.setName((String) row[0]);
            dto.setWishlistCount(((Number) row[1]).longValue());
            topWishlisted.add(dto);
        }

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setRevenueLast30Days(revenue == null ? 0.0 : revenue);
        stats.setRevenueTrend(null);
        stats.setOrdersLast30Days(orderCount);
        stats.setOrdersTrend(null);
        stats.setTotalCustomers(customers);
        stats.setLowStockCount(lowStock);
        stats.setTotalWishlistAdds(totalWishlistAdds);
        stats.setUsersWithWishlistItems(usersWithWishlistItems);
        stats.setRecentOrders(recentOrders);
        stats.setTopProducts(topProducts);
        stats.setTopWishlisted(topWishlisted);
        return stats;
    }

    // ── List all orders (admin) ───────────────────────────────────────
    @Transactional
    public Page<OrderResponse> listOrders(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders;
        if (status != null && !status.isBlank()) {
            try {
                OrderStatus os = OrderStatus.valueOf(status.toUpperCase());
                orders = orderRepo.findByStatusOrderByCreatedAtDesc(os, pageable);
            } catch (IllegalArgumentException e) {
                throw new ApiException("Invalid order status: " + status, HttpStatus.BAD_REQUEST);
            }
        } else {
            orders = orderRepo.findAll(pageable);
        }
        return orders.map(OrderResponse::from);
    }

    // ── Update order status + notify customer ─────────────────────────
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order o = orderRepo.findById(id)
                .orElseThrow(() -> new ApiException("Order not found", HttpStatus.NOT_FOUND));
        try {
            o.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid status: " + status, HttpStatus.BAD_REQUEST);
        }
        Order saved = orderRepo.save(o);
        sendStatusEmail(saved);
        return OrderResponse.from(saved);
    }

    // ── List users ────────────────────────────────────────────────────
    public Page<User> listUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search != null && !search.isBlank()) {
            return userRepo.searchUsers(search, pageable);
        }
        return userRepo.findAll(pageable);
    }

    // ── Enable / disable a user ───────────────────────────────────────
    @Transactional
    public User setUserEnabled(Long id, boolean enabled) {
        User u = userRepo.findById(id)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        u.setEnabled(enabled);
        return userRepo.save(u);
    }

    // ── Email helper ──────────────────────────────────────────────────
    private void sendStatusEmail(Order order) {
        try {
            String name = order.getUser().getFirstName();
            String num  = order.getOrderNumber();
            String subject;
            String body;

            switch (order.getStatus()) {
                case CONFIRMED -> {
                    subject = "Order Confirmed — " + num;
                    body = "Hi " + name + ",\n\n"
                         + "Your SUCE order " + num + " has been confirmed and is being prepared.\n\n"
                         + "Total: ₹" + order.getTotalAmount() + "\n\n"
                         + "We'll notify you once it's shipped.\n\n"
                         + "— The SUCE Team";
                }
                case PROCESSING -> {
                    subject = "Order Being Processed — " + num;
                    body = "Hi " + name + ",\n\n"
                         + "Your order " + num + " is currently being processed.\n\n"
                         + "— The SUCE Team";
                }
                case SHIPPED -> {
                    subject = "Your Order is on the Way! — " + num;
                    body = "Hi " + name + ",\n\n"
                         + "Great news! Your SUCE order " + num + " has been shipped "
                         + "and is on its way to you.\n\n"
                         + "Delivery address: " + order.getShippingCity()
                         + ", " + order.getShippingState() + "\n\n"
                         + "— The SUCE Team";
                }
                case DELIVERED -> {
                    subject = "Order Delivered — " + num;
                    body = "Hi " + name + ",\n\n"
                         + "Your SUCE order " + num + " has been delivered. "
                         + "We hope you love it!\n\n"
                         + "Thank you for shopping with SUCE.\n\n"
                         + "— The SUCE Team";
                }
                case CANCELLED -> {
                    subject = "Order Cancelled — " + num;
                    body = "Hi " + name + ",\n\n"
                         + "Your SUCE order " + num + " has been cancelled.\n\n"
                         + "If you have any questions, please contact us.\n\n"
                         + "— The SUCE Team";
                }
                default -> { return; }
            }

            emailService.send(order.getUser().getEmail(), subject, body);

        } catch (Exception e) {
            System.err.println("[SUCE] Status email failed for order "
                    + order.getOrderNumber() + ": " + e.getMessage());
        }
    }
}