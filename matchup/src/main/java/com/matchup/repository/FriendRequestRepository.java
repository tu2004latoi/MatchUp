package com.matchup.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.matchup.model.FriendRequest;
import com.matchup.model.enums.RequestStatus;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Integer> {
    List<FriendRequest> findBySenderIdAndStatus(Integer senderId, RequestStatus status);
    List<FriendRequest> findByReceiverIdAndStatus(Integer receiverId, RequestStatus status);
    Page<FriendRequest> findByReceiverIdAndStatus(Integer receiverId, RequestStatus status, Pageable pageable);
    FriendRequest findBySenderIdAndReceiverId( Integer senderId, Integer receiverId);
    boolean existsBySenderIdAndReceiverIdAndStatus(Integer senderId, Integer receiverId, RequestStatus status);
}
