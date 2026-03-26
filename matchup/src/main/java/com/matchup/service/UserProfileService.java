package com.matchup.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.matchup.model.UserProfile;
import com.matchup.repository.UserProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserProfileService {
    @Autowired
    private UserProfileRepository userProfileRepository;
    
    @Autowired
    private Cloudinary cloudinary;

    public List<UserProfile> getAllUserProfiles(){
        return this.userProfileRepository.findAll();
    }

    public UserProfile getUserProfileByUserId(int userId){
        return this.userProfileRepository.findByUserId(userId);
    }

    @Transactional
    public UserProfile addUserProfile (UserProfile userProfile){
        if (userProfile.getId()!=null){
            throw new IllegalArgumentException("New UserProfile must not have an ID");
        }

        return this.userProfileRepository.save(userProfile);
    }

    @Transactional
    public UserProfile updateUserProfile (UserProfile userProfile){
        if (userProfile.getFile() != null && !userProfile.getFile().isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(userProfile.getFile().getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                userProfile.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserProfileService.class.getName()).log(Level.SEVERE, null, ex);
            }
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
