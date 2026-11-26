# Git 규칙

Claude는 Git 명령어와 실행 이유를 **설명**하고, 개발자가 직접 실행한다. 읽기 전용(`status`, `diff`, `log`)은 Claude가 확인할 수 있다.

## 1. 브랜치 전략 (간소화 Git Flow)

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포 가능한 안정 버전 |
| `develop` | 개발 통합 |
| `feature/*` | 신규 기능 |
| `fix/*` | 버그 수정 |
| `refactor/*` | 구조 개선 |
| `docs/*` | 문서 변경 |
| `hotfix/*` | 운영 긴급 수정 |

- 이름은 소문자 kebab-case: `feature/project-init`, `feature/auth`, `feature/product-crud`, `feature/product-options`, `feature/order`, `feature/order-concurrency`, `feature/order-idempotency`, `feature/frontend-layout`, `feature/deployment`
- `main`, `develop`에서 직접 기능 개발을 하지 않는다. 최초 저장소 초기화 이후에는 기능 브랜치 → 테스트 → PR로 병합한다.
- `release` 브랜치는 운영하지 않는다.

## 2. 커밋 (Conventional Commits 1.0.0)

공식: https://www.conventionalcommits.org/en/v1.0.0/

- 형식: `type(scope): 작업 내용` (제목은 한국어, 50자 안팎, 마침표 없음)
- type: feat, fix, docs, style, refactor, test, chore, build, ci, perf
- 본문이 필요하면 빈 줄 뒤에 "-"로 구분하고 **무엇을, 왜**를 적는다.
- 호환성을 깨는 변경은 `!` 또는 `BREAKING CHANGE:` 푸터로 표시한다.
- 한 커밋은 하나의 논리적 작업 단위다. 커밋 전에 변경 사항과 테스트 결과를 확인한다.
- 예: `chore(init): 프로젝트 초기 환경 구성`, `feat(order): 멱등성 기반 중복 주문 방지`, `test(order): 동시 주문 테스트 추가`

> 전역 CLAUDE.md의 `<type>: <subject>` 형식보다 이 규칙(scope 포함)이 우선한다.

## 3. Pull Request

`.github/PULL_REQUEST_TEMPLATE.md`는 Claude가 만들지 않는다. 작성 예시를 대화로 제공하고 개발자가 직접 만든다.
PR 항목: 관련 요구사항 ID / 작업 목적 / 주요 변경 사항 / 기술 선정·적용 이유 / 공식 문서 URL / 실제 테스트 결과 / UI 변경 시 캡처 / 보안·컨벤션 확인 / 설계 문서 변경 여부

## 4. 안전

`.env`와 비밀값은 커밋하지 않는다. 스테이징 전에 `git status`로 확인하도록 안내한다. `.gitignore`는 `.env`, `.env.*`를 무시하고 `!.env.example`만 예외로 한다 (개발자가 직접 수정).
GitHub 저장소는 개발 중 **Private**이다. 완료 후 민감 정보와 개인 경력 관련 문서를 검토한 뒤 Public 전환 여부를 정한다. 원격 연결과 push는 별도 승인을 받는다.
