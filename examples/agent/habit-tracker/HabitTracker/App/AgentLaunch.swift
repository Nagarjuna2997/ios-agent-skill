import Foundation

/// The build agent launches the app with `-ios-agent-screen <screen-id>` to open
/// each top-level screen for a screenshot, and with `-ios-agent-sample-data YES` to
/// seed an isolated in-memory demo store. Launch arguments of the form `-key value`
/// are readable through UserDefaults' argument domain.
enum AgentLaunch {
    static var requestedScreen: String? {
        UserDefaults.standard.string(forKey: "ios-agent-screen")
    }

    /// True only for `-ios-agent-sample-data YES` launches; production launches never seed data.
    static var usesSampleData: Bool {
        UserDefaults.standard.bool(forKey: "ios-agent-sample-data")
    }
}
