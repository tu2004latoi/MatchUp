package com.matchup.controller;

import com.matchup.dto.CreateRoomRequest;
import com.matchup.model.Location;
import com.matchup.model.Room;
import com.matchup.model.enums.TimeOfDate;
import com.matchup.service.LocationService;
import com.matchup.service.RoomMemberService;
import com.matchup.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @Autowired
    private LocationService locationService;

    @Autowired
    private RoomMemberService roomMemberService;

    @GetMapping("/v1/rooms")
    public ResponseEntity<List<Room>> getAllRooms(){
        return ResponseEntity.ok(this.roomService.getAllRooms());
    }

    @GetMapping("/v1/rooms/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable int id){
        return ResponseEntity.ok(this.roomService.getRoomById(id));
    }

    @PostMapping("/v1/rooms")
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest createRoomRequest){

        Room room = new Room();
        Location location = this.locationService.getLocationById(createRoomRequest.getLocationId());

        room.setLocation(location);
        room.setName(createRoomRequest.getName());
        room.setDescription(createRoomRequest.getDescription());
        room.setSkillLevel(createRoomRequest.getSkillLevel());
        room.setVisibility(createRoomRequest.getVisibility());
        room.setMaxMembers(createRoomRequest.getMaxMembers());
        room.setStartTime(createRoomRequest.getStartTime());
        room.setEndTime(createRoomRequest.getEndTime());
        room.setOpen(createRoomRequest.getOpen());

        TimeOfDate timeOfDay = roomService.resolveTimeOfDay(createRoomRequest.getStartTime());
        room.setTimeOfDay(timeOfDay);

        return ResponseEntity.ok(this.roomService.createRoom(room));
    }
}
