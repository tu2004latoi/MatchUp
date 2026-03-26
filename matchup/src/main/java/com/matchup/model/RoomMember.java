package com.matchup.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.matchup.model.enums.AttendanceStatus;
import com.matchup.model.enums.RoomRole;
import com.matchup.model.enums.MemberStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_member")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomMember implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private RoomRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private MemberStatus statusMember;

    @Enumerated(EnumType.STRING)
    @Column(name = "attendance_status")
    private AttendanceStatus attendanceStatus;

    @Column(name = "is_point")
    private Boolean isPoint = false;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "joined_at")
    private LocalDateTime joinedAt; 

    @PrePersist
    private void onCreate(){
        joinedAt = LocalDateTime.now();
    }
}
