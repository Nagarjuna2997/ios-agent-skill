import CoreLocation
import SwiftUI

enum LocationError: LocalizedError, Equatable {
    case denied
    case unavailable

    var errorDescription: String? {
        switch self {
        case .denied: "Location access is off for this app. You can turn it on in Settings."
        case .unavailable: "Your location is not available right now."
        }
    }
}

struct Coordinate: Equatable, Sendable {
    let latitude: Double
    let longitude: Double
}

@MainActor
protocol LocationProviding: AnyObject {
    func currentLocation() async throws -> Coordinate
}

@MainActor
final class LocationService: LocationProviding {
    private let manager = CLLocationManager()

    func currentLocation() async throws -> Coordinate {
        switch manager.authorizationStatus {
        case .denied, .restricted:
            throw LocationError.denied
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
        default:
            break
        }
        for try await update in CLLocationUpdate.liveUpdates() {
            try Task.checkCancellation()
            if manager.authorizationStatus == .denied || manager.authorizationStatus == .restricted {
                throw LocationError.denied
            }
            if let location = update.location {
                return Coordinate(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude)
            }
        }
        throw LocationError.unavailable
    }
}

@MainActor
final class PreviewLocationProvider: LocationProviding {
    var result: Result<Coordinate, LocationError> = .success(Coordinate(latitude: 37.3349, longitude: -122.0090))

    func currentLocation() async throws -> Coordinate {
        try result.get()
    }
}

/// Shown when location is denied: explains and links to Settings.
struct LocationDeniedView: View {
    var body: some View {
        ContentUnavailableView {
            Label("Location is off", systemImage: "location.slash")
        } description: {
            Text(LocationError.denied.localizedDescription)
        } actions: {
            if let url = URL(string: UIApplication.openSettingsURLString) {
                Link("Open Settings", destination: url)
            }
        }
    }
}

#Preview {
    LocationDeniedView()
}
