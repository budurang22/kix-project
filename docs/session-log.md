# 세션 기록

세션마다 맨 아래에 항목을 추가한다 (`/wrap-up`).

## 세션 1 — 2026-11-26

- 목표: Notion 기획 검토, 프로젝트 초기 설정, 설계 수정안 작성
- 한 일
  - Notion 하위 문서 10개와 SVG 10개 검토 후 검토 보고서 전달
  - 사용자 협의 사항 반영: docs 기준, 사이즈 옵션·브랜드 필터 MVP 포함, 협업 모드, 비밀값·배포 정책
  - 로컬 환경 점검, 디렉터리·메모리·규칙·스킬·설정 파일 생성
  - 기획 문서 10개를 Markdown으로 정리하고 수정안 v1.2 작성
- 변경 파일: `CLAUDE.md`, `README.md`, `.gitignore`, `.env.example`, `.claude/**`, `docs/**`, `design/**`
- 테스트 결과: 실행한 테스트 없음 (구현 없음). 로컬 도구 버전은 명령으로 확인함.
- 확인하지 못한 것
  - Spring Boot 공식 지원 기간 표 (spring.io 페이지 HTML에 표가 없었음)
  - SessionStart hook, 권한 패턴의 실제 동작 (다음 세션에서 확인)
- 다음 작업: `progress.md` 4장 참고
- 비고: Notion은 읽기만 했고 수정하지 않았다. Git 커밋·푸시는 하지 않았다.

### 세션 1 (이어서) — 학습 모드 확정

- 목표: 직접 코드 작성 권한 철회, 학습 모드·컨벤션·Git 전략을 AI 협업 환경에 반영
- 한 일
  - DEC-013 확정: Claude는 멘토·가이드·리뷰어, 직접 구현 금지
  - `.claude/rules/` 10개로 재구성 (`collaboration.md` 삭제, `learning-mode.md` 등 추가), `wrap-up` 스킬 갱신
  - `.claude/hooks/guard.py` 작성 후 허용·차단 29케이스 실행 검증, `settings.json`에 연결
  - `decisions.md`(DEC-013~016), `references.md`(컨벤션·도구), `docs/learning/README.md`, `progress.md` 갱신
  - Google Java Style, Conventional Commits, Spotless, Claude Code permissions/hooks, Testcontainers 공식 문서 확인
- 개발자가 직접 작성한 파일: 없음
- 학습한 기술: 없음 (학습 시작 전)
- 코드 리뷰 결과: 해당 없음
- 실제 테스트 결과: 가드 스크립트 29/29 통과 (스크립트 단독 실행). Claude Code 안에서의 실제 hook 호출은 미검증
- 발견한 컨벤션 충돌: 들여쓰기(Google 2칸 vs 전역 4칸), `member` 패키지 vs `users` 테이블, 프론트 파일명, 복합 PK → DEC-014
- 이전 세션에서 만든 개발 관련 파일은 삭제하지 않고 `progress.md` 4장에 목록화
- 다음 작업: `progress.md` 5장 참고

### 세션 1 (이어서) — 배포 아키텍처 확정, 2026-11-27

- 목표: EC2 단일 인스턴스 + Docker Compose + Nginx + GitHub Actions 배포 아키텍처를 문서화
- 한 일
  - `docs/tech-stack.md`(현행 기술 스택·배포 아키텍처) 작성, `07-tech-stack.md`에 현행 문서 안내 추가
  - `decisions.md` DEC-017(배포 확정), DEC-018(Tailwind) 추가, DEC-010 보강
  - `references.md` 6장에 Compose, Nginx, GitHub Actions, OIDC, SSM, EC2, Certbot, ACM, Tailwind 기록
  - `.claude/rules/infra.md` 추가, `frontend.md`·`CLAUDE.md` 갱신
  - 가드 버그 수정: 리다이렉션 토큰(`2>&1`)을 명령 인자로 오인해 `git branch`를 차단하던 문제. 수정 후 재시험 통과
- 개발자가 직접 작성한 파일: 없음. 학습 단계 1(Git 기준선)도 아직 시작 전
- 실제 테스트 결과: 가드 스크립트 수정 후 케이스 재시험 통과(스크립트 단독 실행). 배포 관련은 설계·문서 확인만 했고 실행 검증은 없다.
- 확인하지 못한 것: SSM Agent 요건, MySQL 서비스 컨테이너 설정, GHCR/ECR 비교, ACM 내보내기 비용·절차, EC2 요금의 리전 기준, 실제 메모리 사용량
- 다음 작업: `progress.md` 5장 참고

### 세션 1 (이어서) — 컨벤션·기술 스택·TDD 확정, 원문 검증, 2026-11-27

