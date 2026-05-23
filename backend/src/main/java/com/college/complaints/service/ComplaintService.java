package com.college.complaints.service;

import com.college.complaints.dto.request.ComplaintRequest;
import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.enums.ComplaintStatus;
import com.college.complaints.enums.Priority;
import org.springframework.data.domain.Pageable;

public interface ComplaintService {
    ResponseDTOs.ComplaintResponse createComplaint(ComplaintRequest.Create request, String studentEmail);
    ResponseDTOs.ComplaintResponse getComplaintById(Long id, String userEmail);
    ResponseDTOs.ComplaintResponse getComplaintByTicket(String ticketNumber, String userEmail);
    ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> getAllComplaints(
            ComplaintStatus status, Priority priority, Long categoryId, String keyword, Pageable pageable);
    ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> getStudentComplaints(
            String studentEmail, ComplaintStatus status, Pageable pageable);
    ResponseDTOs.PageResponse<ResponseDTOs.ComplaintResponse> getStaffComplaints(
            String staffEmail, ComplaintStatus status, Pageable pageable);
    ResponseDTOs.ComplaintResponse updateComplaintStatus(Long id, ComplaintRequest.UpdateStatus request, String updaterEmail);
    ResponseDTOs.ComplaintResponse assignComplaint(Long id, ComplaintRequest.AssignComplaint request, String adminEmail);
    ResponseDTOs.DashboardStats getAdminDashboardStats();
    ResponseDTOs.DashboardStats getStudentDashboardStats(String studentEmail);
    ResponseDTOs.DashboardStats getStaffDashboardStats(String staffEmail);
}
