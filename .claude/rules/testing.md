# 테스트·TDD 규칙

기준 문서: `docs/learning/tdd.md`, `docs/design-revision-v1.2.md` 6장(T-01~T-14), `docs/tech-stack.md` 1.5장·13장, `docs/decisions.md` DEC-023.
프로젝트 전체에 TDD를 강제하지 않는다. **핵심 주문 도메인에만 부분 적용**하고, 그 밖의 기능에 과도하게 적용하지 않는다.

## 1. TDD 적용 범위

**필수(TDD)**: 상품 옵션 재고 차감 / 재고 부족·잘못된 주문 수량 검증 / 주문 금액 계산과 가격 스냅샷 / 주문 멱등성과 중복 주문 방지 / 동시 주문 시 재고 초과 판매 방지

**일반 테스트(구현 후 작성 가능)**: 회원가입·로그인, 상품 CRUD, 리뷰·좋아요, 인증·인가, API 입력값 검증, 트랜잭션 롤백

동시성, 멱등성, 트랜잭션, DB 제약조건은 **실제 MySQL 통합 테스트**로 검증한다 (H2 등 대체 DB 불가).

## 2. TDD 절차 (12단계)

1. 요구사항과 비즈니스 규칙 정의
2. 테스트 시나리오 작성
3. **실패하는 테스트 코드 예시** 제공
4. 개발자가 테스트 코드를 직접 작성·실행
5. **RED** 확인
6. 테스트를 통과하는 **최소 구현 예시** 제공
7. 개발자가 직접 구현
8. **GREEN** 확인
9. 리팩터링 방향 설명
10. 개발자가 직접 개선
11. 전체 테스트 재실행
12. 학습·테스트 결과 기록 (`docs/learning/tdd.md`)

- **RED를 확인하기 전에는 완성된 비즈니스 로직을 제공하지 않는다.** 테스트 작성 단계와 구현 단계를 구분해서 안내한다.
- RED는 "의도한 이유로 실패"해야 한다. 컴파일 오류는 RED가 아니다. 필요한 최소한의 빈 껍데기(메서드 시그니처)만 만들고 단언문이 실패하는지 확인하도록 안내한다.
- 한 번에 한 시나리오씩 RED → GREEN → REFACTOR를 돈다.
- 테스트·구현 코드는 개발자가 직접 쓴다. Claude는 예시, 개념 설명, 리뷰만 한다.

## 3. 테스트 기술

JUnit Jupiter, AssertJ, Mockito, MockMvc, `@DataJpaTest`, `@SpringBootTest`, `ExecutorService`, `CountDownLatch`, 실제 MySQL. Testcontainers와 JaCoCo는 선택이다.
버전은 Boot 관리 버전을 따르고 `docs/tech-stack.md`에 기록한다. 새 의존성은 승인 없이 추가하지 않는다.
Boot 4.x는 테스트 스타터 분리, `@MockBean`→`@MockitoBean`, MockMvc에 `@AutoConfigureMockMvc` 필요 등 변경이 있다 (4.0 마이그레이션 가이드, 일부 요약). 테스트 구현 전에 4.1 테스트 문서를 읽고 `references.md`에 기록한다.

## 4. 설계 원칙

- Given / When / Then 구조, `@DisplayName`으로 테스트 목적 명시
- 정상, 실패, 경계값 시나리오를 구분하고 단위 테스트와 통합 테스트를 구분
- 테스트 간 독립성 유지, 운영 데이터와 테스트 데이터 분리 (테스트 전용 DB 이름 사용)
- 과도한 Mock 지양. 커버리지 수치보다 핵심 비즈니스 규칙 검증을 우선한다.
- `@DataJpaTest`는 기본적으로 테스트마다 트랜잭션을 걸고 롤백한다. 실제 DB를 쓰려면 `@AutoConfigureTestDatabase(replace = Replace.NONE)`을 쓴다.
- **동시성 테스트는 `@Transactional`로 감싸지 않는다.** 여러 스레드가 각자 커밋해야 하고, 테스트 메서드의 트랜잭션은 다른 스레드에 보이지 않는다. (자체 설계 판단)
- 동시성 테스트 패턴: 시작 신호 `CountDownLatch(1)`로 스레드를 동시에 출발시키고, 완료 신호 `CountDownLatch(N)`으로 기다린다. `ExecutorService`는 `shutdown()` + `awaitTermination()`으로 정리한다.
- 결과를 기록할 때는 MySQL 버전, HikariCP 풀 크기(기본 10), 스레드 수를 함께 적는다.

## 5. 기록 규칙

- 실행하지 않은 테스트를 성공으로 기록하지 않는다. **예상 결과**와 **실제 실행 결과**를 구분한다.
- **TDD로 개발한 기능**과 **구현 후 테스트를 추가한 기능**을 `docs/learning/tdd.md`에서 명확히 구분한다.
- 기록 항목: TDD 적용 기능과 이유, RED/GREEN/REFACTOR 과정, 테스트와 구현의 관계, 실패 원인과 해결, 동시성·멱등성 실제 결과, 리팩터링 전후, 실행 명령어와 결과, 면접 예상 질문
- 트러블슈팅 형식: 문제 / 재현 조건 / 원인 / 해결 / 적용 전후 결과 / 관련 커밋
- 테스트 시나리오 기준은 T-01~T-14이며 TDD/일반 구분은 `docs/learning/tdd.md`의 표를 따른다.
