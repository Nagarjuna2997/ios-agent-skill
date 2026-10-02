import Foundation

enum UniversalLink {
    /// The associated domain from Info.plist, or nil while it is a placeholder.
    static var domain: String? {
        guard let value = Bundle.main.object(forInfoDictionaryKey: "ASSOCIATED_DOMAIN") as? String,
              !value.isEmpty, value != "REPLACE_ME", value.contains(".") else { return nil }
        return value
    }

    /// Rewrites https://<domain>/<screen>/<id> to the app's custom scheme so DeepLink can parse it.
    static func normalize(_ url: URL) -> URL? {
        guard url.scheme == "https", let domain, url.host() == domain else { return nil }
        let parts = url.pathComponents.filter { $0 != "/" }
        guard let screen = parts.first else { return nil }
        let rest = parts.dropFirst().joined(separator: "/")
        return URL(string: "\(DeepLink.scheme)://\(screen)\(rest.isEmpty ? "" : "/" + rest)")
    }

    /// An https link for sharing, or the custom-scheme link until a domain is configured.
    static func url(for link: DeepLink) -> URL? {
        guard let domain else { return link.url }
        switch link {
        case .screen(let name): return URL(string: "https://\(domain)/\(name)")
        case .item(let screen, let id): return URL(string: "https://\(domain)/\(screen)/\(id)")
        }
    }
}
