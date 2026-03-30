# ActivityKit & Live Activities

ActivityKit enables Live Activities that display real-time, glanceable content on the Lock Screen and Dynamic Island. Live Activities are ideal for tracking ongoing events like deliveries, sports scores, workouts, and ride-sharing trips.

## ActivityAttributes and ActivityContent

ActivityAttributes define the static and dynamic data for a Live Activity. The nested `ContentState` contains data that changes over time.

```swift
import ActivityKit
import Foundation

// Define the attributes for a delivery tracking Live Activity
struct DeliveryAttributes: ActivityAttributes {
    // Static data — set when the activity starts, never changes
    let orderNumber: String
    let restaurantName: String
    let estimatedDeliveryTime: Date

    // Dynamic data — updated throughout the activity lifecycle
    struct ContentState: Codable, Hashable {
        let status: DeliveryStatus
        let driverName: String
        let currentStep: Int
        let totalSteps: Int
        let estimatedMinutesRemaining: Int
    }
}

enum DeliveryStatus: String, Codable, Hashable {
    case preparing
    case pickedUp
    case onTheWay
    case nearbyDropoff
    case delivered

    var displayText: String {
        switch self {
        case .preparing: return "Preparing"
        case .pickedUp: return "Picked Up"
        case .onTheWay: return "On the Way"
        case .nearbyDropoff: return "Almost There"
        case .delivered: return "Delivered"
        }
    }

    var systemImage: String {
        switch self {
        case .preparing: return "fork.knife"
        case .pickedUp: return "bag.fill"
        case .onTheWay: return "car.fill"
        case .nearbyDropoff: return "mappin.and.ellipse"
        case .delivered: return "checkmark.circle.fill"
        }
    }
}
```

## Starting a Live Activity

Request a Live Activity by providing initial content and a stale date. The system enforces a limit of one active Live Activity per app on iPhone.

```swift
import ActivityKit

class DeliveryTracker {
    var currentActivity: Activity<DeliveryAttributes>?

    func startTracking(orderNumber: String, restaurant: String, eta: Date) throws {
        // Check if Live Activities are enabled in Settings
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            throw DeliveryError.activitiesDisabled
        }

        let attributes = DeliveryAttributes(
            orderNumber: orderNumber,
            restaurantName: restaurant,
            estimatedDeliveryTime: eta
        )

        let initialState = DeliveryAttributes.ContentState(
            status: .preparing,
            driverName: "",
            currentStep: 1,
            totalSteps: 4,
            estimatedMinutesRemaining: 45
        )

        let content = ActivityContent(
            state: initialState,
            staleDate: Calendar.current.date(byAdding: .minute, value: 15, to: .now),
            relevanceScore: 75
        )

        do {
            currentActivity = try Activity.request(
                attributes: attributes,
                content: content,
                pushType: .token  // Enable push-to-update; use nil for local-only
            )
            print("Live Activity started: \(currentActivity?.id ?? "nil")")
        } catch {
            throw DeliveryError.failedToStart(error)
        }
    }
}
```

## Updating a Live Activity

Update the dynamic content state at any time while the activity is active.

```swift
extension DeliveryTracker {
    func updateStatus(to status: DeliveryStatus, driver: String, step: Int, minutes: Int) async {
        guard let activity = currentActivity else { return }

        let updatedState = DeliveryAttributes.ContentState(
            status: status,
            driverName: driver,
            currentStep: step,
            totalSteps: 4,
            estimatedMinutesRemaining: minutes
        )

        // Set a new stale date with each update
        let staleDate = Calendar.current.date(byAdding: .minute, value: 10, to: .now)

        let updatedContent = ActivityContent(
            state: updatedState,
            staleDate: staleDate,
            relevanceScore: status == .nearbyDropoff ? 100 : 75
        )

        await activity.update(updatedContent)
    }
}
```

## Ending a Live Activity

End activities with a final content state. The `dismissalPolicy` controls how long the ended activity remains visible on the Lock Screen.

