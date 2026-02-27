package com.matchup.service;

import com.matchup.model.Room;
import com.matchup.model.enums.TimeOfDate;
import com.matchup.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms(){
        return this.roomRepository.findAll();
    }

    public Room getRoomById(int id){
        Optional<Room> room = this.roomRepository.findById(id);

        return room.orElse(null);
    }

    public Room getRoomByName(String name){
        Optional<Room> room = this.roomRepository.findByName(name);

        return room.orElse(null);
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
    public void deleteRoom(Room room){
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }

        this.roomRepository.delete(room);
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
}
