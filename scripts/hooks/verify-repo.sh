#!/usr/bin/env bash
#
# Stop hook — runs the same consistency checks as CI before a turn ends.
#
# This is the deterministic half of the verification contract: rules a script
# can decide are decided by a script, not by model judgment, and not deferred
# to a CI failure ten minutes later.
#
# Wire-up (.claude/settings.json):
#   Stop -> this script
#
# Exit codes:
#   0  all checks pass
#   2  a check failed; stderr is fed back to the model so it can fix and retry

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

FAILURES=()

# 1. Mirrors match SKILL.md.
if ! MIRROR_OUT="$(./scripts/sync-mirrors.sh --check 2>&1)"; then
  FAILURES+=("Mirror sync:\n$MIRROR_OUT")
fi

# 2. SKILL.md frontmatter is valid and complete.
if ! FM_OUT="$(python3 - <<'PY' 2>&1
import re, sys

text = open("SKILL.md", encoding="utf-8").read()
match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
if not match:
    sys.exit("SKILL.md is missing its YAML frontmatter block")

block = match.group(1)
keys = set(re.findall(r"^([A-Za-z][A-Za-z0-9_-]*):", block, re.MULTILINE))
missing = {"name", "description", "version", "license"} - keys
if missing:
    sys.exit(f"SKILL.md frontmatter is missing: {', '.join(sorted(missing))}")
PY
)"; then
  FAILURES+=("SKILL.md frontmatter:\n$FM_OUT")
fi

# 3. Every referenced documentation path exists.
if ! PATH_OUT="$(python3 - <<'PY' 2>&1
import os, re, sys

# Every markdown file, not just SKILL.md and README.md.
#
# CI scans the whole tree. When this hook scanned only two files it passed
# locally while CI failed on two broken paths in CHANGELOG.md — a local check
# weaker than the remote one is worse than no local check, because it converts
# "verified" into a guess.
pattern = re.compile(r"`((?:docs|patterns|checklists|templates|scripts|samples|\.claude)/[^`\s]+)`")
missing = []
sources = []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in {".git", ".build", "node_modules", "dist"}]
    sources.extend(os.path.join(root, f) for f in files if f.endswith(".md"))

for source in sorted(sources):
    for number, line in enumerate(open(source, encoding="utf-8"), 1):
        for path in pattern.findall(line):
            if "*" in path or "..." in path:
                continue
            target = path.rstrip("/")
            from_root = os.path.normpath(target)
            from_here = os.path.normpath(os.path.join(os.path.dirname(source), target))
            if any(os.path.isfile(p) or os.path.isdir(p) for p in (from_root, from_here)):
                continue
            missing.append(f"{source}:{number}: {path}")

if missing:
    sys.exit("Referenced paths that do not exist:\n" + "\n".join(missing))
PY
)"; then
  FAILURES+=("Doc references:\n$PATH_OUT")
fi

# 4. Subagent definitions have the required frontmatter.
if ! AGENT_OUT="$(python3 - <<'PY' 2>&1
import glob, re, sys

problems = []
for path in sorted(glob.glob(".claude/agents/*.md")):
    text = open(path, encoding="utf-8").read()
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        problems.append(f"{path}: missing YAML frontmatter")
        continue
    block = match.group(1)
    keys = set(re.findall(r"^([A-Za-z][A-Za-z0-9_-]*):", block, re.MULTILINE))
    for required in ("name", "description"):
        if required not in keys:
            problems.append(f"{path}: frontmatter missing '{required}'")
    name = re.search(r"^name:\s*(.+)$", block, re.MULTILINE)
    if name and not re.fullmatch(r"[a-z0-9-]+", name.group(1).strip()):
        problems.append(f"{path}: name must be lowercase-kebab-case")

if problems:
    sys.exit("\n".join(problems))
PY
)"; then
  FAILURES+=("Subagent definitions:\n$AGENT_OUT")
fi

# 5. Code fences declare a recognized language.
#
# Mirrors the CI check. A local hook weaker than CI means a red run for
# something that could have been caught before pushing.
if ! FENCE_OUT="$(python3 - <<'FENCEPY' 2>&1
import os, re, sys

KNOWN = {
    "swift", "bash", "sh", "shell", "json", "jsonc", "yaml", "yml", "xml",
    "python", "ruby", "text", "objc", "objective-c", "c", "cpp",
    "markdown", "md", "diff", "console", "toml", "ini", "html", "css",
    "js", "javascript", "ts", "typescript", "sql", "mermaid",
}

