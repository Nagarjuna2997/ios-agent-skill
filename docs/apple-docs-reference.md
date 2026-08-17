# Apple Docs Reference

## Context

Load this map when the task asks for Apple documentation, Swift language rules, Xcode diagnostics, memory debugging, crash reports, Instruments, MetricKit, Metal memory, or "all Apple docs" coverage. Apple documentation is the canonical source; this repository turns those references into routing rules, review checklists, and implementation habits for coding agents.

Do not copy Apple documentation wholesale. Link to the source, summarize the rule, then verify the local code or project evidence.

## Swift language sources

- Apple Swift documentation: <https://developer.apple.com/documentation/swift>
- Local first-load Swift brain: `docs/swift/swift-brain.md`
- Local language guide: `docs/swift/swift-language.md`
- Local concurrency guide: `docs/swift/swift-concurrency.md`
- Local standard library guide: `docs/swift/swift-standard-library.md`
- Local memory and lifetime guide: `docs/swift/memory-lifetime.md`

Use these for type-system behavior, protocol/generic design, optionals, errors, closures, macros, property wrappers, structured concurrency, actors, `Sendable`, ARC, ownership, and lifetime bugs.

## Xcode diagnostic sources

- Running-app debugging: <https://developer.apple.com/documentation/xcode/diagnosing-and-resolving-bugs-in-your-running-app>
- Sanitizers and runtime diagnostics: <https://developer.apple.com/documentation/xcode/diagnosing-memory-thread-and-crash-issues-early>
- Crash reports and device logs: <https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs>
- Memory access crashes: <https://developer.apple.com/documentation/xcode/investigating-memory-access-crashes>
- Local Xcode memory workflow: `docs/tooling/xcode-memory-debugging.md`
- Local Xcode agent workflow: `docs/tooling/xcode-27-agents.md`

Use these for breakpoints, scheme diagnostics, Address Sanitizer, Thread Sanitizer, Main Thread Checker, Undefined Behavior Sanitizer scope, crash logs, device logs, jetsam reports, and evidence collection.

## Memory sources

- Gathering memory information in Xcode: <https://developer.apple.com/documentation/xcode/gathering-information-about-memory-use>
- Reducing app memory use: <https://developer.apple.com/documentation/xcode/reducing-your-app-s-memory-use>
- Memory access crashes: <https://developer.apple.com/documentation/xcode/investigating-memory-access-crashes>
- Local Swift lifetime guide: `docs/swift/memory-lifetime.md`
- Local performance hub: `docs/performance/README.md`
- Local MCP analyzer: `docs/mcp/tools.md` with `review_swift_memory`

Use these for Debug navigator memory readings, Memory Graph captures, Malloc Stack allocation traces, Instruments Allocations, Generations, low-memory warnings, MetricKit memory metrics, Xcode Organizer regressions, retain cycles, leaks, and `EXC_BAD_ACCESS`.

## Metal and GPU memory sources

- Metal memory analysis in Xcode: <https://developer.apple.com/documentation/xcode/analyzing-memory-usage>
- Local Metal guide: `docs/frameworks/metal.md`
- Local graphics hub: `docs/graphics/README.md`

Use these for GPU captures, Metal Memory viewer inspections, resource allocation size, texture and buffer labels, heap residency, resource lifetime, and CSV trace exports.

## Agent rule

When a user asks for Apple-doc-backed work:

1. Load the local guide that matches the failure mode.
2. Treat Apple docs as canonical for tool behavior and platform constraints.
3. State the verification level: VERIFIED, INSPECTED, or UNVERIFIED.
4. Prefer measured evidence from Xcode, Instruments, MetricKit, crash logs, jetsam reports, simulator/device logs, or the MCP analyzers.
5. If Xcode, a device, or a simulator is not available, say exactly what could not be checked.
