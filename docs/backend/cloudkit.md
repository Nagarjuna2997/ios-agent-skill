# CloudKit as an Apple-native backend

CloudKit is a major choice for Apple-only apps with iCloud identity, private synchronization and system sharing. It is not a drop-in multi-provider auth service or a relational SQL backend. Start with [existing CloudKit API guidance](../frameworks/cloudkit.md), then apply the lifecycle and deployment decisions here.

## Configuration and identity

CloudKit ships in the Apple SDK; no external SPM package is required. Enable iCloud/CloudKit capabilities and select the actual container entitlement. `CKContainer.default()` uses the configured default container, not an assumption that its identifier equals the bundle ID. Development and production environments have separate schema/data behavior.

Check `accountStatus()` and present deliberate unavailable/restricted/indeterminate states. Do not promise an email address or another cross-service identity from an iCloud account. A user can change accounts while the app is installed. Rebind caches and sync state to the current account; never blend private data between accounts.

## Databases, records and sharing

Choose private, public or shared CKDatabase scope explicitly. Public database does not mean every user can read/write everything; inspect record type permissions. Model CKRecord IDs, zones and ownership as stable domain decisions. CKQuery is paginated; follow cursors and inspect per-record failures. Store file data with CKAsset through managed local files, retaining those files for the operation's required lifetime.

Use CKShare and supported sharing flows for collaboration. Shared data has permission and participant transitions that must be tested. Never assume a record in the shared database is editable. Resolve conflict errors with server/client/ancestor records and a domain merge policy rather than last-writer-wins by accident.

## Sync and local persistence

CKSubscription/push signals tell the app to fetch changes; they are not guaranteed complete event delivery. CKSyncEngine coordinates supported change tracking and scheduling on available OS versions; persist its state and your own local records/outbox. It is not a complete local database. Recreate state safely after account/zone deletion and handle retries/rate limits as documented.

SwiftData + CloudKit and NSPersistentCloudKitContainer are higher-level sync choices with model/schema constraints. Choose one owner for a dataset; do not simultaneously mutate the same records through an unrelated manual sync layer. Check availability and supported schema features in the installed SDK. Plan additive migrations, defaults and old-client compatibility before deploying schema.

## Verification and privacy

Use injected repositories for offline tests; [BackendPatterns](../../samples/BackendPatterns/README.md) includes an account-status adapter compiled against the local Apple SDK without calling iCloud. Test real private/public/shared databases on entitled devices with multiple accounts, revoked sharing, offline changes, quota/rate limits, asset failures and account switching. Simulator results alone are insufficient for production iCloud claims.

Review CloudKit Dashboard schema promotion, indexes and permissions deliberately; never make cloud changes from an unaudited preview. Show sync/pending/conflict status and a recovery path. Account deletion/data deletion requirements depend on the app's account model; iCloud usage does not exempt data disclosure or retention review. See [privacy](privacy.md).

Primary sources: [CloudKit](https://developer.apple.com/documentation/cloudkit), [CKSyncEngine](https://developer.apple.com/documentation/cloudkit/cksyncengine), [SwiftData sync](https://developer.apple.com/documentation/swiftdata/syncing-model-data-across-a-persons-devices), [Core Data and CloudKit](https://developer.apple.com/documentation/coredata/mirroring-a-core-data-store-with-cloudkit).
