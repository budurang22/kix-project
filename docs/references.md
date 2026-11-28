# 공식 문서 참조 기록

기술 판단에 사용한 공식 문서를 기록한다. 항목마다 URL, 확인 날짜, 적용 이유, 검증 결과를 적는다.

검증 결과 표기:
- **실행 검증**: 직접 실행해서 확인함
- **문서 확인**: 문서(또는 검색 결과 요약)로만 확인함. 아직 실행해 보지 않음
- **미확인**: 공식 출처로 확인하지 못함

## 1. Claude Code

| 주제 | 공식 URL | 확인일 | 적용 이유 | 검증 결과 |
| --- | --- | --- | --- | --- |
| Memory (CLAUDE.md, `@import`) | https://code.claude.com/docs/en/memory | 2026-11-26 | CLAUDE.md를 프로젝트 공통 지침으로 사용. 200줄 이하로 유지, import는 컨텍스트를 줄이지 않음 | 문서 확인 (검색 결과 요약, 원문 전체 미열람) |
| Rules (`.claude/rules/`, `paths`) | https://code.claude.com/docs/en/memory | 2026-11-26 | 주제별 규칙 분리. `paths` 지정 규칙은 해당 파일을 다룰 때 로드되고 compact 후 사라질 수 있음 | 문서 확인. `paths` 로딩 동작은 아직 실행 검증하지 않음 |
| Hooks (SessionStart) | https://code.claude.com/docs/en/hooks | 2026-11-26 | 세션 시작 시 progress.md와 decisions.md를 출력. SessionStart는 차단 불가 | 문서 확인. hook 출력이 컨텍스트에 들어오는지는 다음 세션 시작 시 확인 필요 (미검증) |
| Settings / permissions | https://code.claude.com/docs/en/settings-reference | 2026-11-26 | `permissions.deny/ask`로 비밀 파일과 외부 작업 제한 | 문서 확인. 규칙 패턴의 실제 매칭은 미검증 |
| `.claude` 디렉터리 구조 | https://code.claude.com/docs/en/claude-directory | 2026-11-26 | rules, skills 위치 확인 | 문서 확인 |

## 2. Spring

| 주제 | 공식 URL | 확인일 | 적용 이유 | 검증 결과 |
| --- | --- | --- | --- | --- |
| Boot 최신 계열 요구사항 | https://docs.spring.io/spring-boot/system-requirements.html | 2026-11-26 | 최신 Boot 4.2.0은 Java 17 이상(27까지), Spring Framework 7.1.0 이상, Gradle 8.14+ 또는 9.x | 문서 확인 (검색 결과 요약) |
| Boot 3.5 요구사항 | https://docs.spring.io/spring-boot/3.5/system-requirements.html | 2026-11-26 | 3.5.16 기준 Java 17~25, Spring Framework 6.2.19+, Maven 3.6.3+, Gradle 7.6.4+ 또는 8.4+. Java 26은 범위 밖 | 문서 확인 (검색 결과 요약) |
| Boot 프로젝트 페이지 | https://spring.io/projects/spring-boot | 2026-11-26 | 최신 GA 버전 확인. 페이지 상단에 4.2.0 표시 | 문서 확인. **지원 기간 표는 가져온 HTML에 없어 확인 못 함 (미확인)** |
| Boot 4.0.0 발표 | https://spring.io/blog/2025/11/20/spring-boot-4-0-0-available-now/ | 2026-11-26 | Java 25 정식 지원, Java 17 호환 유지 | 문서 확인 (검색 결과 요약) |
| Spring Security 7 마이그레이션 | https://docs.spring.io/spring-security/reference/migration/ | 2026-11-26 | Boot 4 계열의 Security 7 변경점. 무상태 JWT API에서 CSRF 설정 필요 | 문서 확인 (검색 결과 요약). CSRF 기본값 세부는 원문 재확인 필요 |
| Boot 3.5 지원 종료일 | (공식 미확인) | 2026-11-26 | 제3자 블로그 여러 곳이 "OSS 지원 2026-06-30 종료, 마지막 3.5.16"이라고 설명. 3.5 문서 페이지가 3.5.16을 표시하는 점과는 일치 | ~~미확인 (제3자 출처만)~~ → **2026-11-27 공식 Spring API로 확인됨**: 3.5.x OSS 종료 2026-06-30 (7장) |

## 3. 데이터베이스·프론트엔드

| 주제 | 공식 URL | 확인일 | 적용 이유 | 검증 결과 |
| --- | --- | --- | --- | --- |
| MySQL 8.4 LTS | https://dev.mysql.com/doc/refman/8.4/en/mysql-releases.html | 2026-11-26 | LTS는 5년 premier + 3년 extended 지원. Docker 공식 이미지에 8.4 태그 존재 | 문서 확인 (검색 결과 요약). 컨테이너 기동은 미실행 |
| MySQL Docker 이미지 | https://hub.docker.com/_/mysql | 2026-11-26 | 8.4.13.1 태그가 최근 푸시로 표시됨 | 문서 확인. 사용할 태그는 구현 시 재확인 |
| Vite 시작 가이드 | https://vite.dev/guide/ | 2026-11-26 | Node.js 20.19+ 또는 22.12+ 필요. 설치된 Node 24.21.0은 조건 충족 | 문서 확인 (Node 버전은 실행 검증) |

