package com.college.complaints.controller;

import com.college.complaints.dto.request.AuthRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.AuthResponse>> login(
            @Valid @RequestBody AuthRequest.Login request) {
        ResponseDTOs.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    @Operation(summary = "Student registration")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.AuthResponse>> register(
            @Valid @RequestBody AuthRequest.Register request) {
        ResponseDTOs.AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDTOs.ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset")
    public ResponseEntity<ResponseDTOs.ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody AuthRequest.ForgotPassword request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success(
                "Password reset link sent to your email", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<ResponseDTOs.ApiResponse<Void>> resetPassword(
            @Valid @RequestBody AuthRequest.ResetPassword request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Password reset successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        ResponseDTOs.UserResponse user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("User profile retrieved", user));
    }
}
