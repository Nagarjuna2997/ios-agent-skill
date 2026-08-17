# Xcode Memory Debugging

## Context

Load this when an iOS, iPadOS, macOS, watchOS, tvOS, or visionOS app has rising memory, a suspected leak, a retain cycle, `deinit` not firing, `EXC_BAD_ACCESS`, jetsam termination, slow scrolling caused by allocation churn, image/cache pressure, or Metal resource growth.

Apple's Xcode and Instruments tools provide the evidence. This file tells agents what to ask for, what to inspect, and how to report the result.

## First-pass triage

1. Reproduce the issue in a clean run.
2. Record device or simulator, OS version, scheme, build configuration, and the exact interaction.
3. Watch Xcode's Debug navigator memory report for current and peak memory.
4. Capture whether Xcode shows normal, warning, or termination-risk memory pressure.
5. Separate Swift object leaks from large non-object allocations such as images, decoded video frames, Core Animation backing stores, Metal textures, and malloc buffers.

If the issue only happens on device, do not close it based on simulator evidence.

## Memory Graph workflow

Use Xcode Debug Memory Graph when objects stay alive after their owner should be gone.

Checklist:

- Navigate to the feature and back out.
- Press the Debug Memory Graph button.
- Search for the model, view controller, coordinator, task owner, delegate, or cache type.
- Inspect incoming strong references.
- Look for closure captures, delegates declared strong, timers, notification observers, Combine subscriptions, task handles, and global singletons.
- Enable Malloc Stack in the scheme Diagnostics tab when allocation stack traces are needed.
- Export the memory graph when sharing evidence.

Report:

```text
INSPECTED: Memory Graph shows FeedViewModel retained by SearchCoordinator.onComplete closure.
Fix: capture self weakly or clear onComplete in stop().
Still unverified: no device rerun after patch.
```

## Instruments Allocations workflow

Use Instruments Allocations when memory grows but the owner is unclear, allocations churn during scrolling, or the issue involves malloc, images, buffers, or anonymous virtual memory.

Checklist:

- Profile with the Allocations instrument.
- Mark a generation before entering the feature.
- Exercise the feature.
- Mark another generation after leaving.
- Inspect persistent allocations by type, size, count, and responsible stack.
- Compare before and after the fix with the same interaction.

Prefer this over guessing from code when the problem is "memory keeps going up."

## Sanitizers and runtime diagnostics

Use scheme Diagnostics or test plans to enable the right tool:

- Address Sanitizer: memory access errors such as use-after-free and buffer overflow.
- Thread Sanitizer: data races in supported simulator runs.
- Main Thread Checker: system APIs used off the main thread.
- Undefined Behavior Sanitizer: C-family undefined behavior; do not describe it as a Swift-only checker.
- Guard Malloc: targeted investigation of memory access crashes when the overhead is acceptable.

Sanitizers change timing and resource use. A sanitizer finding is strong evidence. A clean sanitizer run is not proof that no bug exists.

## Crash logs, jetsam, and MetricKit

Use crash reports and device logs when the issue comes from TestFlight, App Store, or a build without debugger entitlements.

Checklist:

- Symbolicate crash reports before making code claims.
- Distinguish `EXC_BAD_ACCESS`, language exception aborts, watchdog terminations, and jetsam.
- Treat jetsam as memory pressure evidence, not as a normal crash.
- Use Xcode Organizer and MetricKit for production peak-memory and memory-at-suspension trends.
- Attach the relevant OS version, app version, device, and stack or report summary.

## Reducing memory

Start with the largest measured source, not the easiest code to edit.

Common fixes:

- Decode images to display size instead of full camera size.
- Downsample thumbnails.
- Bound in-memory caches by count and cost.
- Release feature-scoped resources when leaving the flow.
- Stream large files instead of reading them fully.
- Cancel long-running async work.
- Avoid retaining entire response models when only a small projection is needed.
- Reuse buffers carefully in image, audio, and Metal paths.
- Label Metal resources and release temporary render targets promptly.

## Metal Memory viewer

Use Xcode GPU capture and the Metal Memory viewer when GPU resources grow, AR sessions stutter, texture memory spikes, or render passes allocate unexpected buffers.

Checklist:

- Capture a GPU frame near the memory spike.
- Inspect textures, buffers, heaps, and render targets by allocated size.
- Verify resource labels are meaningful.
- Look for per-frame resource creation.
- Export GPU trace or CSV when sharing evidence.
- Cross-reference local Metal code in `docs/frameworks/metal.md`.

## Report template

```text
Status: INSPECTED / VERIFIED / UNVERIFIED
Environment: device/simulator, OS, Xcode, build configuration
Symptom: what grows, crashes, or remains retained
Evidence: Memory Graph / Allocations / sanitizer / crash log / jetsam / MetricKit / Metal Memory viewer
Likely cause: ownership path, allocation source, or resource lifetime
Change made: exact code or configuration change
Remaining risk: what was not rerun or not available
```
