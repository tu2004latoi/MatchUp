package com.matchup.service;

import com.matchup.model.UserProfile;
import com.matchup.repository.UserProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {
    @Autowired
    private UserProfileRepository userProfileRepository;

    @Transactional
    public UserProfile addUserProfile (UserProfile userProfile){
        if (userProfile.getId()!=null){
            throw new IllegalArgumentException("New UserProfile must not have an ID");
        }

        return this.userProfileRepository.save(userProfile);
    }

    @Transactional
    public void deleteUserProfile (UserProfile userProfile){
        if (userProfile==null){
            throw new IllegalArgumentException("UserProfile not found");
        }

        this.userProfileRepository.delete(userProfile);
    }
}
