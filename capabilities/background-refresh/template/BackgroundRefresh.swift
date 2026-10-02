import BackgroundTasks
import Foundation

enum BackgroundRefresh {
    static var identifier: String { (Bundle.main.bundleIdentifier ?? "app") + ".refresh" }

    /// Asks the system to run a refresh no earlier than `interval` from now.
    static func schedule(after interval: TimeInterval = 60 * 60) {
        let request = BGAppRefreshTaskRequest(identifier: identifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: interval)
        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            // Fails in the simulator for some configurations and when refresh is off in Settings; refresh then happens at launch.
        }
    }

    /// Runs the work and schedules the next refresh, whatever the outcome.
    static func run(_ work: () async throws -> Void) async {
        defer { schedule() }
        try? await work()
    }
}
