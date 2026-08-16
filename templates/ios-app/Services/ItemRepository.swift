import Foundation

// MARK: - Outbound boundary
//
// The view model depends on this protocol and never on a concrete client.
// SKILL.md: "Every dependency is a protocol existential injected through init.
// No default argument constructs a live implementation."
//
// It is also what makes `#Preview` work with no network and no disk — swap the
// stub in, and the screen renders every state on demand.

public protocol ItemRepository: Sendable {
    func items() async throws -> [Item]
}

/// Deterministic in-memory repository for previews and tests.
public struct StubItemRepository: ItemRepository {
    public let result: Result<[Item], any Error>
    /// Optional delay so a preview can show the loading state.
    public let delay: Duration

    public init(items: [Item] = Item.samples, delay: Duration = .zero) {
        self.result = .success(items)
        self.delay = delay
    }

    public init(failure: any Error, delay: Duration = .zero) {
        self.result = .failure(failure)
        self.delay = delay
    }

    public func items() async throws -> [Item] {
        if delay > .zero {
            try await Task.sleep(for: delay)
        }
        return try result.get()
    }
}
