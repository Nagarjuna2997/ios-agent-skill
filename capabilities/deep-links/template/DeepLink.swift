import Foundation
import Observation

/// A route the app can open from a link: `scheme://<screen>` or `scheme://<screen>/<id>`.
enum DeepLink: Equatable, Hashable, Sendable {
    case screen(String)
    case item(screen: String, id: String)

    /// The first URL scheme registered in Info.plist (the lowercased app name).
    static var scheme: String {
        let types = Bundle.main.object(forInfoDictionaryKey: "CFBundleURLTypes") as? [[String: Any]]
        return (types?.first?["CFBundleURLSchemes"] as? [String])?.first ?? "app"
    }

    init?(url: URL, scheme: String = DeepLink.scheme) {
        guard url.scheme?.lowercased() == scheme.lowercased(), let host = url.host(), Self.isSafe(host) else { return nil }
        let parts = url.pathComponents.filter { $0 != "/" }
        switch parts.count {
        case 0: self = .screen(host)
        case 1 where Self.isSafe(parts[0]): self = .item(screen: host, id: parts[0])
        default: return nil
        }
    }

    var url: URL? {
        switch self {
        case .screen(let name): URL(string: "\(Self.scheme)://\(name)")
        case .item(let screen, let id): URL(string: "\(Self.scheme)://\(screen)/\(id)")
        }
    }

    private static func isSafe(_ part: String) -> Bool {
        !part.isEmpty && part.count <= 128 && part.allSatisfy { $0.isLetter || $0.isNumber || $0 == "-" || $0 == "_" }
    }
}

@MainActor
@Observable
final class DeepLinkRouter {
    private(set) var pending: DeepLink?

    func open(_ url: URL) {
        pending = DeepLink(url: url)
    }

    func consume() {
        pending = nil
    }
}
