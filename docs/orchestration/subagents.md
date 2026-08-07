# Subagents

**Load this when:** a task is large enough to split, a search would flood your
context, you need work verified by something other than the agent that wrote it,
or you are defining a new specialist in `.claude/agents/`.

A subagent is a separate Claude instance with its **own context window**, its
**own system prompt**, and optionally a **restricted tool set**. The main agent
delegates a task to it, the subagent works in isolation, and it returns a single
final report.

---

## 1. Why delegate at all

Three reasons, in order of how often they apply:

1. **Context preservation.** A search that reads forty files costs forty files
   of your context. Delegated to a subagent, it costs one paragraph of findings.
   This is the most common reason and the most undervalued.
2. **Independent verification.** An agent that wrote code is a bad judge of
   whether that code works — it is predisposed to see its own intent rather than
   what it typed. A fresh subagent has no such stake. See `verification.md`.
3. **Parallelism.** Independent read-only investigations run concurrently
   instead of serially.

Delegation is not free. Each subagent starts **cold** — it does not inherit your
conversation, the file you just read, or the decision the user made three turns
ago. Everything it needs must be in the prompt you give it. For a task you could
finish in two tool calls, spawning a subagent is slower and worse.

**Do the work inline when:** it is a couple of files, you already have the
context loaded, or the task is a single edit. "Thorough", "multiple angles", and
"several parts" are not by themselves reasons to delegate.

---

## 2. Defining a subagent

Subagents are markdown files with YAML frontmatter. Project-level definitions
live in `.claude/agents/`; user-level ones in `~/.claude/agents/`. Project
definitions take precedence when names collide.

```markdown
---
name: swift-reviewer
description: Independent verifier for Swift changes. Use after code is written to check it against the repo rules and prove it builds. Runs builds and tests and returns real output.
tools: Read, Grep, Glob, Bash
model: inherit
---

You are an independent reviewer. …system prompt…
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | Lowercase kebab-case, unique. This is how you invoke it. |
| `description` | yes | **This is the routing signal.** The main agent selects a subagent by matching the task against this text. |
| `tools` | no | Comma-separated allowlist. **Omit to inherit all tools.** |
| `model` | no | `sonnet`, `opus`, `haiku`, or `inherit`. Defaults to the configured subagent model. |

### The description is the interface

The main agent picks a subagent by reading descriptions, not by reading system
prompts. A vague description means the subagent never gets invoked, or gets
invoked for the wrong things.

```yaml
# WEAK — nothing here says when to use it.
description: Reviews code.

# STRONG — names the trigger, the input, and the output.
description: Independent verifier for Swift/iOS changes. Use after another agent
  has written code, to check it against repository rules and prove it builds and
  tests pass. Runs builds and tests and returns their real output.
```

Write descriptions in the form *"<what it does>. Use when <trigger>. Returns
<output>."*

### Restrict tools deliberately

Tool restriction is a correctness feature, not just a safety one. A subagent
with no write tools **cannot** accidentally edit while investigating, which is
what makes it safe to run several in parallel.

| Subagent kind | Tools | Why |
|---------------|-------|-----|
| Search / explore | `Read, Grep, Glob` | Genuinely read-only; parallel-safe |
| Planner | `Read, Grep, Glob` | Produces a plan, never code |
| Reviewer | `Read, Grep, Glob, Bash` | Needs to run builds; must not edit |
| Debugger | `Read, Grep, Glob, Bash, Edit` | Must reproduce and fix |
| Refactorer | `Read, Grep, Glob, Edit, Write, Bash` | Edits, and verifies with tests |
| Docs | `Read, Grep, Glob, Edit, Write, Bash` | Writes prose, runs repo checks |

Giving every subagent every tool defeats the point. A reviewer with `Edit` will
eventually fix what it should have reported.

#### Verifying the restriction actually holds

Run `./scripts/eval-agents.sh`. It prints the grant matrix and fails when a
declaration contradicts the instructions that rely on it:

```
$ ./scripts/eval-agents.sh
AGENT                   TOOLS                                BOUNDARY
ios-explore             Read, Grep, Glob                     read-only (enforced + declared)
swift-reviewer          Read, Grep, Glob, Bash               read-only (enforced + declared)
swift-refactorer        Read, Grep, Glob, Edit, Write, Bash  read-write
…
OK — 10 agents, every declared boundary is consistent with its instructions.
```

The tempting design is to prompt each agent to edit something and check that it
refuses. **That does not test the boundary.** Tool restriction is enforced by
the harness from the `tools:` line before the model is consulted, so a prompt
check passes for an agent whose frontmatter wrongly grants `Write` — the model
simply chose not to use it — and it is non-deterministic besides. What decides
the boundary is the declaration, so that is what gets checked, against the
prompt depending on it:

| Rule | Catches |
|------|---------|
| `read-only-holds-write-tool` | A description promising read-only while `tools` grants `Edit`/`Write` |
| `write-instruction-without-write-tool` | Instructions to modify files with no write tool granted |
| `command-without-bash` | A command in the prompt the agent cannot run |
| `bash-never-used` | `Bash` granted with nothing in the prompt to run |
| `unknown-tool` | A misspelled tool name — not granted, and not reported |
| `name-filename-mismatch` | Delegation prompts pointing at an unregistered identifier |
| `no-tools` | No `tools:` at all, which inherits everything |

Read-only status is taken from the **description**, never the body. Bodies are
full of scoped prohibitions that mean something else — `ios-docs` says "never
edit a *generated* file", `swift-refactorer` says "do not change *access
levels*" — and reading those as a read-only contract flags three correctly
configured agents. The description is what the main agent reads when it decides
to delegate, so it is the only place the promise counts.

`./scripts/eval-agents.sh --self-test` builds agents each broken in exactly one
way and asserts every rule fires, including a regression case for the four real
phrasings above. A check that cannot fail is not a check.

### Model selection

- `inherit` — matches the main agent. Use for reasoning-heavy work: planning,
  review, debugging.
- `sonnet` — cheaper and faster. Use for mechanical work: search, refactors,
  documentation.
- `haiku` — for high-volume trivial classification.

---

## 3. This repository's subagents

Defined in `.claude/agents/`:

| Subagent | Tools | Model | Use for |
|----------|-------|-------|---------|
| `ios-explore` | read-only | sonnet | "Where is X?" across a Swift codebase |
| `ios-plan` | read-only | inherit | Multi-file features, migrations, architecture decisions |
| `swift-reviewer` | read + Bash | inherit | Verifying work someone else did |
| `swift-debugger` | read + Bash + Edit | inherit | A failure whose cause is not obvious |
| `swift-refactorer` | read + write + Bash | sonnet | Behavior-preserving cleanups |
| `ios-docs` | read + write + Bash | sonnet | Docs, DocC, README, CHANGELOG |

They are prefixed `ios-` / `swift-` deliberately: Claude Code ships built-in
subagents including a **general-purpose** one, and in some configurations
`Explore` and `Plan`. Prefixing avoids shadowing a built-in whose behavior you
did not intend to replace, and makes it obvious in a transcript which one ran.

See `router.md` for when the main agent should reach for each.

---

## 4. Writing the delegation prompt

A subagent starts cold. This is the failure mode that makes delegation look
useless: an under-specified prompt produces a confident, irrelevant report.

Every delegation prompt carries:

1. **The goal**, as an outcome rather than an activity.
2. **The context it cannot see** — decisions already made, constraints, the
   relevant file paths you already found.
3. **The boundary** — what is explicitly out of scope.
4. **The return format** — what you need back, and in what shape.

```
# WEAK
"Look at the networking code."

