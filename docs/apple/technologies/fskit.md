# FSKit

## Context

Load this when a task names **FSKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/fskit) · Source checked: 2026-09-16.

Apple’s short description (excerpt):

> Implement a file system that runs in user space.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `FSKit`.

Documentation language identifiers: occ, swift.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| macOS | 15.4 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [Building a passthrough file system](https://developer.apple.com/documentation/fskit/building-a-passthrough-file-system)

### App extensions

- [UnaryFileSystemExtension](https://developer.apple.com/documentation/fskit/unaryfilesystemextension)

### File systems

- [FSUnaryFileSystem](https://developer.apple.com/documentation/fskit/fsunaryfilesystem)
- [FSFileSystemBase](https://developer.apple.com/documentation/fskit/fsfilesystembase)
- [FSFileName](https://developer.apple.com/documentation/fskit/fsfilename)

### Containers

- [FSContainerIdentifier](https://developer.apple.com/documentation/fskit/fscontaineridentifier)
- [FSContainerStatus](https://developer.apple.com/documentation/fskit/fscontainerstatus)

### Resources

- [FSResource](https://developer.apple.com/documentation/fskit/fsresource)
- [FSBlockDeviceResource](https://developer.apple.com/documentation/fskit/fsblockdeviceresource)
- [FSPathURLResource](https://developer.apple.com/documentation/fskit/fspathurlresource)
- [FSGenericURLResource](https://developer.apple.com/documentation/fskit/fsgenericurlresource)

### Volumes

- [FSVolume](https://developer.apple.com/documentation/fskit/fsvolume)

### Items

- [FSItem](https://developer.apple.com/documentation/fskit/fsitem)

### Maintenance and management

- [FSManageableResourceMaintenanceOperations](https://developer.apple.com/documentation/fskit/fsmanageableresourcemaintenanceoperations)

### Operations

- [FSOperationID](https://developer.apple.com/documentation/fskit/fsoperationid)

### Tasks

- [FSTask](https://developer.apple.com/documentation/fskit/fstask)
- [FSTaskOptions](https://developer.apple.com/documentation/fskit/fstaskoptions)

### Errors and logging

- [fs_errorForCocoaError(_:)](https://developer.apple.com/documentation/fskit/fs_errorforcocoaerror(_:))
- [fs_errorForMachError(_:)](https://developer.apple.com/documentation/fskit/fs_errorformacherror(_:))
- [fs_errorForPOSIXError(_:)](https://developer.apple.com/documentation/fskit/fs_errorforposixerror(_:))
- [FSError](https://developer.apple.com/documentation/fskit/fserror)
- [FSError.Code](https://developer.apple.com/documentation/fskit/fserror/code)
- [FSKitErrorDomain](https://developer.apple.com/documentation/fskit/fskiterrordomain)
- [FSDataCacheError](https://developer.apple.com/documentation/fskit/fsdatacacheerror)

### FSKit interactions

- [FSClient](https://developer.apple.com/documentation/fskit/fsclient)

### Supporting types

- [FSBlockmapFlags](https://developer.apple.com/documentation/fskit/fsblockmapflags)
- [FSCompleteIOFlags](https://developer.apple.com/documentation/fskit/fscompleteioflags)
- [FSEntityIdentifier](https://developer.apple.com/documentation/fskit/fsentityidentifier)
- [FSExtentPacker](https://developer.apple.com/documentation/fskit/fsextentpacker)
- [FSExtentType](https://developer.apple.com/documentation/fskit/fsextenttype)
- [FSMatchResult](https://developer.apple.com/documentation/fskit/fsmatchresult)
- [FSMetadataRange](https://developer.apple.com/documentation/fskit/fsmetadatarange)
- [FSProbeResult](https://developer.apple.com/documentation/fskit/fsproberesult)

### Entitlements

- [com.apple.developer.fskit.fsmodule](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.fskit.fsmodule)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
