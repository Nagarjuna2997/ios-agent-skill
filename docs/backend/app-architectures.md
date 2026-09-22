# Backend architectures by app workflow

Keep feature models independent from service-specific records. The following are design options, not endorsements or live-tested deployments. Start with the failure state and choose a backend only after a small prototype verifies it.

| App | Suggested boundary | Data and recovery design | Check before shipping |
|---|---|---|---|
| Notes | Local store → sync repository → CloudKit or an authorized API | Stable note IDs, tombstones, revision/conflict policy; local edit first | Offline edit, account switch, delete/reappear race |
| Social | Feed repository → Supabase/Postgres or Firebase data + storage | Server pagination, ownership policy, moderation, upload cleanup | Cross-user denial, blocked content, cursor stability |
| File storage | Transfer coordinator → authorized object store | File-backed uploads, progress/cancel, short-lived signed access, metadata record | Interrupted upload, orphan cleanup, unauthorized download |
| Chat | Conversation store → realtime coordinator + catch-up API | Message IDs, acknowledgements, ordering, dedupe and durable catch-up | Disconnect during send, duplicate events, revoked membership |
| Subscription | StoreKit client → entitlement repository → trusted verification | Server verifies transaction/entitlement contract; client boolean is not access control | Expired/revoked entitlement, offline grace policy, replay |
| Collaborative | Local document → sync engine → shared records or revisioned server | Explicit conflict/merge rules, participant permissions, change cursor | Concurrent edits, removal from share, stale permissions |
| Offline-first | Local database + outbox → bounded sync worker | Durable operation IDs, replay policy, tombstones and visible pending state | Relaunch mid-sync, auth loss, repeated delivery, migration |

## A notes app's state flow

The UI reads local notes. A repository accepts an edit and atomically records pending work. A sync owner sends it when authenticated, records the acknowledged revision, then updates local status. Incoming changes merge through the same repository. A view disappearing cancels view-owned fetches, not necessarily durable sync work. Account changes cancel and isolate both.

## Avoid hidden coupling

Use DTO-to-domain mapping at the boundary. Do not put SDK singleton calls inside SwiftUI body, copy a token into each feature or create competing refresh loops. Tests inject an offline repository. Provider migration then replaces an adapter and data migration, rather than every screen. See [REST](rest.md) and [BackendPatterns](../../samples/BackendPatterns/README.md).

## Evidence to keep

Save exact SDK versions, policy tests, schema migration tests and device lifecycle outcomes. Test a rejected operation as carefully as a successful one. A compiled view is not evidence of authorized storage or correct offline synchronization. Consult [choosing a backend](choosing-a-backend.md), [security](security.md) and [privacy](privacy.md).
