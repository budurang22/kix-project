---
paths:
  - "backend/**"
---

# 백엔드 컨벤션

공식 참고: Google Java Style Guide https://google.github.io/styleguide/javaguide.html (기본). **들여쓰기는 예외로 4칸** (DEC-019).
버전은 `docs/tech-stack.md`와 `docs/decisions.md`에서 확정된 값을 따른다. Spring Boot는 4.1.x 안정 버전(DEC-024)이고, Boot가 관리하는 의존성은 특별한 이유 없이 개별 버전을 지정하지 않는다. 스타터 이름은 Boot 4 기준(`spring-boot-starter-webmvc` 등, 4.0 마이그레이션 가이드)을 따른다.

## 1. 네이밍

- 클래스 PascalCase / 메서드·변수 camelCase / 상수 UPPER_SNAKE_CASE / 패키지 소문자
- Boolean은 의미가 분명한 `is`, `has` 계열
- DTO는 목적 중심: `OrderCreateRequest`, `OrderResponse`
- 예외는 `Exception` 접미사: `InsufficientStockException`

## 2. 포맷 (확정)

- Google Java Style을 기본으로 하되 **들여쓰기 4칸**(이어지는 줄 8칸)을 쓴다. 구현 수단은 Spotless의 google-java-format AOSP 스타일이다.
- AOSP에서 100자 열 제한과 import 정렬이 Google 스타일과 어떻게 같고 다른지는 아직 공식 문서로 다 확인하지 못했다. 확인 전에는 단정하지 않는다.
- 전역 CLAUDE.md의 중괄호 규칙(K&R, 여는 중괄호는 같은 줄)과 주석 기준을 따른다.
- `spotlessCheck` 실행 검증은 아직 하지 않았다.

## 3. 설계

- 패키지: `com.kix.global.{config,security,exception,response}`, `com.kix.domain.{member,product,order,review,like}`. 회원 도메인은 `member`(엔티티 `Member`, 테이블 `members`)
- 도메인 안에 필요한 Controller, Service, Repository, Entity, DTO를 둔다. 책임을 섞지 않는다.
- 생성자 기반 의존성 주입, Entity를 API로 직접 노출하지 않음, 불필요한 Setter 지양
- 비즈니스 로직은 Service와 도메인 객체에서 처리하고 트랜잭션 범위를 명확히 한다. 공통 예외 처리를 둔다.
- 하드코딩·중복 코드 지양. 불필요한 추상화와 과도한 디자인 패턴은 쓰지 않는다.
- POJO 기반 객체지향 설계를 지향한다. 도메인 객체가 자기 규칙(재고 차감, 금액 계산)을 직접 관리하고(캡슐화), 서비스는 흐름을 조율한다. SOLID와 응집도·결합도를 고려하되 과하게 추상화하지 않는다.
- IoC·DI는 생성자 주입으로, AOP는 `@Aspect`·`@Around` 실행 시간 측정을 일정에 따라 적용한다. PSA는 `@Transactional`이 JPA·JDBC 구현을 추상화하는 예로 트랜잭션 학습 단계에서 설명한다.
- 가격은 서버에서 계산한다. 주문과 재고 차감은 한 트랜잭션이고 옵션 행은 `PESSIMISTIC_WRITE`로 잠근다.
- 멱등성 키 충돌은 `@Transactional` 경계 바깥에서 잡고 별도 트랜잭션으로 기존 주문을 조회한다.
- DB 접근에는 JPA 또는 파라미터 바인딩만 사용한다.

## 4. 개발 방식

- 핵심 주문 도메인(옵션 재고 차감, 수량 검증, 금액·가격 스냅샷, 멱등성, 동시 주문)은 TDD로 진행한다 (`testing.md`).
- 새 라이브러리는 공식 문서에서 호환성을 확인하고 `docs/references.md`에 기록한 뒤, 승인을 받고 개발자가 직접 추가하도록 안내한다.
