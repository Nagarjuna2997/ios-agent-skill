import Foundation

// MARK: - Streaming inbound boundary
//
// A push source — a websocket, a CloudKit subscription, a SwiftData change
// notification — reaches the presentation layer as an AsyncSequence behind a
// protocol, exactly like a request/response dependency does. The view model
// never names the transport.

public protocol ArticleUpdateStream: Sendable {
    /// Returns a **fresh** sequence per call.
    ///
    /// Handing out one shared sequence means a second consumer silently steals
    /// elements from the first — each element is delivered to exactly one
    /// iterator. That bug looks like "updates randomly go missing".
    func updates() -> AsyncStream<Article>
}

public struct StubArticleUpdates: ArticleUpdateStream {
    public let articles: [Article]

    public init(_ articles: [Article]) {
        self.articles = articles
    }

    public func updates() -> AsyncStream<Article> {
        AsyncStream { continuation in
            for article in articles {
                continuation.yield(article)
            }
            continuation.finish()
        }
    }
}

/// A stream that yields, then never finishes — so a test can prove the consumer
/// exits on cancellation rather than on the sequence ending.
public struct EndlessArticleUpdates: ArticleUpdateStream {
    public let articles: [Article]

    public init(_ articles: [Article]) {
        self.articles = articles
    }

    public func updates() -> AsyncStream<Article> {
        AsyncStream { continuation in
            for article in articles {
                continuation.yield(article)
            }
            // Deliberately no finish(): only cancellation ends this.
        }
    }
}

// MARK: - Deterministic suspension for tests
//
// Testing a state transition that exists only *during* an await needs the
// suspension to be controllable. The alternative — sleeping and hoping — is a
// test that passes on a fast machine and fails in CI, which is worse than no
// test because it teaches people to re-run until green.

public actor Gate {
    private var hasEntered = false
    private var isReleased = false
    private var enteredWaiters: [CheckedContinuation<Void, Never>] = []
    private var releaseWaiters: [CheckedContinuation<Void, Never>] = []

    public init() {}

    /// Suspends until the gated work has actually begun.
    public func waitUntilEntered() async {
        if hasEntered { return }
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            enteredWaiters.append(continuation)
        }
    }

    /// Lets the gated work proceed.
    public func release() {
        isReleased = true
        let waiters = releaseWaiters
        releaseWaiters.removeAll()
        for waiter in waiters {
            waiter.resume()
        }
    }

    func enter() {
        hasEntered = true
        let waiters = enteredWaiters
        enteredWaiters.removeAll()
        for waiter in waiters {
            waiter.resume()
        }
    }

    func waitForRelease() async {
        if isReleased { return }
        await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
            releaseWaiters.append(continuation)
        }
    }
}

/// A fetch that parks inside the `await` until the gate is released.
public struct GatedFetchArticles: FetchArticlesUseCase {
    public let gate: Gate
    public let articles: [Article]
    public let error: (any Error)?

    public init(gate: Gate, articles: [Article] = Article.samples, error: (any Error)? = nil) {
        self.gate = gate
        self.articles = articles
        self.error = error
    }

    public func execute(bookmarkedOnly: Bool) async throws -> [Article] {
        await gate.enter()
        await gate.waitForRelease()
        if let error { throw error }
        return bookmarkedOnly ? articles.filter(\.isBookmarked) : articles
    }
}
