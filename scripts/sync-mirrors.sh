#!/usr/bin/env bash
#
# sync-mirrors.sh — regenerate supported agent rule files from SKILL.md.
#
# SKILL.md is the single source of truth. The supported agent entry points
# (CLAUDE.md, AGENTS.md, GEMINI.md) are byte-identical copies of SKILL.md with
# the YAML frontmatter stripped, because those formats are plain instruction
# files with no frontmatter support.
#
#   ./scripts/sync-mirrors.sh          regenerate all mirrors
#   ./scripts/sync-mirrors.sh --check  verify they are current (exit 1 if not)
#
# Run this after ANY edit to SKILL.md. CI enforces it.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SOURCE="SKILL.md"

# Supported mirror targets. The public product direction is Claude,
# ChatGPT/Codex, and Gemini.
MIRRORS=(
  "AGENTS.md"                          # ChatGPT/Codex-style agents
  "CLAUDE.md"                          # Claude Code
  "GEMINI.md"                          # Gemini CLI
)

if [[ ! -f "$SOURCE" ]]; then
  echo "error: $SOURCE not found (run from the repo root)" >&2
  exit 1
fi

# Strip the leading YAML frontmatter block and any blank lines that follow it.
strip_frontmatter() {
  awk '
    NR == 1 && $0 == "---" { in_fm = 1; next }
    in_fm && $0 == "---"   { in_fm = 0; done_fm = 1; next }
    in_fm                  { next }
    !started && $0 == ""   { next }        # drop blank lines before the body
    { started = 1; print }
  ' "$SOURCE"
}

BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT
strip_frontmatter > "$BODY"

if [[ ! -s "$BODY" ]]; then
  echo "error: $SOURCE produced an empty body — refusing to overwrite mirrors" >&2
  exit 1
fi

CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1

stale=0
for target in "${MIRRORS[@]}"; do
  if [[ $CHECK_ONLY -eq 1 ]]; then
    if [[ ! -f "$target" ]]; then
      echo "MISSING  $target"
      stale=1
    elif ! cmp -s "$BODY" "$target"; then
      echo "STALE    $target"
      stale=1
    fi
  else
    mkdir -p "$(dirname "$target")"
    cp "$BODY" "$target"
  fi
done

if [[ $CHECK_ONLY -eq 1 ]]; then
  if [[ $stale -eq 1 ]]; then
    echo ""
    echo "Mirrors are out of sync with $SOURCE."
    echo "Fix: ./scripts/sync-mirrors.sh && git add -A"
    exit 1
  fi
  echo "OK — all ${#MIRRORS[@]} mirrors match $SOURCE"
else
  echo "Synced ${#MIRRORS[@]} mirrors from $SOURCE"
fi
