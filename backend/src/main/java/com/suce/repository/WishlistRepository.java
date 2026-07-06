package com.suce.repository;

import com.suce.entity.Wishlist;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserIdAndProductId(Long userId, Long productId);

    // Total number of wishlist entries across all users (how many "adds" overall)
    long count();

    // Number of distinct users who have at least one wishlist item
    @Query("SELECT COUNT(DISTINCT w.user.id) FROM Wishlist w")
    long countDistinctUsers();

    // Most-wishlisted products, most-wishlisted first
    @Query("SELECT w.product.name, COUNT(w) as wishlistCount " +
           "FROM Wishlist w GROUP BY w.product.id, w.product.name ORDER BY wishlistCount DESC")
    List<Object[]> topWishlistedProducts(Pageable pageable);
}
