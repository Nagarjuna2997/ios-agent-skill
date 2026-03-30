# iOS Platform Guide

## App Lifecycle

### UIApplicationDelegate (UIKit)

```swift
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Configure services, SDKs, appearance
        return true
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        UISceneConfiguration(name: "Default", sessionRole: connectingSceneSession.role)
    }
}
```

### SceneDelegate (UIKit Multi-Window)

```swift
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = MainViewController()
        window?.makeKeyAndVisible()

        // Handle incoming URL
        if let urlContext = options.urlContexts.first {
            handleDeepLink(urlContext.url)
        }
    }

    func sceneDidBecomeActive(_ scene: UIScene) { }
    func sceneWillResignActive(_ scene: UIScene) { }
    func sceneDidEnterBackground(_ scene: UIScene) { }
}
```

### SwiftUI App Lifecycle

```swift
@main
struct MyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { oldPhase, newPhase in
            switch newPhase {
            case .active:    print("App is active")
            case .inactive:  print("App is inactive")
            case .background:
                scheduleBackgroundTasks()
            @unknown default: break
            }
        }
    }
}
```

---

## Background Tasks

### BGTaskScheduler

```swift
// 1. Register in Info.plist under BGTaskSchedulerPermittedIdentifiers:
//    ["com.app.refresh", "com.app.processing"]

// 2. Register handlers at launch
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.app.refresh", using: nil) { task in
        self.handleAppRefresh(task: task as! BGAppRefreshTask)
    }
    BGTaskScheduler.shared.register(forTaskWithIdentifier: "com.app.processing", using: nil) { task in
        self.handleProcessing(task: task as! BGProcessingTask)
    }
    return true
}

// 3. Schedule
func scheduleBackgroundTasks() {
    let refreshRequest = BGAppRefreshTaskRequest(identifier: "com.app.refresh")
    refreshRequest.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60)

    let processingRequest = BGProcessingTaskRequest(identifier: "com.app.processing")
    processingRequest.requiresNetworkConnectivity = true
    processingRequest.requiresExternalPower = false

    try? BGTaskScheduler.shared.submit(refreshRequest)
    try? BGTaskScheduler.shared.submit(processingRequest)
}

// 4. Handle
func handleAppRefresh(task: BGAppRefreshTask) {
    scheduleBackgroundTasks() // Reschedule

    let operation = RefreshOperation()
    task.expirationHandler = { operation.cancel() }

    operation.completionBlock = {
        task.setTaskCompleted(success: !operation.isCancelled)
    }
    OperationQueue().addOperation(operation)
}
```

---

## Deep Linking

### Universal Links

```json
// apple-app-site-association (hosted at https://example.com/.well-known/)
{
    "applinks": {
        "apps": [],
        "details": [
            {
                "appID": "TEAMID.com.example.app",
                "paths": ["/product/*", "/user/*"],
                "components": [
                    { "/": "/product/*", "comment": "Product pages" }
                ]
            }
        ]
    }
}
```

```swift
// SwiftUI handling
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    DeepLinkRouter.shared.handle(url)
                }
        }
    }
}

// Router
@Observable
class DeepLinkRouter {
    static let shared = DeepLinkRouter()
    var selectedTab: Tab = .home
    var navigationPath = NavigationPath()

    func handle(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true) else { return }
        let pathComponents = components.path.split(separator: "/").map(String.init)

        switch pathComponents.first {
        case "product":
            if let id = pathComponents[safe: 1] {
                selectedTab = .shop
                navigationPath.append(Route.product(id: id))
            }
        case "user":
            if let id = pathComponents[safe: 1] {
                selectedTab = .profile
                navigationPath.append(Route.profile(id: id))
            }
        default: break
        }
    }
}
```

### Custom URL Schemes

```swift
// Info.plist: CFBundleURLSchemes = ["myapp"]
// Usage: myapp://action/param

func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    // Parse myapp://product/123
    if url.host == "product", let id = url.pathComponents[safe: 1] {
        navigateToProduct(id: id)
    }
}
```

---

## Share Extensions

