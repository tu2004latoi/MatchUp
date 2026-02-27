package com.matchup.service;

import com.matchup.model.Location;
import com.matchup.model.RoomMember;
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
}
