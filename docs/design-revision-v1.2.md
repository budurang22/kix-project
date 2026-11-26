# 설계 수정안 v1.2 (사용자 검토 대기)

> 상태: **제안**. 사용자가 검토하고 승인하면 `05-erd.md`, `06-api-spec.md` 등 기준 문서에 반영하고 `decisions.md`를 확정으로 바꾼다.
> 2026-11-27: 회원 도메인 명칭 통일(`members` 테이블, `member_id`, `/api/members/me`)은 사용자가 확정(DEC-019)해서 이 문서에 반영했다. 그 밖의 구조 변경은 여전히 **제안**이다. 10개 검토 항목의 요약은 10장에 있다.

### 승인 현황 (2026-11-27)

- **승인** (확정된 방향에 부합): 1) 옵션 단위 재고와 옵션 단위 비관적 락, 주문번호·가격 스냅샷·주문 총액·주문 상태 컬럼의 존재, 같은 키·같은 요청은 기존 주문 반환·같은 키·다른 요청은 409, 8) 인증 정책(7장), 브랜드 필터, `members`, 단일 트랜잭션, 회원별 멱등성 키 유니크 제약
- **구현 전 협의** (세부 미확인): ② `brands` 테이블 분리 여부 ③ `size_mm` 범위·단위 ④ 상품명·사이즈 스냅샷 컬럼 ⑤ 상태 초기값 구성(`ORDERED`)과 취소 확장 방식 ⑥ 재전송 응답 코드(200/201) ⑦ 오류 응답 형식(`ProblemDetail`)·타인 주문 404 정책 ⑨ 개발 순서(DEC-005) ⑩ **주문 처리 순서(5.2.1 — 오류 발견)**
- 10장 표의 "상태" 열보다 이 목록이 우선한다. 승인되지 않은 항목은 임의로 확정하지 않는다.
> 근거: 사용자 협의(DEC-003)와 v1.1 검토에서 발견한 누락 사항.
> 이 문서의 수치와 결과는 모두 **설계 또는 목표**이며 실제 측정 결과가 아니다.

## 1. 변경 요약

| 구분 | v1.1 | v1.2 제안 |
| --- | --- | --- |
| 재고 단위 | 상품(`products.stock`) | 상품 옵션(`product_options.stock`, 신발 사이즈) |
| 락 단위 | 상품 행 | 상품 옵션 행 |
| 브랜드 | 없음 | `brands` 테이블 + 목록 브랜드 필터 |
| 주문 | 상품 ID·수량·가격·키 | 주문번호, 옵션 ID, 수량, 단가, 총액, 상태, 상품명·사이즈 스냅샷 추가 |
| 공통 컬럼 | 없음 | `created_at`, `updated_at` |
| 제약 | FK, UNIQUE 위주 | CHECK(가격, 재고, 수량, 별점, 총액) 추가 |
| API | 13개 | 로그인 사용자 조회, 브랜드 목록, 옵션 관리, 에러 형식, 페이징 규칙 보완 |
| 선택 기능 | 댓글, 장바구니, 취소, N+1, CI/CD | 색상 옵션 추가 (모두 선택 기능) |

## 2. 요구사항 수정

### 2.1 P0 (필수)

| ID | 기능 | 상세 |
| --- | --- | --- |
| MEM-01 | 회원가입 | 이메일 중복 방지, BCrypt 해시. 가입은 항상 `USER` 역할 |
| MEM-02 | 로그인 | JWT 발급. 로그아웃은 클라이언트가 토큰 제거 |
| MEM-03 | 내 정보 조회 | `GET /api/members/me` |
| PRD-01 | 상품 CRUD | 관리자 등록·수정·논리 삭제, 공개 조회 |
| PRD-02 | 검색·필터·페이징 | 상품명 검색, **브랜드 필터**, 페이지 조회 |
| PRD-03 | 품절 표시 | 모든 옵션 재고가 0이거나 판매 중지·삭제 상품이면 주문 불가 |
| OPT-01 | 사이즈 옵션 | 상품마다 사이즈(mm)별 옵션과 재고 관리 |
| REV-01 | 리뷰 CRUD | 구매 회원만 작성, 본인만 수정·삭제, 상품당 1개 |
| LIK-01 | 좋아요 | 등록·취소·개수·본인 여부 (상품 상세 응답에 포함) |
| LIK-02 | 중복 방지 | (회원, 상품) 복합 PK, 반복·동시 요청에도 1건 유지 |
| ORD-01 | 주문 생성 | 단일 옵션·수량, 서버가 가격 계산 |
| ORD-02 | 주문 조회 | 본인 주문 목록·상세 |
| ORD-03 | 재고 관리 | 옵션 행 비관적 락 |
| ORD-04 | 멱등성 | 5장 정책 |
| ORD-05 | 원자성 | 주문 저장 실패 시 재고 롤백 |

### 2.2 선택 기능 (일정 여유 시)

색상 옵션, 장바구니(CRT-01), 주문 취소(ORD-06), 리뷰 댓글(REV-02), N+1 최적화, CI/CD.
`orders.status`와 옵션 구조는 이 기능들이 나중에 붙어도 테이블을 크게 바꾸지 않도록 미리 잡아 둔다.

### 2.3 제외

실제 결제(PG), 배송, 리셀, 입찰, Redis, 소셜 로그인, 파일 업로드(이미지는 URL로만 저장).

