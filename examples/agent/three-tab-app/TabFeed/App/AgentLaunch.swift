import Foundation

/// The build agent launches the app with `-ios-agent-screen <screen-id>` to open
/// each top-level screen for a screenshot, and with `-ios-agent-sample-data YES`
/// to show the plan's sample records. Launch arguments of the form `-key value`
/// are readable through UserDefaults' argument domain.
enum AgentLaunch {
    static var requestedScreen: String? {
        UserDefaults.standard.string(forKey: "ios-agent-screen")
    }

    /// True only for demo launches; the app then uses an isolated in-memory store.
    static var usesSampleData: Bool {
        UserDefaults.standard.bool(forKey: "ios-agent-sample-data")
    }
}
