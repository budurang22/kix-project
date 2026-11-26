---
paths:
  - "backend/**"
  - "docs/05-erd.md"
  - "docs/design-revision*.md"
---

# 데이터베이스 컨벤션

## 1. 네이밍

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 테이블 | 복수형 snake_case | `members`, `product_options`, `orders` |
| 컬럼 | snake_case | `unit_price` |
| 기본키 | `id` | |
| 외래키 컬럼 | `참조대상_id` | `member_id`, `product_option_id` |
| Boolean | `is_` 접두사 | `is_deleted` |
| 시각 | `created_at`, `updated_at` | |
| 인덱스 | `idx_` | `idx_products_brand_id` |
| 유니크 제약 | `uk_` | `uk_orders_member_id_idempotency_key` |
| 외래키 제약 | `fk_` | `fk_orders_member_id` |
| CHECK 제약 | `chk_` | `chk_product_options_stock` |

- 제약·인덱스 이름은 최대 64자다 (MySQL 8.4 CHECK 문서 원문). 길어지면 줄인다.
- 회원 테이블은 `members`다 (`users` 아님).

## 2. 기본키

기본은 `id` 단일 PK다. **복합 PK는 필요한 경우에만** 쓰고, 이유를 문서에 적는다. 현재는 `product_likes (member_id, product_id)` 한 곳이다 (연결 테이블, 쌍 자체가 고유, 다른 테이블이 참조하지 않음. `design-revision-v1.2.md` 9장).

## 3. CHECK 제약 (MySQL 8.4 원문)

- 문법: `CONSTRAINT 이름 CHECK (식)`. `NOT ENFORCED`가 아니면 검사한다.
- 식에는 서브쿼리, 변수, 저장 함수, `AUTO_INCREMENT` 컬럼, 다른 테이블 컬럼을 쓸 수 없다.
- 외래키 참조 동작(`ON UPDATE`, `ON DELETE`)이 걸린 컬럼은 CHECK에 쓸 수 없다.
- 위반 시 실제로 오류가 나는지는 MySQL 8.4 컨테이너에서 직접 시험해 기록한다 (적용 시작 버전은 원문 미확인).

## 4. 일관성

ERD, DDL, Entity, API 명세가 같은 이름과 제약을 쓰도록 유지한다. 한 곳을 바꾸면 나머지를 함께 확인한다.
반영할 설계: 사이즈별 재고(`product_options`), 가격 스냅샷, 주문 상태, 멱등성 키, 데이터 제약조건.

## 5. 설명 규칙

인덱스와 제약조건을 추가할 때는 목적, 동작 원리, 없을 때 생기는 문제를 설명한다. **DDL은 개발자가 직접 작성한다.** Flyway 도입은 검토 중이다 (`docs/tech-stack.md` 2장).
