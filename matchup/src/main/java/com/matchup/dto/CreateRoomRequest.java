package com.matchup.dto;

import com.matchup.model.enums.SkillLevel;
import com.matchup.model.enums.Visibility;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateRoomRequest {
    private Integer locationId;
    private String name;
    private String description;
    private SkillLevel skillLevel;
    private Visibility visibility;
    private Integer maxMembers;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean open;
}
