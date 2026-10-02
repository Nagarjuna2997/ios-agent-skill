import Foundation

protocol RestaurantServicing: Sendable {
    func restaurants() async throws -> [Restaurant]
    func menu(for restaurantId: String) async throws -> [MenuItem]
}

/// Built-in sample data, used until API_BASE_URL is configured.
struct SampleRestaurantService: RestaurantServicing {
    func restaurants() async throws -> [Restaurant] {
        SampleData.restaurants
    }

    func menu(for restaurantId: String) async throws -> [MenuItem] {
        SampleData.menu(for: restaurantId)
    }
}

struct APIRestaurantService: RestaurantServicing {
    let client: any APIClient

    func restaurants() async throws -> [Restaurant] {
        try await client.send(APIRequest<[Restaurant]>.get("restaurants"))
    }

    func menu(for restaurantId: String) async throws -> [MenuItem] {
        try await client.send(APIRequest<[MenuItem]>.get("restaurants/\(restaurantId)/menu"))
    }
}
