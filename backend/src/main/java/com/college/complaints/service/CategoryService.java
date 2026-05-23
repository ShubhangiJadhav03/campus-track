package com.college.complaints.service;

import com.college.complaints.dto.request.CategoryRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import java.util.List;

public interface CategoryService {
    List<ResponseDTOs.CategoryResponse> getAllActiveCategories();
    List<ResponseDTOs.CategoryResponse> getAllCategories();
    ResponseDTOs.CategoryResponse createCategory(CategoryRequest request);
    ResponseDTOs.CategoryResponse updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
