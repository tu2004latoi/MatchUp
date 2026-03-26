package com.matchup.service;

import com.matchup.model.Room;
import com.matchup.model.RoomMember;
import com.matchup.model.enums.MemberStatus;
import com.matchup.model.enums.RoomType;
import com.matchup.model.enums.TimeOfDate;
import com.matchup.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomMemberService roomMemberService;

    public Page<Room> getAllRooms(Pageable pageable){
        return this.roomRepository.findAll(pageable);
    }

    public Page<Room> getPublicRooms(Pageable pageable) {
        return this.roomRepository.findByRoomTypeNot(RoomType.PRIVATE, pageable);
    }

    public Room getRoomById(int id){
        Optional<Room> room = this.roomRepository.findById(id);

        return room.orElse(null);
    }

    public Room getRoomByName(String name){
        Optional<Room> room = this.roomRepository.findByName(name);

        return room.orElse(null);
    }

    public boolean checkPassword(Integer roomId, String password) {
        Room room = this.getRoomById(roomId);
        if (room == null) {
            return false;
        }
        return room.getPassword() != null && room.getPassword().equals(password);
    }

    @Transactional
    public Room createRoom(Room room){
        if (room.getId() != null){
            throw new IllegalArgumentException("New Room must not have an ID");
        }

        return this.roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Room room){
        if (room.getId() == null || !roomRepository.existsById(room.getId())) {
            throw new EntityNotFoundException("Room not found with ID: " + room.getId());
        }

        return this.roomRepository.save(room);
    }

    @Transactional
    public Room closeRoom(int id){
        Room room = this.getRoomById(id);
        if (room == null) {
            throw new EntityNotFoundException("Room not found with ID: " + id);
        }
        room.setOpen(false);
        return this.roomRepository.save(room);
    }

    @Transactional
    public Room openRoom(int id){
        Room room = this.getRoomById(id);
        if (room == null) {
            throw new EntityNotFoundException("Room not found with ID: " + id);
        }
        room.setOpen(true);
        return this.roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Room room){
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        this.roomRepository.delete(room);
    }

    @Transactional
    public void readyRoom(int roomId, int userId){
        Room room = this.getRoomById(roomId);
        if (room == null) {
            throw new EntityNotFoundException("Room not found with ID: " + roomId);
        }
        RoomMember roomMember = this.roomMemberService.getRoomMemberByUserIdAndRoomId(userId, roomId);
        if (roomMember == null) {
            throw new EntityNotFoundException("Room member not found with user ID: " + userId + " and room ID: " + roomId);
        }
        roomMember.setStatusMember(MemberStatus.READY);
        this.roomRepository.save(room);
    }

    @Transactional
    public void unreadyRoom(int roomId, int userId){
        Room room = this.getRoomById(roomId);
        if (room == null) {
            throw new EntityNotFoundException("Room not found with ID: " + roomId);
        }
        RoomMember roomMember = this.roomMemberService.getRoomMemberByUserIdAndRoomId(userId, roomId);
        if (roomMember == null) {
            throw new EntityNotFoundException("Room member not found with user ID: " + userId + " and room ID: " + roomId);
        }
        roomMember.setStatusMember(MemberStatus.THINKING);
        this.roomRepository.save(room);
    }

    public TimeOfDate resolveTimeOfDay(LocalDateTime startTime) {
        LocalTime time = startTime.toLocalTime();

        if (time.isAfter(LocalTime.of(4, 59)) && time.isBefore(LocalTime.NOON)) {
            return TimeOfDate.MORNING;
        }
        else if (!time.isBefore(LocalTime.NOON) && time.isBefore(LocalTime.of(14, 0))) {
            return TimeOfDate.NOON;
        }
        else if (!time.isBefore(LocalTime.of(14, 0)) && time.isBefore(LocalTime.of(18, 0))) {
            return TimeOfDate.AFTERNOON;
        }
        else {
            return TimeOfDate.EVENING;
        }
    }

    public List<Room> getPrivateRoomsByUserId(Integer userId) {
        return roomRepository.findPrivateRoomsByUserId(RoomType.PRIVATE, userId);
    }

    public List<Room> searchEventRooms(String name, Integer maxMembers, TimeOfDate timeOfDay, Integer categoryId) {
        return roomRepository.searchEventRooms(RoomType.EVENT, name, maxMembers, timeOfDay, categoryId);
    }
}
