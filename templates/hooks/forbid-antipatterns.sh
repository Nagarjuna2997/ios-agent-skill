#!/usr/bin/env bash
#
# PostToolUse hook — blocks the anti-patterns from SKILL.md at the moment they
# are written, and tells the model what to use instead.
#
# These are rules, not judgment calls, so they belong in a hook rather than in a
# review comment three steps later. Exit 2 feeds the reason straight back to the
# model, which fixes it without the user having to notice.
#
# Wire-up (.claude/settings.json):
#   PostToolUse -> matcher "Edit|Write|MultiEdit" -> .claude/hooks/forbid-antipatterns.sh
#
# Exit codes:
#   0  clean
#   2  violation found; stderr explains what to do instead

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

[[ -z "$FILE_PATH" || "$FILE_PATH" != *.swift ]] && exit 0
[[ ! -f "$FILE_PATH" ]] && exit 0

# Test files and preview/mock files legitimately do things app code must not.
BASENAME="$(basename "$FILE_PATH")"
case "$BASENAME" in
  *Tests.swift|*Test.swift|*Mock*.swift|*Stub*.swift|*Fake*.swift|*Preview*.swift)
    IS_SUPPORT=1 ;;
  *)
    IS_SUPPORT=0 ;;
esac

VIOLATIONS=()

report() {
  # $1 = regex, $2 = message. Line numbers make the feedback actionable.
  local matches
  matches="$(grep -nE "$1" "$FILE_PATH" 2>/dev/null || true)"
  if [[ -n "$matches" ]]; then
    VIOLATIONS+=("$2"$'\n'"$(echo "$matches" | sed 's/^/    /')")
  fi
}

# --- Concurrency ------------------------------------------------------------

report 'DispatchQueue\.main\.async' \
  "DispatchQueue.main.async in Swift Concurrency code.
  Use @MainActor isolation. Inside an already-isolated type, just assign directly."

report 'Task\.detached' \
  "Task.detached drops actor isolation, priority, and task-locals.
  Use Task { } (which inherits isolation), a nonisolated async function, or an actor."

report 'await MainActor\.run' \
  "await MainActor.run inside a @MainActor type is redundant.
  If the enclosing type is isolated, assign directly. If it is not, isolate it."

# @Observable without @MainActor, checked over the whole file.
if grep -q '@Observable' "$FILE_PATH" 2>/dev/null; then
  if ! grep -q '@MainActor' "$FILE_PATH" 2>/dev/null; then
    VIOLATIONS+=("@Observable type with no @MainActor in the file.
  @Observable grants no isolation. A model the UI renders must be
  '@MainActor @Observable final class'. If this model is deliberately
  nonisolated and never rendered, add a comment saying so.")
  fi
fi

# --- Error handling ---------------------------------------------------------

report 'try!' \
  "try! crashes on any error.
  Use try with do/catch, or try? where a nil result is genuinely correct."

report 'catch\s*\{\s*\}' \
  "Empty catch block silently discards a failure.
  Surface it, or comment why the no-op is deliberate (e.g. CancellationError)."

# --- SwiftUI ----------------------------------------------------------------

report 'NavigationView\s*\{' \
  "NavigationView is deprecated.
  Use NavigationStack, with NavigationPath for programmatic navigation."

report 'AnyView\(' \
  "AnyView erases the view type and defeats SwiftUI's diffing.
  Restructure with @ViewBuilder or 'some View'."

report '\.font\(\.system\(size:\s*[0-9]+\)\)' \
  "Fixed font size breaks Dynamic Type.
  Use a semantic style (.body, .headline) or .custom(_:size:relativeTo:)."

report '\.cornerRadius\(' \
  ".cornerRadius is deprecated.
  Use .clipShape(.rect(cornerRadius:)) or the 'in:' parameter of .background."

# --- Naming -----------------------------------------------------------------

report '^\s*(struct|class|enum|actor)\s+Task\b' \
  "A type named 'Task' shadows _Concurrency.Task, so 'Task { }' in the same
  file will not compile. Rename it (TodoItem, WorkItem, …)."

# --- App-code-only rules ----------------------------------------------------

if [[ $IS_SUPPORT -eq 0 ]]; then
  report '=\s*(Live|Remote|Default|URLSession)[A-Za-z]*\(\s*\)\s*\)' \
    "A dependency defaulting to a live implementation makes forgotten
  injections hit the network silently. Make the init parameter required."

  report 'print\(' \
    "print() is not structured logging and is not stripped in release.
  Use Logger from OSLog (see docs/frameworks/oslog.md)."
fi

# --- Report -----------------------------------------------------------------

if (( ${#VIOLATIONS[@]} > 0 )); then
  {
    echo "Anti-patterns found in $BASENAME — fix these before continuing:"
    echo ""
    for violation in "${VIOLATIONS[@]}"; do
      echo "  - $violation"
      echo ""
    done
    echo "These rules come from SKILL.md. If one is genuinely wrong for this file,"
    echo "say so explicitly rather than working around the check."
  } >&2
  exit 2
fi

exit 0
