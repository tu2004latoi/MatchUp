package com.matchup.service;

import com.matchup.model.Location;
import com.matchup.model.RoomMember;
import com.matchup.model.enums.RoomType;
import com.matchup.repository.RoomMemberRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomMemberService {
    @Autowired
    private RoomMemberRepository roomMemberRepository;

    public List<RoomMember> getAllRoomMember(){
        return this.roomMemberRepository.findAll();
    }

    public RoomMember getRoomMemberById(int id){
        Optional<RoomMember> roomMember = this.roomMemberRepository.findById(id);

        return roomMember.orElse(null);
    }
    
    public RoomMember getRoomMemberByUserIdAndRoomId(int userId, int roomId){
        Optional<RoomMember> roomMember = this.roomMemberRepository.findByUserIdAndRoomId(userId, roomId);

        return roomMember.orElse(null);
    }

    public List<RoomMember> getRoomMemberByRoomId(int roomId){
        Optional<List<RoomMember>> roomMember = this.roomMemberRepository.findByRoomId(roomId);

        return roomMember.orElse(null);
    }

    public List<RoomMember> getRoomMemberByUserId(int userId){
        Optional<List<RoomMember>> roomMember = this.roomMemberRepository.findByUserId(userId);

        return roomMember.orElse(null);
    }

    @Transactional
    public RoomMember addRoomMember(RoomMember roomMember){
        if (roomMember.getId() != null) {
            throw new IllegalArgumentException("New RoomMember must not have an ID");
        }

        return this.roomMemberRepository.save(roomMember);
    }

    @Transactional
    public RoomMember updateRoomMember(RoomMember roomMember){
        if (roomMember.getId() == null || !roomMemberRepository.existsById(roomMember.getId())) {
            throw new EntityNotFoundException("RoomMember not found with ID: " + roomMember.getId());
        }

        return this.roomMemberRepository.save(roomMember);
    }

    @Transactional
    public void deleteRoomMember(RoomMember roomMember){
        if (roomMember == null){
            throw new IllegalArgumentException("RoomMember not found");
        }

        this.roomMemberRepository.delete(roomMember);
    }

    public List<RoomMember> getRoomMemberByUserIdAndEventRoom(Integer userId) {
        return roomMemberRepository.findByUserIdAndRoomType(userId, RoomType.EVENT);
    }
}
