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

    @GetMapping("/v1/room-members/{id}")
    public ResponseEntity<RoomMember> getRoomMemberById(@PathVariable int id){
        return ResponseEntity.ok(this.roomMemberService.getRoomMemberById(id));
    }

    @GetMapping(value = "/v1/room-members", params = {"userId", "roomId"})
    public ResponseEntity<RoomMember> getRoomMember(
            @RequestParam int userId,
            @RequestParam int roomId) {
        return ResponseEntity.ok(
                roomMemberService.getRoomMemberByUserIdAndRoomId(userId, roomId)
        );
    }

    @GetMapping(value = "/v1/room-members", params = {"roomId"})
    public ResponseEntity<List<RoomMember>> getRoomMemberByRoomId(@RequestParam int roomId){
        return ResponseEntity.ok(this.roomMemberService.getRoomMemberByRoomId(roomId));
    }

    @GetMapping(value = "/v1/room-members", params = {"userId"})
    public ResponseEntity<List<RoomMember>> getRoomMemberByUserId(@RequestParam int userId){
        return ResponseEntity.ok(this.roomMemberService.getRoomMemberByUserId(userId));
    }

    @GetMapping(value = "/v1/room-members/event", params = {"userId"})
    public ResponseEntity<List<RoomMember>> getRoomMemberByUserIdAndEventRoom(@RequestParam int userId){
        return ResponseEntity.ok(this.roomMemberService.getRoomMemberByUserIdAndEventRoom(userId));
    }

    @PostMapping("/v1/room-members")
    public ResponseEntity<RoomMember> addRoomMember(@RequestBody CreateRoomMemberRequest createRoomMemberRequest){
        RoomMember roomMember = new RoomMember();
        User user = this.userService.getUserById(createRoomMemberRequest.getUserId());
        Room room = this.roomService.getRoomById(createRoomMemberRequest.getRoomId());
        room.setCurrentMembers(room.getCurrentMembers() + 1);
        roomMember.setUser(user);
        roomMember.setRoom(room);
        roomMember.setStatusMember(createRoomMemberRequest.getStatusMember());
        roomMember.setRole(createRoomMemberRequest.getRole());

        return ResponseEntity.ok(this.roomMemberService.addRoomMember(roomMember));
    }

    @DeleteMapping(value = "/v1/room-members/out", params = {"userId", "roomId"})
    public ResponseEntity<?> deleteRoomMember(@RequestParam int userId, @RequestParam int roomId){
        RoomMember roomMember = this.roomMemberService.getRoomMemberByUserIdAndRoomId(userId, roomId);
        roomMember.getRoom().setCurrentMembers(roomMember.getRoom().getCurrentMembers() - 1);
        this.roomMemberService.deleteRoomMember(roomMember);
        return ResponseEntity.ok().build();
    }
}
