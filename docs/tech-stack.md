# 기술 스택 & 배포 아키텍처 (현행)

> 이 문서가 현재 기준이다. `07-tech-stack.md`는 Notion v1.1 원본 스냅샷이다.
> 근거와 검증 수준은 [references.md](references.md) 7장, 결정은 [decisions.md](decisions.md)(DEC-006, 019~023)에 있다.
> 표기: **(원문)** 공식 문서 원문에서 확인 / **(요약)** 도구가 요약한 내용이라 재확인 필요 / **(미확인)** 확인하지 못함 / **(설계)** 프로젝트 자체 판단
> 사용자 승인 없이 기술 스택을 바꾸거나 라이브러리를 추가하지 않는다. 모든 설정 파일 작성, 명령어 실행, 배포는 개발자가 직접 한다.
> 아직 실행해서 검증한 항목은 없다 (로컬 도구 버전 확인 제외).

## 1. 기술 스택 표

적용 여부: **확정** 사용하기로 함 / **후보** 버전 확정 대기 / **검토** 도입 여부 검토 중 / **선택** 필요할 때만

### 1.1 Frontend

| 기술 | 버전 | 사용 목적 | 선정 이유 | 공식 문서 | 적용 |
| --- | --- | --- | --- | --- | --- |
| React | 19.3 (react.dev 표시 최신, 원문) | UI | 사용자 지정 | https://react.dev/versions | 확정 |
| JavaScript | - | 언어 (TypeScript 아님) | 학습 연속성 | - | 확정 |
| Vite | docs 8.4.0, Node 20.19+ 또는 22.12+ 필요 (원문). 로컬 Node 24.21.0 조건 충족 | 개발 서버, 빌드 | React 표준 도구, 스캐폴딩 `npm create vite@latest` | https://vite.dev/guide/ | 확정 (설치 시 버전 재확인) |
| Tailwind CSS | docs 4.3. `tailwindcss` + `@tailwindcss/vite`, CSS에 `@import "tailwindcss";` (원문). `@tailwindcss/vite` 4.3.5의 peer 의존성이 `vite ^5.2.0 || ^6 || ^7 || ^8`이라 Vite 8.4.0과 호환 (npm 레지스트리 원문) | 기본 스타일링 | 사용자 지정, `@theme`로 디자인 토큰 연결 | https://tailwindcss.com/docs/installation/using-vite | 확정 |
| React Router | **7.x 우선** (7.18.7: Node>=20, React>=18 — npm 레지스트리 원문. 로컬 Node 24.21.0, React 19.3과 호환). 최신 8.5.3은 Node>=22.22.0, React>=19.2.7이 필요하다. 설치 `npm i react-router`, Declarative 모드는 `BrowserRouter` (원문, 8.x 페이지 기준이라 7.x 문서로 재확인) | 클라이언트 라우팅 | 사용자 지정 | https://reactrouter.com/start/declarative/installation | 확정 (7.x 문서 확인 후 설치) |
| Axios | v1.x. 문서가 axios.rest로 이전됨. `npm install axios`, `interceptors.request.use` (원문). Authorization 헤더 설정 예시는 페이지에 없음 | HTTP 클라이언트, 토큰 헤더 | 사용자 지정 | https://axios.rest/pages/getting-started/first-steps | 확정 |

### 1.2 Backend