problems = []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in {".git", ".build", "node_modules", "dist"}]
    for name in files:
        if not name.endswith(".md"):
            continue
        path = os.path.join(root, name)
        in_fence = False
        for number, line in enumerate(open(path, encoding="utf-8"), 1):
            match = re.match(r"^\s*(`{3,})\s*([A-Za-z0-9_+-]*)", line)
            if not match:
                continue
            if not in_fence:
                in_fence = True
                lang = match.group(2).lower()
                if lang and lang not in KNOWN:
                    problems.append(f"{path}:{number}: unknown fence language '{lang}'")
            else:
                in_fence = False

if problems:
    sys.exit("Code fence problems:\n" + "\n".join(problems))
FENCEPY
)"; then
  FAILURES+=("Code fences:\n$FENCE_OUT")
fi

# 6. Every subagent's tool grant matches what its instructions actually do.
if ! EVAL_OUT="$(./scripts/eval-agents.sh 2>&1)"; then
  FAILURES+=("Subagent tool boundaries:\n$EVAL_OUT")
fi

# 7. Exactly one definition of Color.init(hex:).
#
# Three files once declared it, two of them with the SAME signature and
# different bodies — copy both into one target and the compiler rejects it with
# `invalid redeclaration of 'init(hex:)'`. A reader has no way to know which of
# three to trust, so the rule is that there is only ever one.
HEX_DEFS="$(grep -rn --include='*.md' --include='*.swift' -E '^\s*init\(hex[ :]' docs/ templates/ patterns/ 2>/dev/null || true)"
HEX_COUNT="$(printf '%s' "$HEX_DEFS" | grep -c . || true)"
if [ "$HEX_COUNT" -ne 2 ]; then
  FAILURES+=("Color hex initialiser:\nExpected exactly 2 declarations (UInt32 and String overloads, both in docs/design/design-tokens.md), found $HEX_COUNT:\n$HEX_DEFS")
else
  if ! printf '%s' "$HEX_DEFS" | grep -q 'docs/design/design-tokens.md'; then
    FAILURES+=("Color hex initialiser:\nThe canonical definition must live in docs/design/design-tokens.md:\n$HEX_DEFS")
  fi
  if printf '%s' "$HEX_DEFS" | grep -v 'docs/design/design-tokens.md' | grep -q .; then
    FAILURES+=("Color hex initialiser:\nRedeclared outside design-tokens.md:\n$(printf '%s' "$HEX_DEFS" | grep -v 'docs/design/design-tokens.md')")
  fi
fi

# 8. Shipped templates obey the skill's own non-negotiables.
#
# A template that contradicts SKILL.md is worse than a missing one: an agent
# reads the rules, copies the template, and produces code the rules forbid.
# Whichever it follows it is wrong somewhere, and nothing in the repo notices.
if ! TEMPLATE_OUT="$(python3 - <<'TPLPY' 2>&1
import pathlib, re, sys

problems = []
for path in sorted(pathlib.Path("templates").rglob("*.swift")):
    lines = path.read_text(encoding="utf-8").splitlines()

    # SKILL.md: "Every @Observable type the UI renders is
    # @MainActor @Observable final class."
    #
    # Attribute ORDER is not significant in Swift, so the whole contiguous
    # attribute block around @Observable is examined rather than only the line
    # above it. Checking one direction reports @Observable/@MainActor as a
    # violation, which is correct code.
    for index, line in enumerate(lines):
        if not line.strip().startswith("@Observable"):
            continue
        start = index
        while start > 0 and lines[start - 1].lstrip().startswith("@"):
            start -= 1
        end = index
        while end + 1 < len(lines) and lines[end + 1].lstrip().startswith("@"):
            end += 1
        block = "\n".join(lines[start:end + 1])
        if "@MainActor" not in block:
            problems.append(f"{path}:{index + 1}: @Observable without @MainActor on the type")

    # SKILL.md: "No default argument constructs a live implementation."
    #
    # Comment lines are skipped: the docs quote this anti-pattern in order to
    # warn about it, and flagging the warning is how a check trains people to
    # ignore it.
    for number, line in enumerate(lines, 1):
        stripped = line.lstrip()
        if stripped.startswith("//") or stripped.startswith("///") or stripped.startswith("*"):
            continue
        if re.search(r"init\([^)]*:\s*any\s+\w+\s*=\s*[A-Z]\w*\(", line):
            problems.append(f"{path}:{number}: dependency defaulted to a live implementation")

if problems:
    sys.exit("Template rule violations:\n" + "\n".join(problems))
TPLPY
)"; then
  FAILURES+=("Shipped templates:\n$TEMPLATE_OUT")
fi

if (( ${#FAILURES[@]} > 0 )); then
  echo "Repository consistency checks failed:" >&2
  echo "" >&2
  for failure in "${FAILURES[@]}"; do
    printf '%b\n\n' "$failure" >&2
  done
  echo "Fix these before finishing. Run ./scripts/hooks/verify-repo.sh to re-check." >&2
  exit 2
fi

exit 0
