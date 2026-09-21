# Phase 1 release-preparation contract evaluation

This deterministic fixture suite evaluates the local implementation, not whether
an AI with the skill outperforms a baseline. It makes no provider calls and does
not replace the historical 120 runs or their 60 paired ties.

The executable fixtures are in `mcp-server/test/release.test.js`, built using the
shared launch-project helper. Run from the repository root:

```sh
npm run build --prefix mcp-server
node --test mcp-server/test/release.test.js
```

Coverage includes SwiftUI/UIKit, multiple targets, extensions, six permission
families, linked networking/analytics products, authentication, StoreKit, absent
plists, brief conflicts, unknown facts, launch/icon/localization evidence,
nonmember files, false API names in comments/strings, conditional compilation,
selection ambiguity, workspace references, source/assets/lockfile invalidation,
semantic hashes, evidence tampering, locks, symlinks, credential exclusion, ignored
output, CLI JSON and no required AI/Apple credentials.

Assertions measure specific factual claims, forbidden inferences, missed permission
indicators, missing evidence links, question conditions, target isolation and exact
semantic equality. Passing these fixtures is not a precision/recall estimate on
real applications or proof that arbitrary secrets can always be identified.

A provider-free network test rejects fetch; source review also verifies this path
has no HTTP/Apple/AI client and only invokes local Git. It is not an OS-level network
sandbox test. Tests deliberately retain UNKNOWN and unsupported cases instead of
forcing all fixtures to look fully understood.

Next evaluation: a separately frozen, manually labelled corpus of real target
configurations with extension/privacy dependencies, plus a controlled offline
execution environment. Measure unsupported coverage alongside false positives,
missed facts and unnecessary questions. Do not turn these unit tests into an
agent-improvement claim.