## 4. 컨벤션·품질 도구 (2026-11-26 추가)

| 주제 | 공식 URL | 확인일 | 참고한 내용 / 적용 이유 | 검증 결과 |
| --- | --- | --- | --- | --- |
| Google Java Style Guide | https://google.github.io/styleguide/javaguide.html | 2026-11-26 | 들여쓰기 2칸(블록당 +2), 열 제한 100자. 백엔드 컨벤션의 기본으로 검토. 전역 규칙(4칸)과 충돌 → DEC-014 | 문서 확인 (검색 결과 요약) |
| Conventional Commits 1.0.0 | https://www.conventionalcommits.org/en/v1.0.0/ | 2026-11-26 | `type(scope): description`, 본문·푸터, `!`나 `BREAKING CHANGE:`로 호환성 깨짐 표시. 대소문자는 구분하지 않으나 `BREAKING CHANGE`는 대문자 | 문서 확인 (검색 결과 요약) |
| Spotless (Gradle) | https://github.com/diffplug/spotless/blob/main/plugin-gradle/README.md | 2026-11-26 | `googleJavaFormat().aosp()`로 4칸 스타일 가능, `spotlessCheck`/`spotlessApply`. AOSP에서는 import 정렬 옵션 확인 필요, google-java-format 버전별 호환 이슈 보고 있음 | 문서 확인 (검색 결과 요약). **프로젝트 버전과의 호환은 미확인** |
| Claude Code permissions / hooks | https://code.claude.com/docs/en/permissions , https://code.claude.com/docs/en/hooks | 2026-11-26 | PreToolUse에서 exit 2는 도구 호출을 차단하고 stderr가 메시지가 됨. Hook의 deny는 allow 규칙으로 뒤집을 수 없음. 파일 도구 deny와 별개로 Bash 우회는 별도 처리가 필요 | 문서 확인. 가드 스크립트 로직은 29개 케이스 **실행 검증**. 실제 Claude Code 호출 시 동작은 미검증 |
| Spring Boot + Testcontainers | https://docs.spring.io/spring-boot/reference/testing/testcontainers.html | 2026-11-26 | `spring-boot-testcontainers`, `@ServiceConnection`으로 JDBC 연결 정보 자동 구성. MySQL 컨테이너도 JDBC 연결 정보 대상 | 문서 확인 (검색 결과 요약). 적용 여부는 DEC-016에서 결정 |
| EditorConfig, ESLint, Prettier, JUnit 5, GitHub Actions | (미조회) | - | 해당 도구를 처음 쓰는 학습 단계에서 공식 문서와 프로젝트 버전 호환을 확인한 뒤 기록 | **미확인** |

## 5. 로컬 환경 (2026-11-26 실행 검증)

| 도구 | 확인 결과 | 비고 |
| --- | --- | --- |
| JDK 기본 | Temurin 26.0.2.1 | Boot 3.5의 지원 범위(17~25) 밖 |
| JDK 21 | Homebrew OpenJDK 21.0.12.1 (`/opt/homebrew/Cellar/openjdk@21/21.0.12.1/libexec/openjdk.jdk/Contents/Home`) | 기본값 아님. `JAVA_HOME` 지정 또는 Gradle toolchain 필요 |
| JDK 기타 | 17.0.2, 11.0.33, 11.0.32.1 | |
| Node.js / npm | v24.21.0 / 11.19.0 | |
| Docker / Compose | 29.8.2 / v5.6.0 | 데몬 실행 여부는 미확인 |
| Git | 2.54.0 (Apple Git-157) | 저장소 `main`, 커밋·원격 없음 |
| MySQL 클라이언트 | `/opt/homebrew/bin/mysql` 설치됨 | 서버 여부는 미확인 |
| Maven / Gradle | 설치되지 않음 | Spring 프로젝트의 wrapper 사용 예정 |

## 6. 배포·인프라 (2026-11-27 추가)

모두 검색 결과 요약으로 확인했고 직접 실행해 본 것은 없다. 공식 원문 전체는 해당 학습 단계에서 다시 읽는다.

