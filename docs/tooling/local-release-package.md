# Local App Store release preparation — Phase 1

Included in ios-agent-mcp 2.7.1. This phase
collects deterministic, target-aware evidence and writes a private local draft.
It does not connect to Apple, use AI, generate marketing copy or images, build,
archive, sign, upload, submit, or release an app.

## Use the existing combined executable

```sh
npm ci --prefix mcp-server
npm run build --prefix mcp-server
node mcp-server/dist/unified.js apple analyze --project /path/to/app \
  --xcodeproj App.xcodeproj --target App --configuration Release --json
node mcp-server/dist/unified.js apple prepare --project /path/to/app \
  --xcodeproj App.xcodeproj --target App --configuration Release \
  --prompt 'For students. No account required.'
```

`--project` is the root directory, not the .xcodeproj file. `--xcodeproj` and
`--workspace` select paths within that root. Release is the default configuration;
there is no fallback to Debug. One unambiguous application target may be selected
automatically. Multiple projects/targets require explicit selection. Simple flat
workspace group references are supported; nested workspace groups are deferred.

`analyze` writes only its terminal/JSON response. `prepare` writes a package.
Both commands return status 2 when target/configuration selection is blocked,
1 on an invocation or file/integrity failure, and 0 for completed local analysis.
Status 0 does not mean submission-ready: inspect questions, requirements and
coverage. No MCP tool was added; the exported services and `--json` form the
future MCP boundary without increasing the advertised tool count.

## App Model contract

`mcp-server/src/release/model.ts` exports TypeScript interfaces and a runtime Zod
`AppModelSchema`. Schema version 1 includes:

- `selection`: project, optional workspace, target and configuration.
- `claims`: identity/configuration, frameworks, permissions, entitlements, package
  products, privacy/resource declarations and unresolved facts.
- `features`: conservative API-use candidates, evidence, related screen candidates
  and permissions. Service relationships stay empty when not established.
- `screens`: lexical Swift type or storyboard candidates. Reachability is UNKNOWN
  and runtime is NOT_CHECKED in this phase; reusable View types may be candidates.
- `evidence`: stable IDs, relative paths, file SHA-256 and evidence group. No excerpts.
- `coverage`: machine-readable limitations.
- `sectionHashes`: semantic input/observation hashes for project, source, resources,
  dependencies and brief evidence.

Every observed claim requires evidence; all evidence IDs must resolve. States:

| State | Meaning |
|---|---|
| OBSERVED | A configuration/declaration or source syntax exists in inspected inputs |
| INFERRED | API/screen candidate, not verified user-facing behavior |
| DEVELOPER_CONFIRMED | Recognized explicit product intent from the brief |
| CONFLICTING | Brief assertion conflicts with detected evidence and needs clarification |
| UNKNOWN | Insufficient evidence; absence is not a negative claim |
| NOT_APPLICABLE | Reserved for an established non-applicable fact; never used as a fallback |

A camera permission does not prove off-device collection. StoreKit imports do not
prove that subscriptions are sold. Authentication indicators do not prove login
is required. Development team/signing settings do not establish signing validity.

## Selection and evidence

The implementation reuses the launch analyzer's OpenStep/plist dependencies and
shared Xcode group/path resolver. It merges matching project/target configurations
and reads explicit source/resource build phases. Generated Info.plist keys and
simple substitutions are supported. XML and binary plists are supported.

Only member Swift files contribute feature/screen candidates. Extension target
references remain separate; their code is not attributed to the app. Selected
resource trees contribute asset bytes, privacy manifests, localizations, storyboard
and local StoreKit configuration presence. App icon configuration and successfully
read icon-set metadata are separate claims. Existing launch analysis is scoped to
the selected project, target and configuration, with findings retained as review
requirements rather than a runtime certification.

Package product membership is observed; lockfile presence alone does not prove
linkage. Selected project lockfiles and package-manifest presence are hashed, but
this phase does not interpret arbitrary dependency code or package scripts.
README/BRIEF presence is hashed as untrusted context, not treated as feature proof.
URL syntax is recorded without destinations, credentials, paths or query strings.
Required-reason evidence currently covers manifest declarations and a conservative
UserDefaults source indicator, not a comprehensive required-reason API scan.

## Brief and questions

