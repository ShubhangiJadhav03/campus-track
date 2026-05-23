package com.college.complaints.serviceImpl;

import com.college.complaints.dto.request.AuthRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.entity.Role;
import com.college.complaints.entity.User;
import com.college.complaints.exception.BadRequestException;
import com.college.complaints.exception.ResourceNotFoundException;
import com.college.complaints.repository.RoleRepository;
import com.college.complaints.repository.UserRepository;
import com.college.complaints.security.JwtUtils;
import com.college.complaints.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public ResponseDTOs.AuthResponse login(AuthRequest.Login request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtUtils.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseDTOs.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public ResponseDTOs.AuthResponse register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role STUDENT not found"));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(studentRole)
                .department(request.getDepartment())
                .studentId(request.getStudentId())
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateTokenFromEmail(user.getEmail());

        return ResponseDTOs.AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public void forgotPassword(AuthRequest.ForgotPassword request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + request.getEmail()));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Email sending would be triggered here via EmailService
        // For now we log the token (in production, send email)
    }

    @Override
    @Transactional
    public void resetPassword(AuthRequest.ResetPassword request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    public ResponseDTOs.UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserResponse(user);
    }

    private ResponseDTOs.UserResponse mapToUserResponse(User user) {
        return ResponseDTOs.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .department(user.getDepartment())
                .studentId(user.getStudentId())
                .employeeId(user.getEmployeeId())
                .profilePicture(user.getProfilePicture())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
