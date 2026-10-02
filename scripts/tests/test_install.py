"""Hermetic tests for install.sh.

Every run uses a temporary HOME, working directory and a local bare git
remote (via IOS_AGENT_SKILL_REPO_URL), so nothing touches the network or the
developer's real skill folders.

    python3 -m unittest scripts/tests/test_install.py
"""
import os
import pathlib
import shutil
import subprocess
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
INSTALL = ROOT / "install.sh"


def git(*args, cwd):
    subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, text=True)


class InstallScriptTests(unittest.TestCase):
    def setUp(self):
        self.tmp = pathlib.Path(tempfile.mkdtemp(prefix="install-test-"))
        self.home = self.tmp / "home"
        self.work = self.tmp / "work"
        self.home.mkdir()
        self.work.mkdir()
        # A tiny stand-in for the skill repository with a main branch.
        self.source = self.tmp / "source"
        self.source.mkdir()
        git("init", "-q", "-b", "main", cwd=self.source)
        git("config", "user.email", "test@example.invalid", cwd=self.source)
        git("config", "user.name", "Installer Test", cwd=self.source)
        git("config", "commit.gpgsign", "false", cwd=self.source)
        (self.source / "SKILL.md").write_text("# Skill v1\n")
        git("add", "SKILL.md", cwd=self.source)
        git("commit", "-q", "-m", "v1", cwd=self.source)
        self.remote = self.tmp / "remote.git"
        git("clone", "-q", "--bare", str(self.source), str(self.remote), cwd=self.tmp)
        self.env = {
            "HOME": str(self.home),
            "PATH": os.environ["PATH"],
            "IOS_AGENT_SKILL_REPO_URL": str(self.remote),
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_TERMINAL_PROMPT": "0",
        }

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_install(self, *args, env=None):
        return subprocess.run(
            ["bash", str(INSTALL), *args],
            cwd=self.work,
            env=env or self.env,
            capture_output=True,
            text=True,
            timeout=60,
        )

    def publish(self, text):
        (self.source / "SKILL.md").write_text(text)
        git("commit", "-q", "-am", "update", cwd=self.source)
        git("push", "-q", str(self.remote), "main", cwd=self.source)

    def test_help_and_argument_errors(self):
        help_result = self.run_install("--help")
        self.assertEqual(help_result.returncode, 0)
        self.assertIn("Usage: bash install.sh", help_result.stdout)
        for args in [(), ("--client",), ("--client", "unknown"), ("--bogus",)]:
            with self.subTest(args=args):
                result = self.run_install(*args)
                self.assertEqual(result.returncode, 1)
                self.assertIn("Usage:", result.stderr)

    def test_instruction_only_clients_change_nothing(self):
        for client in ("gemini", "chatgpt"):
            with self.subTest(client=client):
                result = self.run_install("--client", client)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertIn("docs/mcp/installation.md", result.stdout)
        rejected = self.run_install("--client", "gemini", "--dir", str(self.tmp / "x"))
        self.assertEqual(rejected.returncode, 1)
        self.assertIn("--dir is only for source-skill installation", rejected.stderr)
        self.assertEqual(list(self.work.iterdir()), [])
        self.assertEqual(list(self.home.iterdir()), [])

    def test_default_targets(self):
        claude = self.run_install("--client", "claude")
        self.assertEqual(claude.returncode, 0, claude.stderr)
        self.assertTrue((self.work / ".claude/skills/ios-agent-skill/SKILL.md").is_file())
        codex = self.run_install("--client", "codex")
        self.assertEqual(codex.returncode, 0, codex.stderr)
        self.assertTrue((self.home / ".codex/skills/ios-agent-skill/SKILL.md").is_file())

    def test_install_is_idempotent_and_updates_fast_forward(self):
        target = self.tmp / "skills" / "ios-agent-skill"
        first = self.run_install("--client", "muse", "--dir", str(target))
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertIn(f"Source skill installed at: {target}", first.stdout)
        again = self.run_install("--client", "muse", "--dir", str(target))
        self.assertEqual(again.returncode, 0, again.stderr)
        self.publish("# Skill v2\n")
        updated = self.run_install("--client", "muse", "--dir", str(target))
        self.assertEqual(updated.returncode, 0, updated.stderr)
        self.assertEqual((target / "SKILL.md").read_text(), "# Skill v2\n")

    def test_refuses_unsafe_targets(self):
        target = self.tmp / "skill"
        self.assertEqual(self.run_install("--client", "claude", "--dir", str(target)).returncode, 0)

        (target / "SKILL.md").write_text("local edit\n")
        dirty = self.run_install("--client", "claude", "--dir", str(target))
        self.assertEqual(dirty.returncode, 1)
        self.assertIn("Local changes found", dirty.stderr)
        self.assertEqual((target / "SKILL.md").read_text(), "local edit\n")
        git("checkout", "-q", "--", "SKILL.md", cwd=target)

        git("checkout", "-q", "-b", "experiment", cwd=target)
        branch = self.run_install("--client", "claude", "--dir", str(target))
        self.assertEqual(branch.returncode, 1)
        self.assertIn("branch other than main", branch.stderr)
        git("checkout", "-q", "main", cwd=target)

        other = dict(self.env, IOS_AGENT_SKILL_REPO_URL=str(self.tmp / "other.git"))
        origin = self.run_install("--client", "claude", "--dir", str(target), env=other)
        self.assertEqual(origin.returncode, 1)
        self.assertIn("another origin", origin.stderr)

        plain = self.tmp / "plain"
        plain.mkdir()
        (plain / "notes.txt").write_text("keep me\n")
        not_checkout = self.run_install("--client", "claude", "--dir", str(plain))
        self.assertEqual(not_checkout.returncode, 1)
        self.assertIn("not this skill checkout", not_checkout.stderr)
        self.assertEqual((plain / "notes.txt").read_text(), "keep me\n")

        link = self.tmp / "link"
        link.symlink_to(target)
        symlink = self.run_install("--client", "claude", "--dir", str(link))
        self.assertEqual(symlink.returncode, 1)
        self.assertIn("symlink", symlink.stderr)

    def test_clear_errors_for_missing_git_and_unreachable_remote(self):
        bin_dir = self.tmp / "bin"
        bin_dir.mkdir()
        (bin_dir / "bash").symlink_to(shutil.which("bash"))
        no_git = dict(self.env, PATH=str(bin_dir))
        result = subprocess.run(
            [str(bin_dir / "bash"), str(INSTALL), "--client", "claude"],
            cwd=self.work, env=no_git, capture_output=True, text=True, timeout=60,
        )
        self.assertEqual(result.returncode, 1)
        self.assertIn("Git is required", result.stderr)

        missing = dict(self.env, IOS_AGENT_SKILL_REPO_URL=str(self.tmp / "missing.git"))
        target = self.tmp / "never"
        unreachable = self.run_install("--client", "claude", "--dir", str(target), env=missing)
        self.assertEqual(unreachable.returncode, 1)
        self.assertIn("Clone failed", unreachable.stderr)
        self.assertFalse(target.exists())


if __name__ == "__main__":
    unittest.main()
