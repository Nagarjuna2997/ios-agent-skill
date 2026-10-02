import ActivityKit
import Foundation

/// A multi-step activity such as an order, trip or timer.
struct ProgressActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable, Sendable {
        var step: Int
        var stepTitle: String
        var eta: Date?
    }

    var title: String
    var subtitle: String
    var steps: [String]
}

extension ProgressActivityAttributes.ContentState {
    func fraction(of total: Int) -> Double {
        total > 1 ? Double(step) / Double(total - 1) : 1
    }
}
