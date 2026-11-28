# 06. API 명세서

> 출처: Notion "06. API 명세서" (v1.1 스냅샷, 2026-11-26 가져옴).
> 누락 API 보완과 옵션 기반 주문 요청 형식은 [design-revision-v1.2.md](design-revision-v1.2.md) 4장에 있다.
> 용어 변경(DEC-019): 내 정보 조회 API는 `GET /api/members/me`다. 회원 도메인 이름은 `member`로 통일했다.

## 1. REST API 초안

| Method | Path | 기능 |
| --- | --- | --- |
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 |
| GET | /api/products | 목록·검색 |
| GET | /api/products/{id} | 상세 |
| POST | /api/products | 관리자 등록 |
| PATCH | /api/products/{id} | 관리자 수정 |
| DELETE | /api/products/{id} | 논리 삭제 |
| GET/POST | /api/products/{id}/reviews | 리뷰 조회·작성 |
| PATCH/DELETE | /api/reviews/{id} | 리뷰 수정·삭제 |
| PUT/DELETE | /api/products/{id}/likes | 좋아요 등록·취소 |
| POST | /api/orders | 주문 생성 |
| GET | /api/orders | 내 주문 조회 |
| GET | /api/orders/{id} | 주문 상세 |

주문 요청: Idempotency-Key 헤더, JSON productId 및 quantity. 최초 성공 201, 재전송 기존 주문 반환, 재고 부족 또는 키 충돌 409. 상세 DTO 및 Swagger는 구현 시 확정.

## 2. REST API 요청 및 처리 구조

![REST API 요청 및 처리 구조 (개념 참고용)](../design/references/notion-concept/kix-06.svg)

설계 초안 · 실제 구현 또는 측정 결과가 아님

## 3. 구현된 API 계약 (실제 코드 기준)

> 1~2장은 초안이다. 이 장은 **백엔드에 구현되어 확인된 API**만 적는다. 프론트(Codex)는 이 장의 JSON 필드 이름을 기준으로 연동한다.
> 확인 방법: 2026-11-28 Postman 수동 확인(개발자 보고)과 `ProductControllerTest`·`ProductRepositoryTest`(자동 테스트, 개발자 실행 통과). 브랜치 `feature/product-api`, 병합 전.

### 3.1 공통 규칙

- 인증: 상품 조회(`GET /api/products/**`)는 **공개**다. 토큰이 필요 없다.
- 오류 응답은 Spring `ProblemDetail` 형식이다.
  ```json
  { "title": "Not Found", "status": 404, "detail": "상품을 찾을 수 없습니다." }
  ```
- 페이지 번호(`page`)는 **0부터** 시작한다.
- 필드 이름은 camelCase다. 사이즈 필드는 `sizeMm`(밀리미터)이다.

### 3.2 GET /api/products (목록·검색)

요청 파라미터 (모두 선택)

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| brandId | number | 없음 | 브랜드 필터. 숫자가 아니면 400 |
| keyword | string | 없음 | 상품명에 포함된 글자 검색. 빈 값(`keyword=`)은 필터 없음으로 처리 |
| page | number | 0 | 페이지 번호 |
| size | number | 20 | 페이지 크기 |

- 삭제된 상품(`is_deleted`)은 목록에서 제외한다.
- **정렬은 최신순(id 내림차순)으로 고정**이다. `sort` 파라미터는 무시한다.
- 판매 중지(`STOPPED`) 상품도 목록에 포함되며 `status`로 구분한다.

응답 200

```json
{
  "content": [
    {
      "id": 14,
      "brandId": 14,
      "brandName": "Nike",
      "name": "[샘플] 덩크 로우",
      "price": 139000,
      "imageUrl": null,
      "status": "ON_SALE",
      "soldOut": false
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 3,
  "totalPages": 1
}
```

| 필드 | 설명 |
| --- | --- |
| status | `ON_SALE` 또는 `STOPPED` |
| soldOut | 서버가 계산한다. **옵션이 없거나 모든 옵션 재고가 0이면 true**. `STOPPED`와는 별개 값이다 |
| imageUrl | 없으면 `null` |

### 3.3 GET /api/products/{id} (상세)

응답 200

```json
{
  "id": 14,
  "brandId": 14,
  "brandName": "Nike",
  "name": "[샘플] 덩크 로우",
  "price": 139000,
  "description": "샘플",
  "imageUrl": null,
  "status": "ON_SALE",
  "soldOut": false,
  "options": [
    { "id": 14, "sizeMm": 260, "stock": 3 },
    { "id": 15, "sizeMm": 270, "stock": 0 }
  ]
}
```

- `options`는 **`sizeMm` 오름차순**이다.
- 삭제된 상품이거나 없는 id면 **404** (`ProblemDetail`). 삭제 여부를 구분해서 알려주지 않는다.

### 3.4 오류 코드

| 상태 | 언제 | 비고 |
| --- | --- | --- |
| 400 | 파라미터 형식 오류 (예: `brandId=abc`) | `detail`은 고정 문구 |
| 404 | 없는 상품, 삭제된 상품 | |

### 3.5 아직 구현하지 않은 것 (프론트가 의존하면 안 됨)

- 상품 `size`의 **상한**(제안: 최대 100)은 적용하지 않았다. 설정하기 전까지 큰 값을 보내면 그대로 처리된다.
- `sort` 파라미터, 가격대·사이즈 필터
- 좋아요 수·내 좋아요 여부 (좋아요 도메인 구현 후 상세 응답에 필드 추가 예정)
- 관리자 상품 등록·수정·삭제, 옵션 추가·재고 변경, 리뷰 API
- Swagger/OpenAPI 문서

### 3.6 프론트 mock과 다른 점 (Codex 전달용)

`frontend/src/api/mocks/products.js`는 "확정된 백엔드 DTO가 아니다"라고 명시되어 있다. 실제 API와 이름이 다르므로 연동 시 아래처럼 맞춘다.

| 프론트 mock | 실제 API |
| --- | --- |
| `items` (목록 배열) | `content` |
| `brand` (문자열) | `brandId`(number), `brandName`(string) |
| 검색 파라미터 `query` | `keyword` |
| `id`가 문자열(`sample-1`) | `id`는 number |
| 응답에 없음 | `status`, `soldOut`, `imageUrl`, `page`, `size`, `totalElements` |

프론트가 이 이름을 바꾸고 싶으면 백엔드 변경이 필요하므로 개발자에게 요청으로 전달한다.
