package com.suce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.suce.entity.Category;
import com.suce.entity.Product;
import com.suce.entity.ProductImage;
import com.suce.exception.ApiException;
import com.suce.repository.CategoryRepository;
import com.suce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    @Value("${app.cloudinary.cloud-name}")
    private String cloudName;

    @Value("${app.cloudinary.api-key}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret}")
    private String apiSecret;

    public ProductService(ProductRepository productRepo, CategoryRepository categoryRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
    }

    public Page<Product> list(String search, Long categoryId, String sort, int page, int size) {
        Sort s;
        if (sort == null) sort = "newest";
        switch (sort) {
            case "price_asc":  s = Sort.by("price").ascending();           break;
            case "price_desc": s = Sort.by("price").descending();          break;
            case "rating":     s = Sort.by("averageRating").descending();  break;
            default:           s = Sort.by("createdAt").descending();      break;
        }
        Pageable pageable = PageRequest.of(page, size, s);
        String searchParam = (search != null && !search.isBlank()) ? search : null;
        return productRepo.findFiltered(searchParam, categoryId, pageable);
    }

    public Product getById(Long id) {
        return productRepo.findById(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Product create(Map<String, Object> payload) {
        Product p = new Product();
        applyPayload(p, payload);
        return productRepo.save(p);
    }

    @Transactional
    public Product update(Long id, Map<String, Object> payload) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        applyPayload(p, payload);
        return productRepo.save(p);
    }

    @Transactional
    public void delete(Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        p.setActive(false);
        productRepo.save(p);
    }

    @Transactional
    public Product uploadImages(Long id, MultipartFile[] files, String uploadDir) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key",    apiKey,
                "api_secret", apiSecret));

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder",          "suce/products",
                                "use_filename",    true,
                                "unique_filename", true,
                                "overwrite",       false));

                String imageUrl = (String) uploadResult.get("secure_url");

                ProductImage img = new ProductImage();
                img.setUrl(imageUrl);
                img.setPrimary(p.getImages().isEmpty() && i == 0);
                img.setProduct(p);
                p.getImages().add(img);

            } catch (Exception e) {
                throw new ApiException("Image upload failed: " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return productRepo.save(p);
    }

    // ── private helper ────────────────────────────────────────────────
    private void applyPayload(Product p, Map<String, Object> m) {
        if (m.containsKey("name"))
            p.setName((String) m.get("name"));
        if (m.containsKey("description"))
            p.setDescription((String) m.get("description"));
        if (m.containsKey("price"))
            p.setPrice(new BigDecimal(m.get("price").toString()));
        if (m.containsKey("discountPrice")) {
            Object dp = m.get("discountPrice");
            p.setDiscountPrice(dp == null ? null : new BigDecimal(dp.toString()));
        }
        if (m.containsKey("stockQuantity"))
            p.setStockQuantity(Integer.parseInt(m.get("stockQuantity").toString()));
        if (m.containsKey("sku"))
            p.setSku((String) m.get("sku"));
        if (m.containsKey("sizes"))
            p.setSizes((String) m.get("sizes"));
        if (m.containsKey("categoryId")) {
            Long catId = Long.parseLong(m.get("categoryId").toString());
            Category cat = categoryRepo.findById(catId)
                    .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));
            p.setCategory(cat);
        }
    }
}