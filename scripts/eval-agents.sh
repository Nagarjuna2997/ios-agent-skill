#!/usr/bin/env bash
#
# eval-agents.sh — verify the tool-restriction boundaries of every subagent.
#
#   ./scripts/eval-agents.sh              evaluate .claude/agents/
#   ./scripts/eval-agents.sh --table      print the grant matrix and exit 0
#   ./scripts/eval-agents.sh --self-test  prove the checks are not vacuous
#
# WHAT THIS DOES NOT DO, AND WHY
#
# The obvious design is to send a prompt like "edit this file" to each agent and
# check that it declines. That tests the model's disposition, not the boundary.
# A tool restriction is enforced by the harness from the `tools:` frontmatter,
# before the model is ever consulted — so a prompt-based check passes for an
# agent whose frontmatter wrongly grants Write (the model simply chose not to
# use it) and fails intermittently for one that is correctly restricted. It is
# non-deterministic, costs API calls, and cannot fail for the right reason.
#
# What actually decides the boundary is the declaration. So this script checks
# the declaration against the prompt that relies on it: an agent must be granted
# what its instructions tell it to do, must not be granted what its contract
# promises it cannot do, and must not hold tools nothing in it uses.
#
# Exit codes:
#   0  every boundary holds
#   1  at least one violation

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_DIR="${AGENT_DIR:-$REPO_ROOT/.claude/agents}"
MODE="${1:-check}"

evaluate() {
  python3 - "$1" "$2" <<'PY'
import glob
import os
import re
import sys

agent_dir, mode = sys.argv[1], sys.argv[2]

KNOWN_TOOLS = {
    "Agent", "Bash", "BashOutput", "Edit", "ExitPlanMode", "Glob", "Grep",
    "KillShell", "NotebookEdit", "Read", "Task", "TodoWrite", "WebFetch",
    "WebSearch", "Write",
}
WRITE_TOOLS = {"Edit", "Write", "NotebookEdit"}

# The read-only contract is read from the DESCRIPTION, never the body.
#
# The body is prose about the work and is full of scoped prohibitions that mean
# something else entirely: ios-docs says "Never edit a generated file",
# swift-refactorer says "Do not change access levels". Matching those as a
# read-only contract flags three correctly-configured agents. The description is
# the contract the main agent actually reads when it decides to delegate, so
# that is the only place a read-only promise counts.
READ_ONLY = re.compile(
    r"read[- ]only|never edits?\b|does not (?:edit|change|modify)|no write tools",
    re.I,
)

# Likewise, a shell command counts only inside a fenced block or after a `$`
# prompt, and only when its first token is an executable. ios-plan discusses
# "Swift Testing" the framework and runs nothing; reading that as `swift test`
# would demand Bash for a deliberately read-only planner. Conversely the two
# reviewers open with fenced `grep -rn` sweeps, so matching only build commands
# would call their Bash grant unused.
EXECUTABLES = {
    "swift", "xcodebuild", "xcrun", "git", "npm", "npx", "node", "python3",
    "grep", "rg", "find", "sed", "awk", "ls", "cat", "wc", "diff", "make",
    "swiftlint", "swift-format", "instruments", "plutil", "defaults",
}

# An explicit instruction to modify a file. Deliberately narrow — anything
# looser matches ordinary prose about code changing.
#
# There is deliberately NO converse check for a write tool the instructions
# never exercise. swift-refactorer's job is "extract subviews, introduce
# protocol seams, replace literals"; every one of those edits, and no regex
# generalizes over that phrasing. Guessing produces false positives against
# correctly-configured agents, and an over-granted Write is not the failure
# this script exists to catch — the read-only contradiction below is.
WRITES = re.compile(
    r"\byou (?:edit|fix|apply|rewrite)\b|\bapply the (?:fix|change|patch)\b"
    r"|\bmake the (?:change|edit)\b|\bwrite the (?:file|doc|test)\b",
    re.I,
)


def frontmatter(text):
    lines = text.split("\n")
    if not lines or lines[0] != "---":
        return None, text
    try:
        end = lines.index("---", 1)
    except ValueError:
        return None, text
    fields = {}
    for line in lines[1:end]:
        match = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):[ \t]*(.*)$", line)
        if match:
            fields[match.group(1)] = match.group(2).strip()
    return fields, "\n".join(lines[end + 1:])


def command_lines(body):
    """Lines that really are commands.

    A `$ ` prefix is the shell-prompt convention and is decisive on its own —
    foundation-models mandates a literal `$ <build/test command>` in its output
    template, which is an instruction to run something even though the command
    itself is a placeholder. Inside a fence without that prefix the content may
    equally be Swift or sample output, so there the first token must be a known
    executable."""
    found, fenced = [], False
    for line in body.split("\n"):
        if line.lstrip().startswith("```"):
            fenced = not fenced
            continue

        stripped = line.strip()
        if stripped.startswith("$ "):
            found.append(stripped[2:].strip())
            continue
        if not fenced:
            continue

        first = stripped.split(" ", 1)[0] if stripped else ""
        if first in EXECUTABLES or first.startswith("./"):
            found.append(stripped)
    return found


