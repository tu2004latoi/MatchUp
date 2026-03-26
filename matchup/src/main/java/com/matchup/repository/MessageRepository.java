package com.matchup.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.matchup.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    
    List<Message> findByRoomId(Integer roomId);
}
