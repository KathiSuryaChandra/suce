package com.suce.repository;

import com.suce.entity.Order;
import com.suce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);
    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt >= :from")
    Double sumRevenueFrom(@Param("from") LocalDateTime from);

    long countByCreatedAtAfter(LocalDateTime from);

    @Query("SELECT oi.productName, SUM(oi.quantity) as sold " +
           "FROM OrderItem oi GROUP BY oi.productName ORDER BY sold DESC")
    List<Object[]> topProductsSold(Pageable pageable);
}