| 주제 | 공식 URL | 확인일 | 참고한 내용 / 적용 이유 | 검증 결과 |
| --- | --- | --- | --- | --- |
| Compose 시작 순서·healthcheck | https://docs.docker.com/compose/how-tos/startup-order/ , https://docs.docker.com/reference/compose-file/services/ | 2026-11-27 | `depends_on` 짧은 문법은 healthy를 기다리지 않음. `condition: service_healthy`는 healthcheck 통과 후 시작. MySQL 준비 전 백엔드 기동 문제 방지 | 문서 확인 (검색 요약). 실행 미검증 |
| Nginx 프록시 | https://nginx.org/en/docs/http/ngx_http_proxy_module.html , https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/ | 2026-11-27 | `proxy_pass`는 `location` 안에서 지정, `proxy_set_header`로 Host 등 전달 헤더 제어. `try_files`로 SPA 새로고침 대응 | 문서 확인 (검색 요약). SPA용 `try_files` 조합은 문서가 직접 말한 것이 아니라 **추론**. 실행 미검증 |
| GitHub Actions 워크플로 | https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax | 2026-11-27 | `on.push.paths` 필터, `jobs.<id>.needs`, `services` 컨테이너(예시는 PostgreSQL). 프론트·백엔드 워크플로 분리 근거 | 문서 확인 (검색 요약). **MySQL 서비스 컨테이너 설정은 미확인** |
| GitHub OIDC → AWS | https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services , https://github.com/aws-actions/configure-aws-credentials | 2026-11-27 | `id-token: write`, `role-to-assume`, IAM 신뢰 정책에서 저장소·브랜치(`sub`) 제한. 장기 Access Key 저장을 피함 | 문서 확인 (검색 요약). 실행 미검증 |
| SSM Run Command | https://docs.aws.amazon.com/cli/latest/reference/ssm/send-command.html , https://docs.aws.amazon.com/systems-manager/latest/userguide/walkthrough-cli.html | 2026-11-27 | `aws ssm send-command`, `AWS-RunShellScript`, `commands`로 EC2에서 스크립트 실행 | 문서 확인 (검색 요약). **SSM Agent·인스턴스 프로파일·아웃바운드 요건은 미확인** |
| EC2 T3 사양 | https://aws.amazon.com/ec2/instance-types/t3/ | 2026-11-27 | t3.micro 1 GiB/2 vCPU, t3.small 2 GiB/2 vCPU, 기준 CPU 10%/20%, 온디맨드 $0.0104/$0.0209 per hour | 문서 확인 (검색 요약). **요금 리전 기준 미확인** |
| EC2 프리 티어 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html | 2026-11-27 | 2025-07-15 이후 생성 계정: t3.micro/t3.small/t4g.micro/t4g.small 등 대상, 6개월 또는 크레딧 소진까지 | 문서 확인 (검색 요약). 본인 계정 조건은 콘솔에서 확인 필요 |
| Certbot + Nginx(Docker) | https://certbot.eff.org/docs/using.html | 2026-11-27 | Nginx가 별도 컨테이너면 `--nginx` 플러그인 대신 webroot/DNS 방식. 갱신 후 Nginx reload 필요 | 커뮤니티 답변 요약으로 확인, **공식 문서 원문 미열람** |
| ACM 내보내기 | https://docs.aws.amazon.com/acm/latest/userguide/export-public-certificate.html | 2026-11-27 | 2025-06-17 이전 공개 인증서는 내보낼 수 없고, 요청 시 export를 켠 새 인증서는 EC2 등에서 사용 가능 | 문서 확인 (검색 요약). 비용·절차 미확인 |
| Tailwind CSS + Vite | https://tailwindcss.com/docs/installation/using-vite | 2026-11-27 | `tailwindcss` + `@tailwindcss/vite`, `@theme`로 디자인 토큰을 CSS 변수로 노출 (v4) | 문서 확인 (검색 요약). Vite·React 버전 호환은 미확인 |

## 7. 공식 문서 원문 검증 (2026-11-27)

1~6장은 검색 결과 요약 수준이다. 이 장은 공식 페이지를 직접 열어 확인한 결과이며 **충돌하면 이 장이 우선**한다.
검증 수준: **원문** = 페이지 본문 그대로 확인 / **요약** = 읽기 도구가 요약한 값이라 재확인 필요 / **미확인** / **실행** = 직접 실행해서 확인
(원문을 읽은 주체는 문서 조회 보조 에이전트이며, 일부 페이지는 길어서 여러 번 나눠 읽었다. 요약 값은 따로 표시했다.)

### 7.1 Spring

