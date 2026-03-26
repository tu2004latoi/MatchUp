package com.matchup.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.matchup.dto.CreateFriendShip;
import com.matchup.model.FriendShip;
import com.matchup.model.User;
import com.matchup.model.enums.FriendStatus;
import com.matchup.repository.FriendShipRepository;

@Service
public class FriendShipService {
    @Autowired
    private FriendShipRepository friendShipRepository;
    
    @Autowired
    private UserService userService;

    public List<FriendShip> getFriendshipsByUserId(Integer userId) {
        return friendShipRepository.findByUserId(userId);
    }

    public Page<FriendShip> getFriendshipsByUserId(Integer userId, Pageable pageable) {
        return friendShipRepository.findByUserId(userId, pageable);
    }

    public boolean CheckIfFriend(Integer userId, Integer friendId) {
        return friendShipRepository.existsByUserIdAndFriendIdOrUserIdAndFriendId(userId, friendId, friendId, userId);
    }

    @Transactional
    public void createFriendship(CreateFriendShip createFriendShip) {
        User user = userService.getUserById(createFriendShip.getUserId());
        User friend = userService.getUserById(createFriendShip.getFriendId());
        FriendShip f1 = new FriendShip();
        f1.setUser(user);
        f1.setFriend(friend);
        f1.setStatus(FriendStatus.NORMAL);

        FriendShip f2 = new FriendShip();
        f2.setUser(friend);
        f2.setFriend(user);
        f2.setStatus(FriendStatus.NORMAL);
        friendShipRepository.saveAll(List.of(f1, f2));
    }

    @Transactional
    public void deleteFriendship(FriendShip friendShip) {
        friendShipRepository.delete(friendShip);
    }

    @Transactional
    public void blockFriend(FriendShip friendShip) {
        friendShip.setStatus(FriendStatus.BLOCKED);
        friendShipRepository.save(friendShip);
    }

    @Transactional
    public void unblockFriend(FriendShip friendShip) {
        friendShip.setStatus(FriendStatus.NORMAL);
        friendShipRepository.save(friendShip);
    }
}
