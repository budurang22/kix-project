package com.kix.domain.member.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    @GetMapping("me")
    public Map<String, String> me (@AuthenticationPrincipal Jwt jwt) {
        return Map.of("id", jwt.getSubject(), "role", jwt.getClaimAsString("role"));
    }
}
