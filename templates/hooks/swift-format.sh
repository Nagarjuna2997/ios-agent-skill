#!/usr/bin/env bash
#
# PostToolUse hook — formats a Swift file immediately after it is edited.
#
# Formatting is not a judgment call, so it should never cost a review comment or
# a model turn. This runs SwiftFormat and SwiftLint's autocorrect on the single
# file that changed.
#
# Wire-up (.claude/settings.json):
#   PostToolUse -> matcher "Edit|Write|MultiEdit" -> .claude/hooks/swift-format.sh
#
# Exit codes:
#   0  formatted, or nothing to do (a missing formatter is not an error)

set -uo pipefail

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

# Only Swift files.
[[ -z "$FILE_PATH" || "$FILE_PATH" != *.swift ]] && exit 0
[[ ! -f "$FILE_PATH" ]] && exit 0

CHANGED=0

if command -v swiftformat >/dev/null 2>&1; then
  # --quiet keeps the transcript clean; real errors still reach stderr.
  if swiftformat "$FILE_PATH" --quiet 2>/dev/null; then
    CHANGED=1
  fi
fi

if command -v swiftlint >/dev/null 2>&1; then
  if swiftlint lint --fix --quiet --path "$FILE_PATH" >/dev/null 2>&1; then
    CHANGED=1
  fi
fi

if [[ $CHANGED -eq 1 ]]; then
  echo "Formatted $(basename "$FILE_PATH")"
fi

# A missing formatter is not a failure — the project may not use one.
exit 0
