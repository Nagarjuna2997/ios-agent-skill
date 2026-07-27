#!/usr/bin/env bash
#
# setup-repo-metadata.sh — set GitHub topics and issue labels, idempotently.
#
# Safe to re-run: topics are a set-union operation, and labels use
# `gh label create --force`, which creates or updates.
#
#   ./scripts/setup-repo-metadata.sh            apply
#   ./scripts/setup-repo-metadata.sh --dry-run  print what would run
#
# Requires the `gh` CLI, authenticated with repo admin rights.

set -euo pipefail

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

run() {
  if [[ $DRY_RUN -eq 1 ]]; then
    printf '  %s\n' "$*"
  else
    "$@"
  fi
}

# A dry run only prints commands, so it must work without gh installed —
# otherwise you cannot preview before deciding to install anything.
if [[ $DRY_RUN -eq 0 ]]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "error: the GitHub CLI (gh) is not installed." >&2
    echo "       https://cli.github.com" >&2
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "error: gh is not authenticated. Run: gh auth login" >&2
    exit 1
  fi
fi

# --- Topics -----------------------------------------------------------------
# --add-topic is a union: re-running adds nothing and removes nothing.

echo "Setting repository topics…"
run gh repo edit \
  --add-topic mcp \
  --add-topic model-context-protocol \
  --add-topic claude-code \
  --add-topic ai-agents \
  --add-topic agent-skills \
  --add-topic ios \
  --add-topic swift \
  --add-topic swiftui \
  --add-topic apple-intelligence \
  --add-topic xcode \
  --add-topic developer-tools

# --- Labels -----------------------------------------------------------------
# `--force` creates the label, or updates its color/description if it exists.
#
# Deliberately NOT using `gh label list | grep "^name"`: that matches by prefix,
# so an existing `swiftui` label would suppress creating `swift`, and `ios-bug`
# would suppress `ios`. --force has no such failure mode.

echo "Creating or updating labels…"

label() {
  local name="$1" color="$2" description="$3"
  run gh label create "$name" --color "$color" --description "$description" --force
}

label "good first issue" 7057ff "Well-scoped, low-context — a good place to start"
label "help wanted"      008672 "Maintainer would welcome outside help here"
label "documentation"    0075ca "Docs, examples, and the skill's own rule files"
label "bug"              d73a4a "Something is broken"
label "enhancement"      a2eeef "New capability or improvement"
label "mcp"              8b5cf6 "The ios-agent-mcp server and its tools"
label "swift"            f05138 "Swift language, concurrency, or standard library"
label "ios"              000000 "iOS, iPadOS, and Apple platform specifics"
label "swiftui"          2396f3 "SwiftUI views, state, and layout"
label "false-positive"   fbca04 "An analyzer rule fired when it should not have"
label "install"          d4c5f9 "Installation and client setup problems"

echo ""
if [[ $DRY_RUN -eq 1 ]]; then
  echo "Dry run — nothing was changed."
else
  echo "Done. Verify with:"
  echo "  gh repo view --json repositoryTopics -q '.repositoryTopics[].name'"
  echo "  gh label list"
fi