| 기술 | 버전 | 사용 목적 | 선정 이유 | 공식 문서 | 적용 |
| --- | --- | --- | --- | --- | --- |
| Java | 21 LTS. 로컬 Homebrew OpenJDK 21.0.12.1 설치됨, 기본 JDK는 26(실측) | 언어 | 사용자 지정. Boot 3.5(Java 17~25)와 4.x(17~27) 모두 호환 (원문) | https://docs.spring.io/spring-boot/3.5/system-requirements.html | 확정 |
| Spring Boot | **4.2.0** (2026-11-28 사용자 결정으로 4.1.3에서 변경, DEC-025). Java 17~27, Spring Framework 7.1.0+, Gradle 8.14+/9.x, Jakarta EE 11·Servlet 6.1, Tomcat 11 (4.2 문서 원문). OSS 지원 2027-12-31까지 (공식 Spring API) | 프레임워크 | 지원 중인 안정 버전 우선 (DEC-006, DEC-024). Boot 관리 의존성은 개별 버전을 지정하지 않는다. | https://docs.spring.io/spring-boot/system-requirements.html | 확정 |
| Spring MVC | Boot 관리 | REST API | 표준 웹 계층 | Boot 문서 | 확정 |
| Spring Data JPA / Hibernate | Boot 4.2.0 관리 Hibernate 7.4.15.Final (관리 표 원문). 스타터 `spring-boot-starter-data-jpa` (4.0 마이그레이션 가이드 원문) | ORM, 락(`PESSIMISTIC_WRITE`) | 사용자 지정 | https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html | 확정 |
| Spring Security | Boot 4.2.0 관리 7.2.0 (관리 표·릴리스 노트 원문). 스타터 `spring-boot-starter-security`. 읽은 reference 문서(CSRF·STATELESS·BCrypt·인가)도 7.2.0이라 관리 버전과 같다 | 인증·인가 | 사용자 지정 | https://docs.spring.io/spring-security/reference/ | 확정 |
| JWT | 라이브러리 **미정** | 토큰 발급·검증 | 사용자 지정(기술명만 정해짐). 구현 방식(직접 필터 vs OAuth2 Resource Server)은 학습 단계에서 비교 | (미조회) | 후보 |
| BCrypt | Spring Security `PasswordEncoder` | 비밀번호 해시 | 사용자 지정 | (미조회) | 확정 |
| Bean Validation | Boot 관리 | 입력 검증 | 사용자 지정 | (미조회) | 확정 |
| Gradle | Wrapper(생성된 버전 9.9.2). Boot 4.2.0: 8.14+ 또는 9.x (원문). 로컬에는 별도 설치 없이 Wrapper 사용 | 빌드 | 사용자 지정 | https://docs.spring.io/spring-boot/system-requirements.html | 확정 |
| Springdoc OpenAPI | 호환표(원문): Boot 4.2.x ↔ springdoc **3.2.1**. 산출물 `springdoc-openapi-starter-webmvc-ui`, 기본 경로 `/swagger-ui.html`, `/v3/api-docs` | API 문서화 | 사용자 지정 | https://springdoc.org/ | 확정 (정확한 버전은 의존성 추가 단계에서 확인) |
| Lombok | Boot 4.2.0 관리 1.18.48 (관리 표 원문) | 보일러플레이트 감소 | 사용자 결정(2026-11-28)으로 도입 (DEC-026). 사용 규칙은 `backend.md` | https://projectlombok.org/setup/gradle | **확정** |

### 1.3 Database

| 기술 | 버전 | 사용 목적 | 선정 이유 | 공식 문서 | 적용 |
| --- | --- | --- | --- | --- | --- |
| MySQL | 8.4 LTS 후보 (Docker 공식 이미지 태그 존재, 요약) | 데이터 저장 | 사용자 지정. CHECK는 `CONSTRAINT 이름 CHECK (...)` 문법, 이름 최대 64자 (원문) | https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html | 확정 (정확한 태그는 컨테이너 구성 시) |
| MySQL Connector/J | Boot 4.2.0 관리 26.10.0 (관리 표 원문). 4.1 릴리스 노트가 "MySQL 9.7.0"으로 적어 표기가 달랐던 점은 구성 단계에서 재확인 | JDBC 드라이버 | Boot 기본 | Boot 의존성 표 | 확정 |
| HikariCP | Boot 4.2.0 관리 7.1.0 (관리 표·릴리스 노트 원문). `maximumPoolSize` 기본 10 (README 원문, 7.x에서 달라졌는지는 미확인), `minimumIdle` 기본 maximumPoolSize, `connectionTimeout` 기본 30초 (원문) | 커넥션 풀 | Boot 기본, 동시성 테스트 해석에 필요 | https://github.com/brettwooldridge/HikariCP | 확정 |
| Flyway | Boot 4.2.0 관리 Flyway 12.11.0 (관리 표·릴리스 노트 원문). Boot 4.x는 `spring-boot-starter-flyway` 필요(4.0 마이그레이션 가이드 원문). 3.5 문서 기준 MySQL은 `flyway-mysql`, 기본 위치 `classpath:db/migration`. **MySQL 8.4 지원은 Flyway 지원 표에서 확인하지 못함(MySQL 목록에 8.4 표기 없음)** | 스키마 이력 관리 | 제약·인덱스 이름이 있는 DDL을 코드로 관리하고 테스트·CI·배포에서 같은 스키마를 쓰기 위해 | https://documentation.red-gate.com/fd/supported-databases-and-versions-143754067.html | **보류** (신규 기술 도입 중단, DDL 학습 단계에서 재검토) |

