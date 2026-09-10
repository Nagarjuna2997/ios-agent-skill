# IOSurface

## Context

Load this when a task names **IOSurface** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/iosurface) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Share hardware-accelerated buffer data (framebuffers and textures) across multiple processes. Manage image memory more efficiently.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `IOSurface`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| iOS | 11.0 | — | No |
| iPadOS | 11.0 | — | No |
| Mac Catalyst | 13.0 | — | No |
| macOS | 10.6 | — | No |
| tvOS | 11.0 | — | No |
| visionOS | 1.0 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Classes

- [IOSurface](https://developer.apple.com/documentation/iosurface/iosurface)
- [IOSurfaceRef](https://developer.apple.com/documentation/iosurface/iosurfaceref)

### Structures

- [IOSurfaceLockOptions](https://developer.apple.com/documentation/iosurface/iosurfacelockoptions)
- [IOSurfacePropertyKey](https://developer.apple.com/documentation/iosurface/iosurfacepropertykey)
- [IOSurfacePurgeabilityState](https://developer.apple.com/documentation/iosurface/iosurfacepurgeabilitystate)

### Reference

- [IOSurface Structures](https://developer.apple.com/documentation/iosurface/iosurface-structures)
- [IOSurface Constants](https://developer.apple.com/documentation/iosurface/iosurface-constants)
- [IOSurface Functions](https://developer.apple.com/documentation/iosurface/iosurface-functions)

### Variables

- [kIOSurfaceContentHeadroom](https://developer.apple.com/documentation/iosurface/kiosurfacecontentheadroom)
- [kIOSurfaceCopybackCache](https://developer.apple.com/documentation/iosurface/kiosurfacecopybackcache)
- [kIOSurfaceCopybackInnerCache](https://developer.apple.com/documentation/iosurface/kiosurfacecopybackinnercache)
- [kIOSurfaceDefaultCache](https://developer.apple.com/documentation/iosurface/kiosurfacedefaultcache)
- [kIOSurfaceInhibitCache](https://developer.apple.com/documentation/iosurface/kiosurfaceinhibitcache)
- [kIOSurfaceMapCacheShift](https://developer.apple.com/documentation/iosurface/kiosurfacemapcacheshift)
- [kIOSurfaceMapCopybackCache](https://developer.apple.com/documentation/iosurface/kiosurfacemapcopybackcache)
- [kIOSurfaceMapCopybackInnerCache](https://developer.apple.com/documentation/iosurface/kiosurfacemapcopybackinnercache)
- [kIOSurfaceMapDefaultCache](https://developer.apple.com/documentation/iosurface/kiosurfacemapdefaultcache)
- [kIOSurfaceMapInhibitCache](https://developer.apple.com/documentation/iosurface/kiosurfacemapinhibitcache)
- [kIOSurfaceMapWriteCombineCache](https://developer.apple.com/documentation/iosurface/kiosurfacemapwritecombinecache)
- [kIOSurfaceMapWriteThruCache](https://developer.apple.com/documentation/iosurface/kiosurfacemapwritethrucache)
- [kIOSurfaceWriteCombineCache](https://developer.apple.com/documentation/iosurface/kiosurfacewritecombinecache)
- [kIOSurfaceWriteThruCache](https://developer.apple.com/documentation/iosurface/kiosurfacewritethrucache)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
