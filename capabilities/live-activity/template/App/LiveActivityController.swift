import ActivityKit
import Foundation
import Observation

@MainActor
protocol LiveActivityControlling: AnyObject {
    var state: LiveActivityController.State { get }
    func start(title: String, subtitle: String, steps: [String]) throws
    func advance(to step: Int, eta: Date?) async
    func end() async
}

enum LiveActivityError: LocalizedError {
    case disabled
    case noSteps

    var errorDescription: String? {
        switch self {
        case .disabled: "Live Activities are turned off for this app in Settings."
        case .noSteps: "A Live Activity needs at least one step."
        }
    }
}

@MainActor
@Observable
final class LiveActivityController: LiveActivityControlling {
    enum State: Equatable {
        case idle
        case running(step: Int, of: Int)
        case ended
        case failed(String)
    }

    private(set) var state: State = .idle
    private var activityID: String?
    private var steps: [String] = []

    func start(title: String, subtitle: String, steps: [String]) throws {
        guard !steps.isEmpty else { throw LiveActivityError.noSteps }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            state = .failed(LiveActivityError.disabled.localizedDescription)
            throw LiveActivityError.disabled
        }
        let attributes = ProgressActivityAttributes(title: title, subtitle: subtitle, steps: steps)
        let initial = ProgressActivityAttributes.ContentState(step: 0, stepTitle: steps[0], eta: nil)
        do {
            let activity = try Activity.request(attributes: attributes, content: ActivityContent(state: initial, staleDate: nil), pushType: nil)
            activityID = activity.id
            self.steps = steps
            state = .running(step: 0, of: steps.count)
        } catch {
            state = .failed(error.localizedDescription)
            throw error
        }
    }

    func advance(to step: Int, eta: Date?) async {
        guard let activityID, steps.indices.contains(step) else { return }
        let content = ProgressActivityAttributes.ContentState(step: step, stepTitle: steps[step], eta: eta)
        await Self.update(id: activityID, state: content)
        state = .running(step: step, of: steps.count)
    }

    func end() async {
        guard let activityID else { return }
        await Self.end(id: activityID)
        self.activityID = nil
        state = .ended
    }

    // Activity objects are looked up by id inside nonisolated functions so no
    // activity reference crosses actor boundaries.
    nonisolated private static func update(id: String, state: ProgressActivityAttributes.ContentState) async {
        guard let activity = Activity<ProgressActivityAttributes>.activities.first(where: { $0.id == id }) else { return }
        await activity.update(ActivityContent(state: state, staleDate: nil))
    }

    nonisolated private static func end(id: String) async {
        guard let activity = Activity<ProgressActivityAttributes>.activities.first(where: { $0.id == id }) else { return }
        await activity.end(nil, dismissalPolicy: .default)
    }
}

/// For previews and tests: records calls, never touches ActivityKit.
@MainActor
final class PreviewLiveActivityController: LiveActivityControlling {
    private(set) var state: LiveActivityController.State = .idle
    private var total = 0

    func start(title: String, subtitle: String, steps: [String]) throws {
        total = steps.count
        state = .running(step: 0, of: total)
    }

    func advance(to step: Int, eta: Date?) async {
        state = .running(step: step, of: total)
    }

    func end() async {
        state = .ended
    }
}
