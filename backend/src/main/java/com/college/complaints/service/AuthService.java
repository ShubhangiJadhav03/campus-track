package com.college.complaints.service;

import com.college.complaints.dto.request.AuthRequest;
import com.college.complaints.dto.response.ResponseDTOs;

public interface AuthService {
    ResponseDTOs.AuthResponse login(AuthRequest.Login request);
    ResponseDTOs.AuthResponse register(AuthRequest.Register request);
    void forgotPassword(AuthRequest.ForgotPassword request);
    void resetPassword(AuthRequest.ResetPassword request);
    ResponseDTOs.UserResponse getCurrentUser(String email);
}
