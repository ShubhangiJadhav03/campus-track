package com.college.complaints.service;

import com.college.complaints.dto.request.UserUpdateRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import java.util.List;

public interface UserService {
    List<ResponseDTOs.UserResponse> getAllStaff();
    List<ResponseDTOs.UserResponse> getAllStudents();
    List<ResponseDTOs.UserResponse> getAllUsers();
    ResponseDTOs.UserResponse getUserById(Long id);
    ResponseDTOs.UserResponse updateProfile(String email, UserUpdateRequest request);
    void toggleUserStatus(Long id);
    void deleteUser(Long id);
}
