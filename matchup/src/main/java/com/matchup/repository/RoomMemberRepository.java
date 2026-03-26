package com.matchup.repository;

import com.matchup.model.RoomMember;
import com.matchup.model.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Integer> {
    Optional<RoomMember> findById(int id);
    Optional<RoomMember> findByUserIdAndRoomId(int userId, int roomId);
    Optional<List<RoomMember>> findByRoomId(int roomId);
    Optional<List<RoomMember>> findByUserId(int userId);
    
    @Query("SELECT rm FROM RoomMember rm WHERE rm.user.id = :userId AND rm.room.roomType = :roomType")
    List<RoomMember> findByUserIdAndRoomType(@Param("userId") Integer userId, @Param("roomType") RoomType roomType);
}
