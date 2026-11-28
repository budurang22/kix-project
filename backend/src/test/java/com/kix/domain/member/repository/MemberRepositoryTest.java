package com.kix.domain.member.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.kix.domain.member.entity.Member;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

// 스프링 애플리케이션 전체를 띄워서 테스트한다 (실제 MySQL에 접속함)
@SpringBootTest
// 테스트가 끝나면 DB 변경을 롤백한다 (테스트 데이터가 DB에 남지 않음)
@Transactional
class MemberRepositoryTest {

    // 스프링이 만들어 둔 MemberRepository 객체를 주입받는다
    @Autowired
    private MemberRepository memberRepository;

    // 이 메서드가 테스트라는 표시. 아래 이름은 테스트 결과 화면에 그대로 보인다
    @Test
    @DisplayName("회원을 저장하고 이메일로 조회한다")
    void saveAndFindByEmail() {
        // given: 테스트에 필요한 준비물을 만든다 (저장할 회원 객체)
        Member member = new Member("test@kix.com", "hashed-password", "테스터");

        // when: 테스트하려는 동작을 실행한다 (회원을 DB에 저장)
        memberRepository.save(member);

        // then: 결과가 기대대로인지 검증한다 (이메일로 찾으면 회원이 존재해야 한다)
        assertThat(memberRepository.findByEmail("test@kix.com")).isPresent();
    }
}