def tool_list(value):
    return [
        t.strip().strip("\"'")
        for t in value.replace("[", "").replace("]", "").split(",")
        if t.strip()
    ]


paths = sorted(glob.glob(os.path.join(agent_dir, "*.md")))
if not paths:
    print(f"error: no agent definitions found in {agent_dir}", file=sys.stderr)
    sys.exit(1)

failures = []
rows = []

for path in paths:
    name_hint = os.path.basename(path)[:-3]
    fields, body = frontmatter(open(path, encoding="utf-8").read())

    def fail(rule, message):
        failures.append(f"{name_hint}: [{rule}] {message}")

    if fields is None:
        fail("no-frontmatter", "has no YAML frontmatter, so it is not registered as an agent at all")
        continue

    name = fields.get("name", "")
    description = fields.get("description", "")
    granted = tool_list(fields.get("tools", ""))
    granted_set = set(granted)

    if name != name_hint:
        fail(
            "name-filename-mismatch",
            f"frontmatter name is '{name}' but the file is {name_hint}.md — "
            "delegation prompts would reference an identifier that was never registered",
        )

    if not fields.get("model"):
        fail("no-model", "does not declare `model:`, so its cost and capability are whatever it inherits")

    if not granted:
        fail(
            "no-tools",
            "declares no `tools:`, so it inherits every tool the main agent has — "
            "there is no boundary here at all",
        )
        rows.append((name_hint, "INHERITS EVERYTHING", "unbounded"))
        continue

    for tool in granted:
        if tool not in KNOWN_TOOLS:
            fail("unknown-tool", f"grants '{tool}', which is not a real tool — not granted, and not reported")

    if "Read" not in granted_set:
        fail("no-read", "cannot Read. Every one of these agents inspects files")

    claims_read_only = bool(READ_ONLY.search(description))
    write_grants = granted_set & WRITE_TOOLS

    # The central rule. Both directions are violations.
    if claims_read_only and write_grants:
        fail(
            "read-only-holds-write-tool",
            f"is described as read-only but is granted {', '.join(sorted(write_grants))}. "
            "The main agent delegates on that promise; a reviewer that can edit will fix "
            "what it was meant to report",
        )

    if not claims_read_only and not write_grants and WRITES.search(body):
        fail(
            "write-instruction-without-write-tool",
            "is instructed to modify files but is granted no Edit or Write. "
            "It will fail at the moment it tries",
        )

    needs_bash = command_lines(body)
    if needs_bash and "Bash" not in granted_set:
        fail(
            "command-without-bash",
            f"is told to run `{needs_bash[0][:48]}` but is granted no Bash",
        )

    # Over-granting Bash is a real defect, not tidiness: a shell an agent never
    # uses is capability it can still be talked into using. Checkable because a
    # command is a syntactic thing; an *edit* is not, which is why there is no
    # equivalent rule for Edit and Write.
    if "Bash" in granted_set and not needs_bash:
        fail(
            "bash-never-used",
            "is granted Bash but its instructions contain no command to run — "
            "drop it, or say what it should run",
        )

    kind = "read-only" if not write_grants else "read-write"
    if claims_read_only and not write_grants:
        kind = "read-only (enforced + declared)"
    rows.append((name_hint, ", ".join(granted), kind))

width = max(len(r[0]) for r in rows) if rows else 10
print(f"{'AGENT'.ljust(width)}  {'TOOLS'.ljust(34)}  BOUNDARY")
for agent, tools, kind in rows:
    print(f"{agent.ljust(width)}  {tools.ljust(34)}  {kind}")
print()

if mode == "table":
    sys.exit(0)

if failures:
    print(f"{len(failures)} boundary violation(s):\n", file=sys.stderr)
    for failure in failures:
        print(f"  ✗ {failure}", file=sys.stderr)
    print("", file=sys.stderr)
    sys.exit(1)

print(f"OK — {len(rows)} agents, every declared boundary is consistent with its instructions.")
PY
}

