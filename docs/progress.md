# 진행 상황

마지막 갱신: 2026-11-27 (세션 1, 개발 시작 전 최종 결정 반영)

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

1. 백엔드 프로젝트 커밋·push (Boot 4.2.0 빌드 재확인 후, 개발자가 직접)
2. **로컬 MySQL Docker Compose**(개발용): Docker Desktop 실행, 호스트 포트 결정(3307 추천), `infra/` 아래 직접 작성
3. 백엔드와 DB 연결·기동 확인 → ERD/DDL → 인증 → 상품·옵션 → 주문(부분 TDD)
4. **배포는 마지막 단계** (DEC-005): 운영 Dockerfile·Compose, Nginx, EC2, GitHub Actions, HTTPS
5. SessionStart(`resume` 확인 완료) 외 `/wrap-up` 등은 `docs/ai-env-verification.md`에서 병행 확인

## 6. 미해결 사항

- SessionStart hook은 `resume`에서 동작 확인(2026-11-28). `startup`·`clear`·`compact`, `/wrap-up`, Notion `ask`, `paths` 규칙은 미확인 (`ai-env-verification.md`)
- 원격 저장소: 최초 push가 `Repository not found`로 실패했으나 저장소 이름을 `kix-project`로 맞춰 해결 (2026-11-28 확인). 커밋 전 변경: `.claude/hooks/guard.py`(읽기 전용 `git check-ignore` 허용), `docs/ai-env-verification.md`, `docs/progress.md` — 별도 커밋 필요
- 공식 문서로 확인하지 못한 항목: `references.md` 7.5장, 8.1장
- 디자인 시안 제작·승인 (`design/approved.md` 전부 "시안 없음")
- 일정: 마감 2026-11-30까지 3일. 학습 목적을 우선하고 선택 기능부터 제외한다.
