# GraphQL and Apollo iOS

GraphQL fits a typed schema with related resources and clients needing different selections. It does not remove backend authorization, query-cost controls or network failures. Use REST when a small stable endpoint surface is simpler.

## Installation and schema boundary

Add the official `https://github.com/apollographql/apollo-ios` package and select the products needed by the pinned release. Match the code generation tool to that release. Keep a reviewed schema snapshot and operation files; generate types in CI without calling production. Package product/module names and subscription transport APIs vary by major version: compile your lockfile, not an unversioned tutorial.

Queries read data; mutations express writes; subscriptions stream changes. Put operations behind a repository returning domain models, so generated types do not spread through SwiftUI. Inject authentication at the network transport boundary; refresh once and recreate/re-authenticate subscriptions when identity changes.

## Correctness beyond HTTP 200

A response can contain both data and GraphQL errors. Define which partial data is safe to show and distinguish transport errors from field errors. Normalize cache identity consistently; account-scope or clear caches on logout. A normalized cache is not an offline mutation queue. Optimistic updates need reconciliation and rollback after server rejection.

Use cursor pagination and server-provided pageInfo, not an unbounded collection query. Bound selection depth and payloads on the server. Store large files using an authorized upload service or signed URL contract instead of base64 blobs in arbitrary mutations. Realtime subscriptions still require deduplication and a catch-up query after disconnection.

## Lifecycle, testing and migration

Do not keep subscriptions alive indefinitely in the background; iOS may suspend the app. One actor/coordinator owns subscription cancellation, retry and state. Use bounded backoff, honour authorization failures and avoid retrying mutations without idempotency. Validate deep links before selecting an entity, then re-authorize the fetch.

Use generated mocks or injected repositories for previews and offline tests. Test partial responses, missing nullable fields, cursor termination, optimistic rollback, account changes and schema compatibility. Verify code generation determinism and compilation with the pinned SDK; no Apollo SDK execution is claimed by the dependency-free sample.

Follow [authentication](authentication.md), [security](security.md) and [privacy](privacy.md) for token storage, account deletion and analytics. Primary source: [Apollo iOS documentation](https://www.apollographql.com/docs/ios).