| 기술·버전 | 공식 URL | 확인 내용 | 적용 이유·메모 | 검증 |
| --- | --- | --- | --- | --- |
| Boot 지원 기간 | https://api.spring.io/projects/spring-boot/generations | 3.5.x OSS 종료 2026-06-30(상용 2032-06-30 extended), 4.0.x 2026-12-31, 4.1.x 2027-07-31, 4.2.x 최초 릴리스 2026-11-30·OSS 2027-12-31 | 버전 결정(DEC-006). 이 API는 공식 Spring 서비스다. spring.io 프로젝트 페이지의 Support 탭에는 표가 없었다. | 원문 |
| 지원 정책 | https://github.com/spring-projects/spring-boot/wiki/Supported-Versions | "Major는 릴리스 후 최소 3년(지원되는 마이너를 써야 함), Minor는 최소 12개월" | 세대별 날짜 표는 없음 | 원문 |
| Boot 3.5.16 요구사항 | https://docs.spring.io/spring-boot/3.5/system-requirements.html | Java 17 이상·25까지, Spring Framework 6.2.19+, Gradle 7.6.4+(7.x)/8.4+(8.x), Maven 3.6.3+. "최신 안정은 4.2.0" 안내 | Java 21 호환 확인 | 원문 |
| Boot 4.2.0 요구사항 | https://docs.spring.io/spring-boot/system-requirements.html | Java 17 이상·27까지, Spring Framework 7.1.0+, Gradle 8.14+/9.x | 로컬 기본 JDK 26은 4.2 범위 안, 3.5 범위 밖 | 원문 |
| Boot 3.5.16 관리 의존성 | https://docs.spring.io/spring-boot/3.5/appendix/dependency-versions/coordinates.html | mysql-connector-j 9.7.0, HikariCP 6.3.3, jackson-databind 2.21.4, assertj-core 3.27.7, junit-jupiter 5.12.2, mockito-core 5.17.0, testcontainers 1.21.4, org.testcontainers:mysql 1.21.4, spring-security-core 6.5.11, hibernate-core 6.6.53.Final, flyway-core·flyway-mysql 11.7.2, lombok 1.18.46, spring-core 6.2.19 | 표의 값을 버전 없이 선언하면 사용됨 | 원문 |
| start.spring.io | https://start.spring.io/metadata/client | Boot 4.2.0(기본), 4.1.3, 4.0.10과 SNAPSHOT. 3.x 없음. Java 27·25·21·17(기본 17) | 개발자가 화면에서 3.5 선택 가능한지 직접 확인해야 함 | 요약 |
| Spring Security CSRF | https://docs.spring.io/spring-security/reference/6.5/features/exploits/csrf.html | 기본으로 안전하지 않은 메서드(POST 등)를 보호. "브라우저가 처리할 수 있는 요청은 CSRF 보호를 권장, 비브라우저 클라이언트 전용 서비스라면 끄는 것이 좋다." "stateless라고 안전한 것은 아니다." Authorization 헤더 토큰 API는 다루지 않음 | `design-revision-v1.2.md` 7.4장. 헤더 방식 판단은 자체 설계 판단 | 원문 |
| springdoc-openapi | https://springdoc.org/ | 3.x 계열(3.2.1)은 Boot 4.x용. Boot 3.x는 2.x(문서가 v2.10.1 안내). 기본 경로 `/swagger-ui.html`, `/v3/api-docs` | Boot 버전에 따라 메이저 결정 | 원문 |
| Boot 3.5 테스트 | https://docs.spring.io/spring-boot/3.5/reference/testing/spring-boot-applications.html | MockMvc, `@WebMvcTest`, `@SpringBootTest`(서버 미기동 기본), `@DataJpaTest`(기본 트랜잭션·롤백, 실제 DB는 `@AutoConfigureTestDatabase(replace = Replace.NONE)`) | 테스트 설계(DEC-023) | 원문 (페이지 끝 일부는 미열람) |
| starter-test 구성 | https://docs.spring.io/spring-boot/3.5/reference/testing/test-scope-dependencies.html | JUnit 5, Spring Test, AssertJ, Hamcrest, Mockito, JSONassert, JsonPath, Awaitility | 별도 의존성 추가 불필요 | 원문 |
| Boot Testcontainers | https://docs.spring.io/spring-boot/3.5/reference/testing/testcontainers.html | `spring-boot-testcontainers` 필요, `@Testcontainers`·`@Container`·`@ServiceConnection`. **MySQL 예시와 `org.testcontainers:mysql` 의존성 설명은 이 페이지에 없음(Neo4j 예시)** | 도입은 선택 | 원문 |
| Boot 3.5 DB 초기화 | https://docs.spring.io/spring-boot/3.5/how-to/data-initialization.html | Flyway는 클래스패스의 모듈로 자동 실행, MySQL은 `flyway-mysql`, 기본 위치 `classpath:db/migration`. `ddl-auto`는 임베디드 DB+스키마 관리 도구 없을 때만 `create-drop`, 그 외 기본 `none` | Flyway 검토 | 원문 |

### 7.2 데이터베이스

| 기술·버전 | 공식 URL | 확인 내용 | 적용 이유·메모 | 검증 |
| --- | --- | --- | --- | --- |
| MySQL 8.4 CHECK | https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html | 문법 `[CONSTRAINT [symbol]] CHECK (expr) [[NOT] ENFORCED]`, 생략하면 이름 자동 생성, 이름 최대 64자, 서브쿼리·변수·AUTO_INCREMENT 컬럼 불가 | `chk_` 이름 규칙. **"8.0.16부터 적용"이라는 이전 서술은 이 페이지로 확인되지 않아 정정** | 원문 |
| InnoDB 락 대기 | https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html | `innodb_lock_wait_timeout` 기본 50초, 범위 1~1073741824 | 동시성 테스트의 대기 상한 | 원문 |
| HikariCP | https://github.com/brettwooldridge/HikariCP | `maximumPoolSize` 기본 10, `minimumIdle` 기본 maximumPoolSize, `connectionTimeout` 기본 30000ms | 동시 100건 테스트 해석 | 원문 |
| Flyway 지원 DB | https://documentation.red-gate.com/fd/supported-databases-and-versions-143754067.html (2026-11-25 갱신) | MySQL 계열에 9.4, 8.3, 8.2, 8.1, 8.0, 5.7, 5.6 표기. **8.4는 보이지 않음.** 텍스트가 평탄화되어 지원 등급은 구분 못 함 | MySQL 8.4 migrate 지원은 **미확인**. 실제 시험 필요 | 원문(일부 불명확) |

