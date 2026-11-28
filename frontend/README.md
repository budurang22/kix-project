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

## 4. Phase 3 — 상품 탐색·상세 (2026-11-28)

1. **완료 기능**: 홈 브랜드 탐색·샘플 미리보기, 상품 검색+브랜드 복합 필터, URL 상태 보존, 페이지네이션, 품절·판매 중지 카드, 상세 이동, 사이즈별 재고·선택, 수량 상한과 옵션 변경 시 수량 초기화, 잘못된 상품 404 안내. 로그인·회원가입 기본 화면은 Phase 2 결과를 유지합니다.
2. **변경 파일**: `src/api/products-api.js`, `src/api/mocks/products.js`, `src/features/products/`, `src/utils/product-selection.js`, `src/hooks/use-resource.js`, `src/pages/{HomePage,ProductsPage,ProductDetailPage}.jsx`, `src/routes/AppRoutes.jsx`, `tests/products.test.js`, 이 문서.
3. **결정 근거**: 상품 Controller/DTO는 아직 없습니다. 상품 데이터 접근 경계를 products-api.js로 모으고 Mock 표시 모델을 유지합니다. 실제 API 경로·DTO·페이징 계약은 확정하지 않았습니다. 필터 또는 상품 경로가 바뀌면 리소스 소유 컴포넌트를 새로 마운트해 이전 결과·선택을 초기화하고 이전 비동기 응답을 무시합니다. 비정상 page는 0, 범위를 넘은 page는 마지막 결과 페이지로 처리합니다. 새 프로젝트 의존성은 없습니다.
4. **실행 명령**: git fetch origin, git worktree add -b feature/frontend-products /private/tmp/kix-frontend-products origin/develop, npm ci, npm run format, npm run build, npm run lint, npm test. 브라우저 검증 도구는 프로젝트 밖 임시 환경에 설치했습니다.
5. **검증**: 빌드·ESLint 성공, Node 테스트 6개 통과. 검색/필터/페이징, Mock 복사 격리, 없는 상품, 품절·판매 중지·수량 상한 테스트 추가. 기존 React Router use client 지시문 빌드 경고 1건 유지. 실제 서버·DB 검증은 실행하지 않았습니다.
6. **Mock**: 샘플 상품 10개, 브랜드 2개. 가격·재고·상품명은 가상 데이터입니다. 이미지 원본은 없어 준비 중 표시를 사용합니다.
7. **API 상태**: 인증은 기존 실제 API 호출 코드를 유지하고 상품·주문 서버 요청은 보내지 않습니다. 좋아요·리뷰 미구현 안내, 구매 버튼 비활성화로 실제 주문 성공을 가장하지 않습니다. 예상 금액도 샘플이라고 명시합니다.
8. **확인 필요**: 실제 상품/브랜드/옵션 DTO, 검색·페이지 응답 계약과 공개 조회 정책. 상세 이미지·로고·폰트·최종 시안 전달 대기. 백엔드·공통 문서·원래 작업 디렉터리의 변경은 수정하지 않았습니다.
9. **다음 작업**: 주문 API 명세 준비 상태에 맞춰 주문 의도·재시도 키·오류 처리와 마이페이지를 구현합니다. 상품 API가 먼저 준비되면 Mock 변환 경계에서 실제 연동합니다.
10. **권장 커밋**: feat(frontend): 상품 탐색과 상세 옵션 화면 구현.

브라우저 검증도 완료했습니다. Chromium에서 검색·브랜드 필터·페이지 이동/초기화, 상세 링크, 품절/판매 중지 옵션 차단, 수량 상한·옵션 변경 초기화, 구매 비활성화, 상품 404, 비로그인 마이페이지 리다이렉트, 잘못된 페이지 값, 1440/800/390/320px 화면을 확인했습니다. 목록은 4/3/2열이고 목록·상세 모두 가로 넘침이 없었습니다. 브라우저 pageerror 0개. 목록/상세 PC와 상세 모바일 스크린샷을 확인했습니다. 브랜드 선택의 접근 가능한 이름을 보완했고 테스트에서 헤더 검색과 목록 검색 및 공백을 포함한 접근성 이름을 구분했습니다. 실제 인증 서버·주문 검증은 아닙니다.

