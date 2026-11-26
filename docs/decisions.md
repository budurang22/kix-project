# 설계 의사결정 기록

상태: **확정** = 사용자 승인됨 / **제안** = 승인 대기 / **보류**

새 결정은 맨 아래에 추가한다. 주요 설계 변경은 사용자 승인 후 상태를 확정으로 바꾼다.

## DEC-001. 문서 기준과 Notion 역할

- 상태: 확정 (2026-11-26)
- 결정: 로컬 `docs/`를 개발 기준으로 한다. Notion은 서비스 기획과 포트폴리오 관리에 쓰며, Claude는 Notion을 읽기만 한다.
- 이유: 세션이 바뀌어도 설계와 진행 상황을 Git으로 추적하기 위해.
- 영향: 설계 변경은 `docs/`와 이 파일에 기록한다. Notion 반영은 사용자가 따로 결정한다.

## DEC-002. Notion 데이터베이스 명칭 "DropShop"

- 상태: 확정 (기록만 함, 수정하지 않음)
- 내용: Notion 상위 데이터베이스의 상위 제목이 "DropShop | TO DO"로 남아 있다 (현재 이름은 "KIX (한정판 스니커즈 & 패션 커머스)").
- 결정: 직접 수정하지 않는다. 필요하면 사용자가 수정한다.

## DEC-003. MVP 범위 조정

- 상태: 확정 (2026-11-26)
- 결정:
  - 필수: 회원, 상품, 좋아요, 리뷰, 주문
  - MVP에 추가: 사이즈별 재고(상품 옵션), 브랜드 필터
  - 옵션은 신발 사이즈로 제한
  - 선택 기능으로 분리: 색상 옵션, 장바구니, 주문 취소, 리뷰 댓글
  - 제외: 실제 결제, 배송, 리셀, 입찰, Redis, 소셜 로그인
- 마감일: 2026-11-30 유지
- 영향: ERD(product_options 추가), API, 주문 락 단위, 테스트 계획이 바뀐다. 수정안은 `design-revision-v1.2.md`.

## DEC-004. 협업 모드와 전역 학습 모드

- 상태: **대체됨** (DEC-013으로 철회, 2026-11-26)
- 당시 결정: Claude Code가 코드를 직접 작성·수정할 수 있다. 전역 학습 모드와의 충돌은 `.claude/rules/collaboration.md`로 해결한다.
- 철회 이유: 프로젝트 목적이 "개발자가 직접 구현하며 흐름을 이해하는 것"으로 확정되었다. `collaboration.md`는 삭제하고 `learning-mode.md`로 대체했다.

## DEC-005. 개발 순서 조정

- 상태: 제안
- 결정(안): 핵심 가치인 주문·동시성·멱등성을 앞당긴다.
  환경 → ERD/DDL 확정 → 인증 → 상품·옵션 → **주문** → 동시성 테스트 → 좋아요·리뷰 → 디자인 승인 → React → 배포 → 결과 기록
- 이유: 가장 위험한 작업을 마감 직전(11/28)에 몰아두지 않기 위해.
- 일정이 부족할 때: 선택 기능을 먼저 제외하고, 그다음 프론트 화면 수를 줄인다.

## DEC-006. Java / Spring Boot 버전

- 상태: **확정 (2026-11-27): Java 21, Spring Boot 4.1.x 안정 버전** (DEC-024). 아래는 검토 기록이다.
- 사용자 요청: Java 21 LTS + Spring Boot 3.5.x를 우선 후보로 검토
- 확인한 사실
  - Boot 3.5.16 문서: Java 17~25 지원, Spring Framework 6.2.19+ 필요 (문서 확인)
  - Boot 3.5의 OSS 지원은 2026-06-30에 종료되었다는 설명이 여러 제3자 출처에 있음. 공식 spring.io 지원 표는 가져오지 못함 (**미확인**)
  - 최신 GA는 4.2.0 (spring.io 프로젝트 페이지). 4.x는 Java 17~27 지원
  - 제3자 출처 기준: 4.0 OSS 지원은 2026-12-31, 4.1은 2027-07-31까지 (**미확인**)
  - 로컬 기본 JDK는 26이다. 3.5의 범위 밖이므로 JDK 21을 명시해야 한다.
- 추천
  - Java **21** (Homebrew에 설치됨). Gradle toolchain 또는 `JAVA_HOME`으로 고정
  - Boot는 **4.1.x 이상의 4.x**를 우선 검토. 지원 중인 계열을 쓰는 편이 안전하고, 이 프로젝트는 마감 후 포트폴리오로도 쓰일 가능성이 높음
  - 학습 자료와 예제는 3.x 기준이 많아 4.x에서는 Hibernate 7, Jackson 3(`tools.jackson`), Security 7(CSRF 기본값 등) 차이를 확인해야 한다.
  - 3.5.16 사용도 가능하다. 단, 공식 지원이 끝난 계열이라는 점을 README와 이 기록에 남겨야 한다.
