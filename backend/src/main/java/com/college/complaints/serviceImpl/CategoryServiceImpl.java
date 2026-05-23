package com.college.complaints.serviceImpl;

import com.college.complaints.dto.request.CategoryRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.entity.Category;
import com.college.complaints.exception.BadRequestException;
import com.college.complaints.exception.ResourceNotFoundException;
import com.college.complaints.repository.CategoryRepository;
import com.college.complaints.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<ResponseDTOs.CategoryResponse> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseDTOs.CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResponseDTOs.CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .isActive(request.getIsActive())
                .build();

        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public ResponseDTOs.CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    private ResponseDTOs.CategoryResponse mapToResponse(Category c) {
        return ResponseDTOs.CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .icon(c.getIcon())
                .isActive(c.getIsActive())
                .build();
    }
}
