package com.college.complaints.serviceImpl;

import com.college.complaints.dto.request.ComplaintRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.entity.*;
import com.college.complaints.enums.ComplaintStatus;
import com.college.complaints.enums.NotificationType;
import com.college.complaints.enums.Priority;
import com.college.complaints.exception.BadRequestException;
import com.college.complaints.exception.ResourceNotFoundException;
import com.college.complaints.exception.UnauthorizedException;
import com.college.complaints.repository.*;
import com.college.complaints.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository updateRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ResponseDTOs.ComplaintResponse createComplaint(ComplaintRequest.Create request, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        String ticketNumber = generateTicketNumber();

        Complaint complaint = Complaint.builder()
                .ticketNumber(ticketNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .student(student)
                .status(ComplaintStatus.SUBMITTED)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .location(request.getLocation())
                .attachmentUrls(request.getAttachmentUrls())
                .build();

        complaint = complaintRepository.save(complaint);

        // Create initial update record
        ComplaintUpdate update = ComplaintUpdate.builder()
                .complaint(complaint)
                .updatedBy(student)
                .newStatus(ComplaintStatus.SUBMITTED)
                .remarks("Complaint submitted successfully")
                .build();
        updateRepository.save(update);

        // Notify student
        createNotification(student, complaint, "Complaint Submitted",
                "Your complaint " + ticketNumber + " has been submitted successfully.", NotificationType.SUCCESS);

        return mapToComplaintResponse(complaint, false);
    }

    @Override
    public ResponseDTOs.ComplaintResponse getComplaintById(Long id, String userEmail) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
        validateAccess(complaint, userEmail);
        return mapToComplaintResponse(complaint, true);
    }

    @Override
    public ResponseDTOs.ComplaintResponse getComplaintByTicket(String ticketNumber, String userEmail) {
        Complaint complaint = complaintRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ticket: " + ticketNumber));
        validateAccess(complaint, userEmail);
        return mapToComplaintResponse(complaint, true);
    }

    @Override
    public ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> getAllComplaints(
            ComplaintStatus status, Priority priority, Long categoryId, String keyword, Pageable pageable) {
        Page<Complaint> page = complaintRepository.findWithFilters(status, priority, categoryId, keyword, pageable);
        return buildPageResponse(page);
    }

    @Override
    public ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> getStudentComplaints(
            String studentEmail, ComplaintStatus status, Pageable pageable) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Page<Complaint> page = complaintRepository.findByStudentIdAndStatus(student.getId(), status, pageable);
        return buildPageResponse(page);
    }

    @Override
    public ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> getStaffComplaints(
            String staffEmail, ComplaintStatus status, Pageable pageable) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        Page<Complaint> page = complaintRepository.findByAssignedToIdAndStatus(staff.getId(), status, pageable);
        return buildPageResponse(page);
    }

    @Override
    @Transactional
    public ResponseDTOs.ComplaintResponse updateComplaintStatus(Long id, ComplaintRequest.UpdateStatus request, String updaterEmail) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
        User updater = userRepository.findByEmail(updaterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null) {
            complaint.setResolutionNotes(request.getResolutionNotes());
        }
        if (request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        if (request.getAssignedToId() != null) {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff", request.getAssignedToId()));
            complaint.setAssignedTo(assignee);
        }

        complaint = complaintRepository.save(complaint);

        // Log update
        ComplaintUpdate update = ComplaintUpdate.builder()
                .complaint(complaint)
                .updatedBy(updater)
                .oldStatus(oldStatus)
                .newStatus(request.getStatus())
                .remarks(request.getRemarks())
                .build();
        updateRepository.save(update);

        // Notify student
        String notifMsg = String.format("Your complaint %s status has been updated to: %s",
                complaint.getTicketNumber(), request.getStatus().toString().replace("_", " "));
        createNotification(complaint.getStudent(), complaint, "Complaint Status Updated",
                notifMsg, NotificationType.INFO);

        // Push WebSocket event
        messagingTemplate.convertAndSendToUser(
                complaint.getStudent().getEmail(),
                "/queue/notifications",
                Map.of("type", "STATUS_UPDATE", "ticketNumber", complaint.getTicketNumber(),
                        "newStatus", request.getStatus().toString())
        );

        return mapToComplaintResponse(complaint, true);
    }

    @Override
    @Transactional
    public ResponseDTOs.ComplaintResponse assignComplaint(Long id, ComplaintRequest.AssignComplaint request, String adminEmail) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff", request.getStaffId()));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setAssignedTo(staff);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint = complaintRepository.save(complaint);

        ComplaintUpdate update = ComplaintUpdate.builder()
                .complaint(complaint)
                .updatedBy(admin)
                .oldStatus(oldStatus)
                .newStatus(ComplaintStatus.ASSIGNED)
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Complaint assigned to " + staff.getName())
                .build();
        updateRepository.save(update);

        // Notify student
        createNotification(complaint.getStudent(), complaint, "Complaint Assigned",
                "Your complaint " + complaint.getTicketNumber() + " has been assigned to " + staff.getName(),
                NotificationType.INFO);

        // Notify staff
        createNotification(staff, complaint, "New Complaint Assigned",
                "Complaint " + complaint.getTicketNumber() + " has been assigned to you.",
                NotificationType.INFO);

        return mapToComplaintResponse(complaint, true);
    }

    @Override
    public ResponseDTOs.DashboardStats getAdminDashboardStats() {
        Map<String, Long> categoryWise = new LinkedHashMap<>();
        complaintRepository.countByCategory().forEach(row ->
                categoryWise.put((String) row[0], (Long) row[1]));

        Map<String, Long> monthlyTrends = new LinkedHashMap<>();
        int currentYear = LocalDateTime.now().getYear();
        complaintRepository.countByMonthInYear(currentYear).forEach(row -> {
            String month = getMonthName((Integer) row[0]);
            monthlyTrends.put(month, (Long) row[1]);
        });

        Map<String, Long> staffPerformance = new LinkedHashMap<>();
        complaintRepository.countByStaff().forEach(row ->
                staffPerformance.put((String) row[0], (Long) row[1]));

        return ResponseDTOs.DashboardStats.builder()
                .totalComplaints(complaintRepository.count())
                .submittedComplaints(complaintRepository.countByStatus(ComplaintStatus.SUBMITTED))
                .underReviewComplaints(complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW))
                .assignedComplaints(complaintRepository.countByStatus(ComplaintStatus.ASSIGNED))
                .inProgressComplaints(complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS))
                .resolvedComplaints(complaintRepository.countByStatus(ComplaintStatus.RESOLVED))
                .closedComplaints(complaintRepository.countByStatus(ComplaintStatus.CLOSED))
                .categoryWise(categoryWise)
                .monthlyTrends(monthlyTrends)
                .staffPerformance(staffPerformance)
                .totalStudents(userRepository.countByRoleName("STUDENT"))
                .totalStaff(userRepository.countByRoleName("STAFF"))
                .build();
    }

    @Override
    public ResponseDTOs.DashboardStats getStudentDashboardStats(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Long unread = notificationRepository.countByUserIdAndIsReadFalse(student.getId());

        return ResponseDTOs.DashboardStats.builder()
                .totalComplaints(complaintRepository.countByStudentId(student.getId()))
                .submittedComplaints(complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.SUBMITTED))
                .underReviewComplaints(complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.UNDER_REVIEW))
                .inProgressComplaints(complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.IN_PROGRESS))
                .resolvedComplaints(complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.RESOLVED))
                .closedComplaints(complaintRepository.countByStudentIdAndStatus(student.getId(), ComplaintStatus.CLOSED))
                .unreadNotifications(unread)
                .build();
    }

    @Override
    public ResponseDTOs.DashboardStats getStaffDashboardStats(String staffEmail) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        return ResponseDTOs.DashboardStats.builder()
                .totalComplaints(complaintRepository.countByAssignedToId(staff.getId()))
                .assignedComplaints(complaintRepository.countByAssignedToIdAndStatus(staff.getId(), ComplaintStatus.ASSIGNED))
                .inProgressComplaints(complaintRepository.countByAssignedToIdAndStatus(staff.getId(), ComplaintStatus.IN_PROGRESS))
                .resolvedComplaints(complaintRepository.countByAssignedToIdAndStatus(staff.getId(), ComplaintStatus.RESOLVED))
                .build();
    }

    // ========== Helper Methods ==========

    private void validateAccess(Complaint complaint, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String role = user.getRole().getName();

        if ("STUDENT".equals(role) && !complaint.getStudent().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Access denied to this complaint");
        }
        if ("STAFF".equals(role) && (complaint.getAssignedTo() == null
                || !complaint.getAssignedTo().getEmail().equals(userEmail))) {
            // Staff can still see it - allow read access for all staff
        }
    }

    private void createNotification(User user, Complaint complaint, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .complaint(complaint)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private String generateTicketNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        long count = complaintRepository.count() + 1;
        return String.format("TKT-%s-%04d", year, count);
    }

    private String getMonthName(int month) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        return months[month - 1];
    }

    private ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> buildPageResponse(Page<Complaint> page) {
        List<ResponseDTOs.ComplaintResponse> content = page.getContent().stream()
                .map(c -> mapToComplaintResponse(c, false))
                .collect(Collectors.toList());

        return ResponseDTOs.PageResponse.<ResponseDTOs.ComplaintResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private ResponseDTOs.ComplaintResponse mapToComplaintResponse(Complaint c, boolean includeUpdates) {
        ResponseDTOs.ComplaintResponse.ComplaintResponseBuilder builder = ResponseDTOs.ComplaintResponse.builder()
                .id(c.getId())
                .ticketNumber(c.getTicketNumber())
                .title(c.getTitle())
                .description(c.getDescription())
                .category(mapCategoryResponse(c.getCategory()))
                .student(mapUserResponse(c.getStudent()))
                .status(c.getStatus())
                .priority(c.getPriority())
                .location(c.getLocation())
                .attachmentUrls(c.getAttachmentUrls())
                .resolutionNotes(c.getResolutionNotes())
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt());

        if (c.getAssignedTo() != null) {
            builder.assignedTo(mapUserResponse(c.getAssignedTo()));
        }

        if (includeUpdates) {
            List<ComplaintUpdate> updates = updateRepository.findByComplaintIdOrderByCreatedAtDesc(c.getId());
            builder.updates(updates.stream().map(this::mapUpdateResponse).collect(Collectors.toList()));
        }

        return builder.build();
    }

    private ResponseDTOs.CategoryResponse mapCategoryResponse(Category cat) {
        return ResponseDTOs.CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .icon(cat.getIcon())
                .isActive(cat.getIsActive())
                .build();
    }

    private ResponseDTOs.UserResponse mapUserResponse(User u) {
        if (u == null) return null;
        return ResponseDTOs.UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole().getName())
                .department(u.getDepartment())
                .profilePicture(u.getProfilePicture())
                .build();
    }

    private ResponseDTOs.ComplaintUpdateResponse mapUpdateResponse(ComplaintUpdate update) {
        return ResponseDTOs.ComplaintUpdateResponse.builder()
                .id(update.getId())
                .updatedByName(update.getUpdatedBy().getName())
                .updatedByRole(update.getUpdatedBy().getRole().getName())
                .oldStatus(update.getOldStatus())
                .newStatus(update.getNewStatus())
                .remarks(update.getRemarks())
                .createdAt(update.getCreatedAt())
                .build();
    }
}