### 1.4 DevOps / Infrastructure

| 기술 | 버전 | 사용 목적 | 선정 이유 | 공식 문서 | 적용 |
| --- | --- | --- | --- | --- | --- |
| Docker / Compose | 로컬 29.8.2 / v5.6.0 (실측). 데몬 실행 여부는 미확인 | 컨테이너 | 사용자 지정 | https://docs.docker.com/compose/how-tos/startup-order/ | 확정 |
| Nginx | 미정 | 정적 파일, `/api` 프록시 | 사용자 지정 | https://nginx.org/en/docs/http/ngx_http_proxy_module.html | 확정 |
| AWS EC2 / VPC / Security Group / EBS | 사양은 9장 | 서버 | 사용자 지정 | https://aws.amazon.com/ec2/instance-types/t3/ | 확정 |
| GitHub Actions | - | 빌드·테스트·배포 자동화 | 사용자 지정 | https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax | 확정 (단계적, 8장) |

### 1.5 Testing / Code Quality

| 기술 | 버전 | 사용 목적 | 선정 이유 | 공식 문서 | 적용 |
| --- | --- | --- | --- | --- | --- |
| JUnit Jupiter | Boot 4.2.0 관리 6.1.3 (관리 표 원문, 공식 문서 최신 6.1.3과 같고 Java 17+ 필요). **Boot 관리 버전을 따른다** | 테스트 프레임워크 | `spring-boot-starter-test`에 포함 (원문) | https://docs.junit.org/current/user-guide/ | 확정 |
| AssertJ | 3.27.7 (Boot 4.2.0 관리 표 원문). Java 8+ | 읽기 쉬운 단언, `assertThatThrownBy` | starter-test 포함 | https://assertj.github.io/doc/ | 확정 |
| Mockito | 5.24.0 (Boot 4.2.0 관리 표 원문, 사이트의 최신과 같음) | 협력 객체 대역 | starter-test 포함 | https://site.mockito.org/ | 확정 (과도한 Mock 지양) |
| MockMvc, `@WebMvcTest`, `@SpringBootTest`, `@DataJpaTest` | Boot 관리. Boot 4에서는 테스트 스타터가 기술별로 분리됨(`spring-boot-starter-webmvc-test` 등, 마이그레이션 가이드 원문). `@MockBean`/`@SpyBean` 제거 → `@MockitoBean`/`@MockitoSpyBean`, `@SpringBootTest`만으로는 MockMvc 미제공이라 `@AutoConfigureMockMvc` 필요 (4.0 마이그레이션 가이드 원문) | 웹 계층·통합·JPA 슬라이스 테스트 | 3.5 테스트 문서로 개념을 확인했다. **4.2 테스트 문서는 구현 전에 읽는다(미확인)** | https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html | 확정 (4.2 문서 확인 후 구현) |
| `ExecutorService`, `CountDownLatch` | Java 21 | 동시 요청 시뮬레이션 | 표준 라이브러리. Javadoc 예시가 "시작 신호 + 완료 신호" 패턴 (원문) | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CountDownLatch.html | 확정 |
| 실제 MySQL 통합 테스트 | MySQL 8.4 (Docker Compose) | 동시성·멱등성·제약·롤백 검증 | H2 같은 대체 DB는 락·제약 동작이 다르다 | - | 확정 |
| Testcontainers | Boot 4.2.0 관리 2.0.5, 좌표 `testcontainers-mysql` (관리 표 원문. Testcontainers 사이트 좌표와 일치). macOS는 Docker Desktop이 테스트 대상 환경 (원문) | 테스트용 MySQL 컨테이너 자동 기동 | Compose MySQL로 충분하면 불필요 | https://docs.spring.io/spring-boot/3.5/reference/testing/testcontainers.html | **선택** |
| JaCoCo | 최신 릴리스 0.8.16 (2026/10/24), Java 21·25 공식 지원 (원문). Gradle 플러그인 기본 0.8.15, `jacocoTestReport`는 `test`에 자동으로 붙지 않음 (원문) | 커버리지 리포트 | 수치보다 규칙 검증이 우선이므로 보조 | https://docs.gradle.org/current/userguide/jacoco_plugin.html | **선택** |
| Postman | (미조회) | API 수동 테스트 | 사용자 지정 | https://learning.postman.com/ | 확정 (공식 문서 미확인) |
| Spotless + google-java-format | Spotless Gradle 플러그인 8.12.0 (2026-11-21), Gradle 7.3+/JRE 17+ 필요, `googleJavaFormat().aosp()`로 AOSP 선택. 플러그인 기본 google-java-format은 2.0.0(8.11.0 변경 내역), google-java-format 실행에는 JDK(Java 21, README의 "currently Java 21") 필요 (원문) | 포맷 검사·자동 적용 | 4칸 들여쓰기를 AOSP 스타일로 맞춤 | https://github.com/diffplug/spotless/blob/main/plugin-gradle/README.md | 확정 (`reorderImports` 기본값 등 세부는 미확인) |
| ESLint | 최신 v10.15.0, Node `^20.19.0`, `^22.13.0`, `>=24`, `npm init @eslint/config@latest`, `eslint.config.js` (원문) | JS 린트 | 사용자 지정 | https://eslint.org/docs/latest/use/getting-started | 확정 |
| Prettier | 3.10.1, `eslint-config-prettier`로 충돌 규칙 비활성화 (원문) | 포맷 | 사용자 지정 | https://prettier.io/docs/install | 확정 |
| EditorConfig | `.editorconfig`, `indent_style`, `indent_size` (원문) | 편집기 공통 설정 | 사용자 지정 | https://editorconfig.org/ | 확정 |
| Playwright, Checkstyle, Commitlint | - | E2E, 정적 분석, 커밋 검사 | 필요성과 일정을 보고 결정 | - | **선택** |

