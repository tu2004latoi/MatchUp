package com.matchup.repository;

import com.matchup.model.Room;
import com.matchup.model.enums.RoomType;
import com.matchup.model.enums.TimeOfDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findById(int id);
    Optional<Room> findByName(String name);
    
    @Query("SELECT r FROM Room r WHERE r.roomType != :roomType")
    Page<Room> findByRoomTypeNot(@Param("roomType") RoomType roomType, Pageable pageable);
    
    @Query("SELECT r FROM Room r WHERE r.roomType = :roomType AND r.id IN " +
           "(SELECT rm.room.id FROM RoomMember rm WHERE rm.user.id = :userId)")
    List<Room> findPrivateRoomsByUserId(@Param("roomType") RoomType roomType, @Param("userId") Integer userId);
    
    @Query("SELECT r FROM Room r WHERE r.roomType = :roomType " +
           "AND (:name IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:maxMembers IS NULL OR r.maxMembers >= :maxMembers) " +
           "AND (:timeOfDay IS NULL OR r.timeOfDay = :timeOfDay) " +
           "AND (:categoryId IS NULL OR r.category.id = :categoryId)")
    List<Room> searchEventRooms(
            @Param("roomType") RoomType roomType,
            @Param("name") String name,
            @Param("maxMembers") Integer maxMembers,
            @Param("timeOfDay") TimeOfDate timeOfDay,
            @Param("categoryId") Integer categoryId
    );
}
