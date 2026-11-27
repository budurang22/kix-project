package com.kix.domain.member.service;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.exception.DuplicateEmailException;
import com.kix.domain.member.repository.MemberRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Member signup(String email, String rawPassword, String nickname) {
        if(memberRepository.existsByEmail(email)){
            throw new DuplicateEmailException();
        }

        Member member = new Member(email, passwordEncoder.encode(rawPassword), nickname);

        try {
            return memberRepository.save(member);
        } catch (DataIntegrityViolationException e) {
            // 동시에 같은 이메일로 가입하면 DB 유니크 제약이 마지막으로 막는다
            throw new DuplicateEmailException();
        }
    }
}

