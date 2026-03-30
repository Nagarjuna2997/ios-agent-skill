# MapKit

## Map View in SwiftUI

```swift
import SwiftUI
import MapKit

// Basic map with position binding
struct BasicMapView: View {
    @State private var position = MapCameraPosition.region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )
    )

    var body: some View {
        Map(position: $position) {
            // Map content goes here
        }
        .mapStyle(.standard(elevation: .realistic))
        .mapControls {
            MapUserLocationButton()
            MapCompass()
            MapScaleView()
            MapPitchToggle()
        }
    }
}

// Map styles
// .standard(elevation: .realistic, pointsOfInterest: .including([.restaurant, .cafe]))
// .imagery(elevation: .realistic)
// .hybrid(elevation: .realistic)
```

## Annotations

```swift
struct Place: Identifiable {
    let id = UUID()
    let name: String
    let coordinate: CLLocationCoordinate2D
    let category: String
}

struct AnnotatedMapView: View {
    let places: [Place] = [
        Place(name: "Ferry Building", coordinate: .init(latitude: 37.7956, longitude: -122.3933), category: "landmark"),
        Place(name: "Golden Gate Park", coordinate: .init(latitude: 37.7694, longitude: -122.4862), category: "park"),
        Place(name: "Chinatown", coordinate: .init(latitude: 37.7941, longitude: -122.4078), category: "neighborhood"),
    ]

    @State private var selectedPlace: Place?
    @State private var position = MapCameraPosition.automatic

    var body: some View {
        Map(position: $position, selection: $selectedPlace) {
            ForEach(places) { place in
                // Marker — system-styled pin
                Marker(place.name, coordinate: place.coordinate)
                    .tint(colorForCategory(place.category))
                    .tag(place)
            }
        }
        .onChange(of: selectedPlace) { _, newValue in
            if let place = newValue {
                print("Selected: \(place.name)")
            }
        }
    }

    func colorForCategory(_ category: String) -> Color {
        switch category {
        case "landmark": return .orange
        case "park": return .green
        case "neighborhood": return .purple
        default: return .red
        }
    }
}

// Custom annotation with SwiftUI view
struct CustomAnnotationMap: View {
    let places: [Place]

    var body: some View {
        Map {
            ForEach(places) { place in
                Annotation(place.name, coordinate: place.coordinate) {
                    VStack(spacing: 0) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.title)
                            .foregroundStyle(.red)
                        Text(place.name)
                            .font(.caption2)
                            .padding(4)
                            .background(.ultraThinMaterial)
                            .cornerRadius(4)
                    }
                }
            }
        }
    }
}
```

## Overlays

```swift
struct OverlayMapView: View {
    let routeCoordinates: [CLLocationCoordinate2D] = [
        CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        CLLocationCoordinate2D(latitude: 37.7849, longitude: -122.4094),
        CLLocationCoordinate2D(latitude: 37.7949, longitude: -122.3994),
    ]

    var body: some View {
        Map {
            // Circle overlay
            MapCircle(center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194), radius: 500)
                .foregroundStyle(.blue.opacity(0.2))
                .stroke(.blue, lineWidth: 2)

            // Polyline overlay (route)
            MapPolyline(coordinates: routeCoordinates)
                .stroke(.blue, lineWidth: 4)

            // Polygon overlay (area)
            MapPolygon(coordinates: [
                CLLocationCoordinate2D(latitude: 37.77, longitude: -122.42),
                CLLocationCoordinate2D(latitude: 37.78, longitude: -122.42),
                CLLocationCoordinate2D(latitude: 37.78, longitude: -122.41),
                CLLocationCoordinate2D(latitude: 37.77, longitude: -122.41),
            ])
            .foregroundStyle(.green.opacity(0.15))
            .stroke(.green, lineWidth: 2)
        }
    }
}
```

## MKLocalSearch for Place Search

