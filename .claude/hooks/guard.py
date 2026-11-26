#!/usr/bin/env python3
"""KIX 학습 모드 보조 가드 (PreToolUse).

Claude가 소스 코드·개발 환경·Git·배포 작업을 직접 하려는 시도를 막는다.
보안 경계가 아니라 실수 방지용이다. 막히면 exit 2와 안내 메시지를 낸다.
"""
import json
import os
import re
import shlex
import sys

EDIT_TOOLS = {"Edit", "Write", "NotebookEdit", "MultiEdit"}
VERSION_FLAGS = {"-v", "-V", "--version", "version"}

MSG = (
    "[KIX 학습 모드] {what}은(는) 개발자가 직접 수행합니다. "
    "코드·설정·명령어는 대화에서 예시로 안내하세요. (.claude/rules/learning-mode.md)"
)


def deny(what):
    print(MSG.format(what=what), file=sys.stderr)
    sys.exit(2)


def check_edit(tool_input, cwd):
    path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not path:
        return
    root = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR", cwd))
    abs_path = os.path.realpath(os.path.join(cwd, path))
    if abs_path != root and not abs_path.startswith(root + os.sep):
        return  # 프로젝트 밖 파일은 이 가드의 대상이 아니다
    rel = os.path.relpath(abs_path, root)
    allowed = (
        rel in ("CLAUDE.md", "design/approved.md")
        or rel.startswith(".claude" + os.sep)
        or rel.startswith("docs" + os.sep)
    )
    if not allowed:
        deny("'%s' 파일 작성·수정" % rel)


GIT_READONLY = {
    "status", "diff", "log", "show", "rev-parse", "ls-files", "blame", "describe",
    "shortlog", "reflog", "ls-tree", "cat-file", "grep", "version", "help",
    "--version", "-v",
}
GIT_BRANCH_WRITE = {
    "-d", "-D", "-m", "-M", "-c", "-C", "-f", "-u", "--delete", "--move",
    "--copy", "--force", "--set-upstream-to", "--unset-upstream",
}
DOCKER_READONLY = {"--version", "version", "info", "ps", "images", "logs", "inspect", "stats", "ls"}
COMPOSE_READONLY = {"version", "ps", "config", "ls", "logs", "images"}
PACKAGE_READONLY = {"-v", "--version", "ls", "list", "view", "info", "outdated"}
BREW_WRITE = {"install", "upgrade", "uninstall", "remove", "tap", "untap", "link", "unlink", "reinstall"}

MUTATION = re.compile(
    r"(?<![0-9&<])>>?(?!&)|\btee\b|\bsed\s+-\w*i|\bperl\s+-\w*i|\bcp\b|\bmv\b|\brm\b"
    r"|\bmkdir\b|\btouch\b|\binstall\b|\bln\b|\.write\(|\bopen\s*\(|\bshutil\b"
)
PROTECTED = re.compile(
    r"(?:^|[\s'\"=:/])(?:\./)?(?:backend|frontend|infra|\.github|src)(?:/|[\s'\"]|$)"
    r"|\.gitignore|\.editorconfig|\.env\.example|README\.md"
    r"|design/(?:brand|tokens|wireframes|banners|products)"
    r"|build\.gradle|settings\.gradle|pom\.xml|package\.json|Dockerfile|compose\.ya?ml|nginx"
)


def split_args(segment):
    try:
        tokens = shlex.split(segment)
    except ValueError:
        tokens = segment.split()
    while tokens and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", tokens[0]):
        tokens.pop(0)  # FOO=bar 형태의 환경변수 접두사 제거
    # 2>&1, >/dev/null 같은 리다이렉션 토큰은 명령 인자가 아니다
    return [t for t in tokens if not re.match(r"^\d*[<>]+&?\S*$", t)]


def check_git(args):
    while args and args[0].startswith("-") and args[0] not in VERSION_FLAGS:
        args = args[2:] if args[0] in ("-C", "-c") else args[1:]
    sub = args[0] if args else ""
    rest = args[1:]
    if sub in GIT_READONLY:
        return
    if sub == "branch" and all(a.startswith("-") and a not in GIT_BRANCH_WRITE for a in rest):
        return
    if sub == "remote" and rest in ([], ["-v"]):
        return
    if sub == "config" and rest and rest[0] in ("--get", "--get-all", "--list", "-l"):
        return
    deny("Git 명령(git %s)" % sub)


def check_segment(segment):
    tokens = split_args(segment)
    if not tokens:
        return
    prog = os.path.basename(tokens[0])
    args = tokens[1:]
    only_version = args and args[0] in VERSION_FLAGS

    if prog == "git":
        check_git(args)
    elif prog in ("npm", "pnpm", "yarn", "bun"):
        if not (args and args[0] in PACKAGE_READONLY):
            deny("패키지 관리 명령(%s)" % prog)
    elif prog in ("npx", "gradle", "gradlew", "mvn", "mvnw", "pip", "pip3"):
        if not only_version:
            deny("빌드·패키지 명령(%s)" % prog)
    elif prog in ("docker", "docker-compose"):
        words = [a for a in args if not a.startswith("-") or a in VERSION_FLAGS]
        sub = words[0] if words else ""
        if sub == "compose" or prog == "docker-compose":
            sub = words[1] if prog == "docker" and len(words) > 1 else (words[0] if prog == "docker-compose" and words else "")
            if sub not in COMPOSE_READONLY:
                deny("Docker Compose 명령")
        elif sub not in DOCKER_READONLY:
            deny("Docker 명령")
    elif prog in ("aws", "terraform", "kubectl", "ssh", "scp", "rsync", "sftp", "gh"):
        if not only_version:
            deny("배포·원격·클라우드 명령(%s)" % prog)
    elif prog == "brew":
        if args and args[0] in BREW_WRITE:
            deny("패키지 설치 명령(brew)")

    if MUTATION.search(segment) and PROTECTED.search(segment):
        deny("소스·개발 설정 파일 변경")


def check_bash(tool_input):
    command = tool_input.get("command", "")
    for segment in re.split(r"&&|\|\||;|\||\n", command):
        check_segment(segment.strip())


def main():
    data = json.load(sys.stdin)
    tool = data.get("tool_name", "")
    tool_input = data.get("tool_input", {}) or {}
    cwd = data.get("cwd") or os.getcwd()
    if tool in EDIT_TOOLS:
        check_edit(tool_input, cwd)
    elif tool == "Bash":
        check_bash(tool_input)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:  # 가드 오류가 모든 작업을 막지 않도록 실패 시 통과시키고 알린다
        print("[KIX guard] 가드 스크립트 오류: %r" % (exc,), file=sys.stderr)
        sys.exit(1)
