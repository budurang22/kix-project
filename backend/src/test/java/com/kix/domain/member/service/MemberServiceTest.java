package com.kix.domain.member.service;

import com.kix.domain.member.entity.Member;
import com.kix.domain.member.entity.Role;
import com.kix.domain.member.exception.DuplicateEmailException;
import com.kix.domain.member.service.MemberService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

@SpringBootTest
@Transactional
public class MemberServiceTest {

    @Autowired
    private MemberService memberService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("회원가입하면 비밀번호는 해시로 저장되고 역할은 USER다")
    void signup() {
        // when
        Member member = memberService.signup("user@kix.com", "password1234", "킥스");

        // then
        assertThat(member.getPasswordHash()).isNotEqualTo("password1234");
        assertThat(passwordEncoder.matches("password1234", member.getPasswordHash())).isTrue();
        assertThat(member.getRole()).isEqualTo(Role.USER);
    }

    @Test
    @DisplayName("이미 가입된 이메일로 가입하면 예외가 발생한다")
    void signupDuplicateEmail() {
        memberService.signup("user@kix.com", "password1234", "킥스");

        assertThatThrownBy(() -> memberService.signup("user@kix.com", "password1234", "다른사람")).isInstanceOf(DuplicateEmailException.class);
    }
}
