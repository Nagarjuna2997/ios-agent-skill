# BackgroundTasks

## BGTaskScheduler Registration

Register task identifiers in `Info.plist` under `BGTaskSchedulerPermittedIdentifiers`:

```xml
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
    <string>com.yourapp.refresh</string>
    <string>com.yourapp.db-cleanup</string>
    <string>com.yourapp.sync</string>
</array>
```

Register handlers at app launch (before the end of the first `applicationDidFinishLaunching` call or in the `@main` App `init`):

```swift
import BackgroundTasks

@main
struct MyApp: App {
    init() {
        registerBackgroundTasks()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }

    private func registerBackgroundTasks() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.yourapp.refresh",
            using: nil  // nil = main queue
        ) { task in
            guard let task = task as? BGAppRefreshTask else { return }
            handleAppRefresh(task: task)
        }

        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.yourapp.db-cleanup",
            using: nil
        ) { task in
            guard let task = task as? BGProcessingTask else { return }
            handleDatabaseCleanup(task: task)
        }

        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.yourapp.sync",
            using: nil
        ) { task in
            guard let task = task as? BGProcessingTask else { return }
            handleSync(task: task)
        }
    }
}
```

## BGAppRefreshTask for Periodic Updates

App refresh tasks are short-lived (up to 30 seconds). Use for lightweight data fetches.

```swift
func handleAppRefresh(task: BGAppRefreshTask) {
    // Schedule the next refresh before doing work
    scheduleAppRefresh()

    let refreshTask = Task {
        do {
            let newData = try await DataService.shared.fetchLatestData()
            await MainActor.run {
                DataStore.shared.update(with: newData)
            }
            task.setTaskCompleted(success: true)
        } catch {
            task.setTaskCompleted(success: false)
        }
    }

    // Handle system cancelling the task
    task.expirationHandler = {
        refreshTask.cancel()
    }
}

func scheduleAppRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.yourapp.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes minimum

    do {
        try BGTaskScheduler.shared.submit(request)
    } catch {
        print("Could not schedule app refresh: \(error)")
    }
}
```

## BGProcessingTask for Long Operations

Processing tasks can run for several minutes. Require device to be charging and/or on Wi-Fi.

```swift
func handleDatabaseCleanup(task: BGProcessingTask) {
    // Schedule the next cleanup
    scheduleDatabaseCleanup()

    let cleanupTask = Task {
        do {
            try await DatabaseManager.shared.performCleanup()
            try await DatabaseManager.shared.vacuumDatabase()
            try await CacheManager.shared.pruneExpiredEntries()
            task.setTaskCompleted(success: true)
        } catch {
            task.setTaskCompleted(success: false)
        }
    }

    task.expirationHandler = {
        cleanupTask.cancel()
    }
}

func scheduleDatabaseCleanup() {
    let request = BGProcessingTaskRequest(identifier: "com.yourapp.db-cleanup")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 24 * 60 * 60) // Daily
    request.requiresNetworkConnectivity = false
    request.requiresExternalPower = true  // Only when charging

    do {
        try BGTaskScheduler.shared.submit(request)
    } catch {
        print("Could not schedule cleanup: \(error)")
    }
}

func handleSync(task: BGProcessingTask) {
    scheduleSync()

    let syncTask = Task {
        do {
            try await SyncEngine.shared.performFullSync()
            task.setTaskCompleted(success: true)
        } catch {
            task.setTaskCompleted(success: false)
        }
    }

    task.expirationHandler = {
        syncTask.cancel()
    }
}

func scheduleSync() {
    let request = BGProcessingTaskRequest(identifier: "com.yourapp.sync")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 60 * 60) // 1 hour
    request.requiresNetworkConnectivity = true
    request.requiresExternalPower = false

    do {
        try BGTaskScheduler.shared.submit(request)
    } catch {
        print("Could not schedule sync: \(error)")
    }
}
```

## URLSession Background Transfers

Background transfers continue even when your app is suspended or terminated.

