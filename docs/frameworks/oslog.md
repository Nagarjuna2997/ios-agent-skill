# OSLog & MetricKit

## Logger Struct (iOS 14+)

```swift
import OSLog

extension Logger {
    /// Bundle identifier as default subsystem
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.yourapp"

    /// Loggers organized by category
    static let network = Logger(subsystem: subsystem, category: "Network")
    static let ui = Logger(subsystem: subsystem, category: "UI")
    static let data = Logger(subsystem: subsystem, category: "DataStore")
    static let auth = Logger(subsystem: subsystem, category: "Authentication")
    static let payment = Logger(subsystem: subsystem, category: "Payment")
    static let sync = Logger(subsystem: subsystem, category: "Sync")
}
```

## Log Levels

```swift
func demonstrateLogLevels() {
    // .debug — Verbose developer info. Not persisted by default. Not collected in production.
    Logger.network.debug("Request headers: \(headers)")

    // .info — Helpful but not essential. Persisted only during log collect.
    Logger.network.info("Starting request to \(endpoint)")

    // .notice (default) — Essential for troubleshooting. Persisted up to storage limit.
    Logger.auth.notice("User signed in successfully")

    // .error — Error conditions. Always persisted.
    Logger.data.error("Failed to save context: \(error.localizedDescription)")

    // .fault — Bug in the program. Always persisted. Captures calling process info.
    Logger.data.fault("Core Data stack not initialized — this should never happen")
}
```

## String Interpolation Privacy

```swift
func logWithPrivacy(userId: String, email: String, itemCount: Int) {
    // Default: dynamic strings are PRIVATE (redacted in production logs)
    Logger.auth.info("User logged in: \(userId)")
    // Output in production: "User logged in: <private>"

    // Explicitly mark as public when safe
    Logger.ui.info("Screen loaded: \(screenName, privacy: .public)")

    // Mark as private (default for dynamic values)
    Logger.auth.info("Email: \(email, privacy: .private)")

    // Hash private data for correlation without revealing values
    Logger.auth.info("User hash: \(email, privacy: .private(mask: .hash))")

    // Numeric values are PUBLIC by default
    Logger.data.info("Items count: \(itemCount)")

    // Format specifiers
    Logger.payment.info("Amount: \(amount, format: .fixed(precision: 2), privacy: .private)")

    // Boolean and numeric types
    Logger.network.debug("Cache hit: \(isCached, privacy: .public), size: \(responseSize) bytes")
}
```

## os_signpost for Performance Profiling

```swift
import os

// Create a signpost log
let pointsOfInterest = OSLog(subsystem: "com.yourapp", category: .pointsOfInterest)
let networkLog = OSLog(subsystem: "com.yourapp.network", category: "Requests")

// Mark an interval (begin + end)
func fetchData() async throws -> Data {
    let signpostID = OSSignpostID(log: networkLog)

    os_signpost(.begin, log: networkLog, name: "FetchData", signpostID: signpostID,
                "URL: %{public}@", url.absoluteString)

    let (data, _) = try await URLSession.shared.data(from: url)

    os_signpost(.end, log: networkLog, name: "FetchData", signpostID: signpostID,
                "Received %d bytes", data.count)

    return data
}

// Mark a single event (point of interest)
func userTappedCheckout() {
    os_signpost(.event, log: pointsOfInterest, name: "Checkout", "User tapped checkout button")
}

// Modern signpost API (iOS 15+)
let signposter = OSSignposter(subsystem: "com.yourapp", category: "Performance")

func modernSignpostExample() async throws {
    let state = signposter.beginInterval("DataLoad")

    let data = try await loadData()
    signposter.emitEvent("DataReceived", "\(data.count) bytes")

    signposter.endInterval("DataLoad", state)
}

// Automatic interval with withIntervalSignpost
func automaticSignpost() async throws -> [Item] {
    try await signposter.withIntervalSignpost("FetchItems") {
        try await api.fetchItems()
    }
}
```

