# Backend services for Swift apps

Choose a backend around the app's data ownership, identity and recovery requirements. This library connects iOS lifecycle and concurrency decisions to concrete service configuration; it is not a hosted backend or a security certification.

## Start with a boundary

SwiftUI view → UI-isolated feature model → injected repository → SDK or HTTP transport → server authorization. Keep SDK sessions and caches behind this boundary. A preview receives an in-memory repository and never creates a live service. An actor owns shared mutable pagination, refresh or reconnect state; do not put the entire networking layer on the main actor.

1. [Choose a backend](choosing-a-backend.md) and [map your app architecture](app-architectures.md).
2. Establish [authentication and callback ownership](authentication.md), then [authorization and secret boundaries](security.md).
3. Read the specific integration: [Supabase](supabase.md), [Firebase](firebase.md), [CloudKit](cloudkit.md), [AWS Amplify](aws-amplify.md), [Appwrite](appwrite.md), [REST](rest.md), [GraphQL](graphql.md) or [WebSockets](websockets.md).
4. Exercise [privacy and account lifecycle](privacy.md) using synthetic identities.
5. Run `review_backend_integration` with the project path. Treat its file/line evidence as a review starting point, not a remote configuration audit.

## Verification contract

The source snapshot is dated **2026-09-21**. Provider API documentation was reviewed; that does not mean every SDK version was compiled, every OAuth provider was configured, or any live service was tested. [Source record](sources.json) records this distinction. Resolve and pin your chosen SDK, retain Package.resolved, compile for your deployment target, and then test the specific provider configuration on a device.

[BackendPatterns](../../samples/BackendPatterns/README.md) contains dependency-free Swift examples and offline tests. Provider auth snippets in these guides need the named SDK and configured service; they are not complete applications. Use environment-injected client identifiers. Never put a server key in the app, a preview or a prompt.

## Review output and limits

The new read-only tool returns services, matched imports/dependencies/configurations, auth and data-use evidence, risks with severity/confidence, and contextual review questions. It reads bounded local text only; it neither calls providers nor writes fixes. It omits credential values. Paths remain developer-local information.

Concrete checks cover privileged literal credentials, sensitive UserDefaults writes, direct token logging, discarded raw HTTP responses, immediate reconnect loops, explicit RLS disabling and unconditional Firebase allow rules. A public Firebase collection can be intentional; the finding asks for policy review, not an automatic rewrite. Missing RLS files, missing Apple login, missing deletion or absence of a cancellation keyword do not prove a defect.

Use existing SwiftUI/performance/security reviewers for body-side effects, force unwraps and error handling. Review pagination, endpoint environments, relaunch restoration and background assumptions with feature context. The scanner cannot infer custom wrappers, deployed policies, entitlements, SDK persistence or an app's eligibility for App Review exceptions.

## Production gate

Record the exact SDK/toolchain, environment and test identity. Verify cross-user denial, expired/revoked sessions, sign-out cache clearing, offline recovery, bounded paging, upload cancellation and deletion of dependent records/files. Capture safe event IDs and outcomes, never tokens, callback URLs or user payloads. Do not label local tests as proof that production is secure.
