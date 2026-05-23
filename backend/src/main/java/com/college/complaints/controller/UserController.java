package com.college.complaints.controller;

import com.college.complaints.dto.request.UserUpdateRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.service.NotificationService;
import com.college.complaints.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management APIs")
public class UserController {

    private final UserService userService;
    private final NotificationService notificationService;

    // ========== User Profile ==========
    @PutMapping("/profile")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.UserResponse>> updateProfile(
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Profile updated",
                userService.updateProfile(userDetails.getUsername(), request)));
    }

    // ========== Admin User Management ==========
    @GetMapping("/admin/users")
    public ResponseEntity<ResponseDTOs.ApiResponse<List<ResponseDTOs.UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Users retrieved",
                userService.getAllUsers()));
    }

    @GetMapping("/admin/users/staff")
    public ResponseEntity<ResponseDTOs.ApiResponse<List<ResponseDTOs.UserResponse>>> getAllStaff() {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Staff retrieved",
                userService.getAllStaff()));
    }

    @GetMapping("/admin/users/students")
    public ResponseEntity<ResponseDTOs.ApiResponse<List<ResponseDTOs.UserResponse>>> getAllStudents() {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Students retrieved",
                userService.getAllStudents()));
    }

    @PatchMapping("/admin/users/{id}/toggle-status")
    public ResponseEntity<ResponseDTOs.ApiResponse<Void>> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("User status updated", null));
    }

    // ========== Notifications ==========
    @GetMapping("/notifications")
    public ResponseEntity<ResponseDTOs.ApiResponse<List<ResponseDTOs.NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Notifications retrieved",
                notificationService.getUserNotifications(userDetails.getUsername())));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<ResponseDTOs.ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Unread count",
                notificationService.getUnreadCount(userDetails.getUsername())));
    }

    @PostMapping("/notifications/mark-all-read")
    public ResponseEntity<ResponseDTOs.ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("All notifications marked as read", null));
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<ResponseDTOs.ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Notification marked as read", null));
    }
}
