package com.matchup.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.matchup.model.FriendShip;

import java.util.List;

public interface FriendShipRepository extends JpaRepository<FriendShip, Integer> {
    List<FriendShip> findByUserId(Integer userId);
    Page<FriendShip> findByUserId(Integer userId, Pageable pageable);

    boolean existsByUserIdAndFriendId(Integer userId, Integer friendId);
    boolean existsByUserIdAndFriendIdOrUserIdAndFriendId(Integer userId1, Integer friendId1, Integer userId2, Integer friendId2);
    void deleteByUserIdAndFriendId(Integer userId, Integer friendId);
}
