# Choosing an iOS backend

Begin with the hardest requirement: cross-platform identity, relational joins, offline edits, Apple-only sharing or operational control. There is no universally best service. Budget for migration and policy testing as well as a happy-path SDK demo.

## Decision matrix

| Backend | Strong fit | Important tradeoff | Offline and local testing |
|---|---|---|---|
| CloudKit | Apple accounts, private records and system sharing | iCloud identity and Apple platform boundaries; public data needs deliberate permissions | App owns local persistence; CKSyncEngine coordinates supported sync, not a complete database. Test account transitions on devices |
| Supabase | Postgres relationships, SQL/RLS, flexible auth, storage and realtime | Schema, grants and RLS require server expertise | Explicit app cache/outbox; local stack and policy tests; no automatic Swift offline database |
| Firebase | Mobile auth, realtime data, push and operational SDKs | Document/tree modeling, Rules and indexes; query costs and lock-in | Firestore persistent cache is supported on Apple; emulator tests differ from production |
| Amplify | Cognito, AppSync and S3 within AWS operations | IAM/auth modes, generated configuration and cloud complexity | Cache/offline behavior depends on selected API/DataStore architecture; do not assume all GraphQL calls sync |
| Appwrite | Integrated auth/data/storage/functions, managed or self-hosted | Hosting upgrades, permissions and SDK/server compatibility | Explicit local state/outbox and isolated test instance |
| Custom REST | Stable contract, existing backend, transport ownership | Build auth, rate limiting, observability and policy tests | URLProtocol/injected transports; explicit cache and sync design |
| GraphQL | Typed multi-resource queries, schema evolution | Resolver authorization, code generation and partial errors | Normalized cache does not by itself queue offline mutations |

## Capabilities to price and prototype

CloudKit sharing is Apple-native; multi-provider login favors Supabase, Firebase, Cognito or Appwrite. Relational constraints favor Postgres or a custom relational backend. Realtime delivery is not a guarantee of ordered, durable synchronization in any of these choices. CloudKit subscriptions, FCM and AWS push integrations have different setup paths; Appwrite or custom services need a compatible push path and APNs configuration.

Supabase Storage, Firebase Storage, S3 and Appwrite Storage need per-object access policy and orphan cleanup. Server functions differ in runtime and deployment: Supabase Edge Functions, Firebase Functions, Lambda and Appwrite Functions all keep privileged credentials off-device. CloudKit is not a general server-function runtime.

Self-hosting is an option for Supabase and Appwrite; it transfers backups, patching, mail delivery and incident response to you. Export data, preserve stable domain IDs and isolate provider types behind repositories to reduce migration cost. Assess Swift SDK release cadence and deployment targets from the pinned package, not this matrix.

## A useful prototype

Implement one list, one upload and one identity transition. Test two users, denied access, revocation, airplane mode, interrupted writes and account switching. Measure payloads and query count, not only the number of SDK calls. Choose only after validating the hardest flow.

Convex, PocketBase, Parse/Back4App, Hasura and Workers/D1/R2 can fit particular teams; confirm a maintained Swift integration or use a documented HTTP boundary. Vapor, FastAPI and Node.js/NestJS are server implementation choices, not interchangeable iOS SDKs. Keep secondary choices behind the same repository contracts.

See [app architectures](app-architectures.md), [security](security.md), and each provider's primary sources in [the source record](sources.json).
