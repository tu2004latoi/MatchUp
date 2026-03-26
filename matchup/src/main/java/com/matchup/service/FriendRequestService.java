package com.matchup.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.matchup.model.FriendRequest;
import com.matchup.model.enums.RequestStatus;
import com.matchup.repository.FriendRequestRepository;

@Service
public class FriendRequestService {
    @Autowired
    private FriendRequestRepository friendRequestRepository;

    public List<FriendRequest> getFriendRequestsByUserId(Integer userId) {
        List<FriendRequest> sentRequests = friendRequestRepository.findBySenderIdAndStatus(userId, RequestStatus.PENDING);
        List<FriendRequest> receivedRequests = friendRequestRepository.findByReceiverIdAndStatus(userId, RequestStatus.PENDING);
        sentRequests.addAll(receivedRequests);
        return sentRequests;
    }

    public List<FriendRequest> getFriendRequestsByReceiverId(Integer receiverId) {
        return friendRequestRepository.findByReceiverIdAndStatus(receiverId, RequestStatus.PENDING);
    }

    public Page<FriendRequest> getFriendRequestsByReceiverId(Integer receiverId, Pageable pageable) {
        return friendRequestRepository.findByReceiverIdAndStatus(receiverId, RequestStatus.PENDING, pageable);
    }

    public FriendRequest getFriendRequestById(Integer id) {
        return friendRequestRepository.findById(id).orElse(null);
    }

    public FriendRequest getFriendRequestBySenderIdAndReceiverId(Integer senderId, Integer receiverId){
        return friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }

    public boolean checkIfFriendRequestExists(Integer senderId, Integer receiverId) {
        return friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(senderId, receiverId, RequestStatus.PENDING);
    }

    @Transactional
    public void createFriendRequest(FriendRequest friendRequest) {
        friendRequestRepository.save(friendRequest);
    }

    @Transactional
    public void acceptFriendRequest(FriendRequest friendRequest) {
        friendRequest.setStatus(RequestStatus.ACCEPTED);
        friendRequestRepository.save(friendRequest);
    }

    @Transactional
    public void declineFriendRequest(FriendRequest friendRequest) {
        friendRequest.setStatus(RequestStatus.REJECTED);
        friendRequestRepository.save(friendRequest);
    }

    @Transactional
    public void deleteFriendRequest(Integer id) {
        friendRequestRepository.deleteById(id);
    }
}