### 7.3 프론트엔드·품질 도구

| 기술·버전 | 공식 URL | 확인 내용 | 적용 이유·메모 | 검증 |
| --- | --- | --- | --- | --- |
| Tailwind CSS v4.3 + Vite | https://tailwindcss.com/docs/installation/using-vite | `npm install tailwindcss @tailwindcss/vite`, Vite 설정에 `tailwindcss()` 플러그인, CSS에 `@import "tailwindcss";`. 버전·Node 요구사항 명시 없음 | Vite 8과의 호환은 미확인 | 원문 |
| Vite | https://vite.dev/guide/ | 문서 v8.4.0, Node 20.19+/22.12+, `npm create vite@latest`, 템플릿 `react`, `react-ts` 등 | 로컬 Node 24.21.0 충족 | 원문 |
| React | https://react.dev/versions | 최신 19.3 (v19.3.0, 2026-09-09) | | 원문 |
| React Router | https://reactrouter.com/start/declarative/installation , https://reactrouter.com/start/modes | 최신 8.5.3(7.18.7, 6.30.6도 선택 가능), `npm i react-router`, `BrowserRouter`로 Declarative 모드. Node/React 요구사항 없음 | 메이저 선택 필요 | 원문 |
| Axios | https://axios.rest/pages/getting-started/first-steps , https://axios.rest/pages/advanced/interceptors | axios-http.com에서 axios.rest로 이전(301). `npm install axios`, `interceptors.request.use` | Authorization 헤더 예시는 페이지에 없음 | 원문 |
| ESLint | https://eslint.org/docs/latest/use/getting-started | 최신 v10.15.0, Node `^20.19.0`/`^22.13.0`/`>=24`, `npm init @eslint/config@latest`, `eslint.config.js` | | 원문 |
| Prettier | https://prettier.io/docs/install , https://prettier.io/docs/integrating-with-linters | 3.10.1, ESLint 사용 시 `eslint-config-prettier` 설치 | | 원문 |
| EditorConfig | https://editorconfig.org/ | `.editorconfig`, `indent_style`, `indent_size` | | 원문 |
| Spotless Gradle | https://github.com/diffplug/spotless/blob/main/plugin-gradle/README.md , https://raw.githubusercontent.com/diffplug/spotless/main/plugin-gradle/CHANGES.md | 플러그인 8.12.0(2026-11-21), Gradle 7.3+, JRE 17+. `googleJavaFormat('2.0.0').aosp()...`. 기본 google-java-format 2.0.0(8.11.0 변경 내역). README는 `spotlessCheck`가 `check`에 연결되는지 직접 말하지 않음 | DEC-019 | 원문 (README 뒷부분은 도구 요약이라 제외) |
| google-java-format | https://github.com/google/google-java-format | `--aosp`: 블록 4칸·이어지는 줄 8칸(기본은 2칸·4칸). 실행에는 JDK 필요, 최소 Java는 "currently Java 21". 릴리스 페이지에서는 최신 릴리스 번호·날짜가 불명확 | 4칸 예외의 근거 | 원문 |
| JUnit | https://docs.junit.org/current/user-guide/ | 문서 6.1.3, Java 17+ 필요. (Boot 3.5.16은 Jupiter 5.12.2 관리) | Boot 관리 버전 사용 | 원문 |
| Mockito | https://github.com/mockito/mockito/releases | 최신 5.24.0(2026-09-23). Java 최소 버전은 확인하지 못함 | Boot 관리 5.17.0 사용 | 원문, 최소 Java 미확인 |
| AssertJ | https://assertj.github.io/doc/ | 3.27.7, Java 8+, `assertThatThrownBy` 예시 | | 원문 (일부 요약) |
| JaCoCo | https://www.jacoco.org/jacoco/trunk/doc/changes.html , https://docs.gradle.org/current/userguide/jacoco_plugin.html | 최신 릴리스 0.8.16(2026/10/24), Java 21·25·26·27 공식 지원. Gradle `jacoco` 플러그인, `jacocoTestReport`는 `test`에 자동 연결되지 않아 `finalizedBy` 필요, Gradle 기본 0.8.15 | 도입은 선택 | 원문 (changes 일부 요약) |
| Testcontainers MySQL | https://java.testcontainers.org/modules/databases/mysql/ , https://java.testcontainers.org/supported_docker_environment/ | 사이트 모듈 좌표 `testcontainers-mysql:2.0.5`(2.x). Docker Desktop(Mac)은 테스트 대상 환경 | Boot 3.5 관리 1.21.4와 메이저가 다름 | 원문 |
| CountDownLatch / ExecutorService | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CountDownLatch.html | 일회성(재설정 불가), 시작 신호·완료 신호 예시. `ExecutorService`는 `shutdown()` 후 `awaitTermination()` | 동시성 테스트 패턴 | 원문 |

