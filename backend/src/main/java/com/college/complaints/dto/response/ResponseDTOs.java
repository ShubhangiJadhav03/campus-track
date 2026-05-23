package com.college.complaints.dto.response;

import com.college.complaints.enums.ComplaintStatus;
import com.college.complaints.enums.NotificationType;
import com.college.complaints.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ResponseDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private UserResponse user;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private String department;
        private String studentId;
        private String employeeId;
        private String profilePicture;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintResponse {
        private Long id;
        private String ticketNumber;
        private String title;
        private String description;
        private CategoryResponse category;
        private UserResponse student;
        private UserResponse assignedTo;
        private ComplaintStatus status;
        private Priority priority;
        private String location;
        private String attachmentUrls;
        private String resolutionNotes;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<ComplaintUpdateResponse> updates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplaintUpdateResponse {
        private Long id;
        private String updatedByName;
        private String updatedByRole;
        private ComplaintStatus oldStatus;
        private ComplaintStatus newStatus;
        private String remarks;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private Long id;
        private Long complaintId;
        private String ticketNumber;
        private String title;
        private String message;
        private NotificationType type;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private Long totalComplaints;
        private Long submittedComplaints;
        private Long underReviewComplaints;
        private Long assignedComplaints;
        private Long inProgressComplaints;
        private Long resolvedComplaints;
        private Long closedComplaints;
        private Map<String, Long> categoryWise;
        private Map<String, Long> monthlyTrends;
        private Map<String, Long> staffPerformance;
        private Long totalStudents;
        private Long totalStaff;
        private Long unreadNotifications;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageResponse<T> {
        private List<T> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }
}
