import Foundation
import SwiftUI

enum APIConfiguration {
    /// The configured base URL, or nil while API_BASE_URL is missing or a placeholder.
    static func baseURL(bundle: Bundle = .main) -> URL? {
        guard let value = bundle.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
              !value.isEmpty, value != "REPLACE_ME",
              let url = URL(string: value), url.scheme == "https", url.host() != nil else {
            return nil
        }
        return url
    }

    static func makeClient(bundle: Bundle = .main, session: URLSession = .shared) -> URLSessionAPIClient? {
        baseURL(bundle: bundle).map { URLSessionAPIClient(baseURL: $0, session: session) }
    }
}

struct APINotConfiguredView: View {
    var body: some View {
        ContentUnavailableView(
            "Server not configured",
            systemImage: "network.slash",
            description: Text("Set API_BASE_URL in the project's .env file to an https address, then rebuild.")
        )
    }
}

#Preview {
    APINotConfiguredView()
}