## 3. ERD 수정안

### 3.1 테이블

공통: PK는 `BIGINT AUTO_INCREMENT`, 시각 컬럼은 `DATETIME`. 모든 테이블(복합 PK인 `product_likes` 제외)에 `created_at`, `updated_at`을 둔다.

**members**

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| id | PK | |
| email | VARCHAR(255), UNIQUE, NOT NULL | |
| password_hash | VARCHAR(100), NOT NULL | BCrypt |
| nickname | VARCHAR(30), NOT NULL | |
| role | VARCHAR(10), NOT NULL, 기본 `USER` | `USER`, `ADMIN` |

**brands** (신규)

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| id | PK | |
| name | VARCHAR(50), UNIQUE, NOT NULL | 예: NEW BALANCE, ADIDAS |

**products** (수정)

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| id | PK | |
| brand_id | FK → brands, NOT NULL | 브랜드 필터 |
| name | VARCHAR(200), NOT NULL | 검색 대상 |
| price | INT, NOT NULL, CHECK (price > 0) | 원 단위 |
| description | TEXT | |
| image_url | VARCHAR(500) | 파일 업로드 없음 |
| status | VARCHAR(10), NOT NULL, 기본 `ON_SALE` | `ON_SALE`, `STOPPED` |
| is_deleted | BOOLEAN, NOT NULL, 기본 false | 논리 삭제 (v1.1의 `deleted`를 Boolean 네이밍 규칙에 맞게 변경) |
| 인덱스 | (brand_id), (is_deleted, name) | 필터·검색 |

`products.stock`은 제거한다. 품절 여부는 옵션 재고에서 계산한다.

**product_options** (신규)

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| id | PK | 락 대상 |
| product_id | FK → products, NOT NULL | |
| size_mm | SMALLINT, NOT NULL, CHECK (size_mm BETWEEN 150 AND 350) | 신발 사이즈. 범위는 협의 대상 |
| stock | INT, NOT NULL, CHECK (stock >= 0) | 음수 재고 방지 |
| 제약 | UNIQUE (product_id, size_mm) | 같은 사이즈 중복 방지 |

옵션은 삭제하지 않고 재고 0으로 품절을 표현한다. 상품 논리 삭제 시 옵션도 함께 숨겨진다.

**reviews** (보완)

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| id | PK | |
| member_id | FK → members, NOT NULL | |
| product_id | FK → products, NOT NULL | 리뷰는 상품 단위 |
| rating | TINYINT, NOT NULL, CHECK (rating BETWEEN 1 AND 5) | |
| content | VARCHAR(1000), NOT NULL | |
| 제약 | UNIQUE (member_id, product_id) | 상품당 1개 |

작성 자격은 해당 회원의 주문 중 `product_options.product_id`가 일치하는 주문이 있는지로 검사한다.

**product_likes** (보완)

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| member_id | FK → members | 복합 PK |
| product_id | FK → products | 복합 PK |
| created_at | DATETIME, NOT NULL | |

**orders** (수정)

| 컬럼 | 타입·제약 | 비고 |
| --- | --- | --- |
| id | PK | 내부 식별자 |
| order_number | VARCHAR(32), UNIQUE, NOT NULL | 사용자에게 보이는 번호. 예: `KIX-20261128-7F3K9Q2M` |
| member_id | FK → members, NOT NULL | |
| product_option_id | FK → product_options, NOT NULL | `product_id`는 옵션에서 얻으므로 중복 저장하지 않음 |
| product_name | VARCHAR(200), NOT NULL | 주문 당시 상품명 스냅샷 |
| size_mm | SMALLINT, NOT NULL | 주문 당시 사이즈 스냅샷 |
| quantity | INT, NOT NULL, CHECK (quantity >= 1) | |
| unit_price | INT, NOT NULL, CHECK (unit_price > 0) | 주문 당시 단가 스냅샷 |
| total_price | BIGINT, NOT NULL, CHECK (total_price = unit_price * quantity) | 주문 당시 총액 |
| status | VARCHAR(15), NOT NULL, 기본 `ORDERED` | `ORDERED`, (선택 기능) `CANCELED` |
| idempotency_key | VARCHAR(64), NOT NULL | |
| 제약 | UNIQUE (member_id, idempotency_key) | 멱등성의 최종 방어선 |

### 3.2 필요성 검토

| 항목 | 저장 여부 | 이유 |
| --- | --- | --- |
| 주문 식별번호 | 저장 | 주문 완료 화면이 주문번호를 보여준다. 내부 PK를 노출하면 주문 수 추측이 쉬움 |
| 주문 당시 가격(`unit_price`) | 저장 | 이후 가격 변경과 주문 이력을 분리 (정책 5장) |
| 주문 수량 | 저장 | |
| 주문 총액 | 저장 | 정산·표시 기준을 고정. `unit_price * quantity`와 CHECK로 일치 보장 |
| 주문 상태 | 저장 | 지금은 `ORDERED`뿐이지만, 선택 기능(취소)이 붙어도 스키마 변경이 없도록 |
| 상품명·사이즈 스냅샷 | 저장 (제안) | 상품명 수정·상품 삭제 후에도 주문 내역이 같은 내용을 보여준다. 협의 대상 |
| 브랜드 | `brands` 테이블 | 필터와 이름 중복 방지. 단순화를 원하면 `products.brand` 문자열도 가능 |
| 생성·수정 시각 | 전체 테이블 | 정렬, 디버깅, 포트폴리오 증빙 |
| 논리 삭제 | `products`만 | 주문 이력 보존. 사용자·리뷰 삭제는 MVP 범위 밖 |

