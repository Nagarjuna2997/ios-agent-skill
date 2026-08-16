# Performance

## Context

Use this hub for launch time, scroll hitches, memory growth, energy, GPU cost, network latency, database performance, SwiftUI invalidation, animation pacing, Metal frame loops, RealityKit scenes, and MetricKit diagnostics.

## Measurement First

No optimization recommendation is complete without a measurement. Use the right instrument:

| Problem | Measure with |
|---|---|
| launch time | App Launch, signposts |
| CPU cost | Time Profiler |
| memory growth | Allocations, Leaks, Memory Graph |
| scroll hitches | Animation Hitches |
| actor contention | Swift Concurrency instrument |
| GPU pressure | Metal System Trace, GPU counters |
| energy | Energy Log |
| production regressions | MetricKit |

## Static Signals

Static review may flag candidates:

- formatters, sorting, decoding, or image work in SwiftUI `body`
- eager stacks in scroll views
- unbounded tasks or repeated requests
- per-frame allocation in render loops
- large images displayed without downsampling
- broad observation causing full-screen invalidation

Label unmeasured findings as inspected, not confirmed.

## Production Checklist

- [ ] Measured Release build, not Debug.
- [ ] Device/OS/configuration recorded.
- [ ] Signposts bracket critical flows.
- [ ] SwiftUI rows read only the state they render.
- [ ] Images are downsampled to display size.
- [ ] Animations stay responsive at 60Hz and 120Hz.
- [ ] Long-running AR/Metal/motion flows consider thermal and battery cost.