```swift
extension DeliveryTracker {
    func markDelivered() async {
        guard let activity = currentActivity else { return }

        let finalState = DeliveryAttributes.ContentState(
            status: .delivered,
            driverName: "Marcus",
            currentStep: 4,
            totalSteps: 4,
            estimatedMinutesRemaining: 0
        )

        let finalContent = ActivityContent(
            state: finalState,
            staleDate: nil
        )

        // .default: system decides when to remove (up to 4 hours)
        // .immediate: remove right away
        // .after(Date): remove after specified date
        await activity.end(finalContent, dismissalPolicy: .default)

        currentActivity = nil
    }

    func cancelActivity() async {
        guard let activity = currentActivity else { return }
        await activity.end(nil, dismissalPolicy: .immediate)
        currentActivity = nil
    }
}
```

## Dynamic Island Presentations

Live Activities appear in three Dynamic Island presentations. All three must be implemented in the widget bundle.

```swift
import WidgetKit
import SwiftUI

struct DeliveryLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DeliveryAttributes.self) { context in
            // LOCK SCREEN / STANDBY presentation
            LockScreenView(context: context)

        } dynamicIsland: { context in
            DynamicIsland {
                // EXPANDED — shown when user long-presses the Dynamic Island
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: context.state.status.systemImage)
                        .font(.title2)
                        .foregroundStyle(.blue)
                }

                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.estimatedMinutesRemaining) min")
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }

                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 4) {
                        Text(context.state.status.displayText)
                            .font(.headline)
                        Text(context.attributes.restaurantName)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                DynamicIslandExpandedRegion(.bottom) {
                    DeliveryProgressBar(
                        currentStep: context.state.currentStep,
                        totalSteps: context.state.totalSteps
                    )
                    .padding(.top, 4)
                }

            } compactLeading: {
                // COMPACT LEADING — left side of the pill
                Image(systemName: context.state.status.systemImage)
                    .foregroundStyle(.blue)

            } compactTrailing: {
                // COMPACT TRAILING — right side of the pill
                Text("\(context.state.estimatedMinutesRemaining)m")
                    .font(.caption2)
                    .foregroundStyle(.secondary)

            } minimal: {
                // MINIMAL — shown when multiple Live Activities are active
                Image(systemName: context.state.status.systemImage)
                    .foregroundStyle(.blue)
            }
            .keylineTint(.blue)
        }
    }
}
```

## Lock Screen and Supporting Views

```swift
struct LockScreenView: View {
    let context: ActivityViewContext<DeliveryAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.restaurantName)
                        .font(.headline)
                    Text("Order #\(context.attributes.orderNumber)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text(context.state.status.displayText)
                    .font(.subheadline.bold())
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(.blue.opacity(0.2))
                    .clipShape(Capsule())
            }

            DeliveryProgressBar(
                currentStep: context.state.currentStep,
                totalSteps: context.state.totalSteps
            )

            HStack {
                if !context.state.driverName.isEmpty {
                    Label(context.state.driverName, systemImage: "person.fill")
                        .font(.caption)
                }
                Spacer()
                if context.state.estimatedMinutesRemaining > 0 {
                    Text("~\(context.state.estimatedMinutesRemaining) min remaining")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            // Show a message when content is stale
            if context.isStale {
                Label("Updating...", systemImage: "arrow.clockwise")
                    .font(.caption2)
                    .foregroundStyle(.orange)
            }
        }
        .padding()
        .activityBackgroundTint(.black.opacity(0.7))
        .activitySystemActionForegroundColor(.white)
    }
}

struct DeliveryProgressBar: View {
    let currentStep: Int
    let totalSteps: Int

    var body: some View {
        HStack(spacing: 4) {
            ForEach(1...totalSteps, id: \.self) { step in
                Capsule()
                    .fill(step <= currentStep ? Color.blue : Color.gray.opacity(0.3))
                    .frame(height: 4)
            }
        }
    }
}
```

## Push-to-Update with Push Tokens

Register for push tokens to update Live Activities from your server. The token can change, so observe it continuously.

```swift
extension DeliveryTracker {
    func observePushToken() {
        guard let activity = currentActivity else { return }

        Task {
            for await pushToken in activity.pushTokenUpdates {
                let tokenString = pushToken.map { String(format: "%02x", $0) }.joined()
                print("Push token: \(tokenString)")

                // Send token to your server
                await sendTokenToServer(token: tokenString, activityID: activity.id)
            }
        }
    }

    private func sendTokenToServer(token: String, activityID: String) async {
        guard let url = URL(string: "https://api.example.com/live-activity/register") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: String] = [
            "activityId": activityID,
            "pushToken": token
        ]
        request.httpBody = try? JSONEncoder().encode(body)

        _ = try? await URLSession.shared.data(for: request)
    }
}
```