- 목표: 협의 사항 반영(컨벤션, 기술 스택, 배포, 인증 검토, AI 환경 검증, 부분 TDD)과 공식 문서 원문 검증
- 한 일
  - 공식 문서 원문 검증: Spring Boot 지원 기간(공식 Spring API), 요구사항, 관리 의존성, Spring Security CSRF, springdoc, Spotless, google-java-format, 프론트·품질 도구, MySQL·HikariCP·Flyway, Claude Code 권한·Hook·스킬·규칙, 테스트 스택. 결과는 `references.md` 7장
  - **Boot 3.5.x의 OSS 지원이 2026-06-30에 종료**된 것을 공식 API로 확인 (이전에는 제3자 출처만 있었음)
  - `design-revision-v1.2.md`: `users`→`members` 전체 반영, 인증 비교(로그아웃·XSS·CSRF), 검토 항목 요약표, MySQL CHECK 서술 정정(8.0.16 근거를 원문에서 확인하지 못해 "미확인"으로 변경)
  - `decisions.md`: DEC-006 보강, DEC-019(컨벤션), DEC-020(기술 스택), DEC-021(배포 보강), DEC-022(AI 환경 검증), DEC-023(부분 TDD)
  - `tech-stack.md` 전면 개정, `.claude/rules/` 갱신(`testing.md` TDD, `backend.md`, `database.md` 등), `docs/ai-env-verification.md`, `docs/learning/tdd.md` 추가
  - 실제 세션에서 hook(Bash)과 권한 규칙(`Read(./.env)`, `Edit(./backend/**)`) 동작 확인, 첫 커밋 전 민감 정보·개인 경로 점검(해당 없음)
- 개발자가 직접 작성한 파일: 없음. 학습 단계 1(Git 기준선)은 아직 시작 전
- 실제 테스트 결과: 가드 수정 후 재시험 통과(스크립트 단독 8건 + 변수 조립 3건). 그 밖의 검증은 문서 확인이며 실행하지 않았다.
- 정정한 내용: 앞서 "CHECK는 MySQL 8.0.16부터"라고 적었으나 MySQL 8.4 원문 페이지에서 확인되지 않아 "미확인"으로 바꿨다.
- 발견한 충돌: GitHub Actions 배포 자동화 vs "SSH는 개발자 IP만", 로컬 MySQL 접속 vs "호스트에 게시하지 않음"
- 확인하지 못한 것: `references.md` 7.5장
- 다음 작업: `progress.md` 6장 참고

### 세션 1 (이어서) — 개발 시작 전 최종 결정 반영, 2026-11-27

- 목표: 확정된 스택(Boot 4.1.x)·백엔드 설계·인증·DB/주문·로컬/배포·Git 정책을 기존 문서에 반영하고 개발 시작 준비
- 한 일
  - Boot 4.1.3 기준 원문 확인: 요구사항(Java 17~27, Gradle 8.14+/9.x), 4.0 마이그레이션 가이드(스타터 이름, 테스트 스타터 분리, Jackson 3), 4.1 릴리스 노트, 관리 의존성(일부는 요약)
  - Spring Security 7.2.0 문서 원문으로 CSRF·STATELESS·BCrypt·401/403 검토, npm 레지스트리 메타데이터로 React Router 7.x·Tailwind×Vite 8 호환 확인, MySQL 8.4 일관된 읽기·잠금 읽기·중복 키 잠금 문서 확인
  - **설계 오류 발견**: 재고 확인이 키 재확인보다 앞서면 같은 키의 동시 중복 요청이 `OUT_OF_STOCK`으로 잘못 처리됨. 수정안과 T-02b를 `design-revision-v1.2.md` 5.2.1에 기록(협의 대기)
  - 기존 문서 수정(새 문서 없음): `tech-stack.md`, `decisions.md`(DEC-024 추가, DEC-006·008·021 갱신), `design-revision-v1.2.md`(승인 현황, 7.5, 5.2.1), `references.md` 8장, 규칙 파일(`backend`·`security`·`frontend`·`infra`·`git`·`testing`)
- 개발자가 직접 작성한 파일: 없음. 학습 단계 1(Git 기준선)은 아직 시작 전
- 실제 테스트 결과: 실행한 테스트 없음 (문서 작업). `backend.md`에 POJO·AOP 지침이 없어서 해당 부분만 추가
- 확인하지 못한 것: `references.md` 8.1장 (4.1 테스트 문서, Initializr의 4.1.3 비-SNAPSHOT 선택 여부, 요약 행, `FOR SHARE`의 간격 잠금 영향 등)
- 다음 작업: `progress.md` 5장 참고
