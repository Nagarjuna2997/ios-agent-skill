#!/usr/bin/env python3
"""Fail when the skill's version drifts between its manifests.

SKILL.md frontmatter is the source of truth for the skill (repository release)
version. skill.json, the Gemini extension manifest and the Codex plugin
manifests are hand-maintained copies; they silently stayed at 3.5.0 through
three releases because nothing compared them. The npm package version
(mcp-server/package.json) is a separate number and is checked by
mcp-server/scripts/sync-version.mjs.

    python3 scripts/check-manifest-versions.py
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKILL_MANIFESTS = [
    "skill.json",
    "gemini-extension.json",
    "plugins/ios-agent-skill/.codex-plugin/plugin.json",
    "plugins/ios-agent-chatgpt/.codex-plugin/plugin.json",
]


def skill_version() -> str:
    text = (ROOT / "SKILL.md").read_text(encoding="utf-8")
    block = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not block:
        sys.exit("SKILL.md is missing its YAML frontmatter block")
    match = re.search(r'^version:\s*"?([^"\s]+)"?\s*$', block.group(1), re.MULTILINE)
    if not match:
        sys.exit("SKILL.md frontmatter has no version")
    return match.group(1)


def parse(version: str) -> tuple:
    return tuple(int(part) for part in version.split("."))


def main() -> int:
    expected = skill_version()
    problems = []
    for relative in SKILL_MANIFESTS:
        actual = json.loads((ROOT / relative).read_text(encoding="utf-8")).get("version")
        if actual != expected:
            problems.append(f"{relative}: version {actual!r}, SKILL.md says {expected!r}")

    changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
    released = re.findall(r"^## \[(\d+\.\d+\.\d+)\]", changelog, re.MULTILINE)
    unreleased = re.search(r"^## \[Unreleased\]\n(.*?)(?=^## \[)", changelog, re.MULTILINE | re.DOTALL)
    has_unreleased = bool(unreleased and unreleased.group(1).strip())
    newest = released[0] if released else None
    if expected == newest:
        pass
    elif has_unreleased and newest and parse(expected) > parse(newest):
        # A version bumped ahead of its release: the notes live under Unreleased
        # until the owner cuts the release and renames the heading.
        pass
    else:
        problems.append(
            f"SKILL.md version {expected} is neither the newest CHANGELOG release ({newest}) "
            "nor a later version with notes under ## [Unreleased]"
        )

    if problems:
        print("Manifest versions disagree:")
        print("\n".join(problems))
        print("Fix: set every manifest to the SKILL.md version.")
        return 1
    print(f"OK - {len(SKILL_MANIFESTS)} manifests match skill version {expected}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
