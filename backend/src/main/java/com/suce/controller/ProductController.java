package com.suce.controller;

import com.suce.dto.response.PageResponse;
import com.suce.entity.Product;
import com.suce.entity.Review;
import com.suce.entity.User;
import com.suce.service.ProductService;
import com.suce.service.ReviewService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ReviewService  reviewService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ProductController(ProductService productService, ReviewService reviewService) {
        this.productService = productService;
        this.reviewService  = reviewService;
    }

    /** GET /api/products */
    @GetMapping
    public ResponseEntity<PageResponse<Product>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<Product> result = productService.list(search, categoryId, sort, page, size);
        PageResponse<Product> resp = new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    /** GET /api/products/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    /** GET /api/products/{id}/reviews */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<PageResponse<Review>> reviews(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Review> result = reviewService.getReviews(id, page, size);
        PageResponse<Review> resp = new PageResponse<>(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
        return ResponseEntity.ok(resp);
    }

    /** POST /api/products/{id}/reviews – authenticated */
    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> addReview(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.addReview(id, user, body));
    }

    /** POST /api/products – ADMIN */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(body));
    }

    /** PUT /api/products/{id} – ADMIN */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(productService.update(id, body));
    }

    /** DELETE /api/products/{id} – ADMIN */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    /** POST /api/products/{id}/images – ADMIN (multipart) */
    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) {
        return ResponseEntity.ok(productService.uploadImages(id, files, uploadDir));
    }
}