- 결정 전 할 일: spring.io 지원 표(https://spring.io/support, https://spring.io/projects/generations) 확인, start.spring.io에서 선택 가능한 버전 확인

### 2026-11-27 공식 원문 확인 결과 (사용자 요청: 최종 확정 전 보고)

사용자 방향: Java 21 LTS + Boot 3.5.x 우선 검토, 기존 학습 환경과의 연속성 우선. **아직 최종 확정하지 않았다.**

공식 출처에서 확인한 사실 (원문)
- 지원 기간 (공식 Spring API `https://api.spring.io/projects/spring-boot/generations`의 필드 값)

  | 세대 | 최초 릴리스 | OSS 지원 종료 | 상용 지원 종료 |
  | --- | --- | --- | --- |
  | 3.5.x | 2025-05-31 | **2026-06-30** | 2032-06-30 (extended) |
  | 4.0.x | 2025-11-30 | 2026-12-31 | 2027-12-31 |
  | 4.1.x | 2026-06-30 | 2027-07-31 | 2028-07-31 |
  | 4.2.x | 2026-11-30 | 2027-12-31 | 2028-12-31 |

  → **3.5.x는 이미 OSS 지원이 끝났다.** 4.0.x는 마감(2026-11-30) 한 달 뒤인 2026-12-31에 끝난다. 4.1.x가 지원 기간이 가장 여유 있는 안정 계열이다. (같은 API에서 4.2.x의 최초 릴리스는 2026-11-30이라고 나오는데, spring.io 프로젝트 페이지와 start.spring.io에는 이미 4.2.0이 최신으로 표시된다. 날짜 표기 차이가 있어 4.2는 후보에서 제외한다.)
- Boot 3.5.16 요구사항 (docs.spring.io 원문): Java 17 이상, **Java 25까지 호환**, Spring Framework 6.2.19 이상, Gradle 7.6.4+ (7.x) 또는 8.4+ (8.x), Maven 3.6.3+. 페이지에 "최신 안정 버전은 4.2.0"이라고 안내됨. → Java 21 호환 확인
- Boot 4.2.0 요구사항: Java 17 이상, Java 27까지, Spring Framework 7.1.0 이상, Gradle 8.14+ 또는 9.x
- 로컬 기본 JDK 26은 3.5.x 호환 범위(~25) 밖이다. JDK 21을 명시해서 써야 한다.
- 3.5.16이 관리하는 의존성 중 원문 표에서 직접 확인한 것: `mysql-connector-j` 9.7.0, `HikariCP` 6.3.3, `jackson-databind` 2.21.4. 그 밖의 값(Spring Security 6.5.11, Hibernate 6.6.53.Final, Flyway 11.7.2, Mockito 5.17.0, JUnit Jupiter 5.12.2)은 도구가 요약한 값이라 **원문 재확인 필요**
- springdoc-openapi: 공식 사이트의 3.x(3.2.1 등)는 Boot 4.x용이고, Boot 3.x는 2.x 계열(문서가 v2.10.1을 Boot 3.x용으로 안내)을 쓴다. → Boot 버전에 따라 springdoc 메이저가 달라진다.
- start.spring.io (요약 수준 확인): 제공 Boot 버전이 4.2.0(기본), 4.1.3, 4.0.10과 각각의 SNAPSHOT이고 3.x가 목록에 없다고 보고됨. Java는 17(기본), 21, 25, 27. **3.5를 Initializr에서 고를 수 있는지는 개발자가 화면에서 직접 확인해야 한다.**

선택지 비교

| | A. Boot 3.5.16 | B. Boot 4.1.x |
| --- | --- | --- |
| 지원 | OSS 종료(2026-06-30). 마지막 패치 3.5.16 | OSS 2027-07-31까지 |
| 학습 연속성 | 높음 (기존 학습 환경·자료가 3.x 기준) | 낮음 (Spring Framework 7, Security 7, Hibernate 7, Jackson 3 등 변화 큼. 세부 차이는 미확인) |
| Initializr | 선택 가능한지 미확인 (없으면 버전을 직접 지정해야 함) | 선택 가능 (4.1.3) |
| springdoc | 2.x 계열 | 3.x 계열 (4.1.x ↔ 3.1.x~3.2.x) |
| Java 21 | 호환 | 호환 |
| 위험 | 보안 패치 없음. 실제 개인정보를 받지 않는 학습 데모라는 전제에서만 수용 가능 | 변경점 학습 부담, 마감 3일 전 |

- Claude 추천(최종 결정은 사용자): 연속성과 마감을 우선하면 **A안(3.5.16)** 을 받아들일 수 있다. 단, "OSS 지원 종료 계열을 일부러 선택했다"는 점과 마감 후 4.x 업그레이드를 후속 학습 과제로 이 문서에 남기는 것을 조건으로 한다. 지원 기간을 우선한다면 B안이다.
- 확정 전에 개발자가 할 일: start.spring.io 화면에서 Boot 버전 드롭다운에 3.5.x가 있는지 확인(읽기만)
- 상태: 위 비교 후 **B안(4.1.x)으로 확정** (DEC-024)

## DEC-007. 빌드 도구

- 상태: **확정: Gradle** (2026-11-27, DEC-020). 아래는 당시 기록이다.
- 내용: 로컬에 Maven과 Gradle이 없다. Spring Initializr가 생성하는 wrapper(`mvnw` 또는 `gradlew`)를 사용한다.
- 선택 필요: Maven / Gradle(Groovy 또는 Kotlin DSL). 추천은 학습 자료가 많은 쪽이며, 사용자가 익숙한 쪽을 따른다.

## DEC-008. 인증과 토큰

- 상태: **확정 (2026-11-27)**. 최종 정책은 DEC-024와 `design-revision-v1.2.md` 7.5장. 아래는 당시 제안이며 저장 위치는 localStorage 제안이 아니라 **React 메모리**로 확정되었다.
- 결정(안)
  - Spring Security + JWT + BCrypt. Refresh Token은 MVP에서 제외
  - 관리자 계정은 공개 회원가입으로 만들 수 없다. 가입 API는 항상 `USER` 역할만 부여하고, 관리자는 환경변수(`ADMIN_EMAIL`, `ADMIN_PASSWORD`)로 애플리케이션 시작 시 한 번 생성
  - Access Token 만료와 저장 위치는 `design-revision-v1.2.md` 7장의 비교를 보고 결정
- 로그아웃: 서버 엔드포인트 없이 클라이언트가 토큰을 지운다 (서버에서 토큰 무효화는 하지 않음).

## DEC-009. 비밀값 관리

- 상태: 확정 (2026-11-26)
- 결정: 비밀번호, JWT Secret, AWS 자격 증명은 Git에 저장하지 않는다. `.env`는 Git에서 제외하고 `.env.example`에 변수 이름만 둔다. 비밀값은 출력하거나 개발 기록에 남기지 않는다.

## DEC-010. 저장소와 배포

- 상태: 확정 (2026-11-26), **배포 구조는 DEC-017로 보강·구체화**
- 결정: Monorepo (`backend/`, `frontend/`, `docs/`, `design/`, `infra/`). Docker Compose, AWS EC2 단일 인스턴스, Nginx가 프론트 정적 파일과 `/api` 프록시를 맡는다. 8080과 3306은 외부에 공개하지 않는다.
- 협의 대기: 도메인과 HTTPS. HTTPS 미적용 시 실제 개인정보를 쓰지 않는 데모로 제한한다.
- 승인 필요: GitHub 원격 저장소 연결, 실제 배포

## DEC-011. 디자인 관리

- 상태: 확정 (2026-11-26)
- 결정
  - 시안은 ChatGPT에서 제작 예정. Notion 이미지는 개념 참고용
  - 디자인 원본, 승인본, 구현용 이미지, 토큰을 구분하고 `design/approved.md`로 화면별 승인 상태를 관리
  - 승인되지 않은 디자인으로 UI를 구현하지 않는다. 프론트엔드 초기 환경 설정은 가능
  - 색상: #D5FA38(포인트), #111111, #FFFFFF, #F4F4F4(기본). #EF4444는 오류·위험 상태용 기능성 색
  - 라임은 강조 배경 + 검은 텍스트 조합을 우선하고, 흰 배경 위 작은 글자색으로 쓰지 않는다
  - 디자인 토큰을 CSS 변수로 연결하고, 화면 구현 후 브라우저 캡처로 승인된 디자인과 비교한다

## DEC-012. 공통 메모리와 최소 자동화

- 상태: 확정 (2026-11-26), DEC-013에서 권한 부분 수정
- 결정: CLAUDE.md는 간결하게 유지. 세션 종료 기록은 `/wrap-up` 스킬로 한다. 자동화는 최소로 한다.
- 현재 구성: SessionStart hook 1개(Git 상태, progress.md, decisions.md 최근, 학습 기록 출력) + PreToolUse 가드 1개(DEC-013)
- 검증 필요: SessionStart hook 출력이 다음 세션에서 실제로 컨텍스트에 들어오는지, `permissions` 경로 패턴(`Edit(./backend/**)` 등)이 의도대로 매칭되는지 (아직 실행 검증하지 않음)

## DEC-013. 학습 모드 확정과 Claude 작업 권한 (DEC-004 대체)

- 상태: 확정 (2026-11-26)
- 결정
  - 프로젝트의 핵심 목적은 서비스 완성이 아니라 개발자가 직접 구현하며 설계~배포 흐름을 이해하는 것이다.
  - Claude는 시니어 멘토·기술 가이드·코드 리뷰어다. 직접 코드 작성·수정 권한은 철회한다. 전역 `~/.claude/CLAUDE.md` 학습 모드를 유지한다.
  - Claude가 직접 하지 않는 일: 소스 디렉터리와 프로젝트 생성, 코드·SQL·테스트, 개발 환경 설정(Gradle, npm, 패키지), Docker·Nginx·GitHub Actions, Git 브랜치·commit·push·merge, AWS·배포. 예시와 명령어는 대화로 제공하고 개발자가 직접 실행한다.
  - 직접 할 수 있는 일: `CLAUDE.md`, `.claude/**`, `docs/**`, `design/approved.md`, 읽기 전용 분석·Git 상태·버전 확인·공식 문서 조회. Notion은 읽기만 한다.
  - 진행은 `.claude/rules/learning-mode.md`의 12단계를 따른다.
- 보조 장치: `.claude/settings.json`의 `permissions.deny`와 `.claude/hooks/guard.py`(PreToolUse). 보안 경계가 아니라 실수 방지용이다.
- 가드 검증: 허용·차단 29개 케이스를 직접 실행해 모두 통과 (2026-11-26, 실행 검증). Claude Code 안에서 hook이 실제로 호출되는 동작은 다음 도구 호출에서 확인한다.
- 이전 세션에서 이미 만든 개발 관련 파일 목록은 `docs/progress.md` 4장에 있다. 임의로 삭제하지 않았고, 처리는 개발자가 정한다.

## DEC-014. 코드 컨벤션 (일부 결정 대기)

- 상태: **대체됨** (2026-11-27 사용자 결정으로 DEC-019에서 확정). 아래는 당시 제안 기록이다.
- 확정: Google Java Style Guide를 기본으로 검토, 도메인 중심 패키지(`com.kix.global.*`, `com.kix.domain.*`), 생성자 주입, Entity 직접 노출 금지, 프론트 디렉터리 구조, DB 네이밍(복수형 snake_case, `idx_`/`uk_`/`fk_`), REST 규칙, Conventional Commits, 간소화 Git Flow
- 충돌하는 항목과 제안 (사용자 결정 필요)
  1. **들여쓰기**: Google Java Style은 2칸·100자(공식 문서 확인), 전역 CLAUDE.md는 4칸. 제안: google-java-format `--aosp`(4칸)를 Spotless로 적용해 전역 설정과 맞춘다. 2칸을 쓰려면 전역 규칙을 이 프로젝트에서 덮어써야 한다.
  2. **회원 테이블 이름**: 패키지는 `domain.member`인데 ERD는 `users`, API는 `/api/users/me`. 제안: 테이블 `members`, 엔티티 `Member`, API `/api/members/me`로 통일 (또는 패키지를 `user`로 변경).
  3. **프론트 파일명**: 전역은 kebab-case, 새 규칙은 컴포넌트 PascalCase. 제안: 컴포넌트·페이지는 `ProductCard.jsx`(PascalCase), 그 외 파일은 kebab-case.
  4. **복합 PK**: `product_likes`(user_id, product_id)는 "기본키 id" 규칙과 충돌. 제안: 복합 PK를 예외로 허용하고 제약 이름은 `pk_`를 쓰지 않고 DB 기본 PK로 둔다.
  5. **CHECK 제약 이름**: 규칙에 없음. 제안: `chk_` 접두사.
- 커밋 형식은 새 규칙(`type(scope): 작업 내용`)이 전역의 `<type>: <subject>`보다 우선한다.

## DEC-015. Git 브랜치·커밋·PR 전략

- 상태: 확정 (2026-11-26)
- 결정: 간소화 Git Flow(`main`, `develop`, `feature/*`, `fix/*`, `refactor/*`, `docs/*`, `hotfix/*`, release 없음), 브랜치 이름은 소문자 kebab-case, `main`·`develop`에서 직접 개발 금지, Conventional Commits 1.0.0(제목 한국어), PR 템플릿 항목 11장 기준. Claude는 설명만 하고 개발자가 직접 실행한다.
- PR 템플릿 파일(`.github/PULL_REQUEST_TEMPLATE.md`)은 개발자가 직접 만든다. 예시는 대화로 제공한다.
- 상세: `.claude/rules/git.md`

## DEC-016. 코드 품질 도구 적용 범위

- 상태: **대체됨** (2026-11-27, DEC-020에서 확정). 아래는 당시 제안이다.
- 검토 대상: EditorConfig, Spotless + google-java-format, ESLint, Prettier, JUnit 5, 실제 MySQL 통합 테스트, GitHub Actions
- 필요성·일정을 보고 적용 여부를 정할 대상: Checkstyle, Commitlint, Playwright, Testcontainers
- 제안: 필수에 가깝게 EditorConfig, Spotless, ESLint, Prettier, JUnit 5. Testcontainers는 Docker Compose MySQL로 충분하면 보류 (일정과 학습 부담 비교 후 결정). Commitlint·Playwright·Checkstyle은 일정 여유 시.
- 호환성 확인 상태: `docs/references.md` 4장. 대부분 "미확인(해당 단계에서 확인)".

## DEC-017. 배포 아키텍처 확정 (2026-11-27)

- 상태: 확정 (아키텍처). 세부 항목은 아래 "미결정" 참고
- 결정
  - AWS EC2 **단일 인스턴스**, Docker Compose로 컨테이너 3개(frontend=Nginx, backend, mysql)를 통합 관리
  - React·Tailwind 빌드 결과물은 Nginx 컨테이너가 서빙하고, `/api/` 요청은 Nginx Reverse Proxy로 Spring Boot에 전달
  - 컨테이너 간 통신은 Docker 내부 네트워크(서비스 이름)로 한다. 백엔드 8080과 MySQL 3306은 외부에 공개(게시)하지 않는다.
  - MySQL 데이터는 Docker Volume으로 영속화한다.
  - 환경변수·민감 정보 정책은 `docs/tech-stack.md` 4장을 따른다 (Git에는 이름만, 값은 서버 `.env`와 GitHub Secrets).
  - GitHub Actions로 프론트·백엔드의 빌드·테스트를 분리하고 배포를 자동화한다.
  - 향후 프론트·백엔드를 별도 서버로 분리할 수 있도록 설계한다 (`tech-stack.md` 10장 원칙).
- 선정 이유
  - 소규모 1인 학습 프로젝트이고 마감이 짧아 구조가 단순한 단일 인스턴스가 적합하다.
  - Nginx로 정적 파일과 API를 같은 출처로 묶으면 CORS 설정이 필요 없고 포트 노출이 최소화된다.
  - Compose는 환경 재현성이 높아 로컬과 서버의 차이를 줄인다.
- 한계(인지하고 선택): 단일 장애점(SPOF), JVM·MySQL 자원 경쟁, 배포 시 짧은 중단, 수평 확장 어려움 → 비교는 `tech-stack.md` 9장
- 대안: 다중 인스턴스(로드 밸런서 + 관리형 DB). 비용·복잡도가 크고 학습 범위를 넘어 후순위로 둔다.
- 미결정 (사용자 확인 필요)
  1. EC2 사양: t3.small(2 GiB) 이상 추천. 1 GiB(t3.micro)는 JVM+MySQL 동거에 여유가 적다 (메모리 사용량은 **추정**, 미측정)
  2. 이미지 저장소: GHCR vs ECR
  3. 배포 방식: SSH vs SSM Run Command. SSH는 "SSH 허용 IP 제한" 정책과 GitHub 러너 접속이 충돌한다.
  4. HTTPS: 도메인 확보 후 Let's Encrypt(Certbot webroot) 등 선택. 도메인이 없으면 실제 개인정보를 쓰지 않는 데모로 제한
  5. **적용 순서**: 마감(2026-11-30)이 가까우므로 수동 배포 → CI → CD → HTTPS 순으로 단계 적용하고, 못 한 단계는 "미적용"으로 기록할 것을 제안
- 공식 문서 확인: `references.md` 6장 (대부분 검색 결과 요약 수준, 실행 검증 없음)
- 실행·배포·설정 파일 작성은 모두 개발자가 직접 한다 (DEC-013).

## DEC-018. Tailwind CSS 도입과 프론트 컨벤션 조정

- 상태: 제안 (사용자 확인 필요). 기술 스택에는 Tailwind CSS가 포함된 것으로 확정되었다.
- 확인한 사실: Tailwind v4는 `tailwindcss`와 `@tailwindcss/vite` 플러그인으로 Vite에 연결하고, `@theme`으로 정의한 디자인 토큰을 CSS 변수로 노출한다 (검색 결과 요약).
- 충돌: 프론트 규칙 "CSS 클래스 kebab-case", "디자인 토큰을 CSS 변수와 연결"은 일반 CSS 기준이다. Tailwind는 유틸리티 클래스를 JSX에 직접 쓴다.
- 제안: 유틸리티 클래스를 기본으로 쓰고, 직접 작성하는 CSS 클래스가 필요하면 kebab-case를 유지한다. 토큰(`design/tokens`)은 `@theme` CSS 변수로 연결한다. 승인된 디자인의 색·간격 외 값은 임의 클래스로 만들지 않는다.
- 후속: 버전과 설정(Vite 버전 호환 포함)은 프론트 초기 구성 단계에서 공식 문서로 확인한다.

## DEC-019. 코드 컨벤션 확정 (DEC-014 대체)

- 상태: 확정 (2026-11-27, 사용자 결정)
- 결정
  1. **Java 들여쓰기는 4칸**. Google Java Style을 기본으로 하되 들여쓰기만 예외로 한다. 구현 수단은 google-java-format의 AOSP 스타일(`aosp`)이다. 원문(google-java-format README): AOSP는 "블록 4칸, 이어지는 줄 8칸"(Google 기본은 2칸·4칸)이다. Google 스타일의 100자 열 제한 등 나머지 규칙이 AOSP에서도 같은지, import 정렬 규칙이 어떻게 다른지는 **미확인**이다(`reorderImports` 기본값 포함). 예외는 `.claude/rules/backend.md`에 명시했다.
  2. Spotless의 google-java-format AOSP 지원: Spotless Gradle README(원문)에 `googleJavaFormat('2.0.0').aosp()...`가 있고 AOSP는 `.aosp()`로 선택한다. Spotless 8.12.0(2026-11-21)은 Gradle 7.3+, Java 17+가 필요하고 플러그인 기본 google-java-format은 2.0.0이다(변경 내역, 원문). google-java-format 자체는 JDK 21 이상이 필요하다고 README가 적고 있다. → Java 21, Gradle 8.x 조합과 충돌하는 요건은 찾지 못했다. **실제 `spotlessCheck` 실행 검증은 아직 안 했다.**
  3. 회원 도메인은 `member`로 통일: 패키지 `com.kix.domain.member`, 엔티티 `Member`, 테이블 `members`, FK 컬럼 `member_id`, API `/api/members/me`. 역할 값(`USER`/`ADMIN`)은 유지.
  4. React 컴포넌트 파일은 PascalCase, 그 외 프론트엔드 파일은 kebab-case.
  5. CHECK 제약 이름은 `chk_` 접두사. 제약 이름은 최대 64자(MySQL 8.4 원문).
  6. 복합 PK는 필요한 경우에만 사용한다. 현재는 `product_likes (member_id, product_id)` 한 곳이며 선정 이유는 `design-revision-v1.2.md` 9장에 있다.
- 반영한 문서: `design-revision-v1.2.md`(이름 변경 전체, 9장), `02`·`05`·`06` 스냅샷 머리말, `tech-stack.md`(패키지 구조), `.claude/rules/{backend,frontend,database}.md`
- v1.1 스냅샷 `05-erd.md`·`06-api-spec.md`의 본문은 원본 기록이라 `users`로 남기고, 머리말에서 `members`로 읽도록 안내했다.

## DEC-020. 기술 스택 확정 (DEC-007, DEC-016 대체)

- 상태: 확정(기술 목록) / **버전·일부 도입은 미확정**. 목록과 근거는 `docs/tech-stack.md` 1장
- 확정: Frontend(React, JavaScript, Vite, Tailwind CSS, React Router, Axios), Backend(Java 21, Spring MVC, Spring Data JPA, Hibernate, Spring Security, JWT, BCrypt, Bean Validation, **Gradle**, Springdoc OpenAPI), MySQL, HikariCP, Docker, Compose, Nginx, AWS EC2·VPC·Security Group·EBS, GitHub Actions, JUnit, Mockito, MockMvc, 실제 MySQL 통합 테스트, Postman, Spotless, google-java-format, ESLint, Prettier, EditorConfig
- 선택 사항으로 관리: Lombok, Testcontainers, Playwright, Checkstyle, Commitlint (JaCoCo는 DEC-023에서 선택)
- 미확정: Spring Boot 버전(DEC-006), Flyway 도입, JWT 라이브러리, React Router 메이저(8 / 7)
- Flyway 검토 요약: 필요성은 높다(제약·인덱스 이름이 있는 DDL은 JPA 자동 생성으로 재현 불가, 테스트·CI·배포에서 같은 스키마 필요 — 설계 판단). Boot 3.5는 `flyway-mysql`과 `db/migration`을 쓴다(원문). 단 Flyway 지원 표에서 MySQL 8.4를 확인하지 못했다(미확인). → 8.4 컨테이너에서 실제 migrate를 시험한 뒤 확정한다.
- 사용자 승인 없이 기술 스택을 바꾸거나 라이브러리를 추가하지 않는다.
- 기존 학습 환경과의 연속성을 우선 고려하되, 지원 종료 계열(Boot 3.5)을 쓸 때는 그 사실을 기록한다.

## DEC-021. 배포 아키텍처 보강 (DEC-017 보강)

- 상태: 확정(구조) / 아래 미결정 항목은 협의 대기 (2026-11-27)
- 확정
  - EC2 단일 인스턴스, Compose 컨테이너 3개: Frontend(React + Tailwind + Nginx), Backend(Spring Boot + JPA), Database(MySQL)
  - Nginx Reverse Proxy로 `/api` 전달, 8080과 3306은 **호스트와 외부 네트워크에 직접 공개하지 않는다**
  - MySQL 데이터는 Docker Volume
  - **SSH는 개발자 IP로 제한**
  - GitHub Actions로 프론트·백엔드 빌드·테스트를 분리하고 최종 배포를 자동화
  - EC2 사양은 비용과 **실제 리소스 사용량**을 보고 결정 (측정 후)
  - 도메인·HTTPS는 배포 단계에서 검토. HTTPS가 없으면 실제 개인정보나 실제 사용 중인 비밀번호를 입력하지 않는다.
  - 모든 배포 설정과 명령어는 개발자가 직접 작성·실행
- **충돌**: GitHub Actions 러너는 개발자 IP가 아니어서 "SSH는 개발자 IP만"과 SSH 기반 자동 배포가 양립하지 않는다. 대안은 SSM Run Command(요건 미확인) 또는 반자동 배포. 비교는 `tech-stack.md` 8.2장. → **결정 (DEC-024)**: GHCR·SSM 우선 검토, 일정 부족 시 이미지 등록 자동화 + 수동 배포. SSH 전체 공개 금지
- **확정 (DEC-024)**: 로컬 개발에서는 MySQL 호스트 포트를 `127.0.0.1`에만 바인딩한다. 서버·운영에서는 게시하지 않는다 (`tech-stack.md` 7장).
- 기존 EC2 2개 방식과의 차이는 `tech-stack.md` 11.2장. 기존 구성 정보가 없어 일반적인 두 형태로 비교했다.

## DEC-022. AI 협업 환경 검증

- 상태: 일부 검증 완료 (2026-11-27). 절차와 결과는 `docs/ai-env-verification.md`
- 실제 Claude Code 세션에서 확인한 것: PreToolUse Bash hook 호출(차단 메시지 확인), `Read(./.env)`와 `Edit(./backend/**)` 권한 규칙 매칭(거부 확인, 파일 변경 없음)
- 아직 확인하지 못한 것: SessionStart 출력, `/wrap-up`, Notion `ask` 규칙, 경로 지정 규칙(`paths`)의 로딩
- 권한 제한과 Hook은 **실수 방지 수단이며 완전한 보안 경계가 아니다.**

## DEC-023. 핵심 비즈니스 로직 부분 TDD 적용

- 상태: 확정 (2026-11-27)
- 목적: TDD 경험을 확보하고 핵심 비즈니스 로직의 안정성과 데이터 정합성을 검증한다. **프로젝트 전체에 강제하지 않는다.**
- 결정
  - TDD 필수: 상품 옵션 재고 차감, 재고 부족·잘못된 주문 수량 검증, 주문 금액 계산·가격 스냅샷, 주문 멱등성·중복 주문 방지, 동시 주문 시 재고 초과 판매 방지
  - 일반 테스트: 회원가입·로그인, 상품 CRUD, 리뷰·좋아요, 인증·인가, API 입력값 검증, 트랜잭션 롤백
  - 동시성·멱등성·트랜잭션·DB 제약은 실제 MySQL 통합 테스트
  - 12단계 절차(RED 확인 전 완성 로직 미제공)는 `.claude/rules/testing.md`
  - 테스트 도구: JUnit Jupiter, AssertJ, Mockito, MockMvc, `@DataJpaTest`, `@SpringBootTest`, `ExecutorService`, `CountDownLatch`, 실제 MySQL. Testcontainers·JaCoCo는 선택
  - TDD로 개발한 기능과 구현 후 테스트를 추가한 기능을 `docs/learning/tdd.md`에서 구분해 기록
  - 핵심 주문 도메인 이외에는 과도한 TDD를 지양한다 (일정 고려).
- 공식 문서로 확인한 사실 (Boot 3.5.16 문서 원문)
  - `spring-boot-starter-test`에 JUnit 5, Spring Test, AssertJ, Hamcrest, Mockito, JSONassert, JsonPath, Awaitility가 포함된다.
  - `@DataJpaTest`는 기본적으로 트랜잭션을 걸고 테스트 끝에 롤백한다. 임베디드 DB가 클래스패스에 있으면 구성하고, 실제 DB를 쓰려면 `@AutoConfigureTestDatabase(replace = Replace.NONE)`을 쓴다.
  - `@SpringBootTest`는 기본적으로 서버를 띄우지 않고 목 환경을 구성한다.
  - Boot 3.5.16 관리 버전: JUnit Jupiter 5.12.2, AssertJ 3.27.7, Mockito 5.17.0, Testcontainers 1.21.4
  - `CountDownLatch`는 일회성이며 "시작 신호 + 완료 신호" 예시가 Javadoc에 있고, `ExecutorService`는 `shutdown` 후 `awaitTermination`으로 기다린다 (Java 21 Javadoc).
- 프로젝트 자체 설계 판단 (공식 문서가 직접 말하지 않음)
  - 동시성 테스트는 `@Transactional`로 감싸지 않는다. 각 스레드가 자기 트랜잭션으로 커밋해야 한다.
  - Boot 3.5의 Testcontainers 문서에는 MySQL 예시와 의존성 좌표가 없고, Testcontainers 사이트의 현재 MySQL 모듈 좌표(`testcontainers-mysql:2.0.5`)는 2.x용이다. Boot 3.5에서 쓰면 관리 버전(1.x, `org.testcontainers:mysql`)을 따라야 하며 도입은 선택이다.
- Boot 버전이 4.x로 정해지면 위 관리 버전과 문서 링크를 다시 확인한다. → 4.1.x로 확정(DEC-024). 위 "Boot 3.5.16 관리 버전" 수치는 3.5 기준이므로 `tech-stack.md`의 4.1 기준 값을 따른다. 4.1 테스트 문서는 테스트 구현 전에 읽는다.

## DEC-024. 2026-11-27 최종 결정: 개발 시작

- 상태: 확정. AI 협업 환경과 공통 규칙 구성은 이 단계에서 마무리하고 개발을 시작한다. **신규 기술 도입은 현재 범위에서 중단**한다 (Flyway는 보류).
- 근거는 `docs/tech-stack.md`, `design-revision-v1.2.md`, `references.md` 7·8장에 있다.

### 1. 기술 스택과 버전
- Java 21 LTS, **Spring Boot 4.1.x 안정 버전**(문서·Initializr 표시 4.1.3), Gradle Wrapper, Spring MVC, Spring Data JPA, Hibernate, Spring Security, JWT, MySQL 8.4 LTS, React, Vite, Tailwind CSS, **React Router 7.x 우선**, Axios, Docker, Compose, Nginx, AWS EC2, GitHub Actions
- 선정 근거: 3.5.x는 OSS 지원이 2026-06-30에 종료되어(공식 Spring API) 지원 중인 4.1.x(OSS 2027-07-31)를 택했다. Java 21은 4.1.3의 지원 범위(17~27)에 들어간다 (원문).
- Spring Boot가 관리하는 의존성은 특별한 이유 없이 개별 버전을 지정하지 않는다.
- 4.x 전환의 영향(4.0 마이그레이션 가이드 원문 기준): 스타터 이름 변경(`spring-boot-starter-webmvc` 등), 테스트 스타터 분리, Jackson 3(`tools.jackson`), 모듈화, Jakarta EE 11. 학습 자료가 3.x 기준일 수 있다.
- 패치 버전: Initializr 메타데이터 원본에서 `4.1.3.RELEASE` 선택 가능을 확인했다 (기본값은 4.2.0이므로 화면에서 4.1.3으로 바꾼다). → **4.1.3으로 확정**
- Initializr 입력값(제안, 2026-11-27): Project `Gradle - Groovy`(학습 자료가 많은 쪽, 사용자 확인 대상), Language Java, Boot 4.1.3, Packaging Jar, Java 21, Group `com.kix`, Artifact `backend`, Name `kix`, Package name `com.kix`. 의존성: Spring Web, Spring Security, Spring Data JPA, Validation, MySQL Driver. 신규 기술 도입 중단 방침에 따라 Lombok·Flyway·Actuator·DevTools·Docker Compose Support는 넣지 않는다. springdoc은 Initializr에 없어 나중에 직접 추가한다.

### 2. 백엔드 설계 원칙
Spring MVC REST API, 도메인 중심 계층형 구조, Controller·Service·Repository·Entity·DTO 책임 분리, POJO 기반 객체지향(캡슐화·응집도·결합도·SOLID), 생성자 주입, 도메인 객체가 비즈니스 규칙을 관리, `@Transactional`, 과도한 추상화·디자인 패턴 지양. IoC·DI·AOP·PSA를 학습하고 `@Aspect`/`@Around` 실행 시간 측정은 일정에 따라 적용한다. `backend.md`에 누락된 POJO·AOP 지침만 추가했다.

### 3. 인증 정책
Spring Security + JWT + BCrypt, Access Token 60분, Refresh Token 제외, `Authorization: Bearer`, **React 메모리에만 저장**, Stateless, 새로고침·만료 시 재로그인, 일반 회원/관리자 권한 분리, 401/403, 관리자 공개 가입 금지. 쿠키 등 브라우저 자동 전송 인증 정보를 쓰지 않는 전제에서 CSRF를 끈다(자체 설계 판단, 조건은 `design-revision-v1.2.md` 7.5장). 서버 측 즉시 토큰 폐기는 제외한다. 한계(XSS, 탈취, 만료, 로그아웃)는 7.5장에 기록했다.

### 4. DB·주문 설계
- 승인: `members`, `products`, `product_options`(사이즈별 재고), 브랜드 필터, 주문번호·가격 스냅샷·주문 총액·주문 상태, 옵션 단위 비관적 락, 주문 생성+재고 차감 단일 트랜잭션, 회원별 멱등성 키 유니크 제약, 동일 키·동일 요청은 기존 주문 반환, 동일 키·다른 요청은 409, 키 충돌 시 롤백 후 별도 트랜잭션 재조회
- 구현 전 협의: 브랜드 테이블 분리, `size_mm` 범위, 상품명·사이즈 스냅샷, 상태 초기값, 재전송 응답 코드, `ProblemDetail`·타인 주문 404
- **주문 처리 순서 오류 발견**: 재고 확인이 키 재확인보다 앞서면 같은 키의 동시 중복 요청이 `OUT_OF_STOCK`으로 잘못 처리될 수 있다. 수정안(락 → 키 재확인 → 재고, READ COMMITTED)은 `design-revision-v1.2.md` 5.2.1. **협의 후 확정**한다.

### 5. 테스트
부분 TDD(DEC-023)를 유지한다. 재고 차감·수량 검증·금액 계산은 RED→GREEN→REFACTOR, 동시성·멱등성·롤백은 실제 MySQL 통합 테스트. 실제 결과와 예상 결과를 구분한다.

### 6. 로컬·배포
- 로컬: Spring Boot는 IDE 실행, React는 Vite 개발 서버, MySQL은 Compose, **MySQL 호스트 포트는 `127.0.0.1`에만 바인딩**
- 운영: EC2 1대, 컨테이너 3개, Nginx 프록시, 8080·3306 외부 공개 금지, MySQL Docker Volume
- 자동화: GitHub Actions 빌드·테스트, **GHCR 우선 검토, SSM 배포 우선 검토**, 일정 부족 시 이미지 등록 자동화 + 수동 배포, SSH 전체 공개 금지, 도메인·HTTPS는 배포 단계에서 확정

### 7. Git과 기존 파일
- GitHub 저장소는 개발 중 **Private**. 프로젝트 완료 후 민감 정보·개인 경력 관련 문서(`docs/01-project-plan.md` 등)를 검토한 뒤 Public 전환 여부를 결정한다.
- 기존 생성 파일은 유지한다. `.gitignore`는 `.env` 패턴을 검토해 `.env.example`만 예외 처리하도록 개발자가 직접 수정한다. 빈 디렉터리와 `.gitkeep`은 프로젝트 생성 단계에서 개발자가 직접 정리한다.

### 8. 학습 모드
Claude는 코드·설정·테스트 실행·Git·배포를 직접 하지 않는다. 개념, 공식 문서 근거, 단계별 예시, 리뷰, 학습 기록을 맡는다.
