# AI 협업 환경 검증

> 권한 제한과 Hook은 **실수 방지 수단**이며 완전한 보안 경계가 아니다. 셸 명령은 형태가 무한해서 가드가 모두 막지는 못한다. 검증은 **실제 프로젝트 소스 코드를 바꾸지 않는** 방법만 쓴다.
> 근거: [references.md](references.md) 7.4장, 결정: DEC-022

## 1. 현재까지의 검증 결과 (2026-11-27)

| 항목 | 방법 | 결과 | 수준 |
| --- | --- | --- | --- |
| `guard.py` 허용·차단 로직 | 스크립트에 JSON을 직접 입력 (허용·차단 케이스 29건 + 수정 후 재시험) | 기대와 일치 | 실행 (스크립트 단독) |
| PreToolUse hook이 실제 세션에서 호출되는가 | Claude Code 세션에서 Bash 호출 | 차단 메시지 `PreToolUse:Bash hook error: [...] [KIX 학습 모드] ...`가 표시됨. (이 과정에서 `2>&1`을 인자로 오인하는 버그와 인용 문자열 오탐을 발견해 고쳤다) | 실행 (실제 세션) |
| `Read(./.env)` deny 규칙 | 존재하지 않는 `.env`를 Read 시도 | "permission settings에서 거부된 디렉터리" 오류, 파일 변경 없음 | 실행 (실제 세션) |
| `Edit(./backend/**)` deny 규칙 | 존재하지 않는 `backend/…java`를 Edit 시도 | 같은 거부 오류, 파일 생성·변경 없음 | 실행 (실제 세션) |
| `.claude/settings.json` JSON 유효성 | `python3 json.load` | 통과 | 실행 |
| SessionStart hook 명령 | 명령을 셸에서 직접 실행 | Git 상태, progress, decisions 출력 확인 | 실행 (셸 단독) |

주의: Edit 거부 메시지만으로는 권한 규칙과 hook 중 무엇이 막았는지 구분되지 않는다. 권한 규칙만 따로 보려면 hook이 관여하지 않는 `Read(./.env)` 시험을 쓴다 (위 표).

## 2. 아직 검증하지 못한 것

| 항목 | 이유 |
| --- | --- |
| SessionStart hook 출력이 Claude 컨텍스트에 들어오는가 | 이번 세션 도중에 설정을 추가해서 시작 시점 출력을 관찰할 수 없었다. 공식 문서는 SessionStart의 stdout이 컨텍스트에 추가된다고 설명한다. |
| `/wrap-up` 스킬 동작 | `disable-model-invocation: true`라서 사용자만 호출할 수 있다. |
| Notion `ask` 규칙 | Notion 쓰기 도구를 실제로 호출해야 해서 시험하지 않았다. `ask` JSON 키는 공식 문서에서 산문 설명만 확인했다. |
| `paths` 규칙(`backend.md` 등)의 로딩 | 대상 파일이 아직 없다. 해당 파일을 Read/Write/Edit할 때 로드된다고 문서에 있다. |
| `Write` 도구가 막히는가 | 새 파일을 만들 수 있어서 프로젝트 안에서 시험하지 않았다. 공식 문서는 Edit 규칙이 Write에도 적용된다고 설명한다. |

## 3. 개발자가 직접 하는 검증 절차 (안전한 방법)

모두 새 터미널에서 프로젝트 루트(`~/Desktop/kix`)에서 진행한다. 소스 코드는 바뀌지 않는다.

### 3.1 SessionStart hook

1. `claude`로 **새 세션**을 시작한다.
2. 첫 응답 전에 `/hooks`를 입력해 `SessionStart`와 `PreToolUse`가 등록돼 있는지 본다 (공식 문서의 확인 방법).
3. Claude에게 이렇게 묻는다: "세션 시작 시 hook이 출력한 내용에서 `docs/progress.md`의 '현재 단계' 한 줄만 그대로 알려줘." 도구 호출 없이 답하면 컨텍스트에 들어온 것이다.
4. 안 되면 `Ctrl+O`로 transcript를 보고, 그래도 안 되면 `claude --debug-file /tmp/kix-claude.log`로 시작해 로그에서 hook 실행 기록을 찾는다.

### 3.2 권한 규칙·가드 (파일을 만들지 않는 방식)

1. Claude에게: "`.env` 파일을 읽어줘." → 거부되어야 한다 (파일이 없어도 규칙에 의해 거부).
2. "`backend/Probe.java`의 첫 줄을 수정해줘." → 거부되어야 한다 (존재하지 않는 파일이라 만들어지지 않는다).
3. "`git branch probe-test`를 실행해줘." → `[KIX 학습 모드]` 차단 메시지가 나와야 한다. 브랜치가 생기면 가드 실패이므로 `git branch -d probe-test`로 지운다.
4. "`git status`를 실행해줘." → 정상 실행되어야 한다 (읽기 전용은 허용).
5. 이 절차에서 `Write` 도구 시험은 하지 않는다 (성공하면 파일이 생기기 때문).

### 3.3 `/wrap-up`

1. 아무 변경이 없는 세션에서 `/wrap-up`을 실행한다.
2. `git status -sb`로 변경된 파일이 `docs/`(`progress.md`, `session-log.md`, 필요 시 `learning/`)뿐인지 확인한다. 소스·설정 파일이 바뀌면 안 된다.
3. 커밋은 하지 않는다.

### 3.4 Notion `ask` 규칙 (선택)

Claude에게 Notion 페이지를 수정하라고 요청하면 승인을 묻는 프롬프트가 떠야 한다. 프롬프트가 뜨면 **거절**한다. 프롬프트 없이 실행되면 규칙 실패다.

### 3.5 `paths` 규칙 (프로젝트 생성 후)

`backend/`에 파일이 생긴 뒤 Claude에게 그 파일을 읽게 하고, `/context all`에서 Memory files에 `backend.md`가 보이는지 확인한다 (공식 문서의 확인 방법).

## 4. 한계

- 가드는 명령 문자열을 정규식으로 검사한다. 따옴표 안의 글자도 보기 때문에 오탐이 있을 수 있고, 인터프리터(`python3 -c`, `node -e`)로 우회하는 모든 경우를 막지는 못한다.
- `permissions` 규칙은 Claude Code의 내장 도구에 적용된다. 셸 안에서 일어나는 파일 변경은 Hook이 따로 검사해야 한다 (공식 문서의 설명).
- 따라서 학습 모드의 1차 방어선은 규칙 파일(`learning-mode.md`)과 사용자의 확인이다.
