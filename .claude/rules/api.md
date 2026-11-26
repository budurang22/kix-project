---
paths:
  - "backend/**"
  - "docs/06-api-spec.md"
  - "docs/design-revision*.md"
---

# REST API 컨벤션

- 리소스 중심 URL, 경로는 복수형 (`/api/orders`)
- HTTP Method의 의미에 맞게 사용하고 적절한 상태 코드를 반환한다.
- 요청·응답 DTO를 분리하고 입력값을 검증한다.
- 공통 오류 응답 구조를 정의한다 (제안: Spring `ProblemDetail`).
- 페이지네이션 규칙 통일 (제안: `page` 0부터, `size` 기본 20·최대 100, `sort`)
- 인증·인가 정책을 명확히 한다. 401은 인증 실패, 403은 권한·소유자 불일치.
- 멱등성이 필요한 API는 별도로 정의한다 (`POST /api/orders`의 `Idempotency-Key`).
- **구현 전에 요청·응답 JSON 예시를 먼저 보여준다.**
- Swagger/OpenAPI를 적용하면 설정 방법과 사용 목적을 설명한다.
- 상세 명세는 `docs/design-revision-v1.2.md` 4장(승인 후 `06-api-spec.md`)을 따른다.
