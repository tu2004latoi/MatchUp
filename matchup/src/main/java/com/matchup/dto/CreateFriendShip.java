package com.matchup.dto;

import lombok.Data;

@Data
public class CreateFriendShip {
    private Integer userId;
    private Integer friendId;
}
