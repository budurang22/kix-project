package com.kix.domain.member.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresIn) {
}
