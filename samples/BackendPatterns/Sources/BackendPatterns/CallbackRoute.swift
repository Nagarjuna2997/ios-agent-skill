import Foundation

/// Route selection only. The auth SDK must still verify state/PKCE/nonce and exchange credentials.
public struct CallbackRoute: Sendable {
    public let scheme: String
    public let host: String
    public let path: String
    public init(scheme: String, host: String, path: String) {
        self.scheme = scheme; self.host = host; self.path = path
    }
    public func accepts(_ url: URL) -> Bool {
        guard let parts = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return false }
        return parts.scheme?.lowercased() == scheme.lowercased()
            && parts.host?.lowercased() == host.lowercased()
            && parts.percentEncodedPath == path
            && parts.user == nil && parts.password == nil && parts.port == nil
    }
}