## 2. 버전·도입 결정 상태

| 항목 | 상태 | 비고 |
| --- | --- | --- |
| Spring Boot 버전 | **확정: 4.2.0** (4.1.3에서 변경, DEC-025) | 3.5.x는 2026-06-30에 OSS 지원 종료(공식 Spring API, 원문). 근거는 DEC-006·DEC-024 |
| Flyway 도입 | **보류** (신규 기술 도입 중단) | 필요성은 높다. 제약·인덱스 이름이 있는 DDL은 Hibernate 자동 생성으로 재현할 수 없고(설계), 테스트·CI·배포에서 같은 스키마가 필요하다. Boot 3.5는 `flyway-mysql` 모듈과 `db/migration` 위치를 사용한다 (원문). 단 Flyway 지원 표에 MySQL 8.4가 보이지 않으므로 8.4 컨테이너에서 실제 migrate가 되는지 시험한 뒤 확정한다. 대안: DDL SQL을 개발자가 직접 실행하고 `ddl-auto=validate` |
| JWT 라이브러리 | 미정 | 학습 단계 3(인증)에서 비교 후 결정 |
| React Router 메이저 | **확정: 7.x 우선** | 7.x 문서 확인 후 설치 |
| 인증 방식(만료·저장·CSRF) | **확정** (60분, 메모리 저장, CSRF 비활성화 검토) | DEC-024, `design-revision-v1.2.md` 7장 |

## 3. 패키지 구조

### 3.1 백엔드 (확정, DEC-019)

