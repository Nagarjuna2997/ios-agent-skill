# watchOS Platform Guide

## WatchKit App Structure

### SwiftUI App Lifecycle (watchOS 7+)

```swift
@main
struct MyWatchApp: App {
    @WKApplicationDelegateAdaptor(AppDelegate.self) var delegate

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                ContentView()
            }
        }
    }
}

class AppDelegate: NSObject, WKApplicationDelegate {
    func applicationDidFinishLaunching() {
        // Setup HealthKit, WCSession, etc.
        WatchConnectivityManager.shared.activate()
    }

    func applicationDidBecomeActive() { }

    func applicationWillResignActive() { }

    func handle(_ backgroundTasks: Set<WKRefreshBackgroundTask>) {
        for task in backgroundTasks {
            switch task {
            case let refreshTask as WKApplicationRefreshBackgroundTask:
                scheduleNextRefresh()
                refreshTask.setTaskCompletedWithSnapshot(false)
            case let snapshotTask as WKSnapshotRefreshBackgroundTask:
                snapshotTask.setTaskCompleted(restoredDefaultState: true, estimatedSnapshotExpiration: .distantFuture, userInfo: nil)
            case let urlTask as WKURLSessionRefreshBackgroundTask:
                urlTask.setTaskCompletedWithSnapshot(false)
            default:
                task.setTaskCompletedWithSnapshot(false)
            }
        }
    }
}
```

### Navigation Patterns

```swift
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink("Workout") { WorkoutView() }
                NavigationLink("Activity") { ActivityView() }
                NavigationLink("Settings") { SettingsView() }
            }
            .navigationTitle("My App")
        }
    }
}

// Tab-based layout
struct TabContentView: View {
    var body: some View {
        TabView {
            DashboardView()
            WorkoutListView()
            SettingsView()
        }
        .tabViewStyle(.verticalPage)
    }
}
```

---

## Complications (WidgetKit on watchOS)

```swift
import WidgetKit
import SwiftUI

struct StepsWidget: Widget {
    let kind = "StepsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StepsProvider()) { entry in
            StepsWidgetView(entry: entry)
        }
        .configurationDisplayName("Steps")
        .description("Track your daily steps.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline,
            .accessoryCorner
        ])
    }
}

struct StepsEntry: TimelineEntry {
    let date: Date
    let steps: Int
    let goal: Int
}

struct StepsProvider: TimelineProvider {
    func placeholder(in context: Context) -> StepsEntry {
        StepsEntry(date: .now, steps: 5000, goal: 10000)
    }

    func getSnapshot(in context: Context, completion: @escaping (StepsEntry) -> Void) {
        completion(StepsEntry(date: .now, steps: 7500, goal: 10000))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StepsEntry>) -> Void) {
        Task {
            let steps = await HealthKitManager.shared.fetchTodaySteps()
            let entry = StepsEntry(date: .now, steps: Int(steps), goal: 10000)
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }
}

struct StepsWidgetView: View {
    let entry: StepsEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: Double(entry.steps), in: 0...Double(entry.goal)) {
                Text("\(entry.steps)")
            }
            .gaugeStyle(.accessoryCircularCapacity)

        case .accessoryRectangular:
            VStack(alignment: .leading) {
                Text("Steps")
                    .font(.headline)
                    .widgetAccentable()
                Text("\(entry.steps) / \(entry.goal)")
                    .font(.caption)
                ProgressView(value: Double(entry.steps), total: Double(entry.goal))
            }

        case .accessoryInline:
            Text("Steps: \(entry.steps)")

        default:
            Text("\(entry.steps)")
        }
    }
}
```

---

## Watch Connectivity (WCSession)

```swift
import WatchConnectivity

class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    @Published var receivedMessage: [String: Any] = [:]

    func activate() {
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    // MARK: - Send data (phone <-> watch)

    /// Immediate messaging (both apps must be reachable)
    func sendMessage(_ message: [String: Any]) {
        guard WCSession.default.isReachable else { return }
        WCSession.default.sendMessage(message, replyHandler: { reply in
            print("Reply: \(reply)")
        }, errorHandler: { error in
            print("Error: \(error)")
        })
    }

    /// Background transfer - application context (latest state)
    func updateContext(_ context: [String: Any]) {
        try? WCSession.default.updateApplicationContext(context)
    }

    /// Background transfer - user info queue (guaranteed delivery)
    func transferUserInfo(_ info: [String: Any]) {
        WCSession.default.transferUserInfo(info)
    }

    /// File transfer
    func transferFile(_ url: URL, metadata: [String: Any]? = nil) {
        WCSession.default.transferFile(url, metadata: metadata)
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        print("WCSession activated: \(state.rawValue)")
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async { self.receivedMessage = message }
    }

    func session(_ session: WCSession, didReceiveApplicationContext context: [String: Any]) {
        DispatchQueue.main.async { self.receivedMessage = context }
    }

    // iOS only
    #if os(iOS)
    func sessionDidBecomeInactive(_ session: WCSession) { }
    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
    #endif
}
```

---

## HealthKit Workouts

