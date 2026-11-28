#!/usr/bin/env python3
"""guard.py 회귀·권한 테스트. 실행: python3 -I .claude/hooks/test_guard.py

임시 폴더에 가짜 저장소(main)와 worktree(wt-fe), 무관한 저장소(other)를 만들어 검사한다.
실제 프로젝트 파일은 건드리지 않는다. exit code 2 = 차단, 0 = 허용.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

GUARD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "guard.py")
GIT = ["git", "-c", "user.name=t", "-c", "user.email=t@t"]


def git(cwd, *args):
    subprocess.run(GIT + list(args), cwd=cwd, check=True, capture_output=True)


class GuardTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = os.path.realpath(tempfile.mkdtemp(prefix="kix-guard-"))
        b = cls.base
        cls.main, cls.wt, cls.other, cls.scratch = (os.path.join(b, d) for d in ("main", "wt-fe", "other", "scratch"))
        for d in ("backend/src", "frontend/src", "infra", ".github/workflows", "docs", ".claude/rules", "design/tokens"):
            os.makedirs(os.path.join(cls.main, d))
        os.makedirs(cls.other)
        os.makedirs(cls.scratch)
        for f in ("CLAUDE.md", "README.md", "backend/src/A.java", "frontend/src/App.jsx", "docs/a.md"):
            open(os.path.join(cls.main, f), "w").close()
        git(cls.main, "init", "-q")
        git(cls.main, "add", "-A")
        git(cls.main, "commit", "-q", "-m", "init")
        git(cls.main, "worktree", "add", "-q", "-b", "feature/frontend-x", cls.wt)
        git(cls.other, "init", "-q")
        os.symlink("../backend", os.path.join(cls.main, "docs", "link-be"))
        os.symlink("../frontend", os.path.join(cls.main, "docs", "link-fe"))
        os.symlink(os.path.join(cls.main, "backend"), os.path.join(cls.scratch, "lnk"))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.base, ignore_errors=True)

    def run_guard(self, tool, tool_input, cwd=None):
        cwd = cwd or self.main
        env = dict(os.environ, CLAUDE_PROJECT_DIR=self.main)
        data = {"tool_name": tool, "tool_input": tool_input, "cwd": cwd}
        r = subprocess.run([sys.executable, "-I", GUARD], input=json.dumps(data), text=True, env=env, capture_output=True)
        return r.returncode, r.stderr

    def ok(self, cmd, cwd=None):
        code, err = self.run_guard("Bash", {"command": cmd.replace("$MAIN", self.main).replace("$WT", self.wt)}, cwd)
        self.assertEqual(code, 0, "허용되어야 함: %r\n%s" % (cmd, err))

    def no(self, cmd, cwd=None):
        code, err = self.run_guard("Bash", {"command": cmd.replace("$MAIN", self.main).replace("$WT", self.wt)}, cwd)
        self.assertEqual(code, 2, "차단되어야 함: %r\n%s" % (cmd, err))

    def edit_ok(self, path, cwd=None):
        code, err = self.run_guard("Edit", {"file_path": path}, cwd)
        self.assertEqual(code, 0, "허용되어야 함: %s\n%s" % (path, err))

    def edit_no(self, path, cwd=None):
        code, err = self.run_guard("Edit", {"file_path": path}, cwd)
        self.assertEqual(code, 2, "차단되어야 함: %s\n%s" % (path, err))
        return err

    # ---- 회귀: 기존 정책 (Edit)
    def test_edit_allowed(self):
        for p in ("CLAUDE.md", "design/approved.md", "docs/progress.md", ".claude/rules/x.md"):
            self.edit_ok(os.path.join(self.main, p))

    def test_edit_blocked(self):
        for p in ("backend/src/A.java", "infra/docker-compose.yml", ".github/workflows/ci.yml", ".gitignore",
                  "README.md", "design/tokens/tokens.json", ".env.example", ".git/config"):
            self.edit_no(os.path.join(self.main, p))

    def test_edit_outside_repos_allowed(self):
        self.edit_ok(os.path.join(self.scratch, "memo.txt"))
        self.edit_ok(os.path.join(self.other, "x.java"))  # 무관한 저장소

    # ---- 회귀: 기존 정책 (Bash)
    def test_bash_allowed(self):
        for c in ("git status -sb", "git diff --stat", "git log --oneline -5", "git --no-pager branch -vv",
                  "git check-ignore .env", "git -C $WT status", "ls frontend", "cat docs/a.md",
                  "cat frontend/src/App.jsx", "cat $WT/frontend/src/App.jsx", "grep -rn foo backend/",
                  "sed -n 1,5p backend/src/A.java", "./gradlew --version", "docker --version", "docker ps",
                  "docker compose ps", "npm --version", "npm ls", "python3 --version", "echo hi",
                  "echo x > docs/a.md", "git diff backend/ > /dev/null 2>&1",
                  "cat > docs/n.md <<'EOF'\nbackend cp rm touch\nEOF"):
            self.ok(c)

    def test_bash_blocked(self):
        for c in ("git add .", "git commit -m x", "git push", "git checkout -b x", "git branch newbranch",
                  "git branch -D x", "git remote add o u", "git config user.name x", "git worktree add ../x",
                  "npm install", "npx vite", "./gradlew test", "docker run x", "docker compose up",
                  "aws s3 ls", "gh pr create", "ssh host", "brew install x"):
            self.no(c)

    def test_bash_source_mutation_blocked(self):
        for c in ("echo x > backend/Foo.java", "touch frontend/a.js", "mkdir infra/x", "rm -rf backend/src",
                  "cp docs/a.md backend/", "sed -i s/a/b/ backend/src/A.java", "echo x | tee backend/x",
                  "mv docs/a.md backend/", "python3 -c \"open('backend/x','w')\"", "ln -s x backend/l"):
            self.no(c)

    # ---- 신규: cd / 상대·절대 경로 우회
    def test_cd_bypass_blocked(self):
        for c in ("cd backend && echo x > Foo.java", "cd frontend; touch a.js", "cd backend\ntouch Foo.java",
                  "(cd backend && touch Foo)", "cd docs && echo x > ../backend/F", "pushd backend && touch F",
                  "cd docs/.. && touch backend/F"):
            self.no(c)

    def test_cd_allowed(self):
        self.ok("cd docs && touch x.md")
        self.ok("(cd backend && ls); touch docs/x.md")  # 서브셸 종료 후 작업 디렉터리 복원

    def test_path_forms_blocked(self):
        self.no("echo x > $MAIN/backend/F")
        self.no("echo x > docs/../backend/F")
        self.no("echo x > ./frontend/F")
        self.no("echo x > ../main/backend/F", cwd=self.scratch)
        self.no("echo x > ../main/frontend/F", cwd=self.scratch)

    def test_wrappers_and_expansion_blocked(self):
        for c in ("env X=1 rm -rf backend", "bash -c 'touch backend/F'", 'sh -c "cd frontend && touch x"',
                  'eval "touch backend/F"', "ls backend | xargs rm", "find backend -delete",
                  "find . -name x -exec rm {} \\;", "rm -rf ..", "rm -rf .", "rm -rf ./*",
                  "echo $(touch backend/F)", "echo `touch backend/F`", "touch $UNDEFINED_KIX/x",
                  "touch {backend,docs}/x", "tar -xzf a.tgz -C backend", "curl -o frontend/x http://e"):
            self.no(c)

    def test_symlink_bypass_blocked(self):
        self.edit_no(os.path.join(self.main, "docs/link-be/F"))
        self.edit_no(os.path.join(self.main, "docs/link-fe/F"))
        self.edit_no(os.path.join(self.scratch, "lnk/F"))
        self.no("echo x > docs/link-be/F")
        self.no("touch docs/link-fe/F")
        self.no("echo x > lnk/F", cwd=self.scratch)

    # ---- 신규: 다른 worktree에도 동일 제한 (Codex worktree 보호가 아니라 Claude Code 제한)
    def test_worktree_edit(self):
        for p in ("frontend/src/App.jsx", "backend/src/A.java", "frontend/Dockerfile"):
            self.edit_no(os.path.join(self.wt, p))
        for p in ("docs/x.md", ".claude/x.md", "CLAUDE.md"):
            self.edit_ok(os.path.join(self.wt, p))

    def test_worktree_bash(self):
        self.no("echo x > ../wt-fe/frontend/a")
        self.no("echo x > $WT/backend/a")
        self.no("cd ../wt-fe/frontend && touch a")
        self.no("rm -rf ../wt-fe")
        self.no("echo x > frontend/a", cwd=self.wt)
        self.ok("echo x > docs/a.md", cwd=self.wt)

    def test_frontend_message_names_codex(self):
        err = self.edit_no(os.path.join(self.main, "frontend/src/App.jsx"))
        self.assertIn("Codex", err)


if __name__ == "__main__":
    unittest.main(verbosity=2)
