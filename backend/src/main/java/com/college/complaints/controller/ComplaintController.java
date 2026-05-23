package com.college.complaints.controller;

import com.college.complaints.dto.request.ComplaintRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.enums.ComplaintStatus;
import com.college.complaints.enums.Priority;
import com.college.complaints.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Complaint management APIs")
public class ComplaintController {

    private final ComplaintService complaintService;

    // ========== STUDENT ENDPOINTS ==========

    @PostMapping("/student/complaints")
    @Operation(summary = "Create a new complaint")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintRequest.Create request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ResponseDTOs.ComplaintResponse response = complaintService.createComplaint(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDTOs.ApiResponse.success("Complaint submitted successfully", response));
    }

    @GetMapping("/student/complaints")
    @Operation(summary = "Get student's complaints")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse>>> getStudentComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = complaintService.getStudentComplaints(userDetails.getUsername(), status, pageable);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Complaints retrieved", result));
    }

    @GetMapping("/student/dashboard")
    @Operation(summary = "Get student dashboard stats")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.DashboardStats>> getStudentDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Dashboard stats",
                complaintService.getStudentDashboardStats(userDetails.getUsername())));
    }

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping("/admin/complaints")
    @Operation(summary = "Get all complaints (admin)")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse>>> getAllComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = complaintService.getAllComplaints(status, priority, categoryId, keyword, pageable);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Complaints retrieved", result));
    }

    @PatchMapping("/admin/complaints/{id}/status")
    @Operation(summary = "Update complaint status")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest.UpdateStatus request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var result = complaintService.updateComplaintStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Status updated successfully", result));
    }

    @PostMapping("/admin/complaints/{id}/assign")
    @Operation(summary = "Assign complaint to staff")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest.AssignComplaint request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var result = complaintService.assignComplaint(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Complaint assigned successfully", result));
    }

    @GetMapping("/admin/dashboard")
    @Operation(summary = "Get admin dashboard stats")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.DashboardStats>> getAdminDashboard() {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Dashboard stats",
                complaintService.getAdminDashboardStats()));
    }

    // ========== STAFF ENDPOINTS ==========

    @GetMapping("/staff/complaints")
    @Operation(summary = "Get assigned complaints (staff)")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse>>> getStaffComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = complaintService.getStaffComplaints(userDetails.getUsername(), status, pageable);
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Complaints retrieved", result));
    }

    @PatchMapping("/staff/complaints/{id}/status")
    @Operation(summary = "Update complaint status (staff)")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.ComplaintResponse>> updateStatusByStaff(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest.UpdateStatus request,
            @AuthenticationPrincipal UserDetails userDetails) {
        var result = complaintService.updateComplaintStatus(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Status updated successfully", result));
    }

    @GetMapping("/staff/dashboard")
    @Operation(summary = "Get staff dashboard stats")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.DashboardStats>> getStaffDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Dashboard stats",
                complaintService.getStaffDashboardStats(userDetails.getUsername())));
    }

    // ========== SHARED ENDPOINTS ==========

    @GetMapping("/complaints/{id}")
    @Operation(summary = "Get complaint by ID")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.ComplaintResponse>> getComplaintById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        var result = complaintService.getComplaintById(id, userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Complaint retrieved", result));
    }

    @GetMapping("/complaints/ticket/{ticketNumber}")
    @Operation(summary = "Get complaint by ticket number")
    public ResponseEntity<ResponseDTOs.ApiResponse<ResponseDTOs.ComplaintResponse>> getByTicket(
            @PathVariable String ticketNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        var result = complaintService.getComplaintByTicket(ticketNumber, userDetails.getUsername());
        return ResponseEntity.ok(ResponseDTOs.ApiResponse.success("Complaint retrieved", result));
    }
}