```swift
import HealthKit

@Observable
class WorkoutManager: NSObject, HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate {
    let store = HKHealthStore()
    var session: HKWorkoutSession?
    var builder: HKLiveWorkoutBuilder?

    var heartRate: Double = 0
    var activeCalories: Double = 0
    var elapsedTime: TimeInterval = 0
    var isActive = false

    func startWorkout(type: HKWorkoutActivityType) async throws {
        let config = HKWorkoutConfiguration()
        config.activityType = type
        config.locationType = .outdoor

        session = try HKWorkoutSession(healthStore: store, configuration: config)
        builder = session?.associatedWorkoutBuilder()

        session?.delegate = self
        builder?.delegate = self
        builder?.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: config)

        let start = Date()
        session?.startActivity(with: start)
        try await builder?.beginCollection(at: start)
        isActive = true
    }

    func pause() { session?.pause() }
    func resume() { session?.resume() }

    func endWorkout() async throws {
        session?.end()
        try await builder?.endCollection(at: .now)
        try await builder?.finishWorkout()
        isActive = false
    }

    // MARK: - HKWorkoutSessionDelegate

    func workoutSession(_ session: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        DispatchQueue.main.async {
            self.isActive = toState == .running
        }
    }

    func workoutSession(_ session: HKWorkoutSession, didFailWithError error: Error) { }

    // MARK: - HKLiveWorkoutBuilderDelegate

    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) { }

    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        for type in collectedTypes {
            guard let quantityType = type as? HKQuantityType else { continue }
            let stats = workoutBuilder.statistics(for: quantityType)

            DispatchQueue.main.async {
                switch quantityType {
                case HKQuantityType(.heartRate):
                    self.heartRate = stats?.mostRecentQuantity()?.doubleValue(for: .count().unitDivided(by: .minute())) ?? 0
                case HKQuantityType(.activeEnergyBurned):
                    self.activeCalories = stats?.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? 0
                default: break
                }
            }
        }
    }
}
```

---

## Digital Crown

```swift
struct CrownScrollView: View {
    @State private var crownValue: Double = 0
    @State private var isCrownIdle = true

    var body: some View {
        VStack {
            Text("Value: \(crownValue, specifier: "%.1f")")
                .font(.largeTitle)

            Gauge(value: crownValue, in: 0...100) {
                Text("Level")
            }
            .gaugeStyle(.accessoryLinearCapacity)
        }
        .focusable()
        .digitalCrownRotation(
            $crownValue,
            from: 0,
            through: 100,
            by: 1,
            sensitivity: .medium,
            isContinuous: false,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: crownValue) {
            isCrownIdle = false
        }
    }
}

// Crown with detents
struct DetentCrownView: View {
    @State private var selectedIndex: Int = 0
    let options = ["Small", "Medium", "Large", "Extra Large"]

    var body: some View {
        Text(options[selectedIndex])
            .font(.title3)
            .focusable()
            .digitalCrownRotation(
                detent: $selectedIndex,
                from: 0,
                through: options.count - 1,
                by: 1,
                sensitivity: .low,
                isContinuous: false,
                isHapticFeedbackEnabled: true
            ) { event in
                // Detent feedback
            }
    }
}
```

---

## Always-On Display

```swift
struct WorkoutActiveView: View {
    @Environment(\.isLuminanceReduced) var isLuminanceReduced

    let heartRate: Double
    let duration: TimeInterval

    var body: some View {
        VStack {
            if isLuminanceReduced {
                // Simplified always-on display
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    Text(duration.formatted(.time(pattern: .hourMinuteSecond)))
                        .font(.title2)
                }
                Text("\(Int(heartRate)) BPM")
                    .foregroundStyle(.red)
            } else {
                // Full interactive display
                TimelineView(.periodic(from: .now, by: 1)) { context in
                    Text(duration.formatted(.time(pattern: .hourMinuteSecond)))
                        .font(.system(size: 40, weight: .bold, design: .rounded))
                }
                HStack {
                    Image(systemName: "heart.fill")
                        .foregroundStyle(.red)
                    Text("\(Int(heartRate)) BPM")
                }
                .font(.title3)
            }
        }
    }
}
```

---

## Background App Refresh

```swift
// Schedule refresh
func scheduleNextRefresh() {
    WKExtension.shared().scheduleBackgroundRefresh(
        withPreferredDate: Date(timeIntervalSinceNow: 15 * 60),
        userInfo: nil
    ) { error in
        if let error { print("Scheduling failed: \(error)") }
    }
}

// Handle in AppDelegate.handle(_:) — see App Structure section above

// Background URLSession
func scheduleBackgroundDownload() {
    let config = URLSessionConfiguration.background(withIdentifier: "com.app.watch.background")
    config.isDiscretionary = false
    config.sessionSendsLaunchEvents = true

    let session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
    let task = session.downloadTask(with: URL(string: "https://api.example.com/data")!)
    task.resume()
}
```

---

## watchOS Design Guidelines

| Aspect | Recommendation |
|--------|---------------|
| Glance-ability | Show key info at a glance; minimize scrolling |
| Interactions | Keep to 2-3 taps maximum per task |
| Text input | Prefer voice, scribble, or preset options |
| Complications | Always provide at least one complication family |
| Haptics | Use WKInterfaceDevice.default().play(.success) for feedback |
| Layout | Use vertical stacks; avoid horizontal scrolling |
| Always-on | Reduce luminance, hide seconds, dim colors |
