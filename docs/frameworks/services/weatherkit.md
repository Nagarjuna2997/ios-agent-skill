# WeatherKit

## Setup Requirements

WeatherKit requires an **Apple Developer Program membership** and capability registration.

1. Enable **WeatherKit** capability in Xcode (Signing & Capabilities)
2. Register the WeatherKit service in App Store Connect > Identifiers > App Services
3. Add `import WeatherKit` to your source files

Rate limits: 500,000 calls/month included free. Additional calls require a paid tier.

## WeatherService Basics

```swift
import WeatherKit
import CoreLocation

@Observable
final class WeatherManager {
    var currentWeather: CurrentWeather?
    var hourlyForecast: [HourWeather] = []
    var dailyForecast: [DayWeather] = []
    var alerts: [WeatherAlert] = []
    var minuteForecast: [MinuteWeather]?
    var attribution: WeatherAttribution?
    var error: Error?

    private let service = WeatherService.shared

    /// Fetch all weather data for a location
    func fetchWeather(for location: CLLocation) async {
        do {
            let weather = try await service.weather(for: location)

            currentWeather = weather.currentWeather
            hourlyForecast = Array(weather.hourlyForecast.prefix(24))
            dailyForecast = Array(weather.dailyForecast.prefix(10))
            alerts = weather.weatherAlerts ?? []
            minuteForecast = weather.minuteForecast.map { Array($0) }

            // Always fetch attribution (required by Apple)
            attribution = try await service.attribution
        } catch {
            self.error = error
        }
    }
}
```

## Current Weather

```swift
func displayCurrentWeather(_ current: CurrentWeather) {
    let temp = current.temperature                    // Measurement<UnitTemperature>
    let apparentTemp = current.apparentTemperature
    let condition = current.condition                  // .clear, .cloudy, .rain, etc.
    let symbolName = current.symbolName                // SF Symbol name
    let humidity = current.humidity                    // 0.0 ... 1.0
    let windSpeed = current.wind.speed                // Measurement<UnitSpeed>
    let windDirection = current.wind.compassDirection  // .north, .northEast, etc.
    let uvIndex = current.uvIndex.value               // Int
    let pressure = current.pressure                   // Measurement<UnitPressure>
    let visibility = current.visibility               // Measurement<UnitLength>
    let dewPoint = current.dewPoint

    // Format for display
    let formatter = MeasurementFormatter()
    formatter.unitOptions = .providedUnit
    let tempString = temp.formatted(.measurement(width: .abbreviated))
    // e.g., "72°F" or "22°C" based on locale
}
```

## Hourly Forecast

```swift
func processHourlyForecast(_ hours: [HourWeather]) {
    for hour in hours {
        let date = hour.date
        let temp = hour.temperature
        let condition = hour.condition
        let symbol = hour.symbolName
        let precipChance = hour.precipitationChance    // 0.0 ... 1.0
        let precipAmount = hour.precipitationAmount    // Measurement<UnitLength>
        let humidity = hour.humidity
        let windSpeed = hour.wind.speed
        let cloudCover = hour.cloudCover               // 0.0 ... 1.0
    }
}
```

## Daily Forecast

```swift
func processDailyForecast(_ days: [DayWeather]) {
    for day in days {
        let date = day.date
        let highTemp = day.highTemperature
        let lowTemp = day.lowTemperature
        let condition = day.condition
        let symbol = day.symbolName
        let precipChance = day.precipitationChance
        let sunrise = day.sun.sunrise                 // Date?
        let sunset = day.sun.sunset                   // Date?
        let moonPhase = day.moon.phase                // .new, .full, .firstQuarter, etc.
        let moonrise = day.moon.moonrise
        let uvIndexMax = day.uvIndex.value
        let windMax = day.wind.speed
    }
}
```

## Weather Alerts

```swift
func processAlerts(_ alerts: [WeatherAlert]) {
    for alert in alerts {
        let summary = alert.summary            // Human-readable summary
        let severity = alert.severity          // .minor, .moderate, .severe, .extreme
        let source = alert.source              // Issuing authority
        let region = alert.region              // Affected region name
        let detailsURL = alert.detailsURL     // URL for full details

        switch alert.severity {
        case .extreme:
            // Show prominent red banner
            break
        case .severe:
            // Show orange warning
            break
        case .moderate:
            // Show yellow advisory
            break
        case .minor:
            // Show informational notice
            break
        default:
            break
        }
    }
}
```

## Minute-by-Minute Precipitation

```swift
/// Available only in select countries (US, UK, Ireland, etc.)
func processMinuteForecast(_ minutes: [MinuteWeather]?) {
    guard let minutes else {
        // Minute forecast not available for this location
        return
    }

    for minute in minutes {
        let date = minute.date
        let precipChance = minute.precipitationChance
        let precipIntensity = minute.precipitationIntensity // Measurement<UnitSpeed>
    }

    // Summarize: will it rain in the next hour?
    let precipitationExpected = minutes.contains { $0.precipitationChance > 0.5 }
    let firstRainMinute = minutes.first { $0.precipitationChance > 0.5 }
}
```

## Apple Attribution Requirements (Mandatory)

Apple **requires** you to display the Apple Weather attribution in your app.

