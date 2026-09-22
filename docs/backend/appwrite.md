# Appwrite for Apple clients

Appwrite combines auth, data, storage, functions and realtime, with managed or self-hosted operations. Choose it when its permissions and hosting model fit the team. Self-hosting also means owning backups, mail delivery, upgrades, monitoring and security fixes.

## Swift SDK setup

Add `https://github.com/appwrite/sdk-for-apple` through SPM. The official Apple quickstart currently references **10.1.0**; pin the version you validate against your server. Register the app's bundle platform and inject the endpoint/project ID. Never call a server-key configuration method with an administrator API key in an iOS target.

```swift
import Appwrite

func signIn(account: Account, email: String, password: String) async throws {
    _ = try await account.createEmailPasswordSession(email: email, password: password)
}
func signOut(account: Account) async throws {
    _ = try await account.deleteSession(sessionId: "current")
}
```

These snippets need the external SDK and configured service; they were not SDK-compiled here. OAuth uses the documented browser flow and callback configuration. Validate the exact registered callback route, not a substring match. Inspect session persistence in the pinned SDK and never copy sensitive session state to UserDefaults. Test relaunch, expired sessions and identity switching.

## Data and realtime

Match the database API generation to the server/SDK—current TablesDB terminology and older Databases examples must not be mixed blindly. Use explicit permissions, bounded queries, stable ordering and cursor pagination. Client filtering is not authorization. Storage buckets/files need permission, size/type and orphan-cleanup policies. Functions keep privileged operations server-side and must validate caller identity and input.

A realtime subscription is not an offline database. Reconnect with backoff, resubscribe once, deduplicate events and fetch missing changes. One repository owns subscriptions and cancellation. Queue offline edits only with idempotency and conflict rules; background execution and socket delivery are not guaranteed on iOS.

## Production gate

Test with synthetic users in an isolated instance: cross-user denial, OAuth cancellation, callback cold launch, session revocation, pagination, file cancellation and deletion of account-owned data. Use injected repositories for offline Swift tests; self-hosted compatibility and upgrades need integration tests against the actual server. Configure development and production endpoints separately and avoid logging sessions or signed URLs.

Review [privacy](privacy.md) for identity, cloud storage, telemetry and data synchronization. Plan server/SDK upgrades, schema migration and backup restore before shipping. Primary source: [official Apple quickstart](https://appwrite.io/docs/quick-starts/apple), with linked SDK/server references for the pinned release.
