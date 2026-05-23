package com.college.complaints.dto.request;

import com.college.complaints.enums.ComplaintStatus;
import com.college.complaints.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class ComplaintRequest {

    @Data
    public static class Create {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
        private String title;

        @NotBlank(message = "Description is required")
        @Size(min = 10, message = "Description must be at least 10 characters")
        private String description;

        @NotNull(message = "Category is required")
        private Long categoryId;

        private Priority priority = Priority.MEDIUM;

        private String location;

        private String attachmentUrls;
    }

    @Data
    public static class UpdateStatus {
        @NotNull(message = "Status is required")
        private ComplaintStatus status;

        private String remarks;

        private Long assignedToId;

        private String resolutionNotes;
    }

    @Data
    public static class AssignComplaint {
        @NotNull(message = "Staff ID is required")
        private Long staffId;

        private String remarks;
    }
}
