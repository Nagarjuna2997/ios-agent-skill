# Deployment-target availability review

Use the existing `check_availability_guards` MCP tool with `path`, optional `target`, `configuration`, and `mode` (`auto` or `static`). Terminal equivalent:

```sh
node mcp-server/dist/unified.js availability --path /path/to/app --target App --configuration Release
```

No account, server, paid model, package resolution or network request is needed. Source files are read, not edited. Suggested repairs are instructions for developer review; model-generated fixes use the developer's own model.

## Evidence modes

- **compiler**: a bounded `xcrun swiftc -typecheck` completed for a statically resolved Swift-only target, using the selected local simulator SDK and its deployment minimum. This is not a complete Xcode build, test run, or App Store validation.
- **compiler+static**: the typecheck emitted exact iOS availability errors but did not succeed. Other source may remain unchecked. Each compiler finding is labelled `[compiler]`.
- **static-sdk**: scoped lexical review of imported frameworks' local public `.swiftinterface` declarations. It carries enclosing type/extension availability and takes the lowest version across name collisions/overloads. It does not resolve receivers, overloads, conditional conformances or Objective-C headers. Findings are candidates, not compiler proof.
- **static-curated**: no local SDK is available; retain the older small symbol catalog with explicit coverage limitations. Linux can use an installed/copied local SDK interface inventory through the programmatic `sdkPath` option; Apple SDK files are not bundled or downloaded.

Over-restrictive guards are always **static suggestions**, including after compiler success. Swift accepts such guards; a compiler diagnostic cannot establish that lowering one is safe. Check every API and intentional behavior in the branch first. Static source branches under conditional compilation are skipped rather than guessed.

## Project selection

Literal `.pbxproj` target/configuration deployment minima and explicit Swift source membership are read without running Xcode project scripts. Basic XcodeGen `project.yml` sources/minima and Swift package iOS platform literals are supported for static review. `IPHONEOS_DEPLOYMENT_TARGET` can supply an explicit environment override. Unknown minima are reported as **not detected**, and deployment diagnostics are suppressed.

Targets with xcconfig/conditional settings, synchronized source groups, generated files, target/package dependencies, custom compiler flags or bridging headers require their original Xcode build context. The tool does not pretend a minimal typecheck validates those configurations. Package manifests are never executed. Scanning is bounded; exclusions and incomplete inventories are reported. The typecheck has a 60-second deadline, writes only a temporary compiler cache, and neither signs nor launches an app.

Terminal exit statuses: `0` completed review with no actionable availability errors and no coverage limitations; `1` availability findings; `2` incomplete/unknown coverage or a failed check. Read the evidence mode even with exit 0. A static result is never compiler verification.

## Optional write-time hook

After building this checkout (or using an installed package), add this hook to the **app project's** `.claude/settings.json`, using the absolute installed path. No `npx` download occurs in the hook:

```json
{"hooks":{"PostToolUse":[{"matcher":"Edit|Write","hooks":[{"type":"command","command":"node /absolute/path/to/mcp-server/dist/availability/hook.js","timeout":30}]}]}}
```

The hook only responds to Swift file edits and runs static mode. It prints findings/coverage in the terminal agent session; it never makes repairs, sends reports or touches app UI. Unknown coverage produces a non-success response rather than a clean bill of health. Other clients can invoke the terminal command after writes.

## Regression evidence

Five regressions were first run against the previous implementation and all failed: deployment-minimum false positive, unrelated guard, insufficient guard, annotated sibling scope, and a supplied SDK-only symbol. The upgraded tests include branch/else and guard continuations, numeric point releases, project inputs, and compiler diagnostic parsing. Opt into the real local Xcode test with `IOS_AGENT_TEST_LOCAL_SDK=1 node --test mcp-server/test/deployment-guard.test.js`; it requires an SDK containing Liquid Glass. Portable CI does not claim that native check ran.

Swift availability language reference: https://docs.swift.org/swift-book/documentation/the-swift-programming-language/controlflow/#Checking-API-Availability
