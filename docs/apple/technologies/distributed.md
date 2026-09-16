# Distributed

## Context

Load this when a task names **Distributed** or one of the API topics below.

Apple categories: App Frameworks.

[Apple documentation](https://developer.apple.com/documentation/distributed) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Build systems that run distributed code across multiple processes and devices.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `Distributed`.

Documentation language identifiers: swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 16.0 | — | No |
| iPadOS | 16.0 | — | No |
| Mac Catalyst | 16.0 | — | No |
| macOS | 13.0 | — | No |
| tvOS | 16.0 | — | No |
| watchOS | 9.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Distributed Actors

- [DistributedActor](https://developer.apple.com/documentation/distributed/distributedactor)
- [DistributedActorSystem](https://developer.apple.com/documentation/distributed/distributedactorsystem)
- [Resolvable()](https://developer.apple.com/documentation/distributed/resolvable())
- [buildDefaultDistributedRemoteActorExecutor(_:)](https://developer.apple.com/documentation/distributed/builddefaultdistributedremoteactorexecutor(_:))

### Remote Calls

- [RemoteCallTarget](https://developer.apple.com/documentation/distributed/remotecalltarget)
- [RemoteCallArgument](https://developer.apple.com/documentation/distributed/remotecallargument)
- [DistributedTargetInvocationEncoder](https://developer.apple.com/documentation/distributed/distributedtargetinvocationencoder)
- [DistributedTargetInvocationDecoder](https://developer.apple.com/documentation/distributed/distributedtargetinvocationdecoder)
- [DistributedTargetInvocationResultHandler](https://developer.apple.com/documentation/distributed/distributedtargetinvocationresulthandler)

### Local Testing

- [LocalTestingDistributedActorSystem](https://developer.apple.com/documentation/distributed/localtestingdistributedactorsystem)
- [LocalTestingActorID](https://developer.apple.com/documentation/distributed/localtestingactorid)
- [LocalTestingActorAddress](https://developer.apple.com/documentation/distributed/localtestingactoraddress) — deprecated
- [LocalTestingInvocationEncoder](https://developer.apple.com/documentation/distributed/localtestinginvocationencoder)
- [LocalTestingInvocationDecoder](https://developer.apple.com/documentation/distributed/localtestinginvocationdecoder)
- [LocalTestingInvocationResultHandler](https://developer.apple.com/documentation/distributed/localtestinginvocationresulthandler)

### Errors

- [DistributedActorCodingError](https://developer.apple.com/documentation/distributed/distributedactorcodingerror)
- [DistributedActorSystemError](https://developer.apple.com/documentation/distributed/distributedactorsystemerror)
- [ExecuteDistributedTargetError](https://developer.apple.com/documentation/distributed/executedistributedtargeterror)
- [LocalTestingDistributedActorSystemError](https://developer.apple.com/documentation/distributed/localtestingdistributedactorsystemerror)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