# STRONG
"Find every place that constructs a URLRequest in Sources/, and report which
ones set an Authorization header and which do not.

Context: we are adding a shared auth interceptor and need to know what would
be duplicated. The APIClient at Sources/Data/APIClient.swift:44 is already
known — I need the ones outside it.

Out of scope: test targets, and anything under Vendor/.

Return: a table of file:line, the endpoint, and whether it sets auth."
```

The `Out of scope` line matters more than it looks. Without it, subagents
reliably expand the task.

---

## 5. Parallelism

Read-only subagents parallelize cleanly. Launch several in one turn when the
investigations are genuinely independent:

- "Where is the auth token stored?"
- "Which screens call the orders endpoint?"
- "What is our current deployment target and Swift language mode?"

**Do not parallelize writes.** Two subagents editing the same file will clobber
each other, and neither will know. When several agents must change code, either
sequence them or give each an isolated git worktree — see
`dynamic-workflows.md`.

---

## 6. Subagents are not agent teams

This distinction is load-bearing and frequently confused.

|  | Subagents | Agent teams |
|--|-----------|-------------|
| Communication | Report **only** to the main agent | Workers message each other directly |
| Topology | Hub and spoke | Peer to peer |
| Coordination | The main agent is the sole orchestrator | Emergent between workers |
| Availability | Generally available | **Experimental, disabled by default** |

Subagents **cannot** talk to each other. If subagent A discovers something
subagent B needs, that information travels A → main agent → B, and only if the
main agent passes it along. Design your delegation around that: do not split a
task in a way that requires two workers to negotiate.

If you actually need peer-to-peer worker communication, that is the agent-teams
feature, it is experimental, and it is off unless explicitly enabled. Do not
assume it in a workflow you expect to work today.

---

## 7. Anti-patterns

```
# 1. Delegating what you could do in two tool calls.
"Spawn a subagent to read Package.swift."
-> Just read it. Cold start costs more than the read.

# 2. Spawning a fresh agent for a task an existing one has context for.
-> Continue the existing subagent instead of starting cold again.

# 3. Assuming the subagent can see your conversation.
"Fix the bug we discussed."
-> It has no idea what you discussed. Restate it.

# 4. Parallel writers on the same files.
-> Sequence them, or isolate each in a worktree.

# 5. A reviewer that also edits.
-> Then it is grading its own work. Restrict its tools.

# 6. Trusting a report with no evidence.
"The subagent said tests pass."
-> Did it paste the output? If not, it asserted, it did not verify.

# 7. Predicting a background subagent's result.
-> A pending agent has no result. Say it is still running.

# 8. One mega-subagent with every tool and a vague description.
-> It never gets routed correctly and cannot be reasoned about.
```

---

## Checklist for a new subagent definition

- [ ] `name` is lowercase kebab-case and does not shadow a built-in.
- [ ] `description` states what it does, when to use it, and what it returns.
- [ ] `tools` is the minimum set the job needs — read-only if it investigates.
- [ ] The system prompt states the **return format** explicitly.
- [ ] The system prompt includes the evidence contract (`verification.md`).
- [ ] The system prompt states what is out of scope.
- [ ] It does not assume access to the main agent's conversation.
- [ ] `./scripts/eval-agents.sh` passes — the grant matches what the prompt does.
