import MapKit
import SwiftUI

struct MapPlace: Identifiable, Hashable, Sendable {
    let id: String
    let name: String
    let latitude: Double
    let longitude: Double

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

struct PlacesMap: View {
    let places: [MapPlace]
    @Binding var selection: MapPlace.ID?
    @State private var position: MapCameraPosition = .automatic

    var body: some View {
        Map(position: $position, selection: $selection) {
            ForEach(places) { place in
                Marker(place.name, systemImage: "mappin", coordinate: place.coordinate)
                    .tag(place.id)
            }
        }
        .mapControls {
            MapCompass()
            MapScaleView()
        }
        .accessibilityLabel(Text("Map with \(places.count) places"))
    }
}

#Preview {
    PlacesMapPreview()
}

private struct PlacesMapPreview: View {
    @State private var selection: MapPlace.ID?

    var body: some View {
        PlacesMap(
            places: [
                MapPlace(id: "1", name: "Sample Place A", latitude: 37.7749, longitude: -122.4194),
                MapPlace(id: "2", name: "Sample Place B", latitude: 37.7849, longitude: -122.4094),
            ],
            selection: $selection
        )
    }
}
