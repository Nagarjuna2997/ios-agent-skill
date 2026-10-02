import Foundation

struct Restaurant: Identifiable, Hashable, Codable, Sendable {
    let id: String
    let name: String
    let cuisine: String
    let latitude: Double
    let longitude: Double
    let rating: Double?
    let imageURL: URL?

    enum CodingKeys: String, CodingKey {
        case id, name, cuisine, latitude, longitude, rating
        case imageURL = "imageUrl"
    }
}

struct MenuItem: Identifiable, Hashable, Codable, Sendable {
    let id: String
    let restaurantId: String
    let name: String
    let details: String?
    let priceCents: Int
}
