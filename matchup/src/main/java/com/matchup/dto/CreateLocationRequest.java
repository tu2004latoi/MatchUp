package com.matchup.dto;

import lombok.Data;

@Data
public class CreateLocationRequest {
    private String address;
    private String district;
    private String region;
}
