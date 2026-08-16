import Foundation
import Observation

/// Domain error for this screen.
///
/// A bare `any Error` in view state is not enough to render from: the view
/// cannot tell "offline" from "the server rejected us" without string-matching,
/// which is why SKILL.md asks for a typed, localised error instead.
public enum HomeError: LocalizedError, Equatable {
    case loadFailed

    public var errorDescription: String? {
        switch self {
        case .loadFailed:
            String(localized: "Could not load your items.")
        }
    }

    public var recoverySuggestion: String? {
        switch self {
        case .loadFailed:
            String(localized: "Check your connection and pull to refresh.")
        }
    }
}

/// `@MainActor` is on the **type**, not on individual methods.
///
/// `@Observable` grants no isolation of its own. With the annotation only on
/// `loadItems()`, the stored properties stay non-isolated and any task can
/// mutate them while SwiftUI is reading — a data race that Swift 6 rejects and
/// that Swift 5 mode ships silently.
@MainActor
@Observable
public final class HomeViewModel {
    public private(set) var items: [Item] = []
    public private(set) var isLoading = false
    public private(set) var error: HomeError?

    private let repository: any ItemRepository

    /// No default value. `init(repository: any ItemRepository = LiveRepository())`
    /// would let a forgotten injection reach the network in a test or a preview
    /// with nothing to show that it happened.
    public init(repository: any ItemRepository) {
        self.repository = repository
    }

    public func loadItems() async {
        guard items.isEmpty, !isLoading else { return }
        await reload()
    }

    public func refresh() async {
        await reload()
    }

    private func reload() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            items = try await repository.items()
        } catch is CancellationError {
            // A deliberate no-op. Cancellation means the view went away or a
            // newer load superseded this one; surfacing it as a failure shows
            // an error banner for something the user did on purpose.
        } catch {
            self.error = .loadFailed
        }
    }
}
