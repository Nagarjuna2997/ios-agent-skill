# CoreLocation

## CLLocationManager Setup and Permissions

Add to `Info.plist`:
- `NSLocationWhenInUseUsageDescription` — required for foreground location
- `NSLocationAlwaysAndWhenInUseUsageDescription` — required for background location

```swift
import CoreLocation

@Observable
class LocationManager: NSObject, CLLocationManagerDelegate {
    static let shared = LocationManager()

    var currentLocation: CLLocation?
    var authorizationStatus: CLAuthorizationStatus = .notDetermined
    var locationError: Error?

    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 10 // meters
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func requestAlwaysPermission() {
        manager.requestAlwaysAuthorization()
    }

    // Delegate: authorization changed
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus

        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            manager.startUpdatingLocation()
        case .denied, .restricted:
            locationError = LocationError.permissionDenied
        case .notDetermined:
            break
        @unknown default:
            break
        }
    }

    // Delegate: location updated
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        currentLocation = locations.last
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        locationError = error
    }
}

enum LocationError: LocalizedError {
    case permissionDenied
    case locationUnavailable

    var errorDescription: String? {
        switch self {
        case .permissionDenied: return "Location permission denied"
        case .locationUnavailable: return "Location unavailable"
        }
    }
}
```

## Continuous and One-Shot Location

```swift
extension LocationManager {

    // Start continuous updates
    func startTracking() {
        manager.startUpdatingLocation()
    }

    func stopTracking() {
        manager.stopUpdatingLocation()
    }

    // One-shot location request
    func requestCurrentLocation() {
        manager.requestLocation()
    }

    // Significant location changes (battery efficient, ~500m threshold)
    func startSignificantLocationMonitoring() {
        guard CLLocationManager.significantLocationChangeMonitoringAvailable() else { return }
        manager.startMonitoringSignificantLocationChanges()
    }
}

// SwiftUI usage
struct NearbyView: View {
    let locationManager = LocationManager.shared

    var body: some View {
        VStack {
            if let location = locationManager.currentLocation {
                Text("Lat: \(location.coordinate.latitude, specifier: "%.4f")")
                Text("Lon: \(location.coordinate.longitude, specifier: "%.4f")")
                Text("Accuracy: \(location.horizontalAccuracy, specifier: "%.0f")m")
            } else {
                Text("Locating...")
            }
        }
        .onAppear {
            locationManager.requestPermission()
        }
    }
}
```

## Geocoding and Reverse Geocoding

```swift
import CoreLocation

class GeocodingService {
    private let geocoder = CLGeocoder()

    // Address string to coordinates
    func geocode(address: String) async throws -> CLLocation {
        let placemarks = try await geocoder.geocodeAddressString(address)
        guard let location = placemarks.first?.location else {
            throw GeocodingError.noResults
        }
        return location
    }

    // Coordinates to address
    func reverseGeocode(location: CLLocation) async throws -> String {
        let placemarks = try await geocoder.reverseGeocodeLocation(location)
        guard let placemark = placemarks.first else {
            throw GeocodingError.noResults
        }
        return [
            placemark.name,
            placemark.locality,
            placemark.administrativeArea,
            placemark.country,
        ]
        .compactMap { $0 }
        .joined(separator: ", ")
    }

    // Structured address from placemark
    func structuredAddress(from location: CLLocation) async throws -> Address {
        let placemarks = try await geocoder.reverseGeocodeLocation(location)
        guard let pm = placemarks.first else { throw GeocodingError.noResults }
        return Address(
            street: [pm.subThoroughfare, pm.thoroughfare].compactMap { $0 }.joined(separator: " "),
            city: pm.locality ?? "",
            state: pm.administrativeArea ?? "",
            postalCode: pm.postalCode ?? "",
            country: pm.country ?? "",
            isoCountryCode: pm.isoCountryCode ?? ""
        )
    }
}

struct Address {
    let street, city, state, postalCode, country, isoCountryCode: String
}

enum GeocodingError: Error {
    case noResults
}
```

## Geofencing (CLCircularRegion)

