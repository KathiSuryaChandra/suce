package com.suce.repository;

import com.suce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.active = true " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%'))) " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> findFiltered(@Param("search") String search,
                               @Param("categoryId") Long categoryId,
                               Pageable pageable);

    long countByActiveTrue();
    long countByActiveTrueAndStockQuantityLessThan(int threshold);
}
