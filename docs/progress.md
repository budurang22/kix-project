# 진행 상황

마지막 갱신: 2026-11-27 (ChatGPT 협업 방향 반영, DEC-030. 코드 상태는 `af560f1` 기준으로 소스와 대조함)

## 0. 다음 세션 시작점 (먼저 읽기)

- **영역별 현황 (DEC-031)**
  - 백엔드(개발자 직접·Claude 멘토링): 인증까지 구현, 상품 조회 API 착수 전 (아래 상세).
  - 프론트엔드(Codex 전담, Claude는 읽기 전용): 커밋·문서로 확인된 구현 없음. 2026-11-28 기준 `frontend/`는 `.gitkeep`뿐(미커밋). Codex 작업은 별도 worktree의 `feature/frontend-*` 브랜치에서 진행 예정이며 확인되면 여기에 기록한다.
  - 디자인(ChatGPT): 컨셉 방향만 승인, 화면별 시안·로고·이미지 없음 (`design/approved.md`).
  - 통합(API 연동 검증): 없음. 계약 기준은 `docs/06-api-spec.md`.
- **현재 작업 디렉터리 브랜치**: 2026-11-28 확인 시 `feature/frontend-init`(개발자가 전환한 것으로 보임, 이 브랜치에 프론트 구현은 없음). 백엔드 파일 `RestSecurityExceptionHandler.java`가 수정된 상태로 미커밋이다. 백엔드 작업과 Codex 작업은 작업 디렉터리를 분리한다.