### 3.3 DB 제약 참고

- MySQL 8.4 공식 문서(CHECK 제약 페이지, 원문 확인)
  - 문법: `[CONSTRAINT [symbol]] CHECK (expr) [[NOT] ENFORCED]`. 이름을 생략하면 MySQL이 `테이블명_chk_번호`로 자동 생성한다. 제약 이름은 최대 64자다. → `chk_` 이름을 직접 붙이면 이 길이 제한 안에서 만든다.
  - 생략하거나 `ENFORCED`이면 실제로 검사한다. `NOT ENFORCED`면 만들기만 하고 검사하지 않는다.
  - 식에는 서브쿼리, 변수, 저장 함수, `AUTO_INCREMENT` 컬럼, 다른 테이블의 컬럼을 쓸 수 없다. 외래키 참조 동작(`ON UPDATE`, `ON DELETE`)이 걸린 컬럼은 CHECK에 쓸 수 없다. → `stock >= 0`, `quantity >= 1`, `total_price = unit_price * quantity`는 이 제한에 걸리지 않는 컬럼들이다.
  - 이전에 적었던 "MySQL 8.0.16부터 적용"은 이 페이지에서 확인되지 않았다. 버전 기준은 **미확인**으로 두고, 실제 MySQL 8.4 컨테이너에서 위반 시 오류가 나는지 직접 시험해서 기록한다.
- 이 수정안에서 DDL은 작성하지 않았다. 승인 후 확정한다.

## 4. API 수정안

공통 규칙(제안)

- 오류 응답: Spring의 `ProblemDetail`(RFC 9457 형식) 사용. `code` 필드로 업무 오류 구분
- 페이징: `page`(0부터), `size`(기본 20, 최대 100), `sort`
- 인증: `Authorization: Bearer <JWT>`
- 401: 토큰 없음·만료·무효 / 403: 권한(역할) 부족 또는 리소스 소유자가 아님
- 다른 사람의 주문은 존재 여부를 숨기기 위해 403이 아니라 **404**

| Method | Path | 권한 | 설명 | 변경 |
| --- | --- | --- | --- | --- |
| POST | /api/auth/signup | 공개 | 회원가입 (역할은 항상 USER) | |
| POST | /api/auth/login | 공개 | JWT 발급 | |
| GET | /api/members/me | 로그인 | 내 정보 | 추가 |
| GET | /api/brands | 공개 | 브랜드 목록 | 추가 |
| GET | /api/products | 공개 | `keyword`, `brandId`, 페이징 | 브랜드 필터 |
| GET | /api/products/{id} | 공개 | 옵션별 재고, 좋아요 수, 내 좋아요 여부 | 응답 확장 |
| POST | /api/products | ADMIN | 상품 등록 (옵션 포함 가능) | |
| PATCH | /api/products/{id} | ADMIN | 상품 수정 | |
| DELETE | /api/products/{id} | ADMIN | 논리 삭제 | |
| POST | /api/products/{id}/options | ADMIN | 사이즈 옵션 추가 | 추가 |
| PATCH | /api/products/{id}/options/{optionId} | ADMIN | 재고 변경 (주문과 같은 락 사용) | 추가 |
| GET | /api/products/{id}/reviews | 공개 | 리뷰 목록 (페이징) | |
| POST | /api/products/{id}/reviews | 로그인 | 구매 회원만 | |
| PATCH/DELETE | /api/reviews/{id} | 로그인 | 본인만 (아니면 403) | |
| PUT/DELETE | /api/products/{id}/likes | 로그인 | 좋아요 등록·취소 (204, 반복 요청에도 동일 상태) | |
| POST | /api/orders | 로그인 | 주문 생성 | 요청 변경 |
| GET | /api/orders | 로그인 | 내 주문 목록 | |
| GET | /api/orders/{id} | 로그인 | 내 주문 상세 | |

### 4.1 주문 요청·응답

요청

```
POST /api/orders
Idempotency-Key: <키>
{ "productOptionId": 12, "quantity": 1 }
```

| 상황 | 응답 |
| --- | --- |
| 최초 성공 | 201 Created, 주문 정보 (주문번호, 상품명, 사이즈, 수량, 단가, 총액, 상태) |
| 같은 키·같은 내용 재전송 | 200 OK, 기존 주문 그대로 |
| 같은 키·다른 옵션 또는 수량 | 409, `IDEMPOTENCY_KEY_CONFLICT` |
| 재고 부족 | 409, `OUT_OF_STOCK` |
| 판매 중지·삭제된 상품 | 409, `PRODUCT_NOT_AVAILABLE` |
| 키 헤더 누락 또는 형식 오류 | 400 |
| 수량 < 1 | 400 |

로그아웃 API는 만들지 않는다 (클라이언트가 토큰을 삭제, DEC-008).

## 5. 주문 처리 설계

### 5.1 멱등성 키 정책 (제안)