### 7.4 Claude Code (AI 협업 환경)

| 주제 | 공식 URL | 확인 내용 | 메모 | 검증 |
| --- | --- | --- | --- | --- |
| 권한 규칙 경로 | https://code.claude.com/docs/en/permissions | gitignore 방식 패턴, `./path`는 현재 디렉터리 기준, `/path`는 설정 출처 기준, `//`는 절대 경로, `**` 사용 가능. "Edit 규칙은 파일을 수정하는 모든 내장 도구에 적용(Write, NotebookEdit 포함)". 평가 순서 deny → ask → allow. MCP 규칙은 `mcp__<server>__<tool>`, 괄호가 있는 `mcp__` 규칙은 무시됨 | `ask` JSON 키는 산문 설명만 있고 명시적 예시는 못 봄 | 원문 일부, 일부 요약 |
| Hooks | https://code.claude.com/docs/en/hooks , https://code.claude.com/docs/en/hooks-guide | SessionStart stdout은 Claude 컨텍스트에 추가됨(hooks guide 원문). matcher `startup/resume/clear/compact/fork`. PreToolUse stdin에 `tool_name`, `tool_input`, `cwd`. exit 2는 차단하고 stderr가 Claude에게 전달됨. `CLAUDE_PROJECT_DIR` 제공. 확인 방법: `/hooks`, `Ctrl+O`, `claude --debug` | 설정 변경 즉시 반영 여부(파일 감시)는 요약 수준 | 원문 일부, 일부 요약 |
| Skills | https://code.claude.com/docs/en/skills | `.claude/skills/<이름>/SKILL.md`, `/이름`으로 호출, `disable-model-invocation: true`는 수동 호출 전용(요약), `/skills`로 목록, 새 스킬이 안 보이면 `/reload-skills` | | 원문 일부, 일부 요약 |
| Rules `paths` | https://code.claude.com/docs/en/memory | `paths` YAML 목록, 경로 지정 규칙은 해당 파일을 Read/Write/Edit(또는 Bash `cat` 등)할 때 로드, 없으면 시작 시 로드. 확인: `/context all`, `/memory` | 소스가 아직 없는 `backend/**` 규칙은 아직 로드되지 않을 수 있음 | 원문 |

### 7.5 아직 원문으로 확인하지 못한 것

- Spring Boot 3.5가 start.spring.io에서 선택 가능한지 (화면 확인 필요)
- Flyway의 MySQL 8.4 지원 (실제 migrate로 시험 필요)
- JWT 라이브러리(jjwt, Nimbus 등), BCrypt `PasswordEncoder`, Bean Validation, Postman 공식 문서
- SSM Agent·인스턴스 프로파일 요건, GHCR/ECR 비교, MySQL 서비스 컨테이너(GitHub Actions), ACM 내보내기 비용·절차, EC2 요금의 리전 기준
- Certbot 공식 문서 원문, Compose·Nginx 문서의 본문 전체 (구성 단계에서 읽는다)
- Spring Boot 4.x에서의 Security 7, Hibernate 7, Jackson 3 변경점 (4.x를 선택할 경우)
- `reorderImports`/AOSP import 순서 세부, Mockito 최소 Java, Spotless 실제 실행
- (8장에서 일부 해소) Boot 4.x 변경점 중 Hibernate 7, Security 7 세부는 여전히 미확인

## 8. 추가 원문 검증: Boot 4.1 기준 (2026-11-27)

7장과 같은 기준(원문 / 요약 / 미확인)을 쓴다. 3.5 기준 수치는 이 장의 4.1 값이 우선한다.