```swift
import SwiftUI
import WeatherKit

struct WeatherAttributionView: View {
    let attribution: WeatherAttribution?

    var body: some View {
        if let attribution {
            VStack(spacing: 4) {
                // Required: Apple Weather logo
                AsyncImage(url: attribution.combinedMarkDarkURL) { image in
                    image.resizable().scaledToFit()
                } placeholder: {
                    EmptyView()
                }
                .frame(height: 14)

                // Required: link to legal attribution page
                Link("Weather Data Sources", destination: attribution.legalPageURL)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
```

## Caching Strategy

```swift
actor WeatherCache {
    static let shared = WeatherCache()

    private var cache: [String: CachedWeather] = [:]
    private let maxAge: TimeInterval = 900 // 15 minutes

    struct CachedWeather {
        let weather: Weather
        let timestamp: Date
    }

    func weather(for key: String) -> Weather? {
        guard let cached = cache[key],
              Date().timeIntervalSince(cached.timestamp) < maxAge else {
            cache[key] = nil
            return nil
        }
        return cached.weather
    }

    func store(_ weather: Weather, for key: String) {
        cache[key] = CachedWeather(weather: weather, timestamp: Date())
    }

    /// Create a cache key from coordinates (rounded to reduce duplicate calls)
    static func key(lat: Double, lon: Double) -> String {
        let roundedLat = (lat * 100).rounded() / 100
        let roundedLon = (lon * 100).rounded() / 100
        return "\(roundedLat),\(roundedLon)"
    }
}
```

## Complete Weather App Example

```swift
import SwiftUI
import WeatherKit
import CoreLocation

@Observable
final class WeatherViewModel {
    var currentWeather: CurrentWeather?
    var hourly: [HourWeather] = []
    var daily: [DayWeather] = []
    var attribution: WeatherAttribution?
    var isLoading = false
    var errorMessage: String?

    private let service = WeatherService.shared

    func load(latitude: Double, longitude: Double) async {
        isLoading = true
        defer { isLoading = false }

        let location = CLLocation(latitude: latitude, longitude: longitude)
        let cacheKey = WeatherCache.key(lat: latitude, lon: longitude)

        // Check cache first
        if let cached = await WeatherCache.shared.weather(for: cacheKey) {
            applyWeather(cached)
            return
        }

        do {
            let weather = try await service.weather(for: location)
            await WeatherCache.shared.store(weather, for: cacheKey)
            applyWeather(weather)
            attribution = try await service.attribution
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func applyWeather(_ weather: Weather) {
        currentWeather = weather.currentWeather
        hourly = Array(weather.hourlyForecast.prefix(24))
        daily = Array(weather.dailyForecast.prefix(10))
    }
}

struct WeatherAppView: View {
    @State private var viewModel = WeatherViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Current conditions
                if let current = viewModel.currentWeather {
                    CurrentWeatherCard(weather: current)
                }

                // Hourly
                if !viewModel.hourly.isEmpty {
                    HourlyForecastRow(hours: viewModel.hourly)
                }

                // Daily
                if !viewModel.daily.isEmpty {
                    DailyForecastList(days: viewModel.daily)
                }

                // Attribution (required)
                WeatherAttributionView(attribution: viewModel.attribution)
                    .padding(.top, 8)
            }
            .padding()
        }
        .overlay {
            if viewModel.isLoading {
                ProgressView()
            }
        }
        .task {
            await viewModel.load(latitude: 37.7749, longitude: -122.4194)
        }
    }
}

struct CurrentWeatherCard: View {
    let weather: CurrentWeather

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: weather.symbolName)
                .font(.system(size: 60))
                .symbolRenderingMode(.multicolor)

            Text(weather.temperature.formatted(.measurement(width: .abbreviated)))
                .font(.system(size: 56, weight: .thin, design: .rounded))

            Text(weather.condition.description)
                .font(.title3)
                .foregroundStyle(.secondary)

            HStack(spacing: 24) {
                Label(
                    weather.wind.speed.formatted(.measurement(width: .abbreviated)),
                    systemImage: "wind"
                )
                Label(
                    "\(Int(weather.humidity * 100))%",
                    systemImage: "humidity"
                )
                Label(
                    "UV \(weather.uvIndex.value)",
                    systemImage: "sun.max"
                )
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

struct HourlyForecastRow: View {
    let hours: [HourWeather]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(hours, id: \.date) { hour in
                    VStack(spacing: 6) {
                        Text(hour.date, format: .dateTime.hour())
                            .font(.caption)
                        Image(systemName: hour.symbolName)
                            .symbolRenderingMode(.multicolor)
                        Text(hour.temperature.formatted(.measurement(width: .abbreviated)))
                            .font(.callout.bold())
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

struct DailyForecastList: View {
    let days: [DayWeather]

    var body: some View {
        VStack(spacing: 12) {
            ForEach(days, id: \.date) { day in
                HStack {
                    Text(day.date, format: .dateTime.weekday(.abbreviated))
                        .frame(width: 40, alignment: .leading)
                    Image(systemName: day.symbolName)
                        .symbolRenderingMode(.multicolor)
                        .frame(width: 30)
                    Spacer()
                    Text(day.lowTemperature.formatted(.measurement(width: .abbreviated)))
                        .foregroundStyle(.secondary)
                    Text(day.highTemperature.formatted(.measurement(width: .abbreviated)))
                }
                .font(.callout)
            }
        }
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
```
