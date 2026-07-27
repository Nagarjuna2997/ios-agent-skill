#!/usr/bin/env bash
#
# Stop hook — verifies the project still builds before the turn ends.
#
# This is the deterministic backstop for the evidence contract: the model cannot
# report "done" on code that does not compile, because the hook blocks the turn
# and hands back the compiler output.
#
# Wire-up (.claude/settings.json):
#   Stop -> .claude/hooks/build-check.sh
#
# Environment:
#   SKIP_TESTS=1     build only, do not run tests (faster)
#   SCHEME=MyApp     Xcode scheme; auto-detected when unset
#   DESTINATION=...  xcodebuild destination; defaults to a generic iOS simulator
#
# Exit codes:
#   0  builds (and tests pass, unless skipped)
#   2  build or tests failed; stderr is fed back to the model

set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

DESTINATION="${DESTINATION:-platform=iOS Simulator,name=iPhone 16}"

fail() {
  {
    echo "Build verification failed. Do not report this work as complete."
    echo ""
    echo "\$ $1"
    echo ""
    echo "$2"
  } >&2
  exit 2
}

# --- Swift Package Manager --------------------------------------------------

if [[ -f "Package.swift" ]]; then
  if ! OUTPUT="$(swift build 2>&1)"; then
    fail "swift build" "$(echo "$OUTPUT" | tail -40)"
  fi
  echo "$ swift build"
  echo "$(echo "$OUTPUT" | tail -5)"

  if [[ "${SKIP_TESTS:-0}" != "1" ]]; then
    if ! OUTPUT="$(swift test 2>&1)"; then
      fail "swift test" "$(echo "$OUTPUT" | tail -60)"
    fi
    echo "$ swift test"
    echo "$(echo "$OUTPUT" | tail -5)"
  fi
  exit 0
fi

# --- Xcode ------------------------------------------------------------------

if ! command -v xcodebuild >/dev/null 2>&1; then
  # No toolchain (Linux CI, a container). Say so rather than implying a pass.
  echo "UNVERIFIED: xcodebuild not available in this environment; build not checked."
  exit 0
fi

WORKSPACE="$(find . -maxdepth 1 -name '*.xcworkspace' -print -quit)"
PROJECT="$(find . -maxdepth 1 -name '*.xcodeproj' -print -quit)"

if [[ -z "$WORKSPACE" && -z "$PROJECT" ]]; then
  echo "No Package.swift, .xcworkspace, or .xcodeproj found; nothing to build."
  exit 0
fi

if [[ -n "$WORKSPACE" ]]; then
  CONTAINER=(-workspace "$WORKSPACE")
else
  CONTAINER=(-project "$PROJECT")
fi

# Never guess a scheme — ask the project for one.
if [[ -z "${SCHEME:-}" ]]; then
  SCHEME="$(xcodebuild -list "${CONTAINER[@]}" 2>/dev/null \
    | awk '/Schemes:/{flag=1; next} flag && NF {print $1; exit}')"
fi

if [[ -z "$SCHEME" ]]; then
  echo "UNVERIFIED: could not determine a scheme; build not checked."
  echo "Set SCHEME=<name> to enable this hook."
  exit 0
fi

ACTION="build"
[[ "${SKIP_TESTS:-0}" != "1" ]] && ACTION="test"

CMD=(xcodebuild "$ACTION" "${CONTAINER[@]}" -scheme "$SCHEME" -destination "$DESTINATION")

if ! OUTPUT="$("${CMD[@]}" 2>&1)"; then
  fail "${CMD[*]}" "$(echo "$OUTPUT" | grep -E 'error:|failed|FAILED' | head -40)"
fi

echo "$ ${CMD[*]}"
echo "$(echo "$OUTPUT" | grep -E '(BUILD|TEST) (SUCCEEDED|FAILED)' | tail -3)"
exit 0
