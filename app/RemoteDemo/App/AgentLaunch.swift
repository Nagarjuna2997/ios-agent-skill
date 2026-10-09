import Foundation

/// The build agent uses launch arguments to select a screenshot screen and
/// seed synthetic demo data. These flags affect only the agent-launched process.
enum AgentLaunch {
    static var requestedScreen: String? {
        UserDefaults.standard.string(forKey: "ios-agent-screen")
    }

    static var usesSampleData: Bool {
        UserDefaults.standard.bool(forKey: "ios-agent-sample-data")
    }
}