| 주제 | 공식 URL | 확인 내용 | 메모 | 검증 |
| --- | --- | --- | --- | --- |
| Boot 4.1.3 요구사항 | https://docs.spring.io/spring-boot/4.1/system-requirements.html | Java 17 이상·27까지, Spring Framework 7.0.11+, Gradle 8.14+/9.x, Maven 3.6.3+, Tomcat 11.0.x, Servlet 6.1. "최신 안정은 4.2.0" 안내 | Java 21 호환. 4.2.0이 이미 표시되지만 공식 API의 4.2 최초 릴리스는 2026-11-30이라 4.1.x를 택했다 | 원문 |
| Boot 4.1.3 관리 의존성 | https://docs.spring.io/spring-boot/4.1/appendix/dependency-versions/coordinates.html | 직접 확인한 행: jackson-databind(com.fasterxml) 2.21.8, mysql-connector-j 26.10.0, HikariCP 7.0.2. 도구가 요약한 행: Security 7.1.3, Hibernate 7.4.15.Final, Spring Framework 7.0.11, Jackson 3(`tools.jackson`) 3.1.8, JUnit Jupiter 6.0.3, AssertJ 3.27.7, Mockito 5.23.0, Testcontainers 2.0.5·testcontainers-mysql 2.0.5, Flyway 12.4.0, Lombok 1.18.48 | 페이지의 앞 약 27%만 원문으로 읽었다. 요약 행은 구현 시 재확인 | 원문(일부), 나머지 요약 |
| Boot 4.1 릴리스 노트 | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.1-Release-Notes | Spring Security 7.1.0, Hibernate 7.4, Hibernate Validator 9.1, Flyway 12.4.0, Mockito 5.23.0, MySQL 9.7.0, Spring Data BOM 2026.0.0. JPA 부트스트랩 모드 속성 변경 | 관리 표의 mysql-connector-j 26.10.0과 "MySQL 9.7.0" 표기가 달라 구성 시 확인 | 원문(일부) |
| Boot 4.0 마이그레이션 가이드 | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide | 스타터 `spring-boot-starter-<기술>`, `web`→`webmvc`, `spring-boot-starter-data-jpa`, `-security`, `-validation`, `-flyway`, 기술별 테스트 스타터(`*-test`), `spring-boot-starter-test`는 불필요(전이), `@WithMockUser`는 `spring-boot-starter-security-test` 필요, Jackson 3(`com.fasterxml.jackson`→`tools.jackson`, annotations는 그대로), Java 17+·Jakarta EE 11·Servlet 6.1, 모듈화, Undertow 제외 | `@MockBean` 제거(`@MockitoBean`), `@SpringBootTest`의 MockMvc 자동 제공 제거(`@AutoConfigureMockMvc`)는 **요약**. Hibernate 변경점은 원문에서 찾지 못함 | 원문(일부), 일부 요약 |
| Spring Security 7.2.0 CSRF | https://docs.spring.io/spring-security/reference/features/exploits/csrf.html , https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html | "브라우저가 처리할 수 있는 요청에는 CSRF 보호 권장, 비브라우저 전용 서비스는 끄는 것이 좋다." "stateless라고 안전한 것은 아니다." 비활성화 예 `.csrf((csrf) -> csrf.disable())`. "브라우저 트래픽을 처리하지 않는 백엔드는 CSRF를 끌 수 있다" | Bearer 헤더 방식은 직접 다루지 않음 → 자체 판단 | 원문 |
| Spring Security 7.2.0 세션 | https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html | `SessionCreationPolicy.STATELESS`, `NullSecurityContextRepository` 사용, 요청을 세션에 저장하지 않음 | | 원문 |
| Spring Security 7.2.0 BCrypt | https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html | `BCryptPasswordEncoder`, 기본 강도 10, "일부러 느리게" 만든 적응형 해시(약 1초 목표로 조정 권장) | | 원문 |
| Spring Security 7.2.0 인가 | https://docs.spring.io/spring-security/reference/servlet/authorization/authorize-http-requests.html | `requestMatchers(...).hasRole("ADMIN")`, `anyRequest().authenticated()`, `hasRole`은 `ROLE_` 접두사 불필요 | | 원문 |
| 401/403 기본 동작 | https://docs.spring.io/spring-security/reference/servlet/architecture.html | `AuthenticationEntryPoint`(자격 증명 요구)와 `AccessDeniedHandler`(접근 거부)를 설명. **기본 상태 코드를 명시하는 문장은 없음** | 그래서 두 핸들러에서 401/403을 명시한다 | 원문 |
| npm 레지스트리 | https://registry.npmjs.org/react-router/7.18.7 , https://registry.npmjs.org/@tailwindcss/vite/latest 등 | react-router 7.18.7: node>=20, react>=18. 8.5.3: node>=22.22.0, react>=19.2.7. `@tailwindcss/vite` 4.3.5: peer `vite ^5.2.0 \|\| ^6 \|\| ^7 \|\| ^8`. vite 8.4.0: node `^20.19.0 \|\| >=22.12.0`. tailwindcss 4.3.5, axios 1.21.1, create-vite 9.4.0 | 로컬 Node 24.21.0 충족. create-vite 템플릿의 react 범위는 이 메타데이터에 없음(미확인) | 원문 |
| MySQL 일관된 읽기 | https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html | REPEATABLE READ에서 일관된 읽기는 "트랜잭션의 첫 일관된 읽기가 만든 스냅샷"을 읽는다. 최신 상태를 보려면 READ COMMITTED나 잠금 읽기 | 주문 순서 5.2.1의 근거 | 원문 |
| MySQL 잠금 읽기 | https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html | `SELECT ... FOR UPDATE`는 최신 데이터를 읽고 잠그며, 잠금은 커밋·롤백 때 해제 | | 원문 |
| InnoDB 중복 키 잠금 | https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html | 중복 키 오류 시 중복 인덱스 레코드에 공유 락. 앞선 세션이 커밋·롤백하면 대기 중인 락 요청이 허용됨 | "다른 트랜잭션이 끝날 때까지 기다린다"는 문장 자체는 없음(예시로 확인). 키 선점 대안은 시험이 필요 | 원문 |
| InnoDB 격리 수준 | https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html | "InnoDB의 기본 격리 수준은 REPEATABLE READ" | | 원문 |

### 8.1 아직 확인하지 못한 것 (추가)

