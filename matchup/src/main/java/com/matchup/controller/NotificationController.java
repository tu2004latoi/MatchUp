package com.matchup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.matchup.dto.CreateNotification;
import com.matchup.model.Notification;
import com.matchup.service.NotificationService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

@RestController
@RequestMapping("/api")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/v1/notifications/me")
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam Integer userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PostMapping("/v1/notifications")
    public ResponseEntity<?> createNotification(@RequestBody CreateNotification createNotification) {
        notificationService.createNotification(createNotification);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/v1/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/v1/notifications/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Integer id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
    
    // WebSocket endpoint for receiving messages
    @MessageMapping("/notifications/send")
    @SendTo("/topic/notifications")
    public String sendNotification(String message) {
        return message;
    }
}