재현 스크립트: `tests/browser-products.py`. 프로젝트 외부 Python Playwright + Chromium이 필요합니다. Vite를 5174 포트에서 실행한 뒤 해당 환경의 Python으로 스크립트를 실행합니다. `KIX_TEST_BASE_URL`과 `KIX_TEST_ARTIFACTS`로 주소/캡처 경로를 바꿀 수 있습니다. npm 의존성에는 추가하지 않았습니다.

## 5. Phase 4 일부 — 샘플 주문·마이페이지 (2026-11-28)

1. **완료 기능**: 인증 후 샘플 주문 확인·체험 완료·상세·내역 화면, 체험 동의, 처리 중 비활성화와 중복 제출 차단, 같은 주문 의도의 재시도 키 유지, 새 의도의 새 키, 응답의 샘플 재고 반영, 로그인 세션별 데이터 격리와 초기화. Phase 4 전체 완료는 아닙니다.
2. **변경 파일**: `src/api/mocks/orders.js`, `src/features/orders/`, `src/hooks/use-sample-commerce.js`, 주문/마이페이지, 상품 카드·상세·옵션, 라우팅, `tests/orders.test.js`, `tests/browser-orders.py`, 기존 상품 브라우저 검사, 이 문서. 변경은 frontend 내부입니다.
3. **결정 근거**: 실제 주문 Controller/DTO가 없고 상품 DTO도 개발 중이므로 임의의 HTTP 계약을 만들지 않았습니다. 화면은 MOCK 체험임을 명시하며 실제 구매 버튼은 제공하지 않습니다. 샘플 서비스는 로그인 세션의 React 메모리에만 존재하며 로그아웃·새로고침 시 초기화됩니다. 주문 의도 객체는 불변 요청과 키를 보유하고 진행 중 Promise/완료 결과를 재사용합니다. 실패 후에도 같은 의도는 같은 키를 유지합니다. 샘플 서비스의 메모리 중복 방지·재고 차감은 실제 서버의 멱등성·락·트랜잭션 보장을 뜻하지 않습니다.
4. **실행 명령**: git fetch origin, git worktree add -b feature/frontend-orders /private/tmp/kix-frontend-orders origin/develop, npm ci, npm run format/build/lint, npm test, npm run dev -- --host 127.0.0.1 --port 5175 --strictPort, 임시 Python Playwright 환경에서 tests/browser-orders.py 실행. 새 프로젝트 의존성은 없습니다.
5. **검증 결과**: 빌드·린트 성공, Node 테스트 9개 통과. 진행 중 중복 호출, 응답 유실 후 같은 키 재시도/단일 재고 차감, 키 내용 충돌·품절·수량 오류·세션 격리 검증. Chromium에서 인증 필요 이동·체험 동의·동일 이벤트 루프 중복 제출·완료/상세/내역·응답 재고 반영·새로고침/로그아웃 초기화·빈 선택 상태·모바일 확인. 주문 브라우저 pageerror 0개. 브라우저 테스트의 API 인터셉트가 Vite 소스 경로까지 가로채던 오류를 실제 /api 경로로 좁혀 수정 후 통과했습니다. 기존 React Router use client 빌드 경고 1건 유지.
6. **Mock 여부**: 상품과 주문 모두 샘플입니다. 인증은 앱에서 기존 실제 API 코드를 유지하지만 브라우저 테스트에서는 /api/auth/login과 /api/members/me 응답만 가로챘습니다. 제품에 Mock 로그인 기능을 추가하지 않았습니다.
7. **백엔드 상태**: 실제 주문 API/DB를 호출하거나 변경하지 않았습니다. 샘플 입력/결과는 프론트엔드 전용 표시 모델입니다. 실제 연동 시 확인된 DTO·Idempotency-Key 헤더·서버 계산 금액·재고 응답에 맞춰 연결해야 합니다. 현재 HTTP 주문 요청 코드는 없습니다.
8. **확인 필요**: 주문 API 요청·응답, 멱등성 재전송 상태 코드, 주문 상태와 목록/상세 계약, 상품 공개 조회·옵션 DTO. 서버 조회 없는 샘플 내역을 실제 주문이 없는 것으로 표시하지 않고 별도 제목으로 구분했습니다. 기존 백엔드 작업 디렉터리·공통 문서는 수정하지 않았습니다.
9. **다음 작업**: 실제 상품 API가 준비되면 우선 연결하고, 주문 API가 준비되면 샘플과 분리된 실제 주문 흐름 연결. 좋아요·리뷰와 관리자 기능은 아직 미완료입니다. 화면별 승인 리소스도 전달 대기입니다.
10. **권장 커밋**: feat(frontend): 샘플 주문 흐름과 마이페이지 내역 구현.

