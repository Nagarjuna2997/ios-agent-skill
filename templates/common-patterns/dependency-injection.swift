import Foundation
import Observation
import SwiftUI

// MARK: - Protocol-Based Dependency Injection

/// Define service protocols for dependency inversion.
protocol NetworkServiceProtocol: Sendable {
    func fetch<T: Decodable>(from path: String) async throws -> T
}

protocol StorageServiceProtocol: Sendable {
    func save<T: Encodable>(_ value: T, forKey key: String) throws
    func load<T: Decodable>(forKey key: String) throws -> T?
    func delete(forKey key: String)
}

protocol AnalyticsServiceProtocol: Sendable {
    func track(event: String, properties: [String: String])
}

// MARK: - Concrete Implementations

struct NetworkService: NetworkServiceProtocol {
    private let session: URLSession
    private let baseURL: URL
    private let decoder: JSONDecoder

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    func fetch<T: Decodable>(from path: String) async throws -> T {
        let url = baseURL.appendingPathComponent(path)
        let (data, _) = try await session.data(from: url)
        return try decoder.decode(T.self, from: data)
    }
}

struct UserDefaultsStorage: StorageServiceProtocol {
    private let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    func save<T: Encodable>(_ value: T, forKey key: String) throws {
        let data = try JSONEncoder().encode(value)
        defaults.set(data, forKey: key)
    }

    func load<T: Decodable>(forKey key: String) throws -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try JSONDecoder().decode(T.self, from: data)
    }

    func delete(forKey key: String) {
        defaults.removeObject(forKey: key)
    }
}

struct ConsoleAnalytics: AnalyticsServiceProtocol {
    func track(event: String, properties: [String: String]) {
        #if DEBUG
        print("[Analytics] \(event): \(properties)")
        #endif
    }
}

// MARK: - Mock Implementations (for testing and previews)

struct MockNetworkService: NetworkServiceProtocol {
    var mockData: [String: Any] = [:]

    func fetch<T: Decodable>(from path: String) async throws -> T {
        // Return mock data or throw
        throw URLError(.badServerResponse)
    }
}

struct MockStorage: StorageServiceProtocol {
    func save<T: Encodable>(_ value: T, forKey key: String) throws {}
    func load<T: Decodable>(forKey key: String) throws -> T? { nil }
    func delete(forKey key: String) {}
}

struct MockAnalytics: AnalyticsServiceProtocol {
    func track(event: String, properties: [String: String]) {}
}

// MARK: - Dependency Container

/// Central container holding all app dependencies.
@Observable
@MainActor
final class AppDependencies {
    let network: NetworkServiceProtocol
    let storage: StorageServiceProtocol
    let analytics: AnalyticsServiceProtocol

    init(
        network: NetworkServiceProtocol,
        storage: StorageServiceProtocol,
        analytics: AnalyticsServiceProtocol
    ) {
        self.network = network
        self.storage = storage
        self.analytics = analytics
    }

    /// Production dependencies
    static func live(baseURL: URL) -> AppDependencies {
        AppDependencies(
            network: NetworkService(baseURL: baseURL),
            storage: UserDefaultsStorage(),
            analytics: ConsoleAnalytics()
        )
    }

    /// Preview/test dependencies
    static var preview: AppDependencies {
        AppDependencies(
            network: MockNetworkService(),
            storage: MockStorage(),
            analytics: MockAnalytics()
        )
    }
}

// MARK: - SwiftUI Environment Integration

/// Use SwiftUI Environment for dependency injection.
extension EnvironmentValues {
    @Entry var dependencies: AppDependencies = .preview
}

// MARK: - Usage in App

struct DependencyInjectionExampleApp: View {
    @State private var dependencies = AppDependencies.live(
        baseURL: URL(string: "https://api.example.com")!
    )

    var body: some View {
        ContentExampleView()
            .environment(\.dependencies, dependencies)
    }
}

// MARK: - Usage in Views

struct ContentExampleView: View {
    @Environment(\.dependencies) private var dependencies

    var body: some View {
        Text("Using DI")
            .onAppear {
                dependencies.analytics.track(
                    event: "screen_viewed",
                    properties: ["screen": "content"]
                )
            }
    }
}

// MARK: - Usage in ViewModels

@Observable
@MainActor
final class ExampleViewModel {
    private let network: NetworkServiceProtocol
    private let storage: StorageServiceProtocol
    private(set) var items: [String] = []

    init(network: NetworkServiceProtocol, storage: StorageServiceProtocol) {
        self.network = network
        self.storage = storage
    }

    func loadItems() async {
        do {
            items = try await network.fetch(from: "/items")
        } catch {
            // Load from cache
            items = (try? storage.load(forKey: "cached_items")) ?? []
        }
    }
}