## Structured Logging Utility

```swift
import OSLog

/// Centralized logging with context
enum AppLogger {
    private static let logger = Logger(
        subsystem: Bundle.main.bundleIdentifier ?? "com.yourapp",
        category: "App"
    )

    static func logNetworkRequest(
        method: String,
        url: URL,
        statusCode: Int?,
        duration: TimeInterval,
        error: Error? = nil
    ) {
        if let error {
            Logger.network.error("""
                Network error — \(method, privacy: .public) \(url.absoluteString, privacy: .public) \
                status=\(statusCode ?? 0) \
                duration=\(duration, format: .fixed(precision: 3))s \
                error=\(error.localizedDescription)
                """)
        } else {
            Logger.network.info("""
                Network — \(method, privacy: .public) \(url.absoluteString, privacy: .public) \
                status=\(statusCode ?? 0) \
                duration=\(duration, format: .fixed(precision: 3))s
                """)
        }
    }

    static func logUserAction(_ action: String, screen: String, metadata: [String: String] = [:]) {
        let metaString = metadata.map { "\($0.key)=\($0.value)" }.joined(separator: ", ")
        Logger.ui.notice("Action: \(action, privacy: .public) screen=\(screen, privacy: .public) \(metaString)")
    }

    static func logAppLifecycle(_ event: String) {
        logger.notice("Lifecycle: \(event, privacy: .public)")
    }
}
```

## MXMetricManager (MetricKit)

```swift
import MetricKit

final class MetricsManager: NSObject, MXMetricManagerSubscriber {
    static let shared = MetricsManager()

    func startCollecting() {
        MXMetricManager.shared.add(self)
    }

    func stopCollecting() {
        MXMetricManager.shared.remove(self)
    }

    // Called once per day with aggregated metrics
    func didReceive(_ payloads: [MXMetricPayload]) {
        for payload in payloads {
            processMetricPayload(payload)
        }
    }

    // Called when diagnostic reports are available
    func didReceive(_ payloads: [MXDiagnosticPayload]) {
        for payload in payloads {
            processDiagnosticPayload(payload)
        }
    }

    private func processMetricPayload(_ payload: MXMetricPayload) {
        // Launch time
        if let launchMetrics = payload.applicationLaunchMetrics {
            let resumeTime = launchMetrics.histogrammedTimeToFirstDraw
            Logger.data.info("Launch histogram: \(resumeTime)")
        }

        // Responsiveness (hang rate)
        if let responsiveness = payload.applicationResponsivenessMetrics {
            let hangTime = responsiveness.histogrammedApplicationHangTime
            Logger.data.info("Hang time histogram: \(hangTime)")
        }

        // CPU
        if let cpu = payload.cpuMetrics {
            let cumulativeCPUTime = cpu.cumulativeCPUTime
            Logger.data.info("CPU time: \(cumulativeCPUTime)")
        }

        // Memory
        if let memory = payload.memoryMetrics {
            let peakMemory = memory.peakMemoryUsage
            Logger.data.info("Peak memory: \(peakMemory)")
        }

        // Disk I/O
        if let disk = payload.diskIOMetrics {
            let writes = disk.cumulativeLogicalWrites
            Logger.data.info("Disk writes: \(writes)")
        }

        // Network
        if let network = payload.networkTransferMetrics {
            let upload = network.cumulativeCellularUpload
            let download = network.cumulativeCellularDownload
            Logger.data.info("Cellular: up=\(upload), down=\(download)")
        }

        // Export as JSON for server-side analytics
        let jsonData = payload.jsonRepresentation()
        sendToAnalyticsServer(jsonData)
    }

    private func processDiagnosticPayload(_ payload: MXDiagnosticPayload) {
        // Crash diagnostics
        if let crashes = payload.crashDiagnostics {
            for crash in crashes {
                Logger.data.fault("Crash: \(crash.jsonRepresentation())")
                let callStack = crash.callStackTree
                // Analyze call stack for crash root cause
            }
        }

        // Hang diagnostics
        if let hangs = payload.hangDiagnostics {
            for hang in hangs {
                let duration = hang.hangDuration
                Logger.data.error("Hang detected: \(duration)s")
            }
        }

        // Disk write diagnostics
        if let diskWrites = payload.diskWriteExceptionDiagnostics {
            for diagnostic in diskWrites {
                let totalWrites = diagnostic.totalWritesCaused
                Logger.data.error("Excessive disk writes: \(totalWrites)")
            }
        }

        // CPU exceptions
        if let cpuExceptions = payload.cpuExceptionDiagnostics {
            for exception in cpuExceptions {
                let totalCPU = exception.totalCPUTime
                Logger.data.error("CPU exception: \(totalCPU)s")
            }
        }
    }

    private func sendToAnalyticsServer(_ data: Data) {
        // Upload payload JSON to your analytics backend
    }
}
```

