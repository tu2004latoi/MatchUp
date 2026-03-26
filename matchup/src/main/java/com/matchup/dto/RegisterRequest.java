package com.matchup.dto;

import com.matchup.model.enums.Gender;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private Gender gender;
}
