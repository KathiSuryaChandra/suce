package com.suce.service;

import com.suce.entity.Product;
import com.suce.entity.Review;
import com.suce.entity.User;
import com.suce.exception.ApiException;
import com.suce.repository.ProductRepository;
import com.suce.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;

    public ReviewService(ReviewRepository reviewRepo, ProductRepository productRepo) {
        this.reviewRepo = reviewRepo;
        this.productRepo = productRepo;
    }

    public Page<Review> getReviews(Long productId, int page, int size) {
        return reviewRepo.findByProductId(
                productId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @Transactional
    public Review addReview(Long productId, User user, Map<String, Object> payload) {
        if (reviewRepo.existsByUserIdAndProductId(user.getId(), productId))
            throw new ApiException("You have already reviewed this product", HttpStatus.CONFLICT);

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(Integer.parseInt(payload.get("rating").toString()));
        if (payload.containsKey("comment"))
            review.setComment((String) payload.get("comment"));

        reviewRepo.save(review);

        // Recalculate average rating on the product
        Double avg = reviewRepo.avgRatingByProduct(productId);
        long cnt = reviewRepo.countByProductId(productId);
        product.setAverageRating(avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0);
        product.setReviewCount((int) cnt);
        productRepo.save(product);

        return review;
    }
}