## Xcode Instruments Integration

```swift
/// Custom OSLog categories map to Instruments categories
/// View in Instruments > Logging > your subsystem

// For Instruments profiling, use os_signpost:
import os

final class InstrumentsHelper {
    private static let log = OSLog(subsystem: "com.yourapp", category: "Performance")

    /// Wrap any async operation with Instruments-visible signpost
    static func measure<T>(
        _ name: StaticString,
        _ operation: () async throws -> T
    ) async rethrows -> T {
        let id = OSSignpostID(log: log)
        os_signpost(.begin, log: log, name: name, signpostID: id)
        let result = try await operation()
        os_signpost(.end, log: log, name: name, signpostID: id)
        return result
    }

    /// Measure synchronous work
    static func measureSync<T>(
        _ name: StaticString,
        _ operation: () throws -> T
    ) rethrows -> T {
        let id = OSSignpostID(log: log)
        os_signpost(.begin, log: log, name: name, signpostID: id)
        let result = try operation()
        os_signpost(.end, log: log, name: name, signpostID: id)
        return result
    }
}

// Usage:
// let items = await InstrumentsHelper.measure("LoadItems") {
//     try await api.fetchItems()
// }
```

## Complete Logging Setup Example

```swift
import SwiftUI
import OSLog
import MetricKit

@main
struct MyApp: App {
    @State private var metricsManager = MetricsManager.shared

    init() {
        MetricsManager.shared.startCollecting()
        AppLogger.logAppLifecycle("App launched")
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    Logger.ui.info("Opened URL: \(url.absoluteString, privacy: .public)")
                }
        }
    }
}

// Network layer with structured logging
final class LoggingHTTPClient {
    private let session: URLSession
    private let signposter = OSSignposter(subsystem: "com.yourapp", category: "HTTP")

    init(session: URLSession = .shared) {
        self.session = session
    }

    func request(_ urlRequest: URLRequest) async throws -> (Data, HTTPURLResponse) {
        let method = urlRequest.httpMethod ?? "GET"
        let url = urlRequest.url!

        Logger.network.info("Starting \(method, privacy: .public) \(url.absoluteString, privacy: .public)")

        let state = signposter.beginInterval("HTTP", "\(method) \(url.path())")
        let start = CFAbsoluteTimeGetCurrent()

        do {
            let (data, response) = try await session.data(for: urlRequest)
            let httpResponse = response as! HTTPURLResponse
            let duration = CFAbsoluteTimeGetCurrent() - start

            signposter.endInterval("HTTP", state)

            AppLogger.logNetworkRequest(
                method: method,
                url: url,
                statusCode: httpResponse.statusCode,
                duration: duration
            )

            return (data, httpResponse)
        } catch {
            let duration = CFAbsoluteTimeGetCurrent() - start
            signposter.endInterval("HTTP", state)

            AppLogger.logNetworkRequest(
                method: method,
                url: url,
                statusCode: nil,
                duration: duration,
                error: error
            )

            throw error
        }
    }
}
```