| 항목 | 정책 |
| --- | --- |
| 생성 주체 | 클라이언트. UUID v4 권장 |
| 형식·길이 | `^[A-Za-z0-9_-]{16,64}$` |
| 범위 | 회원별 (`UNIQUE(member_id, idempotency_key)`) |
| 유효 기간 | 주문 행이 존재하는 동안 유효. MVP에서는 별도 만료(TTL)를 두지 않음 (실서비스라면 보관 기간 정책 필요) |
| "같은 내용" | `productOptionId`와 `quantity`가 같음 |
| 실패한 요청 | 재고 부족 등으로 주문이 저장되지 않으면 키가 소모되지 않는다. 같은 키로 재시도 가능 |
| 클라이언트 | 한 번의 구매 시도 동안 같은 키를 재사용. 새 구매 시도는 새 키 |

### 5.2 처리 흐름

1. 인증, 입력 검증 (키 형식, 수량)
2. (트랜잭션 밖) `member_id + key`로 기존 주문 조회 → 있으면 같은 내용 비교 → 같으면 200, 다르면 409
3. 새 요청이면 **트랜잭션 시작**
4. 옵션 행을 `SELECT ... FOR UPDATE`로 잠금 (JPA `PESSIMISTIC_WRITE`)
5. 상품 상태(판매 중·삭제 여부)와 재고 확인 → 부족하면 409 (롤백)
6. 재고 차감, 서버가 현재 상품 가격으로 `unit_price`, `total_price` 계산, 상품명·사이즈 스냅샷, 주문 저장
7. 커밋 → 201
8. 6단계에서 `UNIQUE(member_id, idempotency_key)` 위반이 나면 트랜잭션 전체가 롤백된다(재고 차감 포함). 트랜잭션 **바깥**에서 예외를 잡고, **별도 트랜잭션**으로 기존 주문을 조회해 내용을 비교한다 → 같으면 200, 다르면 409

구현 구조: 컨트롤러 → (트랜잭션 없는) 주문 Facade → `@Transactional` 주문 서비스. Facade가 2, 8단계를 맡는다. 예외를 같은 트랜잭션 안에서 잡으면 이미 rollback-only로 표시되어 조회를 이어갈 수 없다.

### 5.2.1 순서 재검토 (2026-11-27, 협의 대기)

**문제**: 위 5.2 순서는 재고 확인이 키 재확인보다 앞선다. 재고가 1개이고 같은 키·같은 옵션의 요청 A, B가 동시에 온다고 하자.
1. A, B 모두 2단계(트랜잭션 밖 키 조회)를 통과한다. 아직 A가 커밋 전이라 주문이 없기 때문이다.
2. A가 옵션 행 락을 잡고 재고를 차감한 뒤 커밋한다.
3. B는 락을 기다렸다가 얻고 재고를 확인한다. 재고가 0이라 `OUT_OF_STOCK`(409)을 응답한다.

B는 A의 주문을 그대로 돌려받아야 하는데(멱등성) **재고 부족으로 잘못 판단한다.** 재고가 남아 있었다면 6단계의 유니크 위반 → 롤백 → 재조회로 결과는 맞지만 차감과 롤백이 불필요하게 일어난다.

**수정안**: 옵션 행 락을 잡은 **직후, 재고를 확인하기 전에** 키를 다시 확인한다.
- 4. 옵션 행 락
- 4a. 같은 `member_id + key` 주문이 이미 있으면 내용 비교 후 기존 주문 반환(같음) 또는 409(다름). **재고는 보지 않는다.**
- 5. 없을 때만 상품 상태·재고 확인, 이후 차감·저장은 기존과 같다.
- 유니크 제약과 8단계(트랜잭션 밖 별도 재조회)는 최종 방어선으로 유지한다 (예: 다른 옵션으로 같은 키를 쓴 경우).

**4a에서 주의할 MySQL 동작 (MySQL 8.4 공식 문서 원문)**
- InnoDB 기본 격리 수준은 REPEATABLE READ다. 이 수준에서 일반 SELECT는 "트랜잭션의 첫 번째 일관된 읽기가 만든 스냅샷"을 계속 보며, 이후 다른 트랜잭션이 커밋한 변경은 보이지 않는다. 같은 트랜잭션의 앞선 문장이 만든 변경은 예외다.
- `SELECT ... FOR UPDATE`는 "가장 최신 데이터"를 읽고 잠근다. 최신 상태를 보려면 READ COMMITTED나 잠금 읽기를 쓰라고 문서가 안내한다.
- 그래서 4a의 일반 SELECT가 **옵션 락 이후 첫 일관된 읽기**여야 B가 A의 커밋을 본다. JPA가 락 전에 다른 SELECT(회원·상품 조회 등)를 먼저 실행하면 스냅샷이 그 시점에 고정되어 A의 주문이 보이지 않을 수 있다.
- 방법 (가) 주문 생성 트랜잭션을 READ COMMITTED로 실행해 매 읽기가 최신을 보게 한다. (나) 락 쿼리가 트랜잭션의 첫 쿼리가 되도록 보장한다. (가)가 단순하고 실수 여지가 적다.
- 4a를 `FOR SHARE`로 잠그는 방법은 아직 쓰지 않는다. 없는 행에 대한 잠금이 다른 삽입을 막을 수 있다는 우려가 있지만 공식 문서로 확인하지 못했다 (미확인).

