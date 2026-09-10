# Dispatch

## Context

Load this when a task names **Dispatch** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/dispatch) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Execute code concurrently on multicore hardware by submitting work to dispatch queues managed by the system.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Dispatch`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 8.0 | — | No |
| iPadOS | 8.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.10 | — | No |
| tvOS | 9.0 | — | No |
| visionOS | 1.0 | — | No |
| watchOS | 2.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Queues and Tasks

- [DispatchQueue](https://developer.apple.com/documentation/dispatch/dispatchqueue)
- [DispatchWorkItem](https://developer.apple.com/documentation/dispatch/dispatchworkitem)
- [DispatchGroup](https://developer.apple.com/documentation/dispatch/dispatchgroup)
- [Dispatch Queue](https://developer.apple.com/documentation/dispatch/dispatch-queue)
- [Dispatch Work Item](https://developer.apple.com/documentation/dispatch/dispatch-work-item)
- [Dispatch Group](https://developer.apple.com/documentation/dispatch/dispatch-group)
- [Workloop](https://developer.apple.com/documentation/dispatch/workloop)

### Thread Scheduling

- [DispatchQoS](https://developer.apple.com/documentation/dispatch/dispatchqos)

### System Event Monitoring

- [DispatchSource](https://developer.apple.com/documentation/dispatch/dispatchsource)
- [Dispatch Source](https://developer.apple.com/documentation/dispatch/dispatch-source)
- [DispatchIO](https://developer.apple.com/documentation/dispatch/dispatchio)
- [DispatchData](https://developer.apple.com/documentation/dispatch/dispatchdata)
- [DispatchDataIterator](https://developer.apple.com/documentation/dispatch/dispatchdataiterator)
- [Dispatch I/O](https://developer.apple.com/documentation/dispatch/dispatch-i-o)
- [Dispatch Data](https://developer.apple.com/documentation/dispatch/dispatch-data)
- [DispatchSourceProtocol](https://developer.apple.com/documentation/dispatch/dispatchsourceprotocol)

### Task Synchronization

- [DispatchSemaphore](https://developer.apple.com/documentation/dispatch/dispatchsemaphore)
- [Dispatch Semaphore](https://developer.apple.com/documentation/dispatch/dispatch-semaphore)
- [Dispatch Barrier](https://developer.apple.com/documentation/dispatch/dispatch-barrier)

### Time Constructs

- [DispatchTime](https://developer.apple.com/documentation/dispatch/dispatchtime)
- [DispatchWallTime](https://developer.apple.com/documentation/dispatch/dispatchwalltime)
- [DispatchTimeInterval](https://developer.apple.com/documentation/dispatch/dispatchtimeinterval)
- [DispatchTimeoutResult](https://developer.apple.com/documentation/dispatch/dispatchtimeoutresult)
- [dispatch_time_t](https://developer.apple.com/documentation/dispatch/dispatch_time_t)
- [DISPATCH_WALLTIME_NOW](https://developer.apple.com/documentation/dispatch/dispatch_walltime_now)
- [Wall Time Constants](https://developer.apple.com/documentation/dispatch/2963138-wall-time-constants)

### Dispatch Objects

- [DispatchObject](https://developer.apple.com/documentation/dispatch/dispatchobject)
- [DispatchPredicate](https://developer.apple.com/documentation/dispatch/dispatchpredicate)
- [dispatchPrecondition(condition:)](https://developer.apple.com/documentation/dispatch/dispatchprecondition(condition:))
- [Dispatch Objects](https://developer.apple.com/documentation/dispatch/dispatch-objects)

### Deprecated

- [Deprecated Symbols](https://developer.apple.com/documentation/dispatch/deprecated-symbols)

### Classes

- [DispatchWorkloop](https://developer.apple.com/documentation/dispatch/dispatchworkloop)

### Reference

- [Dispatch Constants](https://developer.apple.com/documentation/dispatch/dispatch-constants)
- [Dispatch Data Types](https://developer.apple.com/documentation/dispatch/dispatch-data-types)
- [Dispatch Functions](https://developer.apple.com/documentation/dispatch/dispatch-functions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
