package com.matchup.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;

import com.matchup.dto.SendMessage;
import com.matchup.model.Message;
import com.matchup.service.MessageService;

@RestController
@RequestMapping("/api")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @GetMapping("/v1/messages")
    public List<Message> getMessagesByRoomId(@RequestParam Integer roomId) {
        return messageService.getMessagesByRoomId(roomId);
    }

    @PostMapping("/v1/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody SendMessage sendMessage) {
        return ResponseEntity.ok(messageService.sendMessage(sendMessage));
    }
    
    // WebSocket endpoint for receiving messages
    @MessageMapping("/chat/send")
    @SendTo("/topic/room/{roomId}")
    public Message sendChatMessage(SendMessage sendMessage) {
        return messageService.sendMessage(sendMessage);
    }
}
