package com.matchup.dto;

import com.matchup.model.enums.RoomRole;
import com.matchup.model.enums.MemberStatus;
import lombok.Data;

@Data
public class CreateRoomMemberRequest {
    private int userId;
    private int roomId;
    private RoomRole role;
    private MemberStatus statusMember;
}
