import SwiftUI
import MapKit

struct LocationMap: View {
    let title: String
    let coordinate: CLLocationCoordinate2D
    var body: some View { Map { Marker(title, coordinate: coordinate) } }
}
@MainActor
enum MapsService {
    static func search(_ query: String, region: MKCoordinateRegion) async throws -> [MKMapItem] {
        let request = MKLocalSearch.Request(); request.naturalLanguageQuery = query; request.region = region
        let search = MKLocalSearch(request: request)
        return try await search.start().mapItems
    }
    static func directions(from: MKMapItem, to: MKMapItem, transport: MKDirectionsTransportType = .walking) async throws -> [MKRoute] {
        let request = MKDirections.Request(); request.source = from; request.destination = to; request.transportType = transport
        return try await MKDirections(request: request).calculate().routes
    }
    @discardableResult static func open(_ item: MKMapItem) -> Bool {
        item.openInMaps(launchOptions: [MKLaunchOptionsDirectionsModeKey: MKLaunchOptionsDirectionsModeWalking])
    }
}
