# MapKit map with places

A `Map` with one `Marker` per place, selection bound to the place id, and compass and scale controls. It needs no permission because it does not read the user's location.

## Use

```swift
@State private var selection: MapPlace.ID?

PlacesMap(places: model.restaurants.map { MapPlace(id: $0.id, name: $0.name, latitude: $0.latitude, longitude: $0.longitude) }, selection: $selection)
    .sheet(item: Binding(get: { model.restaurant(id: selection) }, set: { _ in selection = nil })) { RestaurantView(restaurant: $0) }
```

## Rules

From [MapKit](../../docs/frameworks/mapkit.md):

- Use the SwiftUI `Map` with `MapContentBuilder` content (iOS 17), not `MKMapView`, unless a feature needs UIKit.
- Showing the user's location needs Core Location authorization and a usage string; add `location-services`.
- Sample coordinates are placeholders, not real businesses.
