package com.matchup.dto;

import lombok.Data;

@Data
public class SendMessage {
    private Integer roomId;
    private String content;
    private Integer senderId;
}
