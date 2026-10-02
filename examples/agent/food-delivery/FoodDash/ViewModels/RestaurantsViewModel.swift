import CoreLocation
import Foundation

@MainActor
@Observable
final class RestaurantsViewModel {
    enum Phase {
        case loading
        case loaded
        case failed(String)
    }

    enum Mode: String, CaseIterable, Identifiable {
        case list
        case map

        var id: String { rawValue }
        var title: String { self == .list ? "List" : "Map" }
    }

    private(set) var phase: Phase = .loading
    private(set) var restaurants: [Restaurant] = []
    private(set) var userLocation: Coordinate?
    private(set) var isLocating = false
    var mode: Mode = .list
    var searchText = ""
    var selectedID: String?
    var locationDenied = false

    private var hasLoaded = false
    private let service: any RestaurantServicing
    private let location: any LocationProviding

    init(service: any RestaurantServicing, location: any LocationProviding) {
        self.service = service
        self.location = location
    }

    func load(force: Bool = false) async {
        if hasLoaded && !force { return }
        if restaurants.isEmpty { phase = .loading }
        do {
            restaurants = try await service.restaurants()
            phase = .loaded
            hasLoaded = true
        } catch is CancellationError {
            return
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }

    func useMyLocation() async {
        guard !isLocating else { return }
        isLocating = true
        defer { isLocating = false }
        do {
            userLocation = try await location.currentLocation()
        } catch let error as LocationError {
            if error == .denied { locationDenied = true }
        } catch {
            return
        }
    }

    var visible: [Restaurant] {
        let filtered = searchText.isEmpty ? restaurants : restaurants.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) || $0.cuisine.localizedCaseInsensitiveContains(searchText)
        }
        guard userLocation != nil else { return filtered }
        return filtered.sorted { (distance(to: $0) ?? .infinity) < (distance(to: $1) ?? .infinity) }
    }

    var mapPlaces: [MapPlace] {
        visible.map { MapPlace(id: $0.id, name: $0.name, latitude: $0.latitude, longitude: $0.longitude) }
    }

    var selectedRestaurant: Restaurant? {
        restaurants.first { $0.id == selectedID }
    }

    func distance(to restaurant: Restaurant) -> CLLocationDistance? {
        guard let user = userLocation else { return nil }
        return CLLocation(latitude: user.latitude, longitude: user.longitude)
            .distance(from: CLLocation(latitude: restaurant.latitude, longitude: restaurant.longitude))
    }

    func distanceText(for restaurant: Restaurant) -> String? {
        distance(to: restaurant).map {
            Measurement(value: $0, unit: UnitLength.meters).formatted(.measurement(width: .abbreviated, usage: .road))
        }
    }
}
