#!/usr/bin/env python3
"""KIX 학습 모드 보조 가드 (Claude Code PreToolUse 전용).

Claude Code가 소스 코드·개발 환경·Git·배포 작업을 직접 하려는 시도를 막는다.
이 스크립트는 .claude/settings.json 의 hook 으로만 실행되므로 Codex, IDE, 개발자
터미널에는 영향이 없다. 보안 경계가 아니라 실수 방지용이다. 막히면 exit 2.

수정 허용 범위(이 저장소와 같은 저장소의 모든 worktree에 동일 적용):
  CLAUDE.md, design/approved.md, .claude/**, docs/**
그 밖의 경로(backend, frontend, infra, .github, .git 등)는 Claude Code가 수정하지 않는다.
경로는 cd, 상대·절대 경로, .., 심볼릭 링크를 모두 실경로로 풀어서 판정한다.
"""
import glob
import json
import os
import re
import sys

EDIT_TOOLS = {"Edit", "Write", "NotebookEdit", "MultiEdit"}
VERSION_FLAGS = {"-v", "-V", "--version", "version"}
ALLOWED_FILES = {"CLAUDE.md", "design/approved.md"}
ALLOWED_DIRS = {".claude", "docs"}

MSG = (
    "[KIX 학습 모드] {what}은(는) 개발자가 직접 수행합니다. "
    "코드·설정·명령어는 대화에서 예시로 안내하세요. (.claude/rules/learning-mode.md)"
)
MSG_FRONTEND = (
    "[KIX 가드] '{what}': frontend/는 Codex가 전담하며 Claude Code는 읽기 전용입니다. "
    "(CLAUDE.md 2장)"
)


def deny(what, frontend=False):
    print((MSG_FRONTEND if frontend else MSG).format(what=what), file=sys.stderr)
    sys.exit(2)


# ---------------------------------------------------------------- 경로 판정

