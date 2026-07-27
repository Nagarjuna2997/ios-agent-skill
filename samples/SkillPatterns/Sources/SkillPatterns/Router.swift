import Foundation
import Observation

// MARK: - Typed routes
//
// Hashable + Codable is what makes NavigationPath state restoration possible.
// Add Codable now even if you do not restore yet — retrofitting it later means
// touching every case.
// See docs/swiftui/deep-linking-and-routing.md.

public enum Route: Hashable, Codable, Sendable {
    case articleDetail(id: UUID)
    case bookmarks
    case settings
}

/// Modal presentation is a different axis from stack navigation — model it separately.
public enum Sheet: Identifiable, Hashable, Sendable {
    case share(articleID: UUID)
    case filter

    public var id: Self { self }
}

// MARK: - Deep links
//
// Parsing is a PURE function: URL in, intent out, no side effects and no router.
// That is what makes it unit-testable without launching an app.

public struct DeepLink: Equatable, Sendable {
    public var routes: [Route]
    public var sheet: Sheet?

    public init(routes: [Route], sheet: Sheet? = nil) {
        self.routes = routes
        self.sheet = sheet
    }
}

public enum DeepLinkParser {
    public static func parse(_ url: URL) -> DeepLink? {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else {
            return nil
        }

        let isCustomScheme = components.scheme == "skillpatterns"
        let isUniversalLink = components.scheme == "https"
            && components.host == "example.com"
        guard isCustomScheme || isUniversalLink else { return nil }

        var segments = components.path.split(separator: "/").map(String.init)
        // For a custom scheme the first path element is the host.
        let root = isCustomScheme ? components.host : (segments.isEmpty ? nil : segments.removeFirst())

        switch root {
        case "article":
            guard let raw = segments.first, let id = UUID(uuidString: raw) else { return nil }
            // Build the WHOLE stack, not just the leaf — landing on a detail
            // screen with an empty back stack strands the user.
            return DeepLink(routes: [.bookmarks, .articleDetail(id: id)])

        case "bookmarks":
            return DeepLink(routes: [.bookmarks])

        case "settings":
            return DeepLink(routes: [.settings])

        default:
            return nil          // unknown URL: ignore, never crash, never guess
        }
    }
}

// MARK: - Router
//
// One @MainActor @Observable object owns navigation state. Views send intent;
// they never mutate a path directly.

@MainActor
@Observable
public final class Router {
    public private(set) var routes: [Route] = []
    public var sheet: Sheet?

    /// Links can arrive before the app is ready (during launch, before sign-in).
    /// Queue rather than drop them.
    private var pendingLink: DeepLink?

    public var isReady = false {
        didSet { if isReady { flushPendingLink() } }
    }

    public init() {}

    // MARK: Stack

    public func push(_ route: Route) {
        routes.append(route)
    }

    public func pop() {
        guard !routes.isEmpty else { return }
        routes.removeLast()
    }

    public func popToRoot() {
        routes.removeAll()
    }

    /// Deep links replace the stack, so a link never piles screens on top of
    /// wherever the user happened to be.
    public func replaceStack(with newRoutes: [Route]) {
        routes = newRoutes
    }

    // MARK: Deep links

    @discardableResult
    public func handle(_ url: URL) -> Bool {
        guard let link = DeepLinkParser.parse(url) else { return false }
        apply(link)
        return true
    }

    public func apply(_ link: DeepLink) {
        guard isReady else {
            pendingLink = link
            return
        }
        sheet = nil                       // never open a link behind a sheet
        replaceStack(with: link.routes)
        if let sheet = link.sheet { self.sheet = sheet }
    }

    private func flushPendingLink() {
        guard let link = pendingLink else { return }
        pendingLink = nil
        apply(link)
    }
}
