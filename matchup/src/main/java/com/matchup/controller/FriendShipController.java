package com.matchup.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.matchup.dto.CreateFriendShip;
import com.matchup.model.FriendShip;
import com.matchup.model.User;
import com.matchup.model.enums.FriendStatus;
import com.matchup.service.FriendShipService;
import com.matchup.service.UserService;

@RestController
@RequestMapping("/api")
public class FriendShipController {
    @Autowired
    private FriendShipService friendShipService;

    @Autowired
    private UserService userService;

    @GetMapping("/v1/friends")
    public ResponseEntity<?> getFriendsByUserId(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FriendShip> friendShips = friendShipService.getFriendshipsByUserId(userId, pageable);
        return ResponseEntity.ok(friendShips);
    }

    @GetMapping("/v1/friends/check")
    public ResponseEntity<?> checkIfFriend(@RequestParam Integer userId, @RequestParam Integer friendId) {
        boolean isFriend = friendShipService.CheckIfFriend(userId, friendId);
        return ResponseEntity.ok(isFriend);
    }

    @PostMapping("/v1/friends/create")
    public ResponseEntity<?> createFriendship(@RequestBody CreateFriendShip createFriendShip) {
        friendShipService.createFriendship(createFriendShip);
        return ResponseEntity.ok("Friendship created");
    }
}
