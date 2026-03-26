package com.matchup.dto;

import lombok.Data;

@Data
public class CheckPasswordRoomRequest {
    private Integer roomId;
    private String password;
}
