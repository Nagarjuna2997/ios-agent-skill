# Foundation Framework

## URLSession — Async Networking

```swift
// Basic async data request
func fetchUser(id: Int) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          (200...299).contains(httpResponse.statusCode) else {
        throw URLError(.badServerResponse)
    }
    return try JSONDecoder().decode(User.self, from: data)
}

// Download with progress
func downloadFile(from url: URL) async throws -> URL {
    let (localURL, response) = try await URLSession.shared.download(from: url)

    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw URLError(.badServerResponse)
    }
    // Move from temp to permanent location
    let destination = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        .appendingPathComponent(url.lastPathComponent)
    try FileManager.default.moveItem(at: localURL, to: destination)
    return destination
}

// Upload data
func uploadImage(_ imageData: Data) async throws -> UploadResponse {
    var request = URLRequest(url: URL(string: "https://api.example.com/upload")!)
    request.httpMethod = "POST"
    request.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")

    let (data, _) = try await URLSession.shared.upload(for: request, from: imageData)
    return try JSONDecoder().decode(UploadResponse.self, from: data)
}

// Custom URLSession configuration
let config = URLSessionConfiguration.default
config.timeoutIntervalForRequest = 30
config.waitsForConnectivity = true
config.requestCachePolicy = .returnCacheDataElseLoad
config.httpAdditionalHeaders = ["Authorization": "Bearer \(token)"]
let session = URLSession(configuration: config)
```

## FileManager

```swift
let fm = FileManager.default

// App directories
let documentsURL = fm.urls(for: .documentDirectory, in: .userDomainMask).first!
let cachesURL = fm.urls(for: .cachesDirectory, in: .userDomainMask).first!
let appSupportURL = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!

// Create directory
let logsDir = documentsURL.appendingPathComponent("Logs", isDirectory: true)
try fm.createDirectory(at: logsDir, withIntermediateDirectories: true)

// Write and read string
let filePath = documentsURL.appendingPathComponent("notes.txt")
try "Hello, world!".write(to: filePath, atomically: true, encoding: .utf8)
let contents = try String(contentsOf: filePath, encoding: .utf8)

// Write and read JSON
let encoder = JSONEncoder()
encoder.outputFormatting = .prettyPrinted
let jsonData = try encoder.encode(myModel)
try jsonData.write(to: documentsURL.appendingPathComponent("data.json"))

// File attributes
let attrs = try fm.attributesOfItem(atPath: filePath.path)
let fileSize = attrs[.size] as? UInt64
let modified = attrs[.modificationDate] as? Date

// List directory contents
let items = try fm.contentsOfDirectory(
    at: documentsURL,
    includingPropertiesForKeys: [.fileSizeKey, .creationDateKey],
    options: .skipsHiddenFiles
)

// Check existence and delete
if fm.fileExists(atPath: filePath.path) {
    try fm.removeItem(at: filePath)
}

// Copy and move
try fm.copyItem(at: source, to: destination)
try fm.moveItem(at: source, to: destination)
```

## UserDefaults and @AppStorage

```swift
// Basic UserDefaults
let defaults = UserDefaults.standard
defaults.set("dark", forKey: "theme")
defaults.set(true, forKey: "notificationsEnabled")
defaults.set(42, forKey: "launchCount")
let theme = defaults.string(forKey: "theme") ?? "system"

// Register defaults (call in AppDelegate or App init)
UserDefaults.standard.register(defaults: [
    "theme": "system",
    "notificationsEnabled": true,
    "launchCount": 0,
])

// App Groups for sharing between app and extensions
let sharedDefaults = UserDefaults(suiteName: "group.com.myapp.shared")
sharedDefaults?.set(true, forKey: "isPremium")

// @AppStorage in SwiftUI — auto-persists to UserDefaults
struct SettingsView: View {
    @AppStorage("theme") private var theme = "system"
    @AppStorage("fontSize") private var fontSize = 16.0
    @AppStorage("isPremium", store: UserDefaults(suiteName: "group.com.myapp.shared"))
    private var isPremium = false

    var body: some View {
        Form {
            Picker("Theme", selection: $theme) {
                Text("System").tag("system")
                Text("Light").tag("light")
                Text("Dark").tag("dark")
            }
            Slider(value: $fontSize, in: 12...24, step: 1) {
                Text("Font Size: \(Int(fontSize))")
            }
        }
    }
}
```

## JSONEncoder/JSONDecoder and Codable

