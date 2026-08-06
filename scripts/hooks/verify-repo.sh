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

# 5. Every subagent's tool grant matches what its instructions actually do.
if ! EVAL_OUT="$(./scripts/eval-agents.sh 2>&1)"; then
  FAILURES+=("Subagent tool boundaries:\n$EVAL_OUT")
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
