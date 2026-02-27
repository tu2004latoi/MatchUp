package com.matchup.repository;

import com.matchup.model.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Integer> {
    Optional<RoomMember> findById(int id);
}