**대안(키 선점)**: 트랜잭션 맨 앞에서 주문 행을 INSERT해 키를 먼저 선점한 뒤 옵션 락·재고를 확인한다. 중복 요청은 유니크 인덱스에서 대기하다가 중복 오류를 받는다. 공식 문서(`innodb-locks-set`)는 중복 키 오류 시 중복 인덱스 레코드에 공유 락을 걸고, 앞선 트랜잭션이 커밋·롤백하면 대기 중인 락 요청이 허용된다고 설명한다. 중복 판단이 항상 재고 확인보다 먼저라는 장점이 있지만, 재고 부족 시 INSERT를 롤백해야 하고 대기·교착 동작을 더 학습해야 한다.

**추천**: 수정안(락 → 키 재확인 → 재고) + READ COMMITTED. 승인된 방향(옵션 단위 비관적 락, 롤백 후 별도 트랜잭션 조회)을 유지하고 변경이 작다. 테스트 T-02b를 추가한다. **협의 후 확정한다.**

### 5.3 설계 판단과 주의점

- **락 단위가 옵션인 이유**: 같은 상품의 다른 사이즈 주문은 서로 기다리지 않게 하고, 재고가 있는 행만 직렬화한다.
- **관리자 재고 변경**도 같은 옵션 행 락을 사용해 주문과 경쟁해도 정합성을 지킨다.
- **MySQL 격리 수준 주의**: InnoDB 기본은 REPEATABLE READ이고, 일반 SELECT는 트랜잭션 첫 읽기 시점의 스냅샷을 본다. 잠금 읽기(`FOR UPDATE`)는 최신 커밋 값을 읽는다. 그래서 키 존재 확인은 트랜잭션 밖(2단계)에서 하고, 트랜잭션 안에서는 유니크 제약을 최종 방어선으로 삼는다. 실제 MySQL에서 이 동작을 테스트로 검증한다 (미검증).
- **락 대기 시간**: MySQL `innodb_lock_wait_timeout` 기본값(50초)이 요청 지연의 상한이 된다. 애플리케이션의 락 타임아웃 힌트가 MySQL에서 어떻게 동작하는지는 구현 시 공식 문서로 확인한다 (미확인).
- **커넥션 풀**: HikariCP 기본 최대 풀 크기는 10이다. 동시 100건 테스트에서는 풀 크기에 따라 대기·타임아웃이 달라지므로 결과에 풀 크기를 함께 기록한다.
- 판매 상태(`status`, `is_deleted`) 변경과 주문이 동시에 일어나는 경쟁은 MVP에서는 허용 범위로 두고 문서에 남긴다 (옵션 락만 보호).

## 6. 테스트 계획

모두 실제 MySQL(Docker Compose)에서 실행한다. 아래 기대 결과는 **목표**이며 아직 측정하지 않았다. 결과를 기록할 때는 MySQL 버전, 커넥션 풀 크기, 스레드 수를 함께 적는다.

| ID | 시나리오 | 조건 | 기대 결과(목표) |
| --- | --- | --- | --- |
| T-01 | 동시 주문 | 옵션 재고 10, 서로 다른 키로 1개씩 100건 동시 | 성공 10, `OUT_OF_STOCK` 90, 최종 재고 0, 주문 10건 |
| T-02 | 같은 키 동시 | 같은 회원·키·내용 10건 동시 | 주문 1건, 재고 1 차감, 응답은 모두 같은 주문번호 (201은 1건) |
| T-02b | 같은 키 동시, 재고 1개 | 재고 1개 옵션에 같은 회원·키·내용 10건 동시 | 응답은 모두 같은 주문번호, `OUT_OF_STOCK` 0건, 재고 0 (5.2.1) |
| T-03 | 키 충돌 | 같은 키, 다른 수량(또는 옵션) | 409 `IDEMPOTENCY_KEY_CONFLICT`, 재고 변화 없음 |
| T-04 | 롤백 | 재고 차감 후 주문 저장에서 강제로 예외 발생 (테스트용 실패 주입) | 재고 원상 유지, 주문 0건 |
| T-05 | 가격 스냅샷 | 주문 후 상품 가격 변경 | 주문 조회의 단가·총액은 주문 당시 값 |
| T-06 | 옵션 독립성 | 같은 상품의 서로 다른 사이즈를 동시 주문 | 서로 영향 없이 각 옵션 재고가 독립적으로 차감 |
| T-07 | 관리자 재고 변경 경합 | 주문과 관리자 재고 변경 동시 | 최종 재고 = 초기 + 변경 − 판매 수량 |
| T-08 | 주문 불가 상태 | 판매 중지·삭제 상품, 재고 0 | 409 `PRODUCT_NOT_AVAILABLE` 또는 `OUT_OF_STOCK` |
| T-09 | 좋아요 | 같은 PUT 반복·동시, DELETE 반복 | 1건 유지 / 이미 취소된 상태 유지, 오류 없음 |
| T-10 | 리뷰 | 비구매자 작성, 같은 상품 중복 작성, 타인 수정 | 거부 / 거부 / 403 |
| T-11 | 접근 제어 | 비로그인 주문, 일반 회원 상품 등록, 가입으로 ADMIN 지정 시도, 타인 주문 조회 | 401 / 403 / USER로 생성 / 404 |
| T-12 | 키 검증 | 키 누락·형식 오류, 수량 0 | 400 |
| T-13 | 영속성 | DB 컨테이너 재생성 | 볼륨 데이터 유지 |
| T-14 | 배포 | 외부 브라우저에서 접속 | 정상 이용 (HTTPS 여부 기록) |

