package com.college.complaints.service;

import com.college.complaints.dto.response.ResponseDTOs;
import java.util.List;

public interface NotificationService {
    List<ResponseDTOs.NotificationResponse> getUserNotifications(String userEmail);
    Long getUnreadCount(String userEmail);
    void markAllAsRead(String userEmail);
    void markAsRead(Long notificationId, String userEmail);
}