def _read(path):
    try:
        with open(path, encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return None


def common_git_dir(root):
    """root(작업 디렉터리)가 속한 저장소의 공용 .git 디렉터리. worktree도 같은 값이 나온다."""
    g = os.path.join(root, ".git")
    if os.path.isdir(g):
        return os.path.realpath(g)
    if os.path.isfile(g):
        m = re.match(r"gitdir:\s*(.+)", _read(g) or "")
        if not m:
            return None
        gd = os.path.realpath(os.path.join(root, m.group(1).strip()))
        c = _read(os.path.join(gd, "commondir"))
        return os.path.realpath(os.path.join(gd, c)) if c else gd
    return None


def find_git_root(path):
    cur = path if os.path.isdir(path) else os.path.dirname(path)
    while True:
        if os.path.exists(os.path.join(cur, ".git")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            return None
        cur = parent


def repo_root_of(abs_path, project):
    """abs_path가 속한 '이 저장소의 작업 디렉터리' 루트(본 디렉터리 또는 다른 worktree). 무관하면 None."""
    mine = common_git_dir(project)
    root = find_git_root(abs_path)
    if root and mine and common_git_dir(root) == mine:
        return root
    if abs_path == project or abs_path.startswith(project + os.sep):
        return project
    return None


def is_allowed_rel(rel, dir_ok=True):
    parts = rel.split(os.sep)
    if rel in ALLOWED_FILES:
        return True
    return parts[0] in ALLOWED_DIRS and (len(parts) > 1 or dir_ok)


def violation(abs_path, project, ancestor_check=False, dir_ok=True):
    """수정하면 안 되는 경로면 설명 문자열(rel), 아니면 None."""
    if ancestor_check and (abs_path == project or project.startswith(abs_path + os.sep)):
        return "프로젝트 루트 또는 상위 경로"
    root = repo_root_of(abs_path, project)
    if root is None:
        return None
    rel = os.path.relpath(abs_path, root)
    if rel != "." and is_allowed_rel(rel, dir_ok):
        return None
    return rel


def top_of(rel):
    return rel.split(os.sep)[0]


def check_edit(tool_input, cwd, project):
    path = tool_input.get("file_path") or tool_input.get("notebook_path")
    if not path:
        return
    abs_path = os.path.realpath(os.path.join(cwd, os.path.expanduser(path)))
    bad = violation(abs_path, project)
    if bad:
        deny("'%s' 파일 작성·수정" % bad, frontend=top_of(bad) == "frontend")


def resolve_targets(path, cwd):
    """경로 문자열 -> 실경로 목록. 해석할 수 없으면 None(호출자가 거부한다)."""
    p = os.path.expandvars(os.path.expanduser(path))
    if re.search(r"[$`]|\{[^}]*,[^}]*\}", p):
        return None
    if not os.path.isabs(p):
        if cwd is None:
            return None
        p = os.path.join(cwd, p)
    out = [os.path.realpath(p)]
    if re.search(r"[*?\[]", p):
        out += [os.path.realpath(m) for m in glob.glob(p)]
    return out


def check_target(path, cwd, project, what, ancestor_check=False, dir_ok=True):
    paths = resolve_targets(path, cwd)
    if paths is None:
        deny("%s 대상 경로를 해석할 수 없는 명령(%s)" % (what, path))
    for p in paths:
        bad = violation(p, project, ancestor_check, dir_ok)
        if bad:
            deny("'%s' %s" % (bad, what), frontend=top_of(bad) == "frontend")


# ---------------------------------------------------------------- 명령 파싱

def lex(command):
    """셸 명령을 ('seg', words, redirects) / ('push',) / ('pop',) 목록으로 나눈다.
    따옴표, 줄바꿈, ; && || | & ( ) 백틱, 리다이렉션, heredoc 본문을 처리하는 단순 분석기다."""
    items, words, redirs = [], [], []
    buf, in_word, pending, quote = [], False, None, None
    heredocs = []
    i, n = 0, len(command)

    def end_word():
        nonlocal buf, in_word, pending
        if not in_word:
            return
        w = "".join(buf)
        buf, in_word = [], False
        if pending == "heredoc":
            heredocs.append(w)
        elif pending == "ignore":
            pass
        elif pending == ">&":
            if not re.fullmatch(r"\d+|-", w):
                redirs.append((">&", w))
        elif pending:
            redirs.append((pending, w))
        else:
            words.append(w)
        pending = None

    def end_seg():
        nonlocal words, redirs, pending
        end_word()
        if words or redirs:
            items.append(("seg", words, redirs))
        words, redirs, pending = [], [], None

    while i < n:
        c = command[i]
        if quote == "'":
            if c == "'":
                quote = None
            else:
                buf.append(c)
            i += 1
            continue
        if quote == '"':
            if c == '"':
                quote = None
            elif c == "\\" and i + 1 < n and command[i + 1] in '"\\$`':
                buf.append(command[i + 1])
                i += 1
            else:
                buf.append(c)
            i += 1
            continue
        if c == "\\":
            if i + 1 < n and command[i + 1] == "\n":
                i += 2
            elif i + 1 < n:
                buf.append(command[i + 1])
                in_word = True
                i += 2
            else:
                i += 1
            continue
        if c in "'\"":
            quote, in_word = c, True
            i += 1
            continue
        if c == "#" and not in_word:
            while i < n and command[i] != "\n":
                i += 1
            continue
        if c in " \t":
            end_word()
            i += 1
            continue
        if c == "\n":
            end_seg()
            i += 1
            for delim in heredocs:
                while i < n:
                    j = command.find("\n", i)
                    j = n if j == -1 else j
                    line, i = command[i:j], min(j + 1, n)
                    if line.strip() == delim:
                        break
            heredocs.clear()
            continue
        if c in ";`":
            end_seg()
            i += 1
            continue
        if c in "<>" or (c == "&" and command[i + 1:i + 2] == ">"):
            if in_word and "".join(buf).isdigit():
                buf, in_word = [], False  # 2>file 의 파일 기술자 번호
            else:
                end_word()
            ops = ("&>>", "&>", ">>", ">|", ">&", ">") if c in ">&" else ("<<<", "<<-", "<<", "<&", "<>", "<")
            op = next(o for o in ops if command.startswith(o, i))
            i += len(op)
            if op in ("<<", "<<-"):
                pending = "heredoc"
            elif op in ("<", "<<<", "<&"):
                pending = "ignore"
            else:
                pending = op
            continue
        if c in "()":
            end_seg()
            items.append(("push",) if c == "(" else ("pop",))
            i += 1
            continue
        if c == "&" or c == "|":
            end_seg()
            i += 2 if command[i + 1:i + 2] in ("&", "|") and command[i + 1] == c or command[i:i + 2] == "|&" else 1
            continue
        buf.append(c)
        in_word = True
        i += 1
    end_seg()
    return items


ENV_ASSIGN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")
WRAPPERS = {"env", "command", "nohup", "time", "nice", "exec", "builtin", "sudo", "stdbuf", "timeout"}
SHELLS = {"bash", "sh", "zsh", "dash", "ksh"}


def unwrap(words):
    while words:
        if ENV_ASSIGN.match(words[0]):
            words = words[1:]
            continue
        prog = os.path.basename(words[0])
        if prog not in WRAPPERS:
            break
        words = words[1:]
        while words and (words[0].startswith("-") or ENV_ASSIGN.match(words[0])):
            words = words[1:]
        if prog == "timeout" and words and re.fullmatch(r"[\d.]+[smhd]?", words[0]):
            words = words[1:]
    return words


def positional(args, value_flags=()):
    out, rest, skip = [], False, False
    for a in args:
        if skip:
            skip = False
        elif rest:
            out.append(a)
        elif a == "--":
            rest = True
        elif a in value_flags:
            skip = True
        elif a.startswith("-") and a != "-":
            continue
        else:
            out.append(a)
    return out


def option_value(args, names):
    for k, a in enumerate(args):
        for name in names:
            if a == name and k + 1 < len(args):
                return args[k + 1]
            if name.startswith("--") and a.startswith(name + "="):
                return a.split("=", 1)[1]
    return None


# ---------------------------------------------------------------- 기존 명령별 차단

GIT_READONLY = {
    "status", "diff", "log", "show", "rev-parse", "ls-files", "check-ignore", "blame", "describe",
    "shortlog", "reflog", "ls-tree", "cat-file", "grep", "version", "help",
    "--version", "-v",
}
GIT_BRANCH_WRITE = {
    "-d", "-D", "-m", "-M", "-c", "-C", "-f", "-u", "--delete", "--move",
    "--copy", "--force", "--set-upstream-to", "--unset-upstream",
}
DOCKER_READONLY = {"--version", "version", "info", "ps", "images", "logs", "inspect", "stats", "ls", "port"}
COMPOSE_READONLY = {"version", "ps", "config", "ls", "logs", "images"}
PACKAGE_READONLY = {"-v", "--version", "ls", "list", "view", "info", "outdated"}
BREW_WRITE = {"install", "upgrade", "uninstall", "remove", "tap", "untap", "link", "unlink", "reinstall"}

# 경로 해석으로 판정하는 명령과 별도 규칙이 있는 명령. 그 밖의 프로그램(python -c 등 인라인 코드)은
# 아래 정규식으로 한 번 더 거른다.
ANALYZED = {
    "rm", "rmdir", "unlink", "shred", "mv", "mkdir", "touch", "mkfifo", "tee", "truncate", "chmod",
    "chown", "chgrp", "cp", "install", "ln", "dd", "sed", "perl", "ruby", "sort", "curl", "wget",
    "tar", "unzip", "find", "xargs", "git", "docker", "docker-compose", "npm", "pnpm", "yarn", "bun",
    "npx", "gradle", "gradlew", "mvn", "mvnw", "pip", "pip3", "aws", "terraform", "kubectl", "ssh",
    "scp", "rsync", "sftp", "gh", "brew", "cd", "pushd", "popd", "eval",
    "echo", "printf", "cat", "ls", "grep", "egrep", "fgrep", "rg", "head", "tail", "wc", "diff", "cmp",
    "stat", "file", "pwd", "test", "[", "true", "false", "which", "jq", "less", "more", "tree",
    "realpath", "basename", "dirname", "date", "sleep", "uniq", "cut", "tr", "sw_vers", "uname",
} | SHELLS
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


def check_program(prog, args):
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


# ---------------------------------------------------------------- 파일 변경 명령

RISKY_VIA_XARGS = {
    "rm", "rmdir", "mv", "cp", "tee", "touch", "mkdir", "chmod", "chown", "ln", "install", "sed",
    "perl", "ruby", "dd", "truncate", "shred", "unlink",
} | SHELLS


def check_mutation(prog, args, cwd, project):
    pos = positional(args)
    targets = []  # (경로, 조상 검사, 디렉터리 루트 허용)

    def add(paths, ancestor=False, dir_ok=True):
        targets.extend((p, ancestor, dir_ok) for p in paths)

    if prog in ("rm", "rmdir", "unlink", "shred", "mv"):
        add(pos, True, False)
    elif prog in ("mkdir", "touch", "mkfifo", "tee"):
        add(pos)
    elif prog == "truncate":
        add(positional(args, ("-s", "--size", "-r", "--reference")))
    elif prog in ("chmod", "chown", "chgrp"):
        add(pos[1:])
    elif prog in ("cp", "install", "ln"):
        dest = option_value(args, ("-t", "--target-directory"))
        if dest:
            add([dest])
        elif prog == "install" and ("-d" in args or "--directory" in args):
            add(pos)
        elif len(pos) >= 2:
            add(pos[-1:])
        elif len(pos) == 1 and prog == "ln":
            add([os.path.basename(pos[0])])
    elif prog == "dd":
        add([a[3:] for a in args if a.startswith("of=")])
    elif prog == "sed" and any(re.match(r"-[A-Za-z]*i|--in-place", a) for a in args):
        has_script = any(a in ("-e", "-f") or a.startswith(("--expression", "--file")) for a in args)
        files = positional(args, ("-e", "-f", "--expression", "--file"))
        add(files if has_script else files[1:])
    elif prog in ("perl", "ruby") and any(re.match(r"-[A-Za-z]*i", a) for a in args):
        add(positional(args, ("-e", "-E")))
    elif prog == "sort":
        out = option_value(args, ("-o", "--output"))
        if out:
            add([out])
    elif prog == "curl":
        out = option_value(args, ("-o", "--output"))
        if out:
            add([out])
        if any(a in ("-O", "--remote-name") for a in args):
            add(["./_"])
    elif prog == "wget":
        out = option_value(args, ("-O", "--output-document"))
        folder = option_value(args, ("-P", "--directory-prefix"))
        if out and out != "-":
            add([out])
        elif not out:
            add([os.path.join(folder, "_") if folder else "./_"])
    elif prog == "unzip" and "-l" not in args:
        folder = option_value(args, ("-d",))
        add([os.path.join(folder, "_") if folder else "./_"])
    elif prog == "tar":
        clusters = [a.lstrip("-") for a in args if a.startswith("-") and not a.startswith("--")]
        if args and not args[0].startswith("-"):
            clusters.append(args[0])
        joined = "".join(clusters)
        if "x" in joined or "--extract" in args or "--get" in args:
            folder = option_value(args, ("-C", "--directory"))
            add([os.path.join(folder, "_") if folder else "./_"])
        if "c" in joined or "r" in joined or "u" in joined:
            for k, a in enumerate(args):
                if (k == 0 or a.startswith("-")) and "f" in a.lstrip("-") and k + 1 < len(args):
                    add([args[k + 1]])
                    break
    elif prog == "find":
        starts = []
        for a in args:
            if a.startswith("-") or a in ("(", ")", "!", ","):
                break
            starts.append(a)
        mutating = "-delete" in args
        for k, a in enumerate(args):
            if a in ("-exec", "-execdir", "-ok", "-okdir") and k + 1 < len(args):
                if os.path.basename(args[k + 1]) in RISKY_VIA_XARGS | {"tar", "unzip", "curl", "wget"}:
                    mutating = True
        if mutating:
            add(starts or ["."], True, True)
    elif prog == "xargs":
        if any(os.path.basename(a) in RISKY_VIA_XARGS for a in args):
            deny("xargs로 전달되는 변경 대상을 알 수 없는 명령")

    for path, ancestor, dir_ok in targets:
        check_target(path, cwd, project, "소스·개발 설정 파일 변경", ancestor, dir_ok)


def do_cd(args, cwd):
    pos = positional(args)
    target = pos[0] if pos else "~"
    if target == "-":
        return None
    p = os.path.expandvars(os.path.expanduser(target))
    if re.search(r"[$`*?\[{]", p):
        return None
    if not os.path.isabs(p):
        if cwd is None:
            return None
        p = os.path.join(cwd, p)
    return os.path.realpath(p)


def check_segment(words, redirs, cwd, project, depth):
    for _op, target in redirs:
        check_target(target, cwd, project, "리다이렉션 쓰기")
    words = unwrap(words)
    if not words:
        return cwd
    prog, args = os.path.basename(words[0]), words[1:]
    if prog in ("cd", "pushd"):
        return do_cd(args, cwd)
    if prog == "popd":
        return None
    if prog in SHELLS:
        for k, a in enumerate(args):
            if a.startswith("-") and not a.startswith("--") and "c" in a and k + 1 < len(args):
                scan(args[k + 1], cwd, project, depth + 1)
                break
    elif prog == "eval":
        scan(" ".join(args), cwd, project, depth + 1)
    check_program(prog, args)
    check_mutation(prog, args, cwd, project)
    text = " ".join(words)
    if prog not in ANALYZED and MUTATION.search(text) and PROTECTED.search(text):
        deny("소스·개발 설정 파일 변경")
    return cwd


def scan(command, cwd, project, depth=0):
    if depth > 3:
        deny("중첩이 깊은 셸 명령")
    stack = []
    for item in lex(command):
        if item[0] == "push":
            stack.append(cwd)
        elif item[0] == "pop":
            cwd = stack.pop() if stack else cwd
        else:
            cwd = check_segment(item[1], item[2], cwd, project, depth)


def main():
    data = json.load(sys.stdin)
    tool = data.get("tool_name", "")
    tool_input = data.get("tool_input", {}) or {}
    cwd = os.path.realpath(data.get("cwd") or os.getcwd())
    project = os.path.realpath(os.environ.get("CLAUDE_PROJECT_DIR") or cwd)
    if tool in EDIT_TOOLS:
        check_edit(tool_input, cwd, project)
    elif tool == "Bash":
        scan(tool_input.get("command", ""), cwd, project)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:  # 가드 오류가 모든 작업을 막지 않도록 실패 시 통과시키고 알린다
        print("[KIX guard] 가드 스크립트 오류: %r" % (exc,), file=sys.stderr)
        sys.exit(1)
