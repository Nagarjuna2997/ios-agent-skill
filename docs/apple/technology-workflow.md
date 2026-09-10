# Implementing a Technology from the Apple Directory

## Context

Use this workflow after choosing an entry in [All Apple Technologies](all-technologies.md). The directory spans application frameworks, system interfaces, drivers, developer tools, web services, design resources, release notes, and legacy technologies. A directory entry is not automatically an iOS framework or a Swift module.

The catalog provides source-checked discovery and topic-level routing. Existing authored guides provide implementation patterns. Compilation, provisioning, and runtime validation still belong to the project using the technology.

## Pattern

### Select the exact integration surface

1. Match the requested feature to the technology’s topic group, then read the selected symbol or setup article linked there. Do not load all 405 entries into context.
2. Check the target platform, target type, language, SDK, and symbol introduction/deprecation versions. Module availability does not imply member availability. An external web API does not require a Swift `import`.
3. Inspect the existing app’s dependencies and architecture before adding another implementation. Prefer the catalog’s existing guide when present; the generated page supplies discovery context rather than an alternative implementation.
4. Establish authorization, entitlements, supported hardware, lifecycle, concurrency, and failure behavior from the selected API’s documentation. Test the denied/unavailable path as well as the successful path.
5. Implement the smallest complete feature using the established architecture. Compile it against the actual target; distinguish build evidence from tests and device/runtime evidence.

### Route by integration domain

| Domain | Implementation decisions | Local guidance and verification |
|---|---|---|
| App Frameworks | Identify who owns presentation and state, whether an extension target is required, and how the host app resumes after dismissal or interruption. | [SwiftUI state](../swiftui/state-and-data-flow.md), [platform guidance](../platforms/ios.md). Exercise navigation, cancellation, background/foreground transitions, and accessible controls. |
| App Services | Separate app identity, user permission, service credentials, and server authorization. Decide which operation belongs on-device versus the backend. | [Security](../security/README.md), [networking](../networking/README.md). Validate denied permission, expired credentials, offline operation, idempotency, and retries. |
| Graphics and Games | Establish the renderer, frame loop, coordinate system, resource ownership, asset pipeline, and hardware constraints before adding effects. | [Graphics](../graphics/README.md), [performance](../performance/README.md). Measure frame time and memory on representative devices; test unsupported hardware and interruptions. |
| Media | Identify capture/playback sessions, permission prompts, audio routing, buffer formats, clock/timebase behavior, and interruption recovery. | [AVFoundation](../frameworks/avfoundation.md). Exercise route changes, permission denial, cancellation, background behavior, and large media. |
| System | Determine whether this is an app API, process boundary, privileged service, driver, or low-level C interface. Keep ownership and authorization explicit at the boundary. | [Memory/lifetime](../swift/memory-lifetime.md), [security](../security/README.md), [concurrency](../swift/swift-concurrency.md). Test malformed input, invalid handles, process failure, and cleanup. |
| Developer Tools | Identify whether the entry is a build tool, compiler facility, Xcode integration, test framework, or runtime diagnostic. Check toolchain compatibility independently of app deployment targets. | [Xcode migration](../migration/xcode-migration.md), [testing](../../checklists/testing.md). Run the actual command or tool workflow and retain its output. |
| Web | Determine whether integration belongs in a browser, backend, JavaScript SDK, or native web view. Keep browser origins and authentication boundaries explicit. | [Web/native routing](../web/README.md). Test navigation restrictions, untrusted messages, session expiry, and failure responses. |
| Design | Translate the selected guidance into states, interactions, accessibility, and platform behavior rather than treating the resource as an importable API. | [Design](../design/README.md). Verify rendered states, Dynamic Type, contrast, Reduce Motion, and input methods. |
| Release Notes | Extract changes relevant to the project’s actual SDK and affected API. Distinguish known issues, fixes, and deprecations. | [Compatibility](../compatibility-matrix.md). Reproduce the affected behavior and record the toolchain used. |
| Sample Code | Inspect sample requirements and the specific behavior demonstrated. Reuse the pattern with the app’s lifecycle and error handling rather than transplanting a whole sample project. | [Sample patterns](../../samples/SkillPatterns/README.md). Build the adapted code and test its integration boundaries. |
| Technology Overviews | Use the overview to choose a framework, then load its dedicated record before implementation. | [Selected framework index](../apple-framework-index.md). Validate the chosen framework’s exact capabilities and availability. |

### Process boundaries, drivers, and legacy technologies

For XPC and related process communication, identify the service deployment model and the supported platform/API combination first. Inspect peer authentication/requirements, message types, cancellation, invalidation, and reconnect behavior in the selected API documentation. Treat received messages as untrusted input; validate them before privileged work. A connection or imported module alone is not proof of authorization.

For DriverKit, kernel-related, and system-extension entries, establish target type, signing, entitlement eligibility, installation/activation requirements, and hardware access. Keep these separate from ordinary app targets. A simulator test cannot establish hardware-driver correctness.

For deprecated technologies, determine whether the request is maintaining an existing integration or introducing a new one. Read the deprecation/migration notice and preserve compatibility requirements. Do not silently substitute another framework without checking that it supports the required behavior.

### Verification record

Report the technology, selected API, source URL, SDK and target, checks performed, and remaining runtime limitations. A fetched landing page verifies the existence and recorded metadata of the resource; it does not verify a feature built with it. Topic links are extracted from that landing page and are not individually fetched by catalog refresh.

## Anti-Patterns

- Treating the selected 99-entry catalog’s historical 100% as proof that all Apple technologies have implementations. The full live-directory snapshot is separately counted and checked.
- Generating identical Swift examples for unrelated frameworks. Services, resources, drivers, and language/runtime APIs have different integration surfaces.
- Applying the lowest framework-level OS version to every symbol. Read member-level availability and compile the chosen call.
- Treating `deprecated: false` or an absent availability value as a universal stability guarantee. Metadata is scoped to its source and refresh date.
- Counting aliases or multiple category appearances as separate technologies. The canonical URL is the directory identity.
- Claiming every method/property page was mirrored. The repository stores the technology directory, landing-page topic maps, short attributed excerpts, and local engineering guidance.
