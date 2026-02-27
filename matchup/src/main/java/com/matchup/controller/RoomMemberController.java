package com.matchup.controller;

import com.matchup.dto.CreateRoomMemberRequest;
import com.matchup.model.Room;
import com.matchup.model.RoomMember;
import com.matchup.model.User;
import com.matchup.service.RoomMemberService;
import com.matchup.service.RoomService;
import com.matchup.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RoomMemberController {
    @Autowired
    private RoomMemberService roomMemberService;

    @Autowired
    private UserService userService;

    @Autowired
    private RoomService roomService;

    @GetMapping("/v1/room-members")
    public ResponseEntity<List<RoomMember>> getAllRoomMembers(){
        return ResponseEntity.ok(this.roomMemberService.getAllRoomMember());
    }

    @PostMapping("/v1/room-members")
    public ResponseEntity<RoomMember> addRoomMember(@RequestBody CreateRoomMemberRequest createRoomMemberRequest){
        RoomMember roomMember = new RoomMember();
        User user = this.userService.getUserById(createRoomMemberRequest.getUserId());
        Room room = this.roomService.getRoomById(createRoomMemberRequest.getRoomId());
        roomMember.setUser(user);
        roomMember.setRoom(room);
        roomMember.setStatusMember(createRoomMemberRequest.getStatusMember());
        roomMember.setRole(createRoomMemberRequest.getRole());

        return ResponseEntity.ok(this.roomMemberService.addRoomMember(roomMember));
    }
}
