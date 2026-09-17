#!/usr/bin/env bash
#
# PostToolUse hook — regenerates the agent mirrors whenever SKILL.md changes.
#
# Keeping this deterministic means the model never has to remember to run the
# sync, and a forgotten sync can never reach a commit.
#
# Wire-up (.claude/settings.json):
#   PostToolUse -> matcher "Edit|Write|MultiEdit" -> this script
#
# Exit codes:
#   0  nothing to do, or sync succeeded
#   2  sync failed; stderr is fed back to the model

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

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

REL="${FILE_PATH#"$REPO_ROOT"/}"
[[ "$REL" != "SKILL.md" ]] && exit 0

if ! OUTPUT="$(./scripts/sync-mirrors.sh 2>&1)"; then
  echo "Mirror sync failed after editing SKILL.md:" >&2
  echo "$OUTPUT" >&2
  exit 2
fi

# Surfaced in the transcript so the change is visible rather than silent.
echo "$OUTPUT"
exit 0