```
com.kix
├── global
│   ├── config        # 공통 설정 (Swagger 등)
│   ├── security      # JWT, 인증·인가
│   ├── exception     # 공통 예외 처리 (@RestControllerAdvice, ProblemDetail)
│   └── response      # 공통 응답·오류 구조
└── domain
    ├── member        # Member, 로그인·회원가입, /api/members/me
    ├── product       # Product, ProductOption, Brand
    ├── order         # Order, 재고 차감, 멱등성
    ├── review
    └── like
```

각 도메인 안에 필요한 `controller`, `service`, `repository`, `entity`, `dto`를 둔다. 위 구조는 **방향**이며 디렉터리와 코드는 개발자가 직접 만든다. `Brand`를 `product` 안에 둘지 따로 둘지는 학습 단계에서 정한다.

### 3.2 프론트엔드

`assets/`, `components/`(공통 UI), `features/`(도메인 기능), `pages/`, `hooks/`, `api/`, `layouts/`, `routes/`, `styles/`, `utils/`. 컴포넌트 파일은 PascalCase, 그 외 파일은 kebab-case.

## 4. 배포 아키텍처 (DEC-017, 확정)

```
Browser
  │  80 / 443 (공개)
  ▼
┌──────────────── EC2 단일 인스턴스 (Docker Compose) ────────────────┐
│  [frontend 컨테이너]  React + Tailwind 빌드 결과물 + Nginx          │
│    ├─ /      → 정적 파일 (SPA)                                     │
│    └─ /api/  → Reverse Proxy ──┐                                   │
│                                ▼  (Docker 내부 네트워크)           │
│  [backend 컨테이너]   Spring Boot + JPA :8080 (호스트·외부 비공개) │
│                                ▼  (Docker 내부 네트워크)           │
│  [mysql 컨테이너]     MySQL :3306          (호스트·외부 비공개)    │
│                                │                                   │
│                           Docker Volume (데이터 영속)              │
└────────────────────────────────────────────────────────────────────┘
```

- 외부에 열리는 포트는 Nginx의 80(HTTPS 적용 시 443)뿐이다.
- 컨테이너는 Compose의 내부 네트워크에서 서비스 이름(`backend`, `mysql`)으로 통신한다. (설계)
- `depends_on`의 짧은 목록 문법은 시작 순서만 정하고 healthy를 기다리지 않는다. `condition: service_healthy`와 `healthcheck`를 함께 쓴다 (원문, Compose startup-order 문서의 설명을 요약으로 확인했으므로 구성 단계에서 원문 재확인).

## 5. 컨테이너 구성

### 5.1 frontend

- 멀티 스테이지 빌드: Node 이미지에서 `npm ci` + `npm run build` → Nginx 이미지에 `dist/`만 복사. (설계)
- `location /`에서 `try_files $uri $uri/ /index.html;`로 새로고침 404 방지, `location /api/`에서 `proxy_pass http://backend:8080;`와 `proxy_set_header Host $host;` (설계. `proxy_pass`·`proxy_set_header` 자체는 nginx 문서로 확인, `try_files` 조합은 직접 시험 전까지 추론)
- 브라우저는 항상 같은 출처(`/api`)로 요청하므로 CORS 설정이 필요 없다.

### 5.2 backend

- Spring Boot JAR을 JRE 이미지로 실행하는 멀티 스테이지 빌드. DB 주소·계정·JWT Secret은 환경변수로 받는다.
- 상태 확인 엔드포인트는 Compose healthcheck용으로 검토한다.

### 5.3 mysql

- 공식 `mysql` 이미지 8.4 계열, 데이터 디렉터리를 named volume에 연결해 컨테이너를 다시 만들어도 데이터가 유지되게 한다 (검증 T-13).
- 초기 DB 이름·계정은 환경변수로 지정한다.

## 6. 환경변수와 민감 정보

