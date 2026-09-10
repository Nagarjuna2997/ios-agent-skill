import Foundation

public enum HTTPSQuery {
    public enum QueryError: Error { case invalidBaseURL, invalidResult }

    /// Adds query values using URLComponents, preserving repeated names and existing values.
    /// The URL is constructed only; this API does not perform networking.
    public static func appending(_ items: [URLQueryItem], to url: URL) throws -> URL {
        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              components.scheme?.lowercased() == "https",
              let host = components.host, !host.isEmpty,
              components.user == nil, components.password == nil else {
            throw QueryError.invalidBaseURL
        }
        components.queryItems = (components.queryItems ?? []) + items
        // Some form-style servers interpret a literal '+' as a space.
        components.percentEncodedQuery = components.percentEncodedQuery?.replacingOccurrences(of: "+", with: "%2B")
        guard let result = components.url else { throw QueryError.invalidResult }
        return result
    }
}
