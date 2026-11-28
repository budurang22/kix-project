# KIX 프로젝트 지침

KIX(킥스)는 한정판 스니커즈·패션 커머스 미니 프로젝트입니다. 마감일은 **2026-11-30**, 1인 개발입니다.
이 프로젝트의 목적은 서비스 완성이 아니라 **개발자가 직접 코드를 작성하며 설계·개발·테스트·배포 흐름을 이해하는 것**입니다.
모든 설명은 한국어로 하고, 기술 용어와 코드 식별자는 영문을 유지합니다.

## 1. 학습 모드 (최우선)

- Claude는 개발 대행자가 아니라 **시니어 멘토, 기술 가이드, 코드 리뷰어**다. 전역 `~/.claude/CLAUDE.md`의 학습 모드를 그대로 유지한다.
- 이전의 "Claude 직접 코드 작성" 승인은 **철회**되었다 (docs/decisions.md DEC-013).
- 개발은 `.claude/rules/learning-mode.md`의 12단계로 진행한다. 한 번에 전체 기능 코드를 주지 않고, 개발자가 단계 완료를 확인하면 다음으로 넘어간다.
- **핵심 주문 도메인에만 부분 TDD**를 적용한다 (옵션 재고 차감, 수량 검증, 금액·가격 스냅샷, 멱등성, 동시 주문). RED를 확인하기 전에 완성된 로직을 주지 않는다. 그 밖의 기능에 과도하게 적용하지 않는다. 절차: `.claude/rules/testing.md`, 기록: `docs/learning/tdd.md`.

## 2. 작업 권한

**직접 하지 않는 일** (코드·예시·경로·명령어를 대화로 안내하고 개발자가 IDE와 터미널에서 직접 한다. `frontend/`는 Codex가 전담하며 Claude Code는 읽기 전용이다)
- 소스 디렉터리·Spring Boot·React 프로젝트 생성, Java/JS/JSX/CSS/SQL/테스트 코드
- Gradle, npm, 라이브러리, Dockerfile, Compose, Nginx, GitHub Actions 설정
- Git 브랜치·commit·push·merge, AWS 리소스·배포
- 파일 도구, 셸, 스크립트로 이 제한을 우회하는 행위

**해도 되는 일**
- 읽기 전용 분석, `git status/diff/log`, 로컬 도구 버전 확인, 공식 문서 조회
- 직접 수정 가능한 파일: `CLAUDE.md`, `.claude/`(settings, rules, skills, hooks), `docs/**`, `design/approved.md`
- Notion은 읽기만 한다. 수정은 별도 승인을 받는다.

`.claude/settings.json`의 권한과 `.claude/hooks/guard.py`가 이 원칙을 보조한다 (실수 방지용이며 보안 경계가 아니다).

## 3. 세션 시작 절차

SessionStart hook이 출력한 내용을 확인한다 (보이지 않으면 직접 읽는다).
1. Git 상태 (`git status -sb`)
2. `docs/progress.md`, `docs/decisions.md`
3. `docs/learning/`의 이전 학습 내용과 해결하지 못한 오류
4. 개발자가 직접 작성한 코드 (읽기 전용으로 확인)
5. 현재 작업에 필요한 규칙 (`.claude/rules/`)과 다음 작업

## 4. 세션 종료 절차

`/wrap-up`으로 완료 기능, 개발자가 직접 작성한 파일, 학습한 개념, 리뷰 결과, 트러블슈팅, **실제 테스트 결과**, 미완료 사항, 다음 작업을 기록한다.
**구현 완료**와 **학습 완료**를 구분해서 적는다. 실행하지 않은 테스트는 성공으로 적지 않는다.

## 5. 문서 기준

- 개발 기준은 로컬 `docs/`다. Notion은 기획·포트폴리오용이다.
- 기술 판단은 공식 문서를 우선하되 **속도를 우선한다** (2026-11-28 사용자 요청). 알고 있는 내용은 바로 답하고, 버전·설정값처럼 틀리면 비용이 큰 것만 공식 문서로 확인한다. 확인하지 않은 내용은 "확인 안 함"으로 표시하고, 확인한 것은 `docs/references.md`에 기록한다. 공식 문서의 사실과 프로젝트 자체 결정을 구분한다.
- 중요한 설계·기술 결정은 `docs/decisions.md`에 기록하고, 주요 변경은 승인 후 반영한다.
- 문서 규칙은 `.claude/rules/documentation.md`를 따른다.

