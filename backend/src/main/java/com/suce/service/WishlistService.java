package com.suce.service;

import com.suce.entity.Product;
import com.suce.entity.User;
import com.suce.entity.Wishlist;
import com.suce.exception.ApiException;
import com.suce.repository.ProductRepository;
import com.suce.repository.WishlistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepo;
    private final ProductRepository  productRepo;

    public WishlistService(WishlistRepository wishlistRepo, ProductRepository productRepo) {
        this.wishlistRepo = wishlistRepo;
        this.productRepo  = productRepo;
    }

    public List<Product> list(User user) {
        return wishlistRepo.findByUserId(user.getId())
                .stream()
                .map(Wishlist::getProduct)
                .collect(Collectors.toList());
    }

    @Transactional
    public void add(User user, Long productId) {
        if (wishlistRepo.existsByUserIdAndProductId(user.getId(), productId)) return;
        Product p = productRepo.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        Wishlist w = new Wishlist();
        w.setUser(user);
        w.setProduct(p);
        wishlistRepo.save(w);
    }

    @Transactional
    public void remove(User user, Long productId) {
        wishlistRepo.deleteByUserIdAndProductId(user.getId(), productId);
    }
}
