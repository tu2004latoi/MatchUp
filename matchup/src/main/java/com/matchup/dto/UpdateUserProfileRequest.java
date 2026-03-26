package com.matchup.dto;

import java.sql.Date;

import org.springframework.web.multipart.MultipartFile;

import com.matchup.model.enums.Gender;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String firstName;
    private String lastName;
    private Date dob;
    private Gender gender;
    private MultipartFile file;
}