```swift
@Observable
class PlaceSearchManager {
    var searchResults: [MKMapItem] = []
    var isSearching = false

    func search(query: String, region: MKCoordinateRegion) async {
        isSearching = true
        defer { isSearching = false }

        let request = MKLocalSearch.Request()
        request.naturalLanguageQuery = query
        request.region = region
        request.resultTypes = [.pointOfInterest, .address]

        do {
            let search = MKLocalSearch(request: request)
            let response = try await search.start()
            searchResults = response.mapItems
        } catch {
            searchResults = []
        }
    }

    // Category-based search
    func searchNearby(category: MKPointOfInterestCategory, region: MKCoordinateRegion) async {
        let request = MKLocalPointsOfInterestRequest(center: region.center, radius: 1000)
        request.pointOfInterestFilter = MKPointOfInterestFilter(including: [category])

        do {
            let search = MKLocalSearch(request: request)
            let response = try await search.start()
            searchResults = response.mapItems
        } catch {
            searchResults = []
        }
    }
}

// Usage in SwiftUI
struct SearchableMapView: View {
    @State private var searchManager = PlaceSearchManager()
    @State private var searchText = ""
    @State private var position = MapCameraPosition.automatic

    var body: some View {
        Map(position: $position) {
            ForEach(searchManager.searchResults, id: \.self) { item in
                if let coordinate = item.placemark.coordinate as CLLocationCoordinate2D? {
                    Marker(item.name ?? "Unknown", coordinate: coordinate)
                }
            }
        }
        .searchable(text: $searchText)
        .onSubmit(of: .search) {
            Task {
                await searchManager.search(
                    query: searchText,
                    region: MKCoordinateRegion(
                        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
                        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
                    )
                )
            }
        }
    }
}
```

## MKDirections for Routing

```swift
@Observable
class DirectionsManager {
    var route: MKRoute?
    var travelTime: TimeInterval = 0
    var distance: CLLocationDistance = 0

    func getDirections(
        from source: CLLocationCoordinate2D,
        to destination: CLLocationCoordinate2D,
        transportType: MKDirectionsTransportType = .automobile
    ) async throws {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: source))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: destination))
        request.transportType = transportType
        request.requestsAlternateRoutes = true

        let directions = MKDirections(request: request)
        let response = try await directions.calculate()

        if let primaryRoute = response.routes.first {
            route = primaryRoute
            travelTime = primaryRoute.expectedTravelTime
            distance = primaryRoute.distance
        }
    }

    func getETA(
        from source: CLLocationCoordinate2D,
        to destination: CLLocationCoordinate2D
    ) async throws -> TimeInterval {
        let request = MKDirections.Request()
        request.source = MKMapItem(placemark: MKPlacemark(coordinate: source))
        request.destination = MKMapItem(placemark: MKPlacemark(coordinate: destination))

        let directions = MKDirections(request: request)
        let response = try await directions.calculateETA()
        return response.expectedTravelTime
    }
}

// Display route on map
struct RouteMapView: View {
    @State private var directionsManager = DirectionsManager()

    var body: some View {
        Map {
            if let route = directionsManager.route {
                MapPolyline(route.polyline)
                    .stroke(.blue, lineWidth: 5)
            }
        }
        .overlay(alignment: .bottom) {
            if directionsManager.route != nil {
                VStack {
                    Text("Distance: \(directionsManager.distance / 1000, specifier: "%.1f") km")
                    Text("ETA: \(Int(directionsManager.travelTime / 60)) min")
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)
                .padding()
            }
        }
    }
}
```

## MapCamera and MapCameraPosition

```swift
struct CameraControlMap: View {
    @State private var position: MapCameraPosition = .automatic

    var body: some View {
        VStack {
            Map(position: $position)

            HStack {
                Button("SF") {
                    withAnimation {
                        position = .region(MKCoordinateRegion(
                            center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
                            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
                        ))
                    }
                }
                Button("3D View") {
                    withAnimation {
                        position = .camera(MapCamera(
                            centerCoordinate: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
                            distance: 1000,
                            heading: 45,
                            pitch: 60
                        ))
                    }
                }
                Button("User Location") {
                    withAnimation {
                        position = .userLocation(fallback: .automatic)
                    }
                }
            }
            .buttonStyle(.bordered)
        }
    }
}
```

## Look Around

```swift
struct LookAroundPreview: View {
    let coordinate: CLLocationCoordinate2D
    @State private var lookAroundScene: MKLookAroundScene?

    var body: some View {
        Group {
            if let scene = lookAroundScene {
                LookAroundPreview(initialScene: scene)
                    .frame(height: 200)
                    .cornerRadius(12)
            } else {
                ContentUnavailableView("No Look Around available", systemImage: "eye.slash")
            }
        }
        .task {
            await fetchScene()
        }
    }

    private func fetchScene() async {
        let request = MKLookAroundSceneRequest(coordinate: coordinate)
        lookAroundScene = try? await request.scene
    }
}
```