## ActivityKit Push Notification Payload

Send this JSON payload from your server via APNs to update or end a Live Activity.

```json
// APNs headers:
// apns-topic: <BundleID>.push-type.liveactivity
// apns-push-type: liveactivity

// Update payload
{
    "aps": {
        "timestamp": 1699900000,
        "event": "update",
        "content-state": {
            "status": "onTheWay",
            "driverName": "Marcus",
            "currentStep": 3,
            "totalSteps": 4,
            "estimatedMinutesRemaining": 12
        },
        "stale-date": 1699900600,
        "dismissal-date": 1699904200,
        "alert": {
            "title": "Delivery Update",
            "body": "Your order is on the way!"
        },
        "sound": "default",
        "relevance-score": 100
    }
}

// End payload
{
    "aps": {
        "timestamp": 1699901000,
        "event": "end",
        "dismissal-date": 1699904600,
        "content-state": {
            "status": "delivered",
            "driverName": "Marcus",
            "currentStep": 4,
            "totalSteps": 4,
            "estimatedMinutesRemaining": 0
        },
        "alert": {
            "title": "Order Delivered",
            "body": "Your food has arrived. Enjoy!"
        }
    }
}
```

## Timer and Progress Live Activities

Use `Text` with date-relative formatting for automatic countdown timers that the system updates without push notifications.

```swift
struct TimerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerAttributes.self) { context in
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.timerName)
                        .font(.headline)
                    // Automatic countdown timer — system updates this every second
                    Text(context.state.endTime, style: .timer)
                        .font(.system(.title, design: .monospaced))
                        .foregroundStyle(.blue)
                }
                Spacer()
                // Relative time display: "in 5 min"
                Text(context.state.endTime, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .activityBackgroundTint(.black)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.endTime, style: .timer)
                        .font(.system(.title, design: .monospaced))
                }
            } compactLeading: {
                Image(systemName: "timer")
            } compactTrailing: {
                Text(context.state.endTime, style: .timer)
                    .frame(width: 50)
                    .font(.caption2.monospacedDigit())
            } minimal: {
                // Progress ring for minimal view
                ProgressView(
                    timerInterval: context.state.startTime...context.state.endTime,
                    countsDown: true
                ) {
                    EmptyView()
                }
                .progressViewStyle(.circular)
                .tint(.blue)
            }
        }
    }
}

struct TimerAttributes: ActivityAttributes {
    let timerName: String

    struct ContentState: Codable, Hashable {
        let startTime: Date
        let endTime: Date
    }
}
```

## StaleDate and Dismissal Policy

Control how stale data is displayed and when ended activities are removed.

```swift
// Observe activity state changes across the app lifecycle
func observeAllActivities() {
    Task {
        // Monitor activities for this attribute type
        for await activity in Activity<DeliveryAttributes>.activityUpdates {
            print("New activity: \(activity.id)")

            Task {
                for await state in activity.activityStateUpdates {
                    switch state {
                    case .active:
                        print("Activity is active")
                    case .stale:
                        // Content has passed its staleDate — refresh it
                        print("Activity is stale — requesting update")
                        await refreshActivityFromServer(activity)
                    case .dismissed:
                        print("Activity was dismissed by user or system")
                    case .ended:
                        print("Activity has ended")
                    @unknown default:
                        break
                    }
                }
            }
        }
    }
}

func refreshActivityFromServer(_ activity: Activity<DeliveryAttributes>) async {
    guard let freshState = await fetchLatestState(for: activity.attributes.orderNumber) else {
        return
    }
    let content = ActivityContent(
        state: freshState,
        staleDate: Calendar.current.date(byAdding: .minute, value: 10, to: .now)
    )
    await activity.update(content)
}

func fetchLatestState(for orderNumber: String) async -> DeliveryAttributes.ContentState? {
    // Fetch from your API
    return nil
}
```

## Complete Delivery Tracking Example

A full Livewire-style manager that coordinates the entire Live Activity lifecycle.