```swift
// Basic Codable model
struct Article: Codable, Identifiable {
    let id: Int
    let title: String
    let body: String
    let publishedAt: Date
    let author: Author
    let tags: [String]

    struct Author: Codable {
        let name: String
        let avatarURL: URL

        enum CodingKeys: String, CodingKey {
            case name
            case avatarURL = "avatar_url"
        }
    }
}

// Configured decoder
let decoder = JSONDecoder()
decoder.keyDecodingStrategy = .convertFromSnakeCase
decoder.dateDecodingStrategy = .iso8601
let articles = try decoder.decode([Article].self, from: jsonData)

// Configured encoder
let encoder = JSONEncoder()
encoder.keyEncodingStrategy = .convertToSnakeCase
encoder.dateEncodingStrategy = .iso8601
encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
let data = try encoder.encode(articles)

// Custom Codable for complex JSON
struct SearchResult: Codable {
    let query: String
    let results: [Item]

    struct Item: Codable {
        let id: String
        let score: Double
    }

    enum CodingKeys: String, CodingKey {
        case query = "q"
        case results = "hits"
    }

    // Custom decoding
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        query = try container.decode(String.self, forKey: .query)
        results = try container.decodeIfPresent([Item].self, forKey: .results) ?? []
    }
}
```

## Formatters

```swift
// DateFormatter
let dateFormatter = DateFormatter()
dateFormatter.dateStyle = .medium
dateFormatter.timeStyle = .short
dateFormatter.locale = Locale(identifier: "en_US")
let dateString = dateFormatter.string(from: Date()) // "Mar 30, 2026 at 3:45 PM"

// ISO 8601
let isoFormatter = ISO8601DateFormatter()
isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
let isoString = isoFormatter.string(from: Date())

// RelativeDateTimeFormatter
let relativeFormatter = RelativeDateTimeFormatter()
relativeFormatter.unitsStyle = .full
relativeFormatter.string(from: Date().addingTimeInterval(-3600)) // "1 hour ago"

// NumberFormatter
let currencyFormatter = NumberFormatter()
currencyFormatter.numberStyle = .currency
currencyFormatter.locale = Locale(identifier: "en_US")
currencyFormatter.string(from: 49.99) // "$49.99"

let percentFormatter = NumberFormatter()
percentFormatter.numberStyle = .percent
percentFormatter.maximumFractionDigits = 1
percentFormatter.string(from: 0.856) // "85.6%"

// Modern formatted API (iOS 15+)
let formatted = Date.now.formatted(.dateTime.month(.wide).day().year())
let price = 49.99.formatted(.currency(code: "USD"))
let percent = 0.856.formatted(.percent.precision(.fractionLength(1)))
```

## NotificationCenter

```swift
// Define custom notification
extension Notification.Name {
    static let userDidLogin = Notification.Name("userDidLogin")
    static let cartUpdated = Notification.Name("cartUpdated")
}

// Post notification with userInfo
NotificationCenter.default.post(
    name: .userDidLogin,
    object: nil,
    userInfo: ["userId": "abc123", "timestamp": Date()]
)

// Observe with closure (returns token — store it)
let token = NotificationCenter.default.addObserver(
    forName: .cartUpdated,
    object: nil,
    queue: .main
) { notification in
    if let count = notification.userInfo?["itemCount"] as? Int {
        print("Cart has \(count) items")
    }
}

// Observe with async sequence (iOS 17+)
func observeLoginEvents() async {
    for await notification in NotificationCenter.default.notifications(named: .userDidLogin) {
        if let userId = notification.userInfo?["userId"] as? String {
            print("User logged in: \(userId)")
        }
    }
}

// Remove observer
NotificationCenter.default.removeObserver(token)
```

## Timer and RunLoop

```swift
// Scheduled repeating timer
let timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
    print("Tick")
}
timer.invalidate() // Stop the timer

// Timer with tolerance for battery efficiency
let efficientTimer = Timer.scheduledTimer(withTimeInterval: 60.0, repeats: true) { _ in
    refreshData()
}
efficientTimer.tolerance = 5.0 // System can delay up to 5 seconds

// Async timer pattern
func startCountdown(from seconds: Int) async {
    for remaining in stride(from: seconds, through: 0, by: -1) {
        print("\(remaining)...")
        try? await Task.sleep(for: .seconds(1))
    }
}

// Timer publisher (Combine)
import Combine
let timerPublisher = Timer.publish(every: 1.0, on: .main, in: .common).autoconnect()
```

## ProcessInfo and Bundle

```swift
// ProcessInfo
let processInfo = ProcessInfo.processInfo
let systemUptime = processInfo.systemUptime
let isLowPowerMode = processInfo.isLowPowerModeEnabled
let thermalState = processInfo.thermalState // .nominal, .fair, .serious, .critical
let osVersion = processInfo.operatingSystemVersion // (major: 18, minor: 0, patch: 0)

// Check for Xcode preview or simulator
#if DEBUG
let isPreview = processInfo.environment["XCODE_RUNNING_FOR_PREVIEWS"] == "1"
#endif

// Bundle
let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String
let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String
let bundleId = Bundle.main.bundleIdentifier

// Load bundled resource
if let url = Bundle.main.url(forResource: "config", withExtension: "json"),
   let data = try? Data(contentsOf: url) {
    let config = try JSONDecoder().decode(AppConfig.self, from: data)
}

// Localized strings
let greeting = Bundle.main.localizedString(forKey: "greeting", value: nil, table: nil)
// Or use the macro: String(localized: "greeting")
```
