#!/usr/bin/env bash
#
# PreToolUse hook — blocks direct edits to generated mirror files.
#
# The 24 agent rule files (CLAUDE.md, AGENTS.md, .cursorrules, …) are generated
# from SKILL.md by scripts/sync-mirrors.sh. Editing one by hand is silently
# undone on the next sync, so this hook denies the write and tells the model
# where to edit instead.
#
# Wire-up (.claude/settings.json):
#   PreToolUse -> matcher "Edit|Write|MultiEdit" -> this script
#
# Exit codes:
#   0  allow
#   2  block; stderr is fed back to the model as the reason

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Hook input arrives as JSON on stdin.
INPUT="$(cat)"

FILE_PATH="$(printf '%s' "$INPUT" | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    print("")
    sys.exit(0)
print(data.get("tool_input", {}).get("file_path", "") or "")
')"

[[ -z "$FILE_PATH" ]] && exit 0

# Normalize to a repo-relative path.
REL="${FILE_PATH#"$REPO_ROOT"/}"

GENERATED=(
  "AGENTS.md" "CLAUDE.md" "CONVENTIONS.md" "GEMINI.md" "replit.md"
  ".clinerules" ".continuerules" ".cursorrules" ".kilocoderules"
  ".roorules" ".rules" ".windsurfrules"
  ".aiassistant/rules/ios-skill.md" ".amazonq/rules/ios-skill.md"
  ".augment/rules/ios-skill.md" ".continue/rules/ios-skill.md"
  ".cursor/rules/ios-skill.md" ".github/copilot-instructions.md"
  ".junie/guidelines.md" ".kilocode/rules/ios-skill.md"
  ".roo/rules/ios-skill.md" ".tabnine/guidelines/ios-skill.md"
  ".trae/rules/ios-skill.md" ".windsurf/rules/ios-skill.md"
)

for generated in "${GENERATED[@]}"; do
  if [[ "$REL" == "$generated" ]]; then
    cat >&2 <<EOF
BLOCKED: $REL is a generated file.

All 24 agent rule files are produced from SKILL.md by scripts/sync-mirrors.sh.
An edit here is discarded on the next sync.

Edit SKILL.md instead, then run:
  ./scripts/sync-mirrors.sh && ./scripts/sync-mirrors.sh --check
EOF
    exit 2
  fi
done

exit 0