브라우저 재현: 기존 외부 Python Playwright/Chromium 환경에서 `tests/browser-orders.py`를 실행합니다. 기본 주소는 http://127.0.0.1:5175, `KIX_TEST_BASE_URL`로 변경할 수 있습니다. 캡처는 `KIX_TEST_ARTIFACTS` 또는 /private/tmp/kix-order-artifacts에 저장합니다. 인증 응답은 테스트 내부에서만 가로채며 실제 토큰·계정을 사용하지 않습니다.

## 6. Phase 4 일부 — 샘플 좋아요·리뷰 (2026-11-28)

1. **완료 기능**: 상품 목록/상세의 샘플 좋아요 등록·취소, 마이페이지 좋아요 목록, 샘플 주문 완료 상품의 리뷰 작성·수정·수정 취소, 평점/내용 검증, 마이페이지 리뷰 목록과 상품 이동. 모든 화면에 샘플·현재 세션·초기화 정책을 표시합니다.
2. **변경 파일**: `src/api/mocks/engagement.js`, 샘플 주문 서비스의 구매 여부 조회, `src/features/engagement/`, 샘플 세션 Provider, ProductCard·상품 상세·마이페이지·주문 상세, `src/hooks/use-pending-action.js`, `src/utils/review-validation.js`, `tests/engagement.test.js`, `tests/browser-engagement.py`, 이 문서.
3. **결정 근거**: 좋아요/리뷰 Controller·DTO가 아직 없고 상품 DTO도 개발 중입니다. 임의의 HTTP API 계약은 추가하지 않았습니다. Mock 서비스 응답 기준으로 상태를 갱신하고, 로그인 세션에 묶인 메모리 상태만 사용합니다. 좋아요는 희망 상태 지정으로 중복 등록을 막고 리뷰는 샘플 주문 기록을 확인해 상품당 1개로 제한합니다. 평점은 정수 1~5, 내용은 앞뒤 공백을 제외한 1~1000자입니다(설계 VARCHAR(1000) 참고). 실제 서버 검증을 대체하지 않습니다.
4. **실행 명령**: git fetch origin, git worktree add -b feature/frontend-engagement /private/tmp/kix-frontend-engagement origin/develop, npm ci, npm run format/build/lint, npm test, npm run dev -- --host 127.0.0.1 --port 5176 --strictPort, 외부 Python Playwright 환경에서 tests/browser-engagement.py 및 기존 상품/주문 브라우저 검사. 새 의존성 없음.
5. **검증 결과**: 빌드·ESLint 통과, Node 테스트 12개 통과. 좋아요 희망 상태 멱등 처리·샘플 반환값 복사 격리·세션 분리, 비구매 리뷰/중복 리뷰/없는 리뷰 수정 거부, 평점·내용 경계 검사 추가. Chromium에서 로그인 이동 시 필터 보존, 중복 좋아요/리뷰 제출, 화면 간 상태 동기화, 좋아요 취소, 주문 후 리뷰 작성, 공백 오류, 수정 취소/저장, HTML 형태 입력의 텍스트 표시, 390/320px 가로 넘침 없음, 로그아웃·다른 계정 초기화 확인. pageerror 0개. 기존 React Router use client 빌드 경고 1건 유지.
6. **Mock 여부**: 주문·좋아요·리뷰는 세션별 가상 데이터입니다. 리뷰는 공개 리뷰가 아니며 다른 회원의 실제 리뷰/좋아요 수를 표시하지 않습니다. 브라우저 검사는 인증 응답만 테스트 내부에서 가로채고 실제 좋아요/리뷰/주문 서버 요청을 보내지 않았습니다. 앱에 Mock 인증을 추가하지 않았습니다.
7. **백엔드 연동**: 실제 인증 호출 코드는 유지. 실제 좋아요·리뷰 연동/DB 저장/서버 인가 검증은 미실행입니다. 샘플의 구매 기록/세션 확인을 실제 접근 제어로 간주하지 않습니다. 실제 연동 시 확인된 Controller·DTO와 서버 권한을 따릅니다.
8. **확인 필요**: 리뷰 삭제는 기능 명세의 CRUD·DELETE 경로와 design-revision-v1.2.md의 MVP 제외 문구가 상충하여 구현하지 않았습니다. 이번 범위는 사용자 요청의 작성·수정입니다. 실제 리뷰 DTO/공개 목록/페이지 응답과 좋아요 상태·목록 계약, 승인 디자인 전달 대기. 백엔드·공통 문서·원래 작업 디렉터리는 수정하지 않았습니다.
9. **다음 작업**: 준비된 실제 상품 API 연결 우선. 관리자 상품·옵션 UI는 실제 API 준비 상태에 맞춰 구현. 실제 주문·좋아요·리뷰 연동과 Phase 4 전체 검증은 아직 미완료입니다.
10. **권장 커밋**: feat(frontend): 샘플 좋아요와 구매 상품 리뷰 구현.

