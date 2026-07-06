package com.suce.controller;

import com.suce.entity.Product;
import com.suce.entity.User;
import com.suce.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    /** GET /api/wishlist */
    @GetMapping
    public ResponseEntity<List<Product>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(wishlistService.list(user));
    }

    /** POST /api/wishlist  body: { productId } */
    @PostMapping
    public ResponseEntity<Map<String, Boolean>> add(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {
        Long productId = Long.parseLong(body.get("productId").toString());
        wishlistService.add(user, productId);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }

    /** DELETE /api/wishlist/{productId} */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, Boolean>> remove(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        wishlistService.remove(user, productId);
        return ResponseEntity.ok(Collections.singletonMap("success", true));
    }
}
