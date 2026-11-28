# KIX 프론트엔드

## 1. 실행

frontend 폴더에서 `npm ci`, `npm run dev`를 실행합니다. Node 24.21.0 / npm 11.19.0에서 검증했습니다.

기본 API 주소는 `/api`, 개발 프록시 대상은 `http://localhost:8080`입니다. `.env.example`은 공개 설정만 포함합니다. 운영에는 기존 Nginx `/api` 프록시와 SPA fallback이 필요합니다. 운영 설정은 변경하지 않았습니다.

## 2. Phase 1·2 보고 (2026-11-28)

1. **완료 기능**: React/Vite/Tailwind, ESLint/Prettier, 기본 라우팅, Header/Footer·검색, 버튼·입력·모달·페이지네이션·로딩/오류/빈 상태, Axios, 메모리 인증·만료·로그아웃, 회원/관리자 접근 제어. API 연결을 위한 기본 로그인·회원가입 화면 포함. 최종 시안 구현은 아닙니다.
2. **생성 파일**: package.json/lockfile, Vite/ESLint/Prettier/EditorConfig 설정, .env.example, index.html, src의 api/components/features/auth/hooks/layouts/pages/routes/styles, tests, 이 문서. 기존 .gitkeep 보존. 작성 범위는 frontend 내부입니다.
3. **기술 결정**: React 19.3.1, Vite 8.4.0, Router 7.18.7, Tailwind 4.3.5, Axios 1.21.1. npm 레지스트리와 실제 설치로 버전·peer 호환성을 확인했습니다. @eslint/js는 별도 버전인 10.0.1 사용. JSX는 Vite 기본 변환 사용. React 상태 보존용 HMR 플러그인은 미도입. 토큰은 React가 구독하는 메모리에만 저장하며 이전 요청의 401이 새 세션을 지우지 않도록 토큰을 비교합니다. expiresIn은 실제 백엔드 기준 초 단위입니다.
4. **실행 명령**: 승인받은 git switch -c feature/frontend-init, npm view, npm install, npm ls --depth=0, npm run format, npm run build, npm run lint, npm test, npm run format:check, npm run dev -- --host 127.0.0.1, curl. 초기 @eslint/js 버전 오류는 레지스트리 확인 후 수정했습니다. 네트워크·포트 제한은 승인된 실행으로 검증했습니다.
5. **검증 결과**: 빌드·ESLint·포맷 검사 성공. React Router use client 지시문 빌드 경고 1건. Node 테스트 4개 통과: 세션 경쟁 상태, 오류 메시지, Axios adapter 기반 Bearer/401/403, SSR 라우팅. SSR은 공개 화면·비로그인 회원 정보 비노출·USER 관리자 거부·ADMIN 준비 화면을 확인합니다. 브라우저 리다이렉트 검증은 아닙니다. /, /login, /admin HTTP 200은 SPA HTML 제공만 확인했습니다. 설치 audit 취약점 0개. 브라우저/Playwright 환경이 없어 모바일·키보드·모달·브라우저 로그인/로그아웃은 미검증입니다.
6. **Mock 사용**: src/api/mocks/products.js는 임시 표시 모델이며 백엔드 DTO가 아닙니다. MOCK/구매 불가 표시, 이미지 준비 중 상태를 사용합니다. Mock 검색 외 브랜드 필터·상품 상세·주문·좋아요·리뷰·관리자 CRUD는 미구현입니다.
7. **백엔드 연동**: POST /api/auth/login, POST /api/auth/signup, GET /api/members/me 호출 코드를 실제 Controller/DTO에 맞췄습니다. 로그인 후 me 성공 시 세션 저장. me의 id/role만 표시. 실서버 회원가입·로그인은 실행하지 않았으며 DB도 변경하지 않았습니다. adapter 테스트와 실서버 검증은 구분합니다.
8. **확인 필요**: 상품 공개 조회와 현재 SecurityConfig 인증 필수 정책 조율, 상품 DTO·페이징, 주문 멱등성 명세, 승인 디자인 전달. Pretendard는 우선 폰트명만 지정하고 파일 미전달로 폴백합니다. 간격·브레이크포인트는 임시값입니다. 이번 사용자 지침의 직접 구현 허용을 우선했으며 공통 문서·백엔드는 변경하지 않았습니다. 기존 변경과 스테이징 삭제도 보존했습니다.
9. **다음 작업**: Phase 3 상품 검색·필터·상세/옵션 → Phase 4 주문/마이페이지 → Phase 5 관리자 → Phase 6 승인 리소스 → Phase 7 실서버·브라우저 검증. 주문 재시도 키·재고 갱신은 주문 구현 시 추가합니다. 미구현 기능을 실제 성공처럼 표시하지 않습니다.
10. **권장 커밋**: feat(frontend): 초기 환경과 공통 UI 및 인증 기반 구성. 커밋·push·PR은 미실행입니다.

## 3. 공식 참조

- [Vite](https://vite.dev/guide/)
- [Tailwind Vite 설치](https://tailwindcss.com/docs/installation/using-vite)
- [React Router 7](https://reactrouter.com/7.9.6/start/declarative/installation)
- [Axios 인터셉터](https://axios.rest/pages/advanced/interceptors)

브랜드 색상은 design/tokens/tokens.json과 사용자 지침을 CSS @theme에 반영했습니다. 보조 패키지는 ESLint용 @eslint/js·globals·Hooks 플러그인입니다. 별도 UI·상태·테스트 프레임워크는 도입하지 않았습니다.
