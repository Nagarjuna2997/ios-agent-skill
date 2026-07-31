import Foundation
import Observation

/// The reference view model for this skill.
///
/// Demonstrates, in one type, the rules that appear throughout `docs/`:
/// - `@MainActor @Observable final class` — `@Observable` alone grants no isolation
/// - dependencies are `any Protocol` existentials injected through `init`,
///   with no default that constructs a live implementation
/// - `private(set)` on anything the view only reads
/// - `CancellationError` treated as a deliberate no-op, never a user-facing failure
/// - no `catch { }` and no `error = nil` — every failure surfaces
/// - stale-index safety: identity is re-resolved after every `await`
/// - re-entrancy safety: one in-flight task, superseded rather than overlapped
///
/// See patterns/mvvm.md and docs/swift/swift-concurrency.md.
@MainActor
@Observable
public final class ArticleListModel {

    // MARK: State

    public private(set) var articles: [Article] = []
    public private(set) var isLoading = false
    public var errorMessage: String?
    public var showBookmarkedOnly = false

    // MARK: Derived state — tracked automatically, no manual invalidation

    public var bookmarkCount: Int {
        articles.filter(\.isBookmarked).count
    }

    public var isEmpty: Bool {
        !isLoading && articles.isEmpty
    }

    // MARK: Dependencies — protocols only, no concrete types named

    private let fetchArticles: any FetchArticlesUseCase
    private let toggleBookmark: any ToggleBookmarkUseCase

    private var loadTask: Task<Void, Never>?

    public init(
        fetchArticles: any FetchArticlesUseCase,
        toggleBookmark: any ToggleBookmarkUseCase
    ) {
        self.fetchArticles = fetchArticles
        self.toggleBookmark = toggleBookmark
    }

    // MARK: Actions

    /// Supersedes any in-flight load rather than racing it.
    ///
    /// Without this, a slow first request can land *after* a fast second one and
    /// overwrite fresh data with stale data — a bug that only reproduces on bad
    /// networks.
    public func load() async {
        loadTask?.cancel()
        let task = Task { await performLoad() }
        loadTask = task
        await task.value
    }

    private func performLoad() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let fetched = try await fetchArticles.execute(bookmarkedOnly: showBookmarkedOnly)
            try Task.checkCancellation()   // don't publish a superseded result
            articles = fetched
            errorMessage = nil
        } catch is CancellationError {
            return                          // deliberate no-op, not a failure
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription
                ?? String(localized: "Couldn't load articles. Pull to refresh.")
        }
    }

    /// Optimistic update with a revert that is safe across the suspension point.
    public func toggleBookmark(for article: Article) async {
        guard let index = articles.firstIndex(where: { $0.id == article.id }) else { return }

        let original = articles[index].isBookmarked
        articles[index].isBookmarked.toggle()
        let desired = articles[index].isBookmarked

        do {
            try await toggleBookmark.execute(id: article.id, isBookmarked: desired)
        } catch is CancellationError {
            return
        } catch {
            // CRITICAL: `index` is stale after the await — the array may have been
            // reloaded, filtered, or reordered. Re-resolve by identity.
            guard let current = articles.firstIndex(where: { $0.id == article.id }) else { return }
            articles[current].isBookmarked = original
            errorMessage = (error as? LocalizedError)?.errorDescription
                ?? String(localized: "Couldn't update the bookmark.")
        }
    }

    public func dismissError() {
        errorMessage = nil
    }

    // MARK: Streamed updates
    //
    // Must live in this file: `articles` is `private(set)`, so only code in the
    // same file can write it. That is the seam working as intended — a stream
    // consumer bolted on from another file would have needed the setter opened
    // up for everyone.

    /// Applies pushed updates by identity until the sequence ends or the task
    /// is cancelled.
    ///
    /// Two rules are load-bearing here:
    ///
    /// - **Match by `id`, never by position.** Elements arrive interleaved with
    ///   whatever else mutates `articles`; an index captured before the `await`
    ///   points somewhere else by the time the next element lands.
    /// - **Cancellation is not a failure.** `AsyncStream`'s iterator returns
    ///   `nil` when the surrounding task is cancelled, so the loop simply ends.
    ///   Setting `errorMessage` here would surface "something went wrong" every
    ///   time the user navigates away mid-stream.
    ///
    /// An update for an unknown article is dropped rather than appended: this
    /// screen shows a fetched list, and inserting a row nothing asked for is a
    /// worse outcome than missing one.
    public func consumeUpdates(from source: any ArticleUpdateStream) async {
        for await update in source.updates() {
            guard let index = articles.firstIndex(where: { $0.id == update.id }) else {
                continue
            }
            articles[index] = update
        }
    }
}