## 7. 인증·토큰 제안

### 7.1 Access Token 만료 시간

| 후보 | 장점 | 단점 |
| --- | --- | --- |
| 15~30분 | 유출 시 피해 기간이 짧음 | Refresh Token이 없어 데모 중 자주 재로그인 |
| **60분 (제안)** | 데모·발표 중 끊김이 적음, 모의 데이터만 사용 | 유출 시 노출 시간이 김 |
| 수 시간 이상 | 편의성 | 토큰 무효화 수단이 없어 비추천 |

Refresh Token은 MVP에서 제외한다. 서버가 토큰을 무효화할 수 없으므로 만료가 짧을수록 안전하다는 점을 문서에 남긴다.

### 7.2 저장 위치

| 후보 | 장점 | 단점 |
| --- | --- | --- |
| localStorage | 구현 단순, 새로고침 후 유지 | XSS로 탈취 가능 |
| 메모리(React 상태) | XSS 노출 최소 | 새로고침 시 로그아웃 |
| HttpOnly 쿠키 | JS가 토큰을 읽을 수 없음 | CSRF 대응 필요, 구현·설정 증가 |

제안: MVP는 **Bearer 헤더 + 브라우저 저장소(localStorage 또는 sessionStorage)** 로 단순하게 구현하고, 실제 개인정보를 받지 않는 데모라는 전제와 XSS 위험을 `decisions.md`에 명시한다. 완화책으로 Nginx의 CSP 헤더와 React의 기본 이스케이프를 사용한다. 실서비스로 확장한다면 HttpOnly 쿠키 방식을 다시 검토한다.

### 7.3 로그아웃 처리

- Refresh Token이 없고 서버가 토큰을 저장하지 않으므로 **서버에서 토큰을 무효화할 수 없다**. 로그아웃은 클라이언트가 저장된 토큰을 삭제하는 것이다 (DEC-008).
- 이미 유출된 토큰은 만료 시각까지 유효하다. 그래서 만료 시간이 짧을수록 안전하다.
- 서버 측 무효화(토큰 블랙리스트)는 저장소가 필요하고 Redis를 제외했으므로 MVP 범위 밖이다. DB 테이블로 구현할 수는 있지만 학습 범위와 일정상 선택 기능으로 남긴다.

### 7.4 XSS와 CSRF 비교

공식 문서에서 확인한 사실 (Spring Security 6.5.11 CSRF 문서 원문)
- "Spring Security protects against CSRF attacks by default for unsafe HTTP methods, such as a POST request."
- "Our recommendation is to use CSRF protection for any request that could be processed by a browser by normal users. If you are creating a service that is used only by non-browser clients, you likely want to disable CSRF protection."
- "What if my application is stateless? That does not necessarily mean you are protected." (stateless 브라우저 애플리케이션 절)
- 이 문서는 Authorization 헤더에 토큰을 넣는 API를 따로 다루지 않는다. 아래 판단은 이 프로젝트의 **자체 설계 판단**이다.

| 방식 | XSS (스크립트가 토큰을 훔침) | CSRF (다른 사이트가 요청을 대신 보냄) | 필요한 설정 |
| --- | --- | --- | --- |
| Bearer 헤더 + localStorage/sessionStorage | 취약. JS가 토큰을 읽을 수 있다 | 브라우저가 헤더를 자동으로 붙이지 않으므로 상대적으로 낮다고 판단 | 서버에서 CSRF 비활성화 설정, CSP 헤더, React 기본 이스케이프 유지 |
| Bearer 헤더 + 메모리 | XSS 노출이 가장 적다 | 위와 같음 | 새로고침하면 로그아웃, Refresh Token 없이는 불편 |
| HttpOnly 쿠키 | JS가 토큰을 읽지 못해 탈취는 어렵다 | 브라우저가 쿠키를 자동으로 보내므로 취약. 방어 필요 | CSRF 토큰 또는 SameSite 설정, 서버 CSRF 활성화, 구현 복잡도 증가 |

- KIX는 브라우저(React)가 쓰는 API라서 공식 문서의 "비브라우저 전용 서비스는 CSRF를 끄는 편이 좋다"는 설명을 그대로 적용할 수는 없다. 헤더 방식이면 쿠키를 쓰지 않으므로 CSRF 토큰 없이 비활성화하는 판단이 가능하지만, 이 근거는 공식 문서가 아니라 프로젝트 자체 판단이다.
- 제안(확정 아님): 만료 60분, Bearer 헤더, 브라우저 저장소, CSRF 비활성화, XSS 완화책(CSP, 사용자 입력 이스케이프, `dangerouslySetInnerHTML` 사용 금지). 실제 개인정보를 받지 않는 데모라는 전제 아래에서만 받아들일 수 있는 위험이다.
### 7.5 확정 정책 (2026-11-27, DEC-024)

