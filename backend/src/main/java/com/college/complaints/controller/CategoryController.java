package com.college.complaints.controller;

import com.college.complaints.dto.request.CategoryRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.service.CategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Complaint category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/active")
    public ResponseEntity<ResponseDTOs.ApiResponse<List<ResponseDTOs.CategoryResponse>>> getActiveCategories() {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Categories retrieved",
                categoryService.getAllActiveCategories()));
    }

    @GetMapping
    public ResponseEntity<ResponseDTOs.ApiResponse<List<ResponseDTOs.CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Categories retrieved",
                categoryService.getAllCategories()));
    }

    @PostMapping("/admin")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDTOs.ApiResponse.success("Category created",
                        categoryService.createCategory(request)));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.CategoryResponse>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Category updated",
                categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ResponseDTOs.ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Category deactivated", null));
    }
}