브라우저 재현 스크립트 `tests/browser-engagement.py`의 기본 주소는 http://127.0.0.1:5176입니다. 외부 Python Playwright/Chromium 환경이 필요하며 `KIX_TEST_BASE_URL`, `KIX_TEST_ARTIFACTS`로 변경할 수 있습니다. 테스트 토큰·계정은 가상이며 실제 서버에 전달하지 않습니다. 캡처는 기본 /private/tmp/kix-engagement-artifacts에 생성합니다.

## 7. Phase 5 샘플 UI — 관리자 상품·옵션·재고 (2026-11-28)

1. **완료 기능**: ADMIN 접근 제어, 관리자 샘플 상품 목록·검색·상태 필터·페이징, 등록·수정·논리 삭제와 확인창, 사이즈 옵션 추가·제거·재고 편집, 입력값 검증, 오류·빈 목록·삭제된 상품 안내. 실제 관리자 API 연동 완료는 아닙니다.
2. **변경 파일**: `src/api/mocks/admin-products.js`, `src/features/admin/`, `src/hooks/use-sample-admin.js`, `src/layouts/AdminLayout.jsx`, 관리자 목록/편집 페이지, 라우팅, `src/utils/admin-product-validation.js`, 공통 Modal, `tests/admin-products.test.js`, `tests/browser-admin.py`, SSR 라우팅 검사, 이 문서.
3. **기술 결정**: 관리자 Controller/DTO가 아직 없으므로 임의의 HTTP 계약을 만들지 않았습니다. 관리자 샘플 서비스는 공개 상품 샘플과 분리하며 관리자 라우트를 벗어나거나 새로고침·로그아웃하면 초기화됩니다. 실제 카탈로그를 변경했다고 표시하지 않습니다. 브랜드는 기존 샘플 2개만 선택하며 브랜드 CRUD/이미지 업로드는 추가하지 않았습니다. 삭제는 메모리 레코드의 deleted 표시이며 조회에서 제외합니다. 사이즈 150~350 정수·중복 금지, 가격 1~2147483647, 재고 0~2147483647, 상품명 1~255자 규칙을 DDL/설계에 맞춰 검증합니다. 샘플에는 최소 옵션 1개가 필요하며 실제 관리자 요청 DTO는 추후 확인합니다.
4. **실행 명령**: git fetch origin, git worktree add -b feature/frontend-admin /private/tmp/kix-frontend-admin origin/develop, npm ci, npm run format, npm run format:check, npm run lint, npm test, npm run build, npm run dev -- --host 127.0.0.1 --port 5177 --strictPort, 외부 Python Playwright 환경에서 관리자·상품·좋아요/리뷰 브라우저 검사. 새 프로젝트 의존성 없음.
5. **검증 결과**: 빌드·ESLint·포맷 검사 성공, Node 테스트 14개 통과. 관리자 생성/수정/재고·옵션 변경/논리 삭제/404, 입력 경계와 중복 사이즈, 공개 상품/다른 관리자 샘플과 격리 검증. Chromium에서 게스트 로그인 이동·USER 거부·ADMIN CRUD·옵션 추가/제거·재고·검색/필터/페이징·삭제 확인/Escape 취소·삭제 후 404·관리자 이탈 초기화 확인. 390/320px 입력·목록의 가로 넘침 없음. Modal을 화면 중앙·여백·최대 높이·내부 스크롤·보조 닫기 버튼으로 보완하고 재검증했습니다. 관리자 pageerror 0개. 기존 상품 및 주문 후 좋아요·리뷰 브라우저 회귀 검사도 통과. 기존 React Router use client 빌드 경고 1건 유지.
6. **Mock 여부**: 관리자 변경은 별도 메모리에만 반영됩니다. 사용자 샘플·주문 재고나 DB를 변경하지 않습니다. UI에 관리자 체험·분리·초기화 정책을 명시했습니다. 테스트 인증만 브라우저에서 가로채며 앱에 Mock 인증이나 관리자 승격 기능을 추가하지 않았습니다.
7. **백엔드 연동**: 실제 ADMIN 인증은 기존 me 응답의 role을 따릅니다. 프론트 접근 제어는 UX이며 서버 인가의 대체가 아닙니다. 실제 관리자 API 요청·DB 저장·서버 권한/재고 동시성 검증은 미실행입니다. 상품 조회 DTO·Service가 백엔드에서 개발 중이며 준비된 Controller 없이 연동 경로를 확정하지 않았습니다.
8. **확인 필요**: 관리자 상품·옵션·재고 API 계약과 논리 삭제·옵션 삭제 정책, 브랜드 목록, 공개 조회 권한. 실제 운영에서는 관리자 변경이 공개 상품/주문 재고에 반영되어야 하며 현재 샘플의 분리는 UI 검증 목적입니다. 승인 시안·이미지·폰트 전달 대기. 백엔드와 공통 문서·원래 작업 디렉터리는 수정하지 않았습니다.
9. **다음 작업**: 준비된 실제 상품 조회 API 연동 우선. 이후 주문·좋아요·리뷰·관리자 API 연결과 실제 인증/인가·주문/재고 오류 검증, 승인 디자인 적용. Phase 5는 샘플 UI만 완료했으며 실제 CRUD 통합은 미완료입니다.
10. **권장 커밋**: feat(frontend): 관리자 샘플 상품 옵션 재고 관리 구현.

`tests/browser-admin.py`는 외부 Python Playwright/Chromium 환경에서 실행합니다. 기본 주소 http://127.0.0.1:5177, 환경변수 KIX_TEST_BASE_URL/KIX_TEST_ARTIFACTS로 변경 가능. 캡처 기본 위치는 /private/tmp/kix-admin-artifacts입니다. 테스트 인증 응답만 사용하고 실제 관리자 서버 요청을 보내지 않습니다.