- Spring Security + JWT + BCrypt, Access Token 60분, Refresh Token 제외, `Authorization: Bearer`, **React 메모리에만 저장**(7.2의 localStorage·sessionStorage 제안은 폐기), Stateless, 새로고침·만료 시 재로그인, 일반 회원/관리자 구분, 인증 실패 401·권한 부족 403, 관리자 공개 가입 금지
- **CSRF 검토**: 공식 문서 원문(Spring Security 7.2.0 reference)은 "브라우저가 처리할 수 있는 요청에는 CSRF 보호를 권장하고, 비브라우저 클라이언트 전용 서비스라면 끄는 것이 좋다"고 하면서 "stateless라고 안전한 것은 아니다"라고 경고한다. CSRF의 전제는 **브라우저가 인증 정보를 자동으로 보내는 것**이다. KIX는 쿠키·세션·Basic 인증을 쓰지 않고 JS가 토큰을 헤더에 직접 붙이므로 이 전제가 성립하지 않는다. 따라서 `csrf.disable()`이 일관된다고 판단한다. 단, 공식 문서가 Bearer 헤더 방식을 직접 다루지는 않으므로 이 연결은 **자체 설계 판단**이다.
  - 조건: 인증에 쿠키를 쓰지 않는다. 세션을 만들지 않고(`STATELESS`), remember-me·Basic·formLogin을 쓰지 않는다. 쿠키 인증을 도입하면 CSRF를 다시 켜야 한다.
- 공식 문서의 설정 예 (원문): `.csrf((csrf) -> csrf.disable())`, `.sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`(`NullSecurityContextRepository`를 쓰고 요청을 세션에 저장하지 않음), `authorizeHttpRequests`의 `requestMatchers(...).hasRole("ADMIN")`과 `anyRequest().authenticated()`(`hasRole`은 `ROLE_` 접두사를 붙이지 않는다). BCrypt는 `BCryptPasswordEncoder`, 기본 강도 10, 일부러 느리게 만든 적응형 해시다.
- **401/403**: 공식 문서는 `AuthenticationEntryPoint`(인증 요구)와 `AccessDeniedHandler`(접근 거부)를 설명하지만 **기본 상태 코드를 명시하지 않는다.** 두 핸들러에서 401과 403을 명시적으로 지정하고 테스트(T-11)로 검증한다.
- **한계 (이번 범위에서 감수)**
  1. XSS: 토큰이 메모리에 있어도 악성 스크립트가 실행되면 같은 페이지에서 토큰을 읽거나 API를 대신 호출할 수 있다. 메모리 저장은 저장소(localStorage) 탈취를 막을 뿐 XSS 자체를 막지 못한다.
  2. JWT 탈취: 유출되면 만료(60분)까지 누구나 쓸 수 있고 서버가 즉시 폐기할 수 없다. HTTPS가 없으면 네트워크에서 노출될 수 있다.
  3. 토큰 만료: 60분 뒤 재로그인해야 하고 Refresh Token이 없어 사용 중에 끊길 수 있다.
  4. 로그아웃: 클라이언트가 토큰을 지울 뿐 서버의 토큰은 만료 전까지 유효하다. 서버 측 즉시 폐기는 이번 범위에서 제외한다.
  5. 새로고침하면 로그아웃된다 (메모리 저장의 트레이드오프).
  - 완화: Nginx의 CSP 헤더, 출력 이스케이프 유지, `dangerouslySetInnerHTML` 금지, HTTPS 적용 전에는 실제 개인정보·실사용 비밀번호 입력 금지

## 8. 사용자 검토·협의 사항

1. 재고 단위를 `product_options`로 옮기고 `products.stock`을 제거하는 것에 동의하는가?
2. 브랜드를 `brands` 테이블로 둘까, `products.brand` 문자열로 단순화할까?
3. 사이즈 범위·단위: `size_mm` 150~350 정수(5mm 단위 강제 여부)로 괜찮은가?
4. 주문에 상품명·사이즈 스냅샷을 저장하는 것에 동의하는가?
5. 주문 상태는 `ORDERED` 하나로 시작하고 취소는 선택 기능으로 두어도 되는가?
6. 같은 키 재전송 시 200(기존 주문), 최초 201로 정해도 되는가?
7. 오류 응답을 `ProblemDetail` 형식으로 통일하고, 타인 주문 조회는 404로 해도 되는가?
8. Access Token 60분과 localStorage/sessionStorage 방식으로 시작해도 되는가?
9. DEC-005(개발 순서), DEC-006(Java 21 + Boot 버전. 2026-11-27 공식 확인 결과는 `decisions.md` 참고)에 대한 결정. 빌드 도구는 Gradle로 확정(DEC-020)
10. 승인된 항목을 `05-erd.md`, `06-api-spec.md` 등 기준 문서에 반영하고 DDL 작성 학습 단계로 넘어가도 되는가? (DDL은 개발자가 직접 작성한다.)
11. ~~DEC-014의 컨벤션 충돌~~ → 2026-11-27 확정(DEC-019). 이 문서에는 반영 완료

## 9. 컨벤션 반영 내용 (DEC-019, 확정)

