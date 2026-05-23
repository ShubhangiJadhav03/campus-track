package com.college.complaints.serviceImpl;

import com.college.complaints.dto.response.ResponseDTOs;
import com.college.complaints.entity.Notification;
import com.college.complaints.entity.User;
import com.college.complaints.exception.ResourceNotFoundException;
import com.college.complaints.exception.UnauthorizedException;
import com.college.complaints.repository.NotificationRepository;
import com.college.complaints.repository.UserRepository;
import com.college.complaints.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<ResponseDTOs.NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public Long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access denied");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private ResponseDTOs.NotificationResponse mapToResponse(Notification n) {
        return ResponseDTOs.NotificationResponse.builder()
                .id(n.getId())
                .complaintId(n.getComplaint() != null ? n.getComplaint().getId() : null)
                .ticketNumber(n.getComplaint() != null ? n.getComplaint().getTicketNumber() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
