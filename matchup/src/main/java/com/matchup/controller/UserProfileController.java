package com.matchup.controller;

import com.matchup.model.UserProfile;
import com.matchup.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UserProfileController {
    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/v1/user-profiles")
    public List<UserProfile> getAllUserProfiles() {
        return userProfileService.getAllUserProfiles();
    }
    
    @GetMapping("/v1/user-profile/{id}")
    public UserProfile getUserProfileByUserId(@PathVariable int id) {
        return userProfileService.getUserProfileByUserId(id);
    }
}
