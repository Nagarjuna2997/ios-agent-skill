# Migrating Xcode: 15 → 16 → 27

**Load this when:** upgrading Xcode, hitting build failures after an upgrade, or
setting the Xcode version in CI.

An Xcode upgrade changes the compiler, the SDKs, and the default build settings
at once. Most post-upgrade "mystery" failures are one of those three, and
telling them apart is the whole job.

| Xcode | Swift | SDK | Brings |
|-------|-------|-----|--------|
| 15 | 5.9 | iOS 17 | Macros, Observation, SwiftData, `#Preview` |
| 16 | 6.0 | iOS 18 | Swift 6 language mode, explicit modules, new Previews engine |
| 26 | 6.2 | iOS 26 | Liquid Glass, Foundation Models |
| 27 | 6.4 | iOS 27 | Coding agents, Device Hub, Swift 6.4, app resizability |

---

## Before you upgrade

1. **Keep the old Xcode.** Rename it (`Xcode-16.app`) before installing the new
   one. Rolling back mid-sprint is otherwise a multi-hour download.
2. **Commit or stash everything.** Xcode rewrites project files on open, and that
   diff is unreadable mixed with real work.
3. **Pin CI separately.** Do not let CI jump versions on the same day as local
   machines — then a red build has two possible causes.

   ```yaml
   - uses: maxim-lobanov/setup-xcode@v1
     with:
       xcode-version: '16.2'      # pin explicitly; never 'latest'
   ```

4. **Upgrade one thing at a time.** Xcode, then language mode, then deployment
   target — never together.

---

## Xcode 15 → 16

### Swift 6 language mode is available but not automatic

Existing targets stay in Swift 5 mode. New warnings appear because strict
concurrency checking got better, not because your code changed. Fix them in
Swift 5 mode first; flip the mode later.
See `swift-6-migration.md`.

### Explicitly built modules

Xcode 16 changes how modules are built. Effects:

- Faster incremental builds and much better diagnostics.
- **Some previously-tolerated header and import issues now fail**, especially in
  mixed Objective-C/Swift targets and older CocoaPods setups.

```
error: missing required module 'SomeCModule'
```

Usually a module map problem that Xcode 15 papered over. Fix the module map;
disabling the feature just defers it.

### Previews rewritten

The new Previews engine is faster and stricter. Previews that "worked" while
quietly reaching a live dependency now fail loudly.

That is a **correct** failure — it means the seam was missing. Inject a stub
rather than working around it. See `../testing/mocking-strategy.md`.

### Common upgrade failures

```
# Symbol not found / older toolchain artifacts.
rm -rf ~/Library/Developer/Xcode/DerivedData

# SPM resolution stuck on a stale graph.
rm -rf .build && swift package reset && swift package resolve

# "Command SwiftCompile failed" with no useful message — build the scheme from
# the CLI to see the real error.
xcodebuild build -scheme "App" -destination '…' 2>&1 | grep -A5 "error:"
```

---

## Xcode 16 → 26

Mostly an SDK step. The compiler change (Swift 6.0 → 6.2) is additive:
`@concurrent` and `nonisolated(nonsending)` appear; nothing is removed.

The real change is **linking against the iOS 26 SDK**, which adopts Liquid Glass
for standard controls whether or not you write any new code. See
`ios-deployment-migration.md` §Part 1.

---

## Xcode 16/26 → 27

### Swift 6.4

Additive. `weak let`, `~Sendable`, `@diagnose`, `async` in `defer`, plus a new
warning for unhandled task errors.

**Expect the new warning to fire on existing code.** It finds work that fails
silently — a real bug class, not noise. Do not silence it with `try?`.
See `swift-6-migration.md` §Part 2.

### App resizability

Rebuilding against the iOS 27 SDK **auto-opts your app into resizability** on
iPad and iPhone Mirroring. This is the single highest-risk item in the upgrade,
because no code of yours changed.

Verify by dragging an iPad window across every width, at normal and accessibility
text sizes. See `../tooling/device-hub.md`.

### Coding agents and Device Hub

New capabilities rather than migration work. Note that **Xcode agents do not read
this skill's rules** — bind them with a pre-commit hook or CI. See
`../tooling/xcode-27-agents.md`.

### Xcode 27 is beta

Do not move CI to it while it is beta. Keep CI on the current stable Xcode and
let developers opt in locally:

```yaml
# CI stays pinned to stable.
xcode-version: '26.2'
```

A beta toolchain in CI means every red build has an extra suspect.

---

## Diagnosing a post-upgrade failure

Work through these in order — each one eliminates a category:

```
1. Does it build with the PREVIOUS Xcode?
   No  → not the upgrade. Look at your own recent changes.
   Yes → continue.

2. Clean state?
   rm -rf ~/Library/Developer/Xcode/DerivedData
   rm -rf .build && swift package reset

3. Compiler or SDK?
   - "cannot find 'X' in scope" for an Apple symbol → SDK/availability
   - concurrency, Sendable, isolation → compiler (language mode)
   - "missing required module" → explicit modules / module map

4. Yours or a dependency's?
   swift package show-dependencies
   Update the dependency before patching around it.

5. Still stuck? Build from the CLI — the real error is often hidden in Xcode's UI.
   xcodebuild build -scheme "App" -destination '…' 2>&1 | grep -B2 -A5 "error:"
```

---

## CI

```yaml
jobs:
  build:
    runs-on: macos-15
    steps:
      - uses: actions/checkout@v4
      - uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: '26.2'          # pinned, never 'latest'
      - run: xcodebuild -version         # log it — invaluable when CI breaks
      - run: swift build
      - run: swift test
```

Two rules:

- **Pin the version.** `latest` means your build changes without a commit.
- **Log `xcodebuild -version` and `swift --version`** in every run. When CI
  breaks after a runner-image update, this is the first thing you need.

Upgrade CI **after** local machines are stable on the new version, in its own PR,
so a failure is attributable.

---

## Checklist

- [ ] Previous Xcode kept and renamed before installing the new one.
- [ ] Working tree clean before first open.
- [ ] Upgraded one variable at a time — Xcode, then language mode, then target.
- [ ] DerivedData and `.build` cleared before diagnosing anything.
- [ ] CI pinned to an explicit version, not `latest`, and updated separately.
- [ ] `xcodebuild -version` logged in CI.
- [ ] Xcode 16+: module-map failures fixed, not disabled.
- [ ] Xcode 16+: previews failing on a live dependency fixed with a stub.
- [ ] Xcode 27: unhandled-task-error warnings handled, not silenced.
- [ ] Xcode 27: **iPad resizing verified** after the SDK rebuild.
- [ ] CI kept on stable while Xcode 27 is beta.
