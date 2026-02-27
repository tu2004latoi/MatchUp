package com.matchup.dto;

import com.matchup.model.enums.RoomRole;
import com.matchup.model.enums.StatusMember;
import lombok.Data;

@Data
public class CreateRoomMemberRequest {
    private int userId;
    private int roomId;
    private RoomRole role;
    private StatusMember statusMember;
}
