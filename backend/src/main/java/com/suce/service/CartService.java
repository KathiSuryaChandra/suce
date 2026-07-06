package com.suce.service;

import com.suce.entity.Cart;
import com.suce.entity.CartItem;
import com.suce.entity.Product;
import com.suce.entity.User;
import com.suce.exception.ApiException;
import com.suce.repository.CartItemRepository;
import com.suce.repository.CartRepository;
import com.suce.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository cartItemRepo;
    private final ProductRepository productRepo;

    public CartService(CartRepository cartRepo,
                       CartItemRepository cartItemRepo,
                       ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.productRepo = productRepo;
    }

    private Cart getOrCreate(User user) {
        return cartRepo.findByUserId(user.getId()).orElseGet(() -> {
            Cart c = new Cart();
            c.setUser(user);
            return cartRepo.save(c);
        });
    }

    public Cart getCart(User user) {
        return getOrCreate(user);
    }

    @Transactional
    public Cart addItem(User user, Long productId, int quantity) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        Cart cart = getOrCreate(user);

        cartItemRepo.findByCartIdAndProductId(cart.getId(), productId).ifPresentOrElse(
                existing -> existing.setQuantity(existing.getQuantity() + quantity),
                () -> {
                    CartItem item = new CartItem();
                    item.setCart(cart);
                    item.setProduct(product);
                    item.setQuantity(quantity);
                    cart.getItems().add(item);
                }
        );
        return cartRepo.save(cart);
    }

    @Transactional
    public Cart updateItem(User user, Long itemId, int quantity) {
        CartItem item = cartItemRepo.findById(itemId)
                .orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        Cart cart = getOrCreate(user);
        if (!item.getCart().getId().equals(cart.getId()))
            throw new ApiException("Forbidden", HttpStatus.FORBIDDEN);

        item.setQuantity(quantity);
        cartItemRepo.save(item);
        return cartRepo.findByUserId(user.getId()).orElse(cart);
    }

    @Transactional
    public Cart removeItem(User user, Long itemId) {
        CartItem item = cartItemRepo.findById(itemId)
                .orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        Cart cart = getOrCreate(user);
        if (!item.getCart().getId().equals(cart.getId()))
            throw new ApiException("Forbidden", HttpStatus.FORBIDDEN);

        cart.getItems().remove(item);
        return cartRepo.save(cart);
    }

    @Transactional
    public Cart clear(User user) {
        Cart cart = getOrCreate(user);
        cart.getItems().clear();
        return cartRepo.save(cart);
    }
}
