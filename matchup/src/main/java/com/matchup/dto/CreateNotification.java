package com.matchup.dto;

import lombok.Data;

@Data
public class CreateNotification {
    private String title;
    private String content;
    private Boolean isRead;
    private Integer userId;
}