- 회원 도메인: 패키지 `com.kix.domain.member`, 엔티티 `Member`, 테이블 `members`, FK 컬럼 `member_id`, API `/api/members/me`. 역할 값 `USER`/`ADMIN`은 그대로 둔다(회원이 가질 권한 이름이므로 `members.role`에 저장).
- 제약·인덱스 이름 (최대 64자): `uk_orders_member_id_idempotency_key`, `uk_product_options_product_id_size_mm`, `uk_reviews_member_id_product_id`, `uk_members_email`, `uk_orders_order_number`, `fk_orders_member_id`, `fk_orders_product_option_id`, `idx_products_brand_id`, `chk_product_options_stock`, `chk_product_options_size_mm`, `chk_orders_quantity`, `chk_orders_total_price`, `chk_reviews_rating`, `chk_products_price`
- 복합 PK는 필요한 경우에만 사용한다. 이 설계에서는 `product_likes (member_id, product_id)` 한 곳뿐이다. 선정 이유
  1. 이 테이블은 "회원이 상품을 좋아한다"는 관계만 담는 연결 테이블이고, 다른 테이블이 이 행을 참조하지 않는다.
  2. (회원, 상품) 쌍 자체가 고유해야 하므로 복합 PK가 중복 방지 제약을 겸한다. 대리키 `id`를 쓰면 `uk_`를 따로 만들어야 하고 컬럼과 인덱스가 하나씩 늘어난다.
  3. 동시에 같은 PUT이 들어와도 PK 충돌 하나로 1건 유지가 보장된다 (LIK-02).
  - 대안: `id` 대리키 + `uk_product_likes_member_id_product_id`. JPA 매핑이 단순해지는 장점이 있지만 위 이유로 복합 PK를 선택한다. JPA에서 복합 PK는 `@EmbeddedId` 같은 매핑이 필요하다는 점을 학습 단계에서 설명한다.
  - 나머지 모든 테이블은 `id` 단일 PK를 쓴다.
- 위 이름은 ERD·DDL·Entity·API 명세에 함께 반영해야 한다. `05-erd.md`, `06-api-spec.md` 같은 v1.1 스냅샷은 `users`로 적혀 있으며 머리말에 변경 안내를 달았다.

## 10. 검토 항목 요약 (8장 1~10번)

각 항목이 왜 바뀌고 기존 설계에 무엇이 영향을 받는지 정리했다. 상태 열보다 문서 머리말의 **승인 현황**이 우선한다. 승인되지 않은 항목은 임의로 확정하지 않는다.

| # | 항목 | 변경 이유 | 기존 설계에 미치는 영향 | 상태 |
| --- | --- | --- | --- | --- |
| 1 | 재고 단위를 `product_options`로 이동 | 스니커즈는 사이즈별로 재고가 다르다. 구매 단위가 상품이 아니라 "상품+사이즈"다. | `products.stock` 삭제, `product_options` 신규, 락 대상이 옵션 행으로 변경, `orders`가 옵션을 참조, 관리자 옵션 API 추가, 테스트 T-06 추가. 05·06·08·09번 문서가 바뀐다. | 방향은 확정(DEC-003), 세부 검토 대기 |
| 2 | `brands` 테이블 | 브랜드 필터와 이름 일관성(오타·중복 방지) | `products.brand_id` FK, `GET /api/brands`, 목록 조회에 필터와 인덱스 추가. 대안은 `products.brand` 문자열(조인이 없어 단순하지만 오타·중복 위험) | 검토 대기 |
| 3 | `size_mm` 150~350 정수 | 한국 스니커즈 사이즈는 mm 단위이고 숫자라서 정렬과 CHECK가 쉽다. | `chk_product_options_size_mm`, 사이즈 선택 UI. 5mm 단위 강제는 앱 검증으로 처리 | 검토 대기 |
| 4 | 주문에 상품명·사이즈 스냅샷 | 상품명 수정이나 삭제 후에도 주문 내역이 그대로여야 한다. 가격 스냅샷과 같은 원칙 | `orders`에 컬럼 2개 추가, 주문 저장 로직과 응답 DTO 변경. 정규화 관점에서는 중복 저장이라는 트레이드오프가 있다. 대안은 조인으로 조회(이력이 변질될 위험) | 검토 대기 |
| 5 | 주문 상태 `ORDERED` 하나로 시작 | 선택 기능(취소)이 붙어도 스키마를 바꾸지 않으려는 것 | `orders.status` 추가, 취소 구현 시 상태 전이 로직만 추가 | 검토 대기 |
| 6 | 같은 키 재전송은 200, 최초는 201 | 클라이언트가 최초 처리와 재전송을 구분할 수 있다. | API 명세, 프론트는 둘 다 성공으로 처리, T-02 기대 결과 | 검토 대기 |
| 7 | 오류는 `ProblemDetail`, 타인 주문은 404 | 오류 형식 표준화(Spring 내장 사용), 타인 주문의 존재 여부를 숨긴다. | 공통 예외 처리 구조, 프론트 오류 처리, 테스트 T-11 | 검토 대기 |
| 8 | Access Token 60분, 브라우저 저장소 | Refresh Token을 제외해 구현을 단순하게 한다. | 프론트 저장·Axios 인터셉터, Security 설정, XSS 완화 필요. 7장 비교 참고 | **협의 후 확정** |
| 9 | 개발 순서와 버전 결정 | 핵심 가치(주문)를 일정 막바지에 몰아넣지 않으려는 것 | 학습 순서와 프로젝트 생성 단계. 버전 결정은 `decisions.md` DEC-006 | 검토 대기 |
| 10 | 승인 후 기준 문서 반영, DDL 학습 단계 진행 | 문서와 코드의 일관성 유지 | 05·06 문서 갱신, DDL은 개발자가 직접 작성 | 위 항목 확정 후 |
