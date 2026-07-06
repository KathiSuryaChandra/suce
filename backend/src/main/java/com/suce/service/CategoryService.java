package com.suce.service;

import com.suce.entity.Category;
import com.suce.exception.ApiException;
import com.suce.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepo;

    public CategoryService(CategoryRepository categoryRepo) {
        this.categoryRepo = categoryRepo;
    }

    public List<Category> list() {
        return categoryRepo.findAll();
    }

    @Transactional
    public Category create(Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank())
            throw new ApiException("Category name is required", HttpStatus.BAD_REQUEST);
        if (categoryRepo.existsByName(name))
            throw new ApiException("Category already exists", HttpStatus.CONFLICT);

        String slug = body.containsKey("slug") && !body.get("slug").isBlank()
                ? body.get("slug")
                : name.toLowerCase().replaceAll("\\s+", "-");

        Category cat = new Category();
        cat.setName(name);
        cat.setSlug(slug);
        cat.setDescription(body.get("description"));
        return categoryRepo.save(cat);
    }

    @Transactional
    public Category update(Long id, Map<String, String> body) {
        Category cat = categoryRepo.findById(id)
                .orElseThrow(() -> new ApiException("Category not found", HttpStatus.NOT_FOUND));
        if (body.containsKey("name"))        cat.setName(body.get("name"));
        if (body.containsKey("slug"))        cat.setSlug(body.get("slug"));
        if (body.containsKey("description")) cat.setDescription(body.get("description"));
        return categoryRepo.save(cat);
    }

    @Transactional
    public void delete(Long id) {
        if (!categoryRepo.existsById(id))
            throw new ApiException("Category not found", HttpStatus.NOT_FOUND);
        categoryRepo.deleteById(id);
    }
}