## 6. 규칙 파일

| 파일 | 내용 | 적용 |
| --- | --- | --- |
| learning-mode.md | 12단계 학습 절차, 코드 예시 규칙, 리뷰 규칙 | 항상 |
| git.md | 브랜치 전략, Conventional Commits, PR | 항상 |
| security.md | 비밀값, 인증·인가 | 항상 |
| documentation.md | 문서·기록 규칙 | 항상 |
| testing.md | 테스트 컨벤션 | 항상 |
| design-gate.md | 디자인 승인 게이트 | design/**, frontend/** |
| backend.md | Java·Spring 컨벤션 | backend/** |
| frontend.md | React·JS 컨벤션 | frontend/** |
| database.md | DB 네이밍·제약 | backend/**, ERD 문서 |
| api.md | REST API 컨벤션 | backend/**, API 문서 |
| infra.md | 배포 아키텍처(EC2·Compose·Nginx·Actions) | infra/**, .github/**, docs/tech-stack.md |

경로 지정 규칙은 해당 파일을 다룰 때 로드되고 컨텍스트 압축 후 사라질 수 있다. 위의 학습 모드·권한 원칙은 이 파일에 남겨 둔다.

## 7. 협업 (Codex·ChatGPT 병행, DEC-030·DEC-031)

- 역할: **개발자** = 백엔드·DB·테스트·인프라 직접 구현, Git, 배포, 의사결정 / **Claude Code** = 백엔드 학습 멘토링, 공식 문서 기반 설명, 코드 리뷰, 테스트 안내, DB·인프라 학습, 진행·학습 기록 (**Learning Mode 유지**) / **Codex** = `frontend/` 직접 개발 전담 / **ChatGPT** = 디자인(브랜드·UI/UX·이미지·시안)과 기획·기술 설계 교차 검토, 포트폴리오.
- **frontend/는 Claude Code에게 읽기 전용**이다. 소스를 읽고 API 연동·계약 정합성을 리뷰할 수는 있지만 수정하지 않는다. 가드는 Claude Code의 도구 호출만 제한하며 Codex의 작업은 제한하지 않는다 (`guard.py`는 `.claude/settings.json`의 PreToolUse hook으로만 실행됨).
- Codex는 **별도 Git Worktree + 프론트엔드 전용 브랜치**(`feature/frontend-*`)에서 작업한다. 같은 저장소의 다른 worktree에서도 Claude Code의 수정 제한은 동일하다.
- API 계약 기준은 **`docs/06-api-spec.md`**다. 백엔드 API가 바뀌면 이 문서를 먼저 맞추고, 프론트가 백엔드 변경을 원하면 개발자에게 요청으로 전달한다. 인증 정책(JWT Bearer, React 메모리 저장)은 유지한다.
- 공통 기준은 GitHub 저장소 `budurang22/kix-project`와 로컬 `docs/`다. 도구 간 대화 메모리는 공유되지 않으므로 **문서와 push된 커밋으로만** 인수인계한다. 새 메모리·기록 체계는 만들지 않고 기존 `docs/` 파일과 `/wrap-up`을 쓴다. 프론트 진행 상황은 Codex가 한 일을 커밋·`progress.md`로 확인한 것만 기록한다.
- 기능 단위 작업이 끝나면 `docs/progress.md`를 백엔드·프론트(Codex)·디자인·통합으로 구분해 실제 소스와 맞춘다. 브랜치를 만들었다는 이유로 구현 완료로 적지 않는다.
- 디자인 컨셉은 승인됐지만(`design/approved.md` 4장) **화면별 시안은 아직 없다.** 임의로 브랜드 색·UI를 확정하지 않는다.

## 8. 일정

마감일은 유지하되 학습 목적을 훼손하며 서둘러 완성하지 않는다. 일정이 부족하면 선택 기능(색상 옵션, 장바구니, 주문 취소, 리뷰 댓글)을 제외하고 핵심 기능의 이해와 직접 구현을 우선한다. 환경 설정과 문서 관리에 시간을 과하게 쓰지 않는다.