```swift
final class BackgroundDownloadManager: NSObject, URLSessionDownloadDelegate {
    static let shared = BackgroundDownloadManager()

    private lazy var backgroundSession: URLSession = {
        let config = URLSessionConfiguration.background(
            withIdentifier: "com.yourapp.background-download"
        )
        config.isDiscretionary = true           // System chooses optimal time
        config.sessionSendsLaunchEvents = true  // Wake app on completion
        config.allowsCellularAccess = false     // Wi-Fi only
        config.timeoutIntervalForResource = 60 * 60 * 24 // 24 hours
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    /// Completion handler stored from AppDelegate for background session events
    var backgroundCompletionHandler: (() -> Void)?

    /// Start a background download
    func download(url: URL) -> URLSessionDownloadTask {
        let task = backgroundSession.downloadTask(with: url)
        task.earliestBeginDate = Date(timeIntervalSinceNow: 60) // Delay start
        task.countOfBytesClientExpectsToSend = 200    // Request size estimate
        task.countOfBytesClientExpectsToReceive = 5_000_000 // Response size estimate
        task.resume()
        return task
    }

    /// Start a background upload
    func upload(data: Data, to url: URL) -> URLSessionUploadTask {
        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        // Write data to temp file (required for background uploads)
        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
        try? data.write(to: tempURL)

        let task = backgroundSession.uploadTask(with: request, fromFile: tempURL)
        task.resume()
        return task
    }

    // MARK: - URLSessionDownloadDelegate

    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didFinishDownloadingTo location: URL
    ) {
        // Move file from temp location before this method returns
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let destinationURL = documentsURL.appendingPathComponent(
            downloadTask.originalRequest?.url?.lastPathComponent ?? "download"
        )

        try? FileManager.default.removeItem(at: destinationURL)
        try? FileManager.default.moveItem(at: location, to: destinationURL)
    }

    func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didWriteData bytesWritten: Int64,
        totalBytesWritten: Int64,
        totalBytesExpectedToWrite: Int64
    ) {
        let progress = Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)
        Task { @MainActor in
            NotificationCenter.default.post(
                name: .downloadProgress,
                object: nil,
                userInfo: ["progress": progress, "taskID": downloadTask.taskIdentifier]
            )
        }
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error {
            print("Background transfer failed: \(error.localizedDescription)")
        }
    }

    // Called when all background events have been delivered
    func urlSessionDidFinishEvents(forBackgroundURLSession session: URLSession) {
        Task { @MainActor in
            backgroundCompletionHandler?()
            backgroundCompletionHandler = nil
        }
    }
}

extension Notification.Name {
    static let downloadProgress = Notification.Name("downloadProgress")
}
```

## AppDelegate Integration for Background Sessions

```swift
import UIKit

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        handleEventsForBackgroundURLSession identifier: String,
        completionHandler: @escaping () -> Void
    ) {
        BackgroundDownloadManager.shared.backgroundCompletionHandler = completionHandler
    }
}

// In your @main App:
@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

## Testing Background Tasks in Xcode

Use the Xcode debugger console to simulate background task execution:

```
# Simulate app refresh task launch
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.yourapp.refresh"]

# Simulate processing task launch
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.yourapp.db-cleanup"]

# Simulate expiration of a running task
e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateExpirationForTaskWithIdentifier:@"com.yourapp.refresh"]
```

## Complete Background Sync Example

```swift
import BackgroundTasks
import OSLog

@Observable
final class SyncEngine {
    static let shared = SyncEngine()

    private(set) var lastSyncDate: Date?
    private(set) var isSyncing = false

    private let logger = Logger(subsystem: "com.yourapp", category: "Sync")

    func performFullSync() async throws {
        guard !isSyncing else { return }
        isSyncing = true
        defer { isSyncing = false }

        logger.info("Starting full sync")

        // 1. Push local changes
        let pendingChanges = try await LocalStore.shared.pendingChanges()
        if !pendingChanges.isEmpty {
            logger.info("Pushing \(pendingChanges.count) local changes")
            try await APIClient.shared.pushChanges(pendingChanges)
            try await LocalStore.shared.markSynced(pendingChanges)
        }

        // 2. Pull remote changes
        let remoteChanges = try await APIClient.shared.pullChanges(since: lastSyncDate)
        logger.info("Pulled \(remoteChanges.count) remote changes")
        try await LocalStore.shared.applyRemoteChanges(remoteChanges)

        // 3. Update sync timestamp
        lastSyncDate = Date()
        UserDefaults.standard.set(lastSyncDate, forKey: "lastSyncDate")

        logger.info("Sync completed successfully")
    }
}

// Schedule sync when app backgrounds
struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var syncEngine = SyncEngine.shared

    var body: some View {
        NavigationStack {
            VStack {
                if syncEngine.isSyncing {
                    ProgressView("Syncing...")
                }
                if let lastSync = syncEngine.lastSyncDate {
                    Text("Last sync: \(lastSync, format: .relative(presentation: .named))")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .background {
                scheduleSync()
                scheduleAppRefresh()
            }
        }
        .task {
            // Sync on app launch if stale
            if let last = syncEngine.lastSyncDate,
               Date().timeIntervalSince(last) > 300 { // 5 minutes
                try? await syncEngine.performFullSync()
            }
        }
    }
}

// Placeholder protocols for completeness
enum LocalStore {
    static let shared = LocalStore.self
    static func pendingChanges() async throws -> [Any] { [] }
    static func markSynced(_ changes: [Any]) async throws {}
    static func applyRemoteChanges(_ changes: [Any]) async throws {}
}

enum APIClient {
    static let shared = APIClient.self
    static func pushChanges(_ changes: [Any]) async throws {}
    static func pullChanges(since date: Date?) async throws -> [Any] { [] }
}
```
