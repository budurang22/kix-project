package com.kix.domain.member.dto;

import com.kix.domain.member.entity.Member;

public record MemberResponse (Long id, String email, String nickname) {

    public static MemberResponse from (Member member) {
        return new MemberResponse(member.getId(), member.getEmail(), member.getNickname());
    }
}
