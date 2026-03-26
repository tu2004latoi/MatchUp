package com.matchup.controller;

import com.matchup.dto.CheckPasswordRoomRequest;
import com.matchup.dto.CreateRoomRequest;
import com.matchup.model.Location;
import com.matchup.model.Room;
import com.matchup.model.User;
import com.matchup.model.enums.RoomType;
import com.matchup.model.enums.TimeOfDate;
import com.matchup.service.CategoryService;
import com.matchup.service.LocationService;
import com.matchup.service.RoomService;
import com.matchup.service.UserService;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    @GetMapping("/v1/rooms")
    public ResponseEntity<Page<Room>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(this.roomService.getPublicRooms(pageable));
    }

    @GetMapping("/v1/rooms/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable int id){
        return ResponseEntity.ok(this.roomService.getRoomById(id));
    }

    @PostMapping("/v1/rooms/{id}/check-password")
    public ResponseEntity<Boolean> checkPassword(@RequestBody CheckPasswordRoomRequest request){
        return ResponseEntity.ok(this.roomService.checkPassword(request.getRoomId(), request.getPassword()));
    }

    @PostMapping("/v1/rooms/create-event-room")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest createRoomRequest){

        Room room = new Room();
        Location location = this.locationService.getLocationById(createRoomRequest.getLocationId());

        room.setLocation(location);
        room.setName(createRoomRequest.getName());
        room.setDescription(createRoomRequest.getDescription());
        room.setCategory(this.categoryService.getCategoryById(createRoomRequest.getCategoryId()));
        room.setSkillLevel(createRoomRequest.getSkillLevel());
        room.setVisibility(createRoomRequest.getVisibility());
        room.setHasPassword(createRoomRequest.getHasPassword());
        room.setPassword(createRoomRequest.getPassword());
        room.setMaxMembers(createRoomRequest.getMaxMembers());
        room.setStartTime(createRoomRequest.getStartTime());
        room.setEndTime(createRoomRequest.getEndTime());
        room.setOpen(createRoomRequest.getOpen());
        room.setRoomType(createRoomRequest.getRoomType());

        TimeOfDate timeOfDay = roomService.resolveTimeOfDay(createRoomRequest.getStartTime());
        room.setTimeOfDay(timeOfDay);

        return ResponseEntity.ok(this.roomService.createRoom(room));
    }

    @PostMapping("/v1/rooms/create-private-room")
    public ResponseEntity<?> createPrivateRoom(@RequestBody CreateRoomRequest createRoomRequest, Principal principal){
        User user = userService.getUserByUsername(principal.getName());
        String privateKey = Math.min(user.getId(), createRoomRequest.getTargetUserId()) + "_" + Math.max(user.getId(), createRoomRequest.getTargetUserId());        

        Room room = new Room();
        room.setName(createRoomRequest.getName());
        room.setRoomType(RoomType.PRIVATE);
        room.setPrivateKey(privateKey);
        Room createdRoom = this.roomService.createRoom(room);
        return ResponseEntity.ok(createdRoom);
    }

    @PatchMapping("/v1/rooms/{id}/close")
    public ResponseEntity<?> closeRoom(@PathVariable int id){
        return ResponseEntity.ok(this.roomService.closeRoom(id));
    }

    @PatchMapping("/v1/rooms/{id}/open")
    public ResponseEntity<?> openRoom(@PathVariable int id){
        return ResponseEntity.ok(this.roomService.openRoom(id));
    }

    @PatchMapping("/v1/rooms/{id}/ready")
    public ResponseEntity<?> readyRoom(@PathVariable int id, Principal principal){
        User user = userService.getUserByUsername(principal.getName());
        this.roomService.readyRoom(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/v1/rooms/{id}/unready")
    public ResponseEntity<?> unreadyRoom(@PathVariable int id, Principal principal){
        User user = userService.getUserByUsername(principal.getName());
        this.roomService.unreadyRoom(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/v1/rooms/private")
    public ResponseEntity<?> getPrivateRooms(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        List<Room> privateRooms = roomService.getPrivateRoomsByUserId(user.getId());
        return ResponseEntity.ok(privateRooms);
    }

    @GetMapping("/v1/rooms/search")
    public ResponseEntity<List<Room>> searchEventRooms(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer maxMembers,
            @RequestParam(required = false) TimeOfDate timeOfDay,
            @RequestParam(required = false) Integer categoryId) {
        return ResponseEntity.ok(roomService.searchEventRooms(name, maxMembers, timeOfDay, categoryId));
    }
}