- **현재 개발 단계**: 백엔드 — 인증까지 병합 완료, 상품 조회 API 착수 전. 소스 확인: `ProductController`·`ProductService`·상품 DTO는 **아직 없다**(`domain/product`에 entity·repository·exception만 있음). 주문 도메인(`domain/order`) 없음. 프론트엔드는 `frontend/.gitkeep`뿐(미착수, 시안 대기).
- **협업**: ChatGPT(디자인·기획 교차 검토)와 병행한다(DEC-030). 디자인 컨셉은 방향만 승인(`design/approved.md` 4장), 화면별 시안은 전부 "시안 없음"이라 **시안을 기다리지 않고 백엔드를 계속한다**. 시안이 전달되면 `design/` 구조와 비교해 위치를 안내하고, 파일 이동·브랜치(`docs/design-system` 검토)·커밋은 개발자가 한다.
- 브랜치: 현재 `develop`(최신 `af560f1`, PR #1~#5 병합 완료, 원격과 동기화). 진행 중인 기능 브랜치 없음 — `feature/auth-bearer` 등 기존 브랜치는 모두 병합됨. 다음 작업은 새 브랜치 `feature/product-api`에서 시작한다(개발자가 직접 생성).
- **다음 작업**: ① 상품 조회 API(목록, 상세, 브랜드 필터) → ② 주문 생성(핵심 부분 TDD: 재고 차감, 가격 스냅샷, 멱등성, 동시성). 합의한 우선순위는 "백엔드 핵심 먼저, 프런트·배포는 마감 후"(추천안 A)이며 사용자의 최종 선택은 아직 받지 않았다(미확정). 마감 2026-11-30.
- **시작 전 확인할 것**: `git status -sb`에서 `MemberRepositoryTest.java`가 스테이징된 삭제(`D `)로 보이면 `git restore --staged backend/src/test/java/com/kix/domain/member/repository/MemberRepositoryTest.java`로 취소한다(작업 폴더의 파일은 커밋 버전과 동일함을 확인했다). 다음 커밋에 삭제가 섞이는 것을 막기 위해서다.
- 이 파일(`progress.md`)의 변경은 아직 커밋되지 않았다.
- 구현 완료(개발자 직접 작성, 테스트 17개 통과를 개발자가 실행해 보고함, 결과 파일로 확인):
  - DB: `V1__init.sql` 7개 테이블(DBeaver로 직접 실행), 로컬 MySQL 8.4.13 Compose
  - member: `Member`, `Role`, `MemberRepository`, 회원가입·로그인 API
  - product: `ProductOption.decreaseStock`(**TDD**, RED 5개 실패 → GREEN 5개 통과), `Brand`, `Product`, `ProductStatus`, Repository 3개 (엔티티 매핑 테스트는 구현 후 작성)
  - 인증: JWT 발급·검증(oauth2-resource-server, HS256, 60분, DEC-028), 401/403 핸들러, `/api/admin/**` ADMIN 전용, 임시 `GET /api/members/me`. 401/403은 `SecurityTest`(MockMvc 3개)로 고정
- 확인 상태: Postman으로 가입 201·중복 409·입력 오류 400·로그인 200/401은 사용자가 예상대로라고 보고했다. **Bearer 토큰 실토큰 확인(없음 401, 정상 200, 위조 401, USER가 admin 403)은 사용자 결과 보고를 아직 받지 못했다(미확인).**
- 학습 완료로 보기 어려운 것: 구현은 끝났지만 면접형 이해도 확인 질문은 아직 하지 않았다(재고 차감 TDD, JWT·401/403 구분 후 진행 권장).
- 미해결: 자동 테스트와 수동 시험이 같은 DB를 써서 `test@kix.com` 잔여 데이터로 `MemberRepositoryTest`가 한 번 실패했다(DEC-029, 배포 전 정리). `@Transactional` 테스트는 롤백되지만 Postman 가입 데이터는 남으므로 시험 후 `DELETE ...; COMMIT;`(DBeaver Manual 커밋 주의).
- 알려진 이력 흠: 커밋 `731b88a`의 메시지("Bearer 토큰 검증과 401/403")는 실제 내용(로그인·JWT 발급)과 다르다(병합된 이력이라 그대로 둠). Bearer 부분은 `6c6aac6`(PR #5).
- 로컬 실행: 터미널은 루트에서 `set -a; source .env; set +a` 후 `./gradlew cleanTest test`. IntelliJ 앱 실행은 실행 설정의 Environment variables에 `MYSQL_USER`·`MYSQL_PASSWORD`·`MYSQL_DATABASE`·`JWT_SECRET`이 필요하다(값은 `.env`, 채팅에 붙이지 않는다).
- 협의 대기(주문 직전): 주문 처리 순서 수정안 `design-revision-v1.2.md` 5.2.1, 재전송 응답 코드(200/201), 타인 주문 404, 4.2 테스트 문서 읽기(`@AutoConfigureMockMvc`는 `org.springframework.boot.webmvc.test.autoconfigure` 패키지임을 4.2.0 JAR에서 확인함).
- 작업 방식 주의: 사용자는 터미널에 오류 로그를 붙여 넣으면 명령으로 실행되는 문제가 있었다("채팅에만 붙이기" 안내). 커밋·PR은 **한 번에 하나씩 결과를 확인**하며 진행한다(커밋 후 바로 PR로 가서 파일이 누락된 적 있음).

## 1. 현재 단계

AI 협업 환경과 공통 규칙 구성은 **마무리**했다. 신규 기술 도입은 중단했고(DEC-024) 개발을 시작한다.
**개발자가 직접 구현하는 학습 모드**(DEC-013)이며 핵심 주문 도메인에만 부분 TDD를 적용한다(DEC-023).
구현 완료: 최초 커밋(`b4fe499`), `develop`·`feature/project-init` 브랜치, GitHub Private 저장소 `kix-project` 연결과 첫 push (개발자가 직접 수행, 읽기 전용으로 확인). JDK 21 설정(학습 단계 3)과 IntelliJ(Spring Boot 마법사)로 백엔드 프로젝트 생성(학습 단계 4)을 마쳤고, Boot 빌드 성공을 확인했다(개발자 실행, 매니페스트로 검증). Boot 버전은 4.1.3으로 한 번 맞췄다가 **4.2.0으로 확정**했다(DEC-025). Lombok을 `build.gradle`에 추가했다(DEC-026). **로컬 MySQL Docker Compose(학습 단계 5) 완료**: `infra/docker-compose.yml`, mysql:8.4, `127.0.0.1:3306`, 볼륨 영속, 터미널에서 `SELECT VERSION()` 8.4.13과 `kix` DB 확인(개발자 실행). 기존 Homebrew MySQL과 이전 Docker 컨테이너(`mysql_db`)는 중지했다(DEC-027). 커밋·push는 확인 대기. 학습 완료: 없음. 백엔드 DB 연결 설정(학습 단계 6)은 `./gradlew cleanTest test` 성공으로 확인했다(`contextLoads` 통과, Hikari·JPA 기동). 다음은 **ERD/DDL**(학습 단계 7, 브랜치 `feature/db-schema`)이다. 마감은 2026-11-30이다.

## 2. 확정된 것 (DEC-024)

- 스택: Java 21, **Spring Boot 4.2.0**(DEC-025), Gradle Wrapper, MySQL 8.4 LTS, React·Vite·Tailwind·**React Router 7.x**·Axios, Docker·Compose·Nginx·EC2·GitHub Actions
- 인증: JWT 60분, Bearer, **React 메모리 저장**, Stateless, Refresh 제외, 401/403, CSRF 비활성화(쿠키 미사용 전제)
- DB·주문: `members`, `product_options`(사이즈별 재고), 옵션 단위 비관적 락, 멱등성, 가격 스냅샷 (승인 현황: `design-revision-v1.2.md`)
- 로컬: Boot IDE 실행, Vite, MySQL Compose(호스트 포트 `127.0.0.1`만) / 배포: GHCR·SSM 우선 검토, 일정 부족 시 이미지 등록 자동화 + 수동 배포
- Git: GitHub **Private**, 완료 후 Public 전환 여부 검토

## 3. 개발을 막지 않는 협의 대기 (구현 직전에 해당 단계에서)

| 항목 | 필요한 시점 |
| --- | --- |
| ~~Boot 버전~~ | 해소: 4.2.0 확정 (DEC-025). 4.2 기준 요구사항·관리 의존성은 `references.md` 9장 |
| 주문 처리 순서 수정안 (`design-revision-v1.2.md` 5.2.1) | 주문 구현·TDD 직전 |
| 브랜드 테이블 분리, `size_mm` 범위, 상품명·사이즈 스냅샷, 상태 초기값 | DDL 작성 직전 |
| 재전송 응답 코드(200/201), `ProblemDetail`·타인 주문 404 | API 구현 직전 |
| ~~개발 순서(DEC-005)~~ | 해소: 개발 먼저, 배포는 마지막 (2026-11-28) |
| 4.2 테스트 문서 읽기 | 테스트 구현 직전 |
| 배포: SSM 요건, GHCR 인증, 도메인·HTTPS, EC2 사양(실측 후) | 배포 단계 |
| Flyway(보류), JWT 라이브러리 비교 | DDL / 인증 단계 |
| ~~Lombok 사용 여부~~ | 해소: 사용 (DEC-026), `build.gradle`에 개발자가 직접 추가 |
| 기존 EC2 2개 구성 설명 | 아무 때나 (`tech-stack.md` 11.2장 보정) |

## 4. 이전 세션에서 만든 개발 관련 파일 (처리 방침)

| 파일 | 방침 |
| --- | --- |
| `backend/.gitkeep`, `frontend/.gitkeep`, `infra/.gitkeep` | 프로젝트 생성 단계에서 **개발자가 직접 정리** |
| `.gitignore` | 유지. `.env`, `.env.*`를 무시하고 `!.env.example`만 예외 처리하도록 **개발자가 직접 수정** |
| `.env.example`, `README.md` | 유지. 첫 커밋 전에 개발자가 내용을 검토 |
| `design/` 아래 파일 | 참고 자료로 유지 |

## 5. 다음 작업

1. (개발자) 시작 전 정리: 스테이징된 `MemberRepositoryTest` 삭제 취소(0장), `progress.md`·`CLAUDE.md`·`design/approved.md`·`design-gate.md`·`decisions.md` 문서 변경 커밋(`docs/` 브랜치 또는 기능 브랜치와 분리해 하나씩 확인)
2. **상품 조회 API**(`feature/product-api`): 목록·상세·브랜드 필터. 구현 전에 요청·응답 JSON 먼저 설계
3. **주문 생성**(부분 TDD): 재고 차감, 가격 스냅샷, 멱등성, 동시성. 직전에 협의 대기 항목(3장) 해소
4. 핵심 기능 후 면접형 이해도 확인 질문(`learning-mode.md` 5장)
5. 시안 전달 시: 화면 상태를 `design/approved.md`에서 확인 → 프론트 초기 환경 구성(Vite·Tailwind, 시안 없이 가능)은 백엔드 핵심 이후
6. **배포는 마지막 단계** (DEC-005): 운영 Dockerfile·Compose, Nginx, EC2, GitHub Actions, HTTPS

## 6. 미해결 사항

- SessionStart hook은 `resume`에서 동작 확인(2026-11-28). `startup`·`clear`·`compact`, `/wrap-up`, Notion `ask`, `paths` 규칙은 미확인 (`ai-env-verification.md`)
- 원격 저장소: 최초 push가 `Repository not found`로 실패했으나 저장소 이름을 `kix-project`로 맞춰 해결 (2026-11-28 확인). 커밋 전 변경: `.claude/hooks/guard.py`(읽기 전용 `git check-ignore` 허용), `docs/ai-env-verification.md`, `docs/progress.md` — 별도 커밋 필요
- 공식 문서로 확인하지 못한 항목: `references.md` 7.5장, 8.1장
- 디자인 시안 제작·승인: 컨셉 방향만 승인(DEC-030), 화면별 시안·로고·이미지 원본은 ChatGPT 제작 대기 (`design/approved.md` 화면 상태 전부 "시안 없음")
- 이 문서 1장의 "다음은 ERD/DDL" 서술은 과거 기록이다. 현재 위치는 0장이 기준이다.
- 일정: 마감 2026-11-30까지 3일. 학습 목적을 우선하고 선택 기능부터 제외한다.
