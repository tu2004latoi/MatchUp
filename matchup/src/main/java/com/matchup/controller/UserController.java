package com.matchup.controller;

import com.matchup.dto.RegisterRequest;
import com.matchup.model.User;
import com.matchup.model.UserProfile;
import com.matchup.model.enums.UserRole;
import com.matchup.service.UserProfileService;
import com.matchup.service.UserService;
import com.matchup.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/v1/users")
    public ResponseEntity<List<User>> getAllUsers(){
        return ResponseEntity.ok(this.userService.getAllUsers());
    }

    @GetMapping("/v1/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id){
        return ResponseEntity.ok(this.userService.getUserById(id));
    }

    @PostMapping("/v1/auth/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest){
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());

        UserProfile userProfile = new UserProfile();
        userProfile.setUser(user);
        userProfile.setRole(UserRole.USER);
        user.setUserProfile(userProfile);

        this.userService.addUser(user);

        return ResponseEntity.ok("Register success");
    }

    @PostMapping("/v1/auth/login")
    public ResponseEntity<?> login(@RequestBody RegisterRequest u) {
        if (u.getUsername() == null || u.getPassword() == null) {
            return ResponseEntity.badRequest().body("Username hoặc password không được để trống");
        }

        if (this.userService.authenticate(u.getUsername(), u.getPassword())) {
            try {
                String token = JwtUtils.generateToken(u.getUsername());
                return ResponseEntity.ok().body(Collections.singletonMap("token", token));
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Lỗi khi tạo JWT");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai thông tin đăng nhập");
    }

    @GetMapping("/v1/users/me")
    @ResponseBody
    @CrossOrigin
    public ResponseEntity<User> getProfile(Principal principal) {
        return new ResponseEntity<>(this.userService.getUserByUsername(principal.getName()), HttpStatus.OK);
    }

    @DeleteMapping("/v1/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        User user = this.userService.getUserById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        this.userService.deleteUser(user);
        return ResponseEntity.ok("Delete User Successfully");
    }

}