| 구분 | 정책 |
| --- | --- |
| 저장 | 서버의 `.env`(권한 제한)에만 실제 값을 둔다. Git에는 `.env.example`(이름만)만 올린다. |
| 전달 | Compose `environment`/`env_file`로 주입한다. 이미지에 값을 굽지 않는다. |
| CI | GitHub Actions Secrets에 보관하고 로그에 출력하지 않는다. |
| AWS 자격 증명 | 장기 Access Key 대신 GitHub OIDC + IAM Role을 우선 검토한다 (원문: `id-token: write`, `role-to-assume`, 신뢰 정책에서 저장소·브랜치 제한). |
| 프론트엔드 | `VITE_*` 값은 번들에 들어가 브라우저에 노출되므로 비밀을 넣지 않는다. |
| 기록 | 비밀값은 문서·로그·대화에 남기지 않는다. |

## 7. 네트워크와 보안 그룹 (DEC-021)

| 포트 | 허용 | 이유 |
| --- | --- | --- |
| 80 | 전체 | HTTP |
| 443 | 전체 (HTTPS 적용 시) | HTTPS |
| 22 (SSH) | **개발자 IP만** (확정) | 관리용. 개발자 IP가 바뀌면 보안 그룹 규칙을 갱신해야 한다. |
| 8080, 3306 | 열지 않음 | 호스트에도 게시하지 않는다. 컨테이너 내부 네트워크에서만 사용 |

- **로컬 개발 (확정, DEC-024)**: Spring Boot는 IDE에서 직접 실행하고, React는 Vite 개발 서버, MySQL은 Docker Compose로 실행한다. IDE에서 접속해야 하므로 MySQL 호스트 포트는 **`127.0.0.1`에만 바인딩**한다 (예: `127.0.0.1:3306:3306`). 서버·운영 Compose에서는 8080과 3306을 호스트에 게시하지 않는다.

## 8. CI/CD (GitHub Actions)

### 8.1 워크플로 분리 (설계)

| 워크플로 | 트리거 | 하는 일 |
| --- | --- | --- |
| `backend-ci` | `backend/**` 변경 | JDK 21 설치, 빌드, 테스트(MySQL 필요), Spotless 검사 |
| `frontend-ci` | `frontend/**` 변경 | Node 설치, `npm ci`, ESLint·Prettier 검사, 빌드 |
| `deploy` | `main` 병합 | 이미지 빌드 → 레지스트리 푸시 → EC2에서 갱신 |

- `on.push.paths` 필터와 `needs`는 GitHub 문서로 확인했다 (요약). CI에서 MySQL을 띄우는 `services` 설정은 **미확인**이다 (문서 예시는 PostgreSQL).

### 8.2 배포 자동화와 "SSH는 개발자 IP만"의 충돌 (결정 필요)

GitHub Actions 러너는 개발자 IP가 아니므로, Actions가 EC2에 SSH로 접속하려면 22번 포트를 개발자 IP 외에도 열어야 한다. 이는 확정된 SSH 제한과 충돌한다.

| 방식 | 동작 | 22번 포트 | 비고 |
| --- | --- | --- | --- |
| A. SSM Run Command | Actions가 `aws ssm send-command`(`AWS-RunShellScript`)로 EC2에서 스크립트 실행 (원문: CLI 문서) | 개발자 IP만 유지 가능 | EC2에 SSM Agent·IAM 권한·아웃바운드 통신 필요. 요건은 **미확인** |
| B. Actions에서 SSH | 러너가 EC2에 SSH | GitHub 러너 IP 대역을 열어야 해서 제한이 사라짐 | 비추천 |
| C. 반자동 | Actions는 이미지 빌드·푸시까지만 하고, 개발자가 개발자 IP로 SSH 접속해 `pull` + `up -d` | 개발자 IP만 | "최종 배포 자동화"는 달성하지 못함 |

**결정 (DEC-024)**: 이미지 저장소는 GHCR, 배포는 SSM(A)을 **우선 검토**한다. 일정이 부족하면 이미지 등록 자동화까지 먼저 하고 배포는 수동(C)으로 시작한다. SSH를 전체 공개하지 않는다(개발자 IP만). SSM 요건과 GHCR 인증은 배포 단계에서 공식 문서로 확인한다.

### 8.3 적용 순서 (제안)

수동 배포 → CI → CD → HTTPS. 못 한 단계는 "미적용"으로 기록한다.