# A check that cannot fail is not a check. --self-test builds agents that are
# each broken in exactly one way and asserts this script catches each one — and
# that the four real definitions which merely *look* broken to a naive matcher
# still pass.
self_test() {
  local scratch
  scratch="$(mktemp -d)"
  trap 'rm -rf "$scratch"' RETURN

  local passed=0 failed=0

  expect() { # expect <name> <should-fail:0|1> <rule-or-->
    local label="$1" want_fail="$2" want_rule="$3"
    local out status
    out="$(evaluate "$scratch/agents" check 2>&1)"
    status=$?

    if [[ "$want_fail" == "1" ]]; then
      if (( status == 0 )); then
        echo "  ✗ $label — expected a violation, got a pass"; ((failed++)); return
      fi
      if [[ "$want_rule" != "-" && "$out" != *"[$want_rule]"* ]]; then
        echo "  ✗ $label — expected rule '$want_rule', got:"; echo "$out" | sed 's/^/      /'
        ((failed++)); return
      fi
    elif (( status != 0 )); then
      echo "  ✗ $label — expected a pass, got:"; echo "$out" | sed 's/^/      /'
      ((failed++)); return
    fi
    echo "  ✓ $label"; ((passed++))
  }

  write_agent() { # write_agent <file> <tools> <description> <body>
    mkdir -p "$scratch/agents"
    local stem="${1%.md}"
    { printf -- '---\nname: %s\ndescription: %s\ntools: %s\nmodel: sonnet\n---\n\n' \
        "$stem" "$3" "$2"; printf '%s\n' "$4"; } > "$scratch/agents/$1"
  }

  echo "Self-test — each case is broken in exactly one way:"
  echo ""

  local RUNS='Run the suite:

```
swift test
```
'

  write_agent good-reviewer.md "Read, Grep, Glob, Bash" \
    "Verifies changes. Use after code is written. Read-only — it never edits." "$RUNS"
  expect "a correctly restricted reviewer passes" 0 -

  write_agent good-reviewer.md "Read, Grep, Glob, Bash, Write" \
    "Verifies changes. Use after code is written. Read-only — it never edits." "$RUNS"
  expect "read-only agent granted Write is caught" 1 read-only-holds-write-tool

  write_agent good-reviewer.md "Read, Grep, Glob" \
    "Verifies changes. Use after code is written. Read-only — it never edits." "$RUNS"
  expect "an agent told to run a command without Bash is caught" 1 command-without-bash

  write_agent good-reviewer.md "Read, Grep, Glob, Bash" \
    "Verifies changes. Use after code is written. Read-only — it never edits." \
    "Read the diff and report. Nothing to run."
  expect "Bash granted but never used is caught" 1 bash-never-used

  write_agent good-reviewer.md "Read, Grep, Glob, Bash, Grap" \
    "Verifies changes. Use after code is written. Read-only — it never edits." "$RUNS"
  expect "a misspelled tool name is caught" 1 unknown-tool

  write_agent wrong-name.md "Read, Grep, Glob, Bash" \
    "Verifies changes. Use after code is written. Read-only — it never edits." "$RUNS"
  rm -f "$scratch/agents/good-reviewer.md"
  sed -i.bak 's/^name: wrong-name$/name: right-name/' "$scratch/agents/wrong-name.md"
  rm -f "$scratch/agents/wrong-name.md.bak"
  expect "a name that does not match its filename is caught" 1 name-filename-mismatch

  rm -f "$scratch/agents/wrong-name.md"
  write_agent fixer.md "Read, Grep, Glob" \
    "Fixes failures. Use when a test breaks." \
    "Reproduce, then you fix the cause.

\`\`\`
swift test
\`\`\`
"
  expect "an agent told to edit with no write tool is caught" 1 -

  # Regression guard. These four phrasings appear verbatim in the real agents
  # and each one flags a correctly-configured agent under naive matching.
  rm -f "$scratch/agents/fixer.md"
  write_agent scoped-docs.md "Read, Grep, Glob, Edit, Write, Bash" \
    "Writes documentation. Use when the deliverable is prose about code." \
    "Mirrors are generated. Never edit a generated file — you edit SKILL.md instead.

\`\`\`
swift build
\`\`\`
"
  write_agent scoped-refactor.md "Read, Grep, Glob, Edit, Write, Bash" \
    "Behavior-preserving cleanups. Use for mechanical improvement." \
    "Do not change access levels to make a refactor easier. Then you apply the fix.

\`\`\`
swift test
\`\`\`
"
  write_agent prose-planner.md "Read, Grep, Glob" \
    "Plans multi-file work. Use before a migration. Read-only — it never edits code." \
    "Note the conventions: Swift Testing vs XCTest, and where mocks live."
  expect "scoped prohibitions and framework names are not misread" 0 -

  echo ""
  if (( failed > 0 )); then
    echo "Self-test FAILED — $passed passed, $failed failed." >&2
    return 1
  fi
  echo "Self-test OK — $passed cases, every check fails when it should."
}

case "$MODE" in
  --self-test)
    self_test || exit 1
    ;;
  --table)
    evaluate "$AGENT_DIR" table
    ;;
  *)
    evaluate "$AGENT_DIR" check || exit 1
    ;;
esac
