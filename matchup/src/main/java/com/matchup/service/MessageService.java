package com.matchup.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.matchup.dto.SendMessage;
import com.matchup.model.Message;
import com.matchup.model.Room;
import com.matchup.model.User;
import com.matchup.repository.MessageRepository;

import jakarta.transaction.Transactional;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoomService roomService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Message> getMessagesByRoomId(Integer roomId) {
        return messageRepository.findByRoomId(roomId);
    }

    @Transactional
    public Message sendMessage(SendMessage sendMessage) {
        User sender = userService.getUserById(sendMessage.getSenderId());
        Room room = roomService.getRoomById(sendMessage.getRoomId());
        
        Message message = new Message();
        message.setRoom(room);
        message.setContent(sendMessage.getContent());
        message.setSender(sender);
        Message savedMessage = messageRepository.save(message);
        
        // Send real-time message via WebSocket
        messagingTemplate.convertAndSend("/topic/room/" + room.getId(), savedMessage);
        
        return savedMessage;
    }
    
    @Transactional
    public void deleteMessage(Integer messageId) {
        messageRepository.deleteById(messageId);
    }
}