```swift
import ActivityKit
import Foundation

@MainActor
@Observable
class LiveDeliveryManager {
    var isTracking = false
    var currentStatus: DeliveryStatus = .preparing
    private var activity: Activity<DeliveryAttributes>?
    private var tokenObservationTask: Task<Void, Never>?

    var areActivitiesEnabled: Bool {
        ActivityAuthorizationInfo().areActivitiesEnabled
    }

    func startDelivery(order: String, restaurant: String, eta: Date) async throws {
        guard areActivitiesEnabled else {
            throw DeliveryError.activitiesDisabled
        }

        // End any existing activity first
        if activity != nil {
            await endDelivery()
        }

        let attributes = DeliveryAttributes(
            orderNumber: order,
            restaurantName: restaurant,
            estimatedDeliveryTime: eta
        )

        let initialState = DeliveryAttributes.ContentState(
            status: .preparing,
            driverName: "",
            currentStep: 1,
            totalSteps: 4,
            estimatedMinutesRemaining: 45
        )

        let content = ActivityContent(
            state: initialState,
            staleDate: Calendar.current.date(byAdding: .minute, value: 15, to: .now),
            relevanceScore: 50
        )

        activity = try Activity.request(
            attributes: attributes,
            content: content,
            pushType: .token
        )

        isTracking = true
        currentStatus = .preparing
        startObservingPushToken()
        startObservingState()
    }

    func update(status: DeliveryStatus, driver: String, step: Int, minutes: Int) async {
        guard let activity else { return }

        let state = DeliveryAttributes.ContentState(
            status: status,
            driverName: driver,
            currentStep: step,
            totalSteps: 4,
            estimatedMinutesRemaining: minutes
        )

        let content = ActivityContent(
            state: state,
            staleDate: Calendar.current.date(byAdding: .minute, value: 10, to: .now),
            relevanceScore: status == .nearbyDropoff ? 100 : 75
        )

        await activity.update(content)
        currentStatus = status
    }

    func endDelivery() async {
        guard let activity else { return }

        let finalState = DeliveryAttributes.ContentState(
            status: .delivered,
            driverName: "Driver",
            currentStep: 4,
            totalSteps: 4,
            estimatedMinutesRemaining: 0
        )

        let content = ActivityContent(state: finalState, staleDate: nil)
        await activity.end(content, dismissalPolicy: .after(
            Calendar.current.date(byAdding: .hour, value: 1, to: .now)!
        ))

        tokenObservationTask?.cancel()
        self.activity = nil
        isTracking = false
        currentStatus = .delivered
    }

    private func startObservingPushToken() {
        guard let activity else { return }
        tokenObservationTask?.cancel()

        tokenObservationTask = Task {
            for await token in activity.pushTokenUpdates {
                let tokenString = token.map { String(format: "%02x", $0) }.joined()
                await registerToken(tokenString, activityID: activity.id)
            }
        }
    }

    private func startObservingState() {
        guard let activity else { return }

        Task {
            for await state in activity.activityStateUpdates {
                switch state {
                case .dismissed, .ended:
                    self.isTracking = false
                    self.activity = nil
                default:
                    break
                }
            }
        }
    }

    private func registerToken(_ token: String, activityID: String) async {
        // Send to your backend
        print("Registering token \(token) for activity \(activityID)")
    }
}

enum DeliveryError: LocalizedError {
    case activitiesDisabled
    case failedToStart(Error)

    var errorDescription: String? {
        switch self {
        case .activitiesDisabled:
            return "Live Activities are disabled in Settings."
        case .failedToStart(let error):
            return "Failed to start activity: \(error.localizedDescription)"
        }
    }
}
```

## Widget Bundle Registration

Register the Live Activity widget alongside your other widgets.

```swift
import WidgetKit
import SwiftUI

@main
struct AppWidgets: WidgetBundle {
    var body: some Widget {
        DeliveryLiveActivity()
        TimerLiveActivity()
        // Other widgets...
    }
}
```

## Key Considerations

- **Size limit**: Live Activity UI is rendered at a fixed size; keep content concise.
- **Update frequency**: The system may throttle updates. Budget approximately one update per hour for push updates; local updates have a higher budget.
- **Stale date**: Always set a stale date so your UI can show a refresh indicator when data is old.
- **Push payload size**: The APNs payload for Live Activities must be under 4 KB.
- **Background**: Live Activities use `activityBackgroundTint` and `activitySystemActionForegroundColor` — standard SwiftUI background modifiers do not work.
- **Availability**: ActivityKit requires iOS 16.1+. Dynamic Island requires iPhone 14 Pro and later.
- **Info.plist**: Add `NSSupportsLiveActivities` set to `YES` in your app target's Info.plist.