## iOS 18+ Additions

### AnyMapContent

`AnyMapContent` provides type-erased map content, enabling dynamic and conditional map building without complex generic constraints. This is useful when composing map content from heterogeneous sources or building map content conditionally at runtime.

```swift
import SwiftUI
import MapKit

struct DynamicMapView: View {
    let places: [Place]
    let routes: [MKRoute]
    @State private var showOverlays = true

    var body: some View {
        Map {
            // Use AnyMapContent for conditional content composition
            ForEach(places) { place in
                if place.category == "landmark" {
                    AnyMapContent(
                        Marker(place.name, coordinate: place.coordinate)
                            .tint(.orange)
                    )
                } else {
                    AnyMapContent(
                        Annotation(place.name, coordinate: place.coordinate) {
                            Image(systemName: "mappin.circle.fill")
                                .foregroundStyle(.blue)
                        }
                    )
                }
            }

            if showOverlays {
                ForEach(routes, id: \.self) { route in
                    AnyMapContent(
                        MapPolyline(route.polyline)
                            .stroke(.blue, lineWidth: 4)
                    )
                }
            }
        }
    }
}

// Building map content dynamically from a heterogeneous collection
struct MapContentBuilder {
    enum MapItem {
        case marker(name: String, coordinate: CLLocationCoordinate2D, tint: Color)
        case circle(center: CLLocationCoordinate2D, radius: Double)
        case polyline(coordinates: [CLLocationCoordinate2D])
    }

    @MapContentBuilder
    static func content(for items: [MapItem]) -> some MapContent {
        ForEach(Array(items.enumerated()), id: \.offset) { _, item in
            switch item {
            case .marker(let name, let coordinate, let tint):
                AnyMapContent(
                    Marker(name, coordinate: coordinate)
                        .tint(tint)
                )
            case .circle(let center, let radius):
                AnyMapContent(
                    MapCircle(center: center, radius: radius)
                        .foregroundStyle(.blue.opacity(0.2))
                        .stroke(.blue, lineWidth: 2)
                )
            case .polyline(let coordinates):
                AnyMapContent(
                    MapPolyline(coordinates: coordinates)
                        .stroke(.red, lineWidth: 3)
                )
            }
        }
    }
}
```

### MapSelection

iOS 18 enhances map selection handling with `MapSelection`, enabling richer interaction with map features including automatic selection of points of interest, physical features (mountains, lakes), and custom annotations.

```swift
import SwiftUI
import MapKit

struct SelectableMapView: View {
    @State private var selection: MapSelection<MKMapItem>?

    var body: some View {
        Map(selection: $selection) {
            Marker("Apple Park", coordinate: CLLocationCoordinate2D(latitude: 37.3349, longitude: -122.0090))
                .tag(MapSelection<MKMapItem>.tag(for: "apple-park"))
        }
        // Enable automatic selection of built-in map features
        .mapFeatureSelectionAccessory(.automatic)
        // React to selection changes
        .onChange(of: selection) { _, newSelection in
            if let selection = newSelection {
                handleSelection(selection)
            }
        }
        .sheet(item: $selection) { selectedItem in
            // Present details for the selected map feature
            MapItemDetailView(selection: selectedItem)
        }
    }

    private func handleSelection(_ selection: MapSelection<MKMapItem>) {
        // Handle different selection types
        print("Map item selected")
    }
}

// Detailed view for selected map features
struct MapItemDetailView: View {
    let selection: MapSelection<MKMapItem>

    var body: some View {
        VStack {
            Text("Selected Location")
                .font(.headline)
            // Display details about the selected feature
        }
        .padding()
        .presentationDetents([.medium])
    }
}
```

### MapKit Improvements Summary

Additional iOS 18 MapKit enhancements:

- **Unified Maps URLs**: `MKMapItem.openMaps(with:launchOptions:)` now generates universal map links that work consistently across iOS, macOS, and the web, making it easier to share locations across platforms.
- **Improved `.mapStyle()` options**: Additional customization for map rendering styles including finer control over point-of-interest filtering and label density.
- **MapFeature selection**: Tap on built-in map features (parks, transit stops, businesses) to get details without custom annotation overlays via `.mapFeatureSelectionAccessory()`.
- **Performance**: MapKit rendering and tile-loading performance improvements for large numbers of annotations and overlays.