## 9. EC2 사양

| 인스턴스 | vCPU | 메모리 | 기준 CPU(vCPU당) | 온디맨드 시간당 |
| --- | --- | --- | --- | --- |
| t3.micro | 2 | 1 GiB | 10% | $0.0104 |
| t3.small | 2 | 2 GiB | 20% | $0.0209 |

(요약 수준. 요금의 리전 기준은 확인하지 못했다.)

- 사양은 **비용과 실제 리소스 사용량**을 보고 결정한다. 지금은 측정값이 없다. 컨테이너를 실제로 띄운 뒤 `docker stats`로 JVM과 MySQL의 메모리·CPU를 재고 기록한다. 그 전까지의 t3.small 이상 권장은 추정이다.
- 프리 티어: 2025-07-15 이후 생성 계정은 t3.micro, t3.small, t4g.micro, t4g.small 등이 대상이고 6개월 또는 크레딧 소진까지다 (요약). 본인 계정은 콘솔에서 확인한다.
- t4g(ARM)는 Mac(arm64)과 같은 아키텍처지만 GitHub 기본 러너는 x86이다. 이미지 아키텍처를 맞춰야 한다 (미확인). 처음에는 x86(t3)이 단순하다.

## 10. HTTPS

| 방안 | 동작 | 장점 | 단점·확인 필요 |
| --- | --- | --- | --- |
| A. Let's Encrypt + Certbot(webroot) | Nginx가 응답하는 공유 볼륨에 인증 토큰을 쓰고 인증서를 볼륨에 저장 | 무료, 단일 인스턴스에 적합 | 도메인 필요. 갱신 후 Nginx reload 필요. 공식 문서 원문 미열람 |
| B. ACM 내보내기 가능 인증서 | 요청 시 export를 켠 인증서를 EC2에서 사용 | AWS 안에서 관리 | 2025-06-17 이전 인증서는 내보낼 수 없음. 비용·절차 미확인 |
| C. ALB/CloudFront + ACM | 로드 밸런서에서 TLS 종료 | 확장에 유리 | 단일 인스턴스 학습 프로젝트에는 비용·복잡도 증가 |

도메인과 HTTPS는 **배포 단계에서 검토**한다. HTTPS가 없으면 실제 개인정보나 실제로 쓰는 비밀번호를 입력하지 않는다.

## 11. 단일 인스턴스 vs 다중 인스턴스

### 11.1 일반 비교

| 항목 | 단일 인스턴스 (현재) | 다중 인스턴스 |
| --- | --- | --- |
| 구성 | 한 서버에 3 컨테이너 | 프론트·백엔드·DB를 별도 서버(또는 관리형 DB)로 분리, 앞단에 로드 밸런서 |
| 장점 | 단순, 저렴, 컨테이너 내부 통신 | 장애 격리, 개별 확장, 무중단 배포 가능 |
| 한계 | 서버가 죽으면 전체 중단(SPOF), JVM·MySQL 자원 경쟁, 배포 시 짧은 중단, 수평 확장 어려움 | 비용, 네트워크·보안·운영 복잡도 증가 |
| DB | 같은 서버의 컨테이너 | 별도 서버 또는 관리형 DB |
| 세션 | JWT 무상태라 서버가 늘어도 로그인 유지 가능 | 동일 |

### 11.2 기존에 학습한 EC2 2개 방식과의 차이

**기존 2개 구성이 정확히 어떤 것이었는지 자료가 없다.** 일반적인 두 형태로 비교하며, 실제 구성을 알려 주시면 맞춰서 고친다.

