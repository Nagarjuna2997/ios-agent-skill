# Location (when in use)

`LocationService` wraps Core Location's `CLLocationUpdate.liveUpdates()` behind `LocationProviding`, returning one coordinate per request.

## Use

```swift
do {
    let coordinate = try await location.currentLocation()
    await model.loadNearby(coordinate)
} catch LocationError.denied {
    showDenied = true
}
```

## Rules

From [Core Location](../../docs/frameworks/core-location.md):

- Ask in context (when the user taps "Near me"), not at launch.
- The purpose string is shown in the permission alert; make it specific to the app.
- Denied and restricted are normal outcomes; offer a way to Settings and a manual alternative such as typing an address.
