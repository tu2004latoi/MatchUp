package com.matchup.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.matchup.dto.FriendRequestDTO;
import com.matchup.model.FriendRequest;
import com.matchup.model.User;
import com.matchup.service.FriendRequestService;
import com.matchup.service.UserService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
public class FriendRequestController {
    @Autowired
    private FriendRequestService friendRequestService;

    @Autowired
    private UserService userService;

    @GetMapping("/v1/friend-requests")
    public ResponseEntity<?> getFriendRequestsByReceiverId(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FriendRequest> friendRequests = friendRequestService.getFriendRequestsByReceiverId(userId, pageable);
        return ResponseEntity.ok(friendRequests);
    }

    @GetMapping("/v1/friend-requests/check")
    public ResponseEntity<?> checkIfFriendRequestExists(@RequestParam Integer senderId, @RequestParam Integer receiverId) {
        boolean exists = friendRequestService.checkIfFriendRequestExists(senderId, receiverId);
        return ResponseEntity.ok(exists);
    }
    
    @PostMapping("/v1/friend-requests")
    public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequestDTO friendRequestDTO) {
        FriendRequest friendRequest = new FriendRequest();
        User sender = userService.getUserById(friendRequestDTO.getSenderId());
        User receiver = userService.getUserById(friendRequestDTO.getReceiverId());
        friendRequest.setSender(sender);
        friendRequest.setReceiver(receiver);
        friendRequestService.createFriendRequest(friendRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/v1/friend-requests/{id}/accept")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Integer id) {
        FriendRequest friendRequest = friendRequestService.getFriendRequestById(id);
        friendRequestService.acceptFriendRequest(friendRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/v1/friend-requests/{id}/decline")
    public ResponseEntity<?> declineFriendRequest(@PathVariable Integer id) {
        FriendRequest friendRequest = friendRequestService.getFriendRequestById(id);
        friendRequestService.declineFriendRequest(friendRequest);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/v1/friend-requests/{id}")
    public ResponseEntity<?> deleteFriendRequest(@PathVariable Integer id) {
        friendRequestService.deleteFriendRequest(id);
        return ResponseEntity.ok().build();
    }
}
