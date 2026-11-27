package com.kix.domain.member.controller;

import com.kix.domain.member.dto.MemberResponse;
import com.kix.domain.member.dto.SignupRequest;
import com.kix.domain.member.entity.Member;
import com.kix.domain.member.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberService memberService;

    public AuthController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@Valid @RequestBody SignupRequest request) {
        Member member = memberService.signup(request.email(), request.password(), request.nickname());

        return ResponseEntity.status(HttpStatus.CREATED).body(MemberResponse.from(member));
    }
}