| 항목 | 2개 방식 (일반적인 형태 ① 프론트 EC2 + 백엔드·DB EC2, ② 앱 EC2 + DB EC2) | 1개 방식 (이번) |
| --- | --- | --- |
| 서버 간 통신 | 인스턴스 사이를 네트워크로 연결. 보안 그룹에서 서버 간 포트(예: 8080, 3306)를 허용해야 한다. | Docker 내부 네트워크, 서비스 이름으로 통신. 호스트 포트 게시 없음 |
| 외부 노출 | 백엔드 포트가 다른 인스턴스에서 접근되므로 노출 범위 관리가 더 필요 | 80/443만 노출 |
| CORS | ① 프론트와 API가 다른 주소면 CORS 설정과 API 주소 설정 필요 | Nginx가 같은 출처로 묶어 CORS 불필요 |
| 장애 격리 | 한쪽이 죽어도 다른 쪽은 살아 있다. | 서버가 죽으면 전부 중단 |
| 자원 | 서버별로 메모리·CPU를 분리 | JVM과 MySQL이 한 서버를 나눠 씀 |
| 비용 | 인스턴스 2배(+서버 간 통신) | 1대 |
| 배포 | 서버마다 배포하고 순서를 맞춰야 함 | `docker compose` 한 번 |
| 확장 | 인스턴스 단위로 개별 확장 | 확장하려면 분리해야 함 |

## 12. 분리 가능하도록 하는 설계 원칙

| 원칙 | 이유 |
| --- | --- |
| 백엔드는 **무상태**(JWT) | 여러 인스턴스로 늘리기 쉽다 |
| DB 접속 정보는 환경변수로만 | 컨테이너 DB를 외부 DB로 바꿀 때 코드 변경이 없다 |
| 프론트의 API 기본 주소를 한 곳에서만 정의 | 같은 출처(`/api`) 대신 별도 도메인으로 바꿀 수 있다 |
| CORS 허용 출처를 설정값으로 관리, 기본은 끔 | 프론트와 백엔드를 다른 도메인으로 분리할 때 켠다 |
| 이미지를 레지스트리에 푸시하고 서버는 pull만 함 | 어느 서버에서도 같은 이미지를 실행한다 |
| 로그는 stdout | 수집 도구를 붙이기 쉽다 |
| 프론트(Nginx)와 백엔드를 별도 이미지로 유지 | 별도 서버로 옮길 때 그대로 이동 |

## 13. 테스트 환경 요약 (DEC-023)

- 테스트 방식과 TDD 범위는 [learning/tdd.md](learning/tdd.md)와 `.claude/rules/testing.md`에 있다.
- 동시성·멱등성·롤백·제약은 실제 MySQL 8.4(Docker Compose)에서 검증한다.
- `@DataJpaTest`는 기본적으로 각 테스트를 트랜잭션으로 감싸고 끝나면 롤백한다. 임베디드 DB가 클래스패스에 있으면 그것을 구성하고, 실제 DB를 쓰려면 `@AutoConfigureTestDatabase(replace = Replace.NONE)`을 쓴다 (원문).
- 동시성 테스트는 여러 스레드가 각자 커밋해야 하므로 테스트 메서드를 `@Transactional`로 감싸지 않는다. (설계. 이유: 테스트의 트랜잭션은 다른 스레드에 보이지 않는다.)
- `@SpringBootTest`는 기본적으로 서버를 띄우지 않고 목(mock) 환경을 구성한다 (3.5 문서 원문). Boot 4.x에서는 테스트 스타터 분리, `@MockBean` 제거(`@MockitoBean`), MockMvc 사용 시 `@AutoConfigureMockMvc` 필요 등 변경이 있다 (4.0 마이그레이션 가이드, 일부는 요약). 테스트 구현 단계 전에 4.2 테스트 문서를 읽는다.

## 14. 남은 확인·협의 사항

1. Boot 버전: **4.2.0 확정** (DEC-025, 4.1.3에서 변경)
2. 구현 전 협의: 브랜드 테이블 분리, `size_mm` 범위, 상품명·사이즈 스냅샷, 오류 응답 형식, 재전송 상태 코드, 주문 처리 순서 (`design-revision-v1.2.md` 승인 현황·5.2.1)
3. 배포 단계: SSM 요건, GHCR 인증, 도메인·HTTPS, EC2 사양(실측 후)
4. Flyway는 DDL 학습 단계에서 재검토, JWT 라이브러리는 인증 단계에서 비교
5. 기존 EC2 2개 구성 설명 요청 (11.2장 보정용)
6. 4.2 테스트 문서 확인 (테스트 구현 전)