The optional brief is not sent to a model and is not saved verbatim. A small fixed
controlled grammar accepts complete statements such as “For students” and the phrase “No account required” (and
its supported login variants). Every statement must match the grammar; negated, quoted or mixed free-form briefs are not promoted to confirmed facts. Other free-form positioning is intentionally not
interpreted. This is not natural-language app understanding. A no-account assertion
with authentication API evidence creates a conflict. Without conflicting evidence,
the explicit assertion avoids a repeat question while static authentication remains
UNKNOWN. Secrets and arbitrary prose do not become artifact text.

Questions cover unresolved identity, review access, sensitive data handling,
purchases and signing. Sensitive permission/dependency/manifest evidence yields
one grouped data-handling question rather than many generic questions. Questions
have priority, domain, claim IDs and evidence IDs. Some missing-answer questions
have no evidence because the fact itself is unknown. Phase 1 does not collect or
persist arbitrary answers, prepare a legal questionnaire, or select legal reasons.

## Package, hashes and resume

Output is `.ios-agent/releases/local-<digest>/`. It contains:

```text
manifest.json           versioned provenance and readiness limits
app-model.json          schema-validated facts and candidates
requirements.json       local checks and unresolved review requirements
questions.json          prioritized missing information
change-plan.json        explicitly empty remote/project operations
integrity.json          SHA-256 for each generated JSON artifact
metadata/ privacy/ review/ icons/ screenshots/raw/ screenshots/composed/
validation/ evidence/ approvals/ operations/
```

Empty directories reserve future boundaries; they are not generated release assets.
The manifest includes selection, identity claims, revision when Git is available,
source fingerprint, package/model schema versions, implementation hash, Node/tool
versions, timestamp, model and evidence hashes, and blockers. Xcode/Swift and
build/test/signing state are NOT_CHECKED because this phase executes none of them.
Its semantic hash excludes the timestamp; integrity includes the timestamp.
The source fingerprint includes selected evidence and coverage, not unrelated
Swift files elsewhere in the repository.

Equivalent inputs produce identical semantic hashes; a second prepare validates
and reuses the immutable package. Changes create a new package, preserving prior
packages. Section hashes include associated facts/candidates as well as input
bytes, so unchanged unrelated sections retain identity. `reusedSections` records
matching verified section identities, not a claim that parsing was skipped.
Inputs are reread to verify validity; there is no persistent parse cache.

All existing packages used for reuse are integrity-checked. Corruption stops
preparation rather than silently overwriting evidence. Atomic directory rename
publishes a complete package after a second fingerprint check. A preparation lock
prevents competing writes. Following a crash, inspect the lock/staging directory
and remove the stale lock before rerunning; completed packages remain intact.
Hashes detect accidental corruption, not malicious edits by someone who can rewrite
both artifacts and their hashes. Live filesystem mutation races are not a sandbox.

## Privacy and safety

No Apple credentials, AI providers or networking are needed. The only child process
in preparation is a bounded local Git revision read. No project scripts, package
resolution, xcodebuild, shell commands from project content or simulator actions run.

Artifacts contain summaries/hashes, not source, raw manifests, signing keys, URLs,
permission prose or raw briefs. Sensitive file formats and conventional credential
paths are excluded. Common token/private-key patterns and unsafe values are
filtered. Do not intentionally place arbitrary secrets in app names/identifiers:
no heuristic filter can recognize every possible secret disguised as ordinary text.

The package is private working data, not a public export. Paths and app identity can
still identify an unpublished product. New directories/files use restrictive modes
where supported. The generated releases/.gitignore ignores all contents; no parent
project .gitignore is rewritten. Already tracked files cannot be untracked by an
ignore rule. Symlink output paths/files are refused; inventory symlinks are excluded.

## Limits

- xcconfig inheritance, conditional build settings, synchronized Xcode groups,
  inclusion/exclusion rules and preprocessed plists block static resolution.
- Swift conditional-compilation files are deferred. Lexical masking handles strings
  and comments, but syntax/type resolution, macros and semantic reachability are
  not implemented. Identically named APIs/types may still be unrelated symbols.
- Generated/copied resources yield partial membership coverage. Missing/unreadable
  inputs and bounded scans remain visible. No claim of whole-app completeness.
- Objective-C, arbitrary project generators, nested workspaces, native Icon Composer
  validation, compiled SDK behavior and extension internals are unsupported.
- Backend behavior, actual privacy collection, retention, tracking, review credentials,
  signing validity and App Store state remain unknown.

These are foundation artifacts, not a guarantee of App Review approval.
See [launch checks](launch-screen-review.md) and the
[release preparation evaluation](../../benchmarks/release-preparation/README.md).
