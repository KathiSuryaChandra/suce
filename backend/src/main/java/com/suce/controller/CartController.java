package com.suce.controller;

import com.suce.entity.Cart;
import com.suce.entity.User;
import com.suce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /** GET /api/cart */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal User user) {
        Cart cart = cartService.getCart(user);
        return ResponseEntity.ok(Collections.singletonMap("items", cart.getItems()));
    }

    /** POST /api/cart/items  body: { productId, quantity } */
    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> addItem(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> body) {

        Long productId = Long.parseLong(body.get("productId").toString());
        int  quantity  = body.containsKey("quantity")
                ? Integer.parseInt(body.get("quantity").toString()) : 1;

        Cart cart = cartService.addItem(user, productId, quantity);
        return ResponseEntity.ok(Collections.singletonMap("items", cart.getItems()));
    }

    /** PUT /api/cart/items/{itemId}  body: { quantity } */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<Map<String, Object>> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {

        int quantity = Integer.parseInt(body.get("quantity").toString());
        Cart cart = cartService.updateItem(user, itemId, quantity);
        return ResponseEntity.ok(Collections.singletonMap("items", cart.getItems()));
    }

    /** DELETE /api/cart/items/{itemId} */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Map<String, Object>> removeItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {

        Cart cart = cartService.removeItem(user, itemId);
        return ResponseEntity.ok(Collections.singletonMap("items", cart.getItems()));
    }

    /** DELETE /api/cart */
    @DeleteMapping
    public ResponseEntity<Map<String, Object>> clearCart(@AuthenticationPrincipal User user) {
        Cart cart = cartService.clear(user);
        return ResponseEntity.ok(Collections.singletonMap("items", cart.getItems()));
    }
}