```swift
extension LocationManager {

    func startMonitoringRegion(
        center: CLLocationCoordinate2D,
        radius: CLLocationDistance,
        identifier: String
    ) {
        guard CLLocationManager.isMonitoringAvailable(for: CLCircularRegion.self) else { return }

        let region = CLCircularRegion(
            center: center,
            radius: min(radius, manager.maximumRegionMonitoringDistance),
            identifier: identifier
        )
        region.notifyOnEntry = true
        region.notifyOnExit = true

        manager.startMonitoring(for: region)
    }

    func stopMonitoringRegion(identifier: String) {
        for region in manager.monitoredRegions {
            if region.identifier == identifier {
                manager.stopMonitoring(for: region)
            }
        }
    }

    // Delegate callbacks
    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        NotificationCenter.default.post(
            name: .didEnterGeofence,
            object: nil,
            userInfo: ["regionId": region.identifier]
        )
    }

    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        NotificationCenter.default.post(
            name: .didExitGeofence,
            object: nil,
            userInfo: ["regionId": region.identifier]
        )
    }
}

extension Notification.Name {
    static let didEnterGeofence = Notification.Name("didEnterGeofence")
    static let didExitGeofence = Notification.Name("didExitGeofence")
}

// Example: monitor arrival at office
let officeCoordinate = CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194)
LocationManager.shared.startMonitoringRegion(
    center: officeCoordinate,
    radius: 100,
    identifier: "office"
)
```

## iBeacon Monitoring

```swift
extension LocationManager {

    func startBeaconMonitoring(uuid: UUID, major: UInt16? = nil, minor: UInt16? = nil) {
        let constraint: CLBeaconIdentityConstraint
        if let major, let minor {
            constraint = CLBeaconIdentityConstraint(uuid: uuid, major: major, minor: minor)
        } else if let major {
            constraint = CLBeaconIdentityConstraint(uuid: uuid, major: major)
        } else {
            constraint = CLBeaconIdentityConstraint(uuid: uuid)
        }

        let region = CLBeaconRegion(beaconIdentityConstraint: constraint, identifier: uuid.uuidString)
        region.notifyEntryStateOnDisplay = true

        manager.startMonitoring(for: region)
        manager.startRangingBeacons(satisfying: constraint)
    }

    func locationManager(_ manager: CLLocationManager, didRange beacons: [CLBeacon],
                         satisfying constraint: CLBeaconIdentityConstraint) {
        for beacon in beacons {
            let proximity: String
            switch beacon.proximity {
            case .immediate: proximity = "immediate"
            case .near: proximity = "near"
            case .far: proximity = "far"
            case .unknown: proximity = "unknown"
            @unknown default: proximity = "unknown"
            }
            print("Beacon \(beacon.minor): \(proximity), accuracy: \(beacon.accuracy)m")
        }
    }
}
```

## Background Location Updates

```swift
// Enable in Xcode: Signing & Capabilities > Background Modes > Location updates

extension LocationManager {

    func enableBackgroundUpdates() {
        manager.allowsBackgroundLocationUpdates = true
        manager.pausesLocationUpdatesAutomatically = false
        manager.showsBackgroundLocationIndicator = true // Blue status bar indicator
    }

    // For navigation-style continuous tracking
    func startNavigationTracking() {
        manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation
        manager.activityType = .automotiveNavigation
        enableBackgroundUpdates()
        manager.startUpdatingLocation()
    }

    // For fitness tracking
    func startFitnessTracking() {
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.activityType = .fitness
        manager.distanceFilter = 5
        enableBackgroundUpdates()
        manager.startUpdatingLocation()
    }
}

// Visit monitoring (battery efficient, detects arrivals/departures)
extension LocationManager {
    func startVisitMonitoring() {
        manager.startMonitoringVisits()
    }

    func locationManager(_ manager: CLLocationManager, didVisit visit: CLVisit) {
        let coordinate = visit.coordinate
        let arrival = visit.arrivalDate
        let departure = visit.departureDate
        print("Visit at \(coordinate): arrived \(arrival), departed \(departure)")
    }
}
```
