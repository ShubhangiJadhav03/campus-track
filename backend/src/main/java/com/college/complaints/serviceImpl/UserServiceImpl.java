package com.college.complaints.serviceImpl;

import com.college.complaints.dto.request.UserUpdateRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.entity.User;
import com.college.complaints.exception.ResourceNotFoundException;
import com.college.complaints.repository.UserRepository;
import com.college.complaints.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public List<ResponseDTOs.UserResponse> getAllStaff() {
        return userRepository.findByRoleNameAndIsActive("STAFF", true)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ResponseDTOs.UserResponse> getAllStudents() {
        return userRepository.findByRoleNameAndIsActive("STUDENT", true)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ResponseDTOs.UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ResponseDTOs.UserResponse getUserById(Long id) {
        return mapToResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    @Override
    @Transactional
    public ResponseDTOs.UserResponse updateProfile(String email, UserUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());

        return mapToResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setIsActive(false);
        userRepository.save(user);
    }

    private ResponseDTOs.UserResponse mapToResponse(User u) {
        return ResponseDTOs.UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .role(u.getRole().getName())
                .department(u.getDepartment())
                .studentId(u.getStudentId())
                .employeeId(u.getEmployeeId())
                .profilePicture(u.getProfilePicture())
                .isActive(u.getIsActive())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
