package com.matchup.service;

import com.matchup.model.User;
import com.matchup.model.UserProfile;
import com.matchup.repository.UserProfileRepository;
import com.matchup.repository.UserRepository;
import com.matchup.security.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = this.getUserByUsername(username);
        if (u == null) {
            throw new UsernameNotFoundException("Invalid username");
        }

        UserProfile userProfile = this.userProfileRepository.findByUserId(u.getId());

        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + userProfile.getRole().name()));

        return new CustomUserDetails(u.getId(), u.getUsername(), u.getPassword(), authorities);
    }

    public List<User> getAllUsers() {
        return this.userRepository.findAll();
    }

    public User getUserByUsername(String username) {
        Optional<User> user = this.userRepository.findByUsername(username);

        return user.orElse(null);
    }

    public User getUserById(int id) {
        Optional<User> user = this.userRepository.findById(id);

        return user.orElse(null);
    }

    @Transactional
    public User addUser(User user) {
        if (user.getId() != null) {
            throw new IllegalArgumentException("New User must not have an ID");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return this.userRepository.save(user);
    }

    @Transactional
    public void deleteUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        this.userRepository.delete(user);
    }

    public boolean authenticate(String username, String password) {
        Optional<User> u = this.userRepository.findByUsername(username);
        if (u.isPresent()) {
            User user = u.get();
            return passwordEncoder.matches(password, user.getPassword());
        }

        return false;
    }
}
