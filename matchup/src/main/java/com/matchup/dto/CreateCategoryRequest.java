package com.matchup.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class CreateCategoryRequest {
    private String name;
    private String description;
    private MultipartFile file;
}