- ~~start.spring.io에서 Boot 4.1.3(비-SNAPSHOT) 선택 가능 여부~~ → **해소 (2026-11-27)**: `https://start.spring.io/metadata/client` 원본 JSON을 직접 파싱해 확인. Boot `4.1.3.RELEASE`(기본값은 4.2.0), Java 17/21/25/27, 타입 `Gradle - Groovy`·`Gradle - Kotlin`, 의존성 ID `web`("Spring Web"), `security`, `data-jpa`, `mysql`("MySQL Driver"), `validation`("Validation"), `lombok`, `flyway`, `actuator`, `devtools`, `docker-compose`가 존재 (실행 확인). 화면의 UI 배치와 생성 결과물(build.gradle 내용)은 미확인
- ~~Boot 4.1 테스트 문서~~ → 9.1장(4.2 기준)으로 이동. Hibernate 7·Security 7 변경점 세부
- 관리 표의 요약 행 (위 표의 "요약"), mysql-connector-j 26.10.0 표기와 "MySQL 9.7.0"의 관계
- `FOR SHARE`가 존재하지 않는 행에 거는 잠금의 영향 (공식 문서로 미확인)
- JWT 라이브러리 선택지 (인증 단계에서 조사)

## 9. Boot 4.2.0 기준 원문 검증 (2026-11-28)

8장의 4.1.3 수치는 4.2.0 변경(DEC-025)으로 대체됐다. 이 장은 공식 문서 페이지를 `curl`로 직접 내려받아 파싱한 결과다 (`/4.2/…` 주소는 현재 문서 페이지로 리다이렉트된다). 검증 수준은 7장과 같다.

| 주제 | 공식 URL | 확인 내용 | 메모 | 검증 |
| --- | --- | --- | --- | --- |
| 4.2.0 요구사항 | https://docs.spring.io/spring-boot/system-requirements.html | "Spring Boot 4.2.0 requires at least Java 17 and is compatible with versions up to and including Java 27. Spring Framework 7.1.0 or above is also required." Maven 3.6.3+, Gradle 8.x(8.14+)·9.x, Tomcat 11.0.x·Jetty 12.1.x(Servlet 6.1), GraalVM 25+ | 생성된 Gradle 9.9.2는 범위 안 | 원문 |
| 4.2.0 관리 의존성 | https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html | 표 1883행 파싱: spring-security-core 7.2.0, hibernate-core 7.4.15.Final, spring-core 7.1.0, tools.jackson jackson-databind 3.1.8(com.fasterxml 2.21.8, annotations 2.21), mysql-connector-j 26.10.0, HikariCP 7.1.0, junit-jupiter 6.1.3, assertj-core 3.27.7, mockito-core 5.24.0, testcontainers·testcontainers-mysql 2.0.5, flyway-core·flyway-mysql 12.11.0, lombok 1.18.48, jakarta.persistence-api 3.2.0, hibernate-validator 9.1.6.Final | 페이지 머리말의 버전 번호는 파싱하지 못했다. 시스템 요구사항 페이지가 4.2.0을 표기한다 | 원문 |
| 4.2 릴리스 노트 | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.2-Release-Notes | Dependency Upgrades: Spring Framework 7.1.0, Spring Security 7.2.0, Spring Data 2026.1.0, Flyway 12.11.0, HikariCP 7.1.0, JUnit Jupiter 6.1.3. Spring Framework 7.1이 `RestTemplate`을 제거 예정으로 표시해 관련 Boot 지원이 deprecated(RestClient 권장). 4.0에서 deprecated였던 항목은 제거됨 | 릴리스 노트 전체(약 5.8만 자)를 읽은 건 아니고 Upgrading·Dependency Upgrades 절만 확인 | 원문(일부) |
| 4.0 마이그레이션 가이드(테스트) | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide | "@MockBean and @SpyBean support has been removed … in favor of @MockitoBean and @MockitoSpyBean." "Using the @SpringBootTest annotation will no longer provide any MockMVC support … add an @AutoConfigureMockMvc annotation to the test class." (8장의 요약을 원문으로 확인) | | 원문 |
| 일관성 | (7장 Spring Security 7.2.0, JUnit 6.1.3, Mockito 5.24.0, Testcontainers 2.0.5 확인값) | 4.2.0 관리 버전이 앞서 읽은 Security reference(7.2.0), JUnit 문서(6.1.3), Mockito 릴리스(5.24.0), Testcontainers 사이트(2.0.5)와 같다 | 4.1.3은 Security 7.1.x, JUnit 6.0.3(요약), Mockito 5.23.0이라 어긋났다 | 원문 대조 |

### 9.1 아직 확인하지 못한 것 (4.2 기준)

- 4.2 테스트 문서(`@DataJpaTest`, MockMvc 설정 세부) — 테스트 구현 전에 읽는다.
- 4.2의 JPA·Security 자동 구성 변경 세부, 4.2 릴리스 노트 전체
- 공식 API의 4.2 최초 릴리스 날짜(2026-11-30)와 실제 배포 상태가 다르게 보이는 이유