```swift
// ShareViewController.swift (in Share Extension target)
import UIKit
import Social

class ShareViewController: SLComposeServiceViewController {
    override func isContentValid() -> Bool {
        return !contentText.isEmpty
    }

    override func didSelectPost() {
        guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
            extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        for item in items {
            for provider in item.attachments ?? [] {
                if provider.hasItemConformingToTypeIdentifier("public.url") {
                    provider.loadItem(forTypeIdentifier: "public.url") { [weak self] data, error in
                        if let url = data as? URL {
                            self?.saveSharedURL(url)
                        }
                        self?.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
                    }
                }
            }
        }
    }

    private func saveSharedURL(_ url: URL) {
        // Save to App Group shared container
        let defaults = UserDefaults(suiteName: "group.com.example.app")
        var urls = defaults?.stringArray(forKey: "sharedURLs") ?? []
        urls.append(url.absoluteString)
        defaults?.set(urls, forKey: "sharedURLs")
    }
}
```

---

## HealthKit Basics

```swift
import HealthKit

class HealthKitManager {
    private let store = HKHealthStore()

    func requestAuthorization() async throws {
        guard HKHealthStore.isHealthDataAvailable() else {
            throw HealthError.notAvailable
        }

        let readTypes: Set<HKObjectType> = [
            HKQuantityType(.stepCount),
            HKQuantityType(.heartRate),
            HKCategoryType(.sleepAnalysis)
        ]
        let writeTypes: Set<HKSampleType> = [
            HKQuantityType(.stepCount)
        ]

        try await store.requestAuthorization(toShare: writeTypes, read: readTypes)
    }

    func fetchTodaySteps() async throws -> Double {
        let stepsType = HKQuantityType(.stepCount)
        let startOfDay = Calendar.current.startOfDay(for: .now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: .now)

        let descriptor = HKStatisticsQueryDescriptor(
            predicate: .init(quantityType: stepsType, predicate: predicate),
            options: .cumulativeSum
        )
        let result = try await descriptor.result(for: store)
        return result?.sumQuantity()?.doubleValue(for: .count()) ?? 0
    }
}
```

---

## Core Haptics

```swift
import CoreHaptics

class HapticsManager {
    private var engine: CHHapticEngine?

    func prepareEngine() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        engine = try? CHHapticEngine()
        try? engine?.start()

        engine?.resetHandler = { [weak self] in
            try? self?.engine?.start()
        }
    }

    func playSuccessPattern() {
        let sharpness = CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5)
        let intensity = CHHapticEventParameter(parameterID: .hapticIntensity, value: 1.0)

        let events = [
            CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0),
            CHHapticEvent(eventType: .hapticTransient, parameters: [intensity, sharpness], relativeTime: 0.15),
        ]

        let pattern = try? CHHapticPattern(events: events, parameters: [])
        let player = try? engine?.makePlayer(with: pattern!)
        try? player?.start(atTime: 0)
    }

    /// Simple feedback using UIKit
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }

    static func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        UINotificationFeedbackGenerator().notificationOccurred(type)
    }
}

// SwiftUI usage
Button("Tap") { }
    .sensoryFeedback(.success, trigger: didSucceed)
```

---

## Document-Based Apps

```swift
import SwiftUI
import UniformTypeIdentifiers

// Define document type
struct MarkdownDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.plainText] }

    var text: String

    init(text: String = "") {
        self.text = text
    }

    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents,
              let string = String(data: data, encoding: .utf8)
        else { throw CocoaError(.fileReadCorruptFile) }
        text = string
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        let data = Data(text.utf8)
        return .init(regularFileWithContents: data)
    }
}

// App entry point
@main
struct DocApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: MarkdownDocument()) { file in
            TextEditor(text: file.$document.text)
                .font(.system(.body, design: .monospaced))
        }
    }
}
```

---

## Key iOS Capabilities Summary

| Feature | Framework | Min iOS |
|---------|-----------|---------|
| Background Tasks | BackgroundTasks | 13.0 |
| Universal Links | Associated Domains | 9.0 |
| HealthKit | HealthKit | 8.0 |
| Core Haptics | CoreHaptics | 13.0 |
| SwiftUI App Lifecycle | SwiftUI | 14.0 |
| Observation framework | Observation | 17.0 |
| Swift Testing | Testing | 16.0+ |
| Interactive Widgets | WidgetKit | 17.0 |
