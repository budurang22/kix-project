---
paths:
  - "frontend/**"
---

# 프론트엔드 컨벤션

## 1. 네이밍

- 컴포넌트 PascalCase / 함수·변수 camelCase / Custom Hook `use` 접두사 / 이벤트 핸들러 `handle` 접두사
- Boolean `is`/`has` 접두사 / 상수 UPPER_SNAKE_CASE / CSS 클래스 kebab-case
- 파일명 (확정, DEC-019): React 컴포넌트 파일은 PascalCase(`ProductCard.jsx`), 그 외 프론트엔드 파일은 kebab-case(`use-auth.js`, `api-client.js`)

## 2. 디렉터리 구조 (기본안)

`assets/`, `components/`(공통 UI), `features/`(도메인별 기능), `pages/`, `hooks/`, `api/`, `layouts/`, `routes/`, `styles/`, `utils/`

- 공통 UI와 도메인 기능을 분리한다.
- API 호출 로직은 `api/`에 모으고 UI 렌더링과 분리한다. 컴포넌트에서 `fetch`를 직접 호출하지 않는다.

## 3. 스타일

- 들여쓰기 2칸, 세미콜론 사용, `const` 우선, 비교는 `===`
- **Tailwind CSS**가 기본 스타일링 도구다 (확정, DEC-020). 유틸리티 클래스가 기본이고, 직접 작성하는 CSS 클래스는 kebab-case. 적용 버전의 공식 설치 문서(`docs/tech-stack.md`)를 따르고, Vite 8과의 호환은 설치 단계에서 확인한다.
- 스택: React, JavaScript, Vite, Tailwind CSS, React Router, Axios. 새 라이브러리는 승인 없이 추가하지 않는다.
- 디자인 토큰(`design/tokens`)을 CSS 변수(Tailwind `@theme`)로 연결해서 쓴다. 색상 값을 임의로 쓰지 않는다.
- 승인된 디자인 시안만 구현한다 (`design-gate.md`). 시안 파일 배치와 React 적용도 개발자가 직접 한다.

## 4. 동작

- 주문 요청마다 `Idempotency-Key`(UUID)를 만들어 헤더로 보내고, 재시도에는 같은 키를 재사용한다.
- Access Token은 **React 메모리(상태·모듈 변수)에만** 저장한다. localStorage, sessionStorage, 쿠키에 저장하지 않는다 (DEC-024). 새로고침·만료 시 재로그인한다. `dangerouslySetInnerHTML`은 쓰지 않는다.
- 구현 후 브라우저 캡처를 승인된 시안과 비교한다.
