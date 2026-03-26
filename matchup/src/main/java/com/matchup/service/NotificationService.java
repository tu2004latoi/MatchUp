package com.matchup.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.matchup.dto.CreateNotification;
import com.matchup.model.Notification;
import com.matchup.model.User;
import com.matchup.repository.NotificationRepository;

import jakarta.transaction.Transactional;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Notification> getNotificationsByUserId(Integer userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Transactional
    public Notification createNotification(CreateNotification createNotification) {
        User user = userService.getUserById(createNotification.getUserId());
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(createNotification.getTitle());
        notification.setContent(createNotification.getContent());
        notification.setIsRead(false);
        Notification savedNotification = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + savedNotification.getUser().getId(), savedNotification);
        
        return savedNotification;
    }

    @Transactional
    public void markNotificationAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    @Transactional
    public void deleteNotification(Integer notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}
