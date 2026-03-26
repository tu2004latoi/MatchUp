package com.matchup.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.matchup.model.Category;
import com.matchup.repository.CategoryRepository;

import java.util.logging.Level;
import java.util.logging.Logger;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private Cloudinary cloudinary;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(int id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public Category addCategory(Category category) {
        if (category.getFile() != null && !category.getFile().isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(category.getFile().getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                category.setIcon(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(CategoryService.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(Category category) {
        categoryRepository.delete(category);
    }
}
