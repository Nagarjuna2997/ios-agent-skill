# HealthKit

## HKHealthStore Setup and Authorization

Add to `Info.plist`:
- `NSHealthShareUsageDescription` — required for reading health data
- `NSHealthUpdateUsageDescription` — required for writing health data

Add the HealthKit capability in Xcode under Signing & Capabilities.

```swift
import HealthKit

@Observable
class HealthKitManager {
    static let shared = HealthKitManager()

    let healthStore = HKHealthStore()
    var isAuthorized = false
    var authorizationError: Error?

    // Check availability
    var isHealthDataAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    func requestAuthorization() async throws {
        guard isHealthDataAvailable else {
            throw HealthKitError.notAvailable
        }

        // Types to read
        let readTypes: Set<HKObjectType> = [
            HKQuantityType(.stepCount),
            HKQuantityType(.heartRate),
            HKQuantityType(.activeEnergyBurned),
            HKQuantityType(.distanceWalkingRunning),
            HKQuantityType(.bodyMass),
            HKCategoryType(.sleepAnalysis),
            HKObjectType.workoutType(),
            HKObjectType.activitySummaryType()
        ]

        // Types to write
        let writeTypes: Set<HKSampleType> = [
            HKQuantityType(.stepCount),
            HKQuantityType(.bodyMass),
            HKQuantityType(.activeEnergyBurned),
            HKObjectType.workoutType()
        ]

        try await healthStore.requestAuthorization(
            toShare: writeTypes,
            read: readTypes
        )
        isAuthorized = true
    }
}

enum HealthKitError: LocalizedError {
    case notAvailable
    case notAuthorized
    case noData
    case writeFailed(Error)

    var errorDescription: String? {
        switch self {
        case .notAvailable:
            return "HealthKit is not available on this device."
        case .notAuthorized:
            return "HealthKit authorization was not granted."
        case .noData:
            return "No health data found."
        case .writeFailed(let error):
            return "Failed to write data: \(error.localizedDescription)"
        }
    }
}
```

## HKSampleType, HKQuantityType, HKCategoryType

```swift
// Quantity types — numeric values with units
let stepCount = HKQuantityType(.stepCount)
let heartRate = HKQuantityType(.heartRate)
let bodyMass = HKQuantityType(.bodyMass)
let height = HKQuantityType(.height)
let activeEnergy = HKQuantityType(.activeEnergyBurned)
let distance = HKQuantityType(.distanceWalkingRunning)

// Category types — enum-based values
let sleepAnalysis = HKCategoryType(.sleepAnalysis)
let mindfulSession = HKCategoryType(.mindfulSession)

// Workout type
let workoutType = HKObjectType.workoutType()

// Units
let bpm = HKUnit.count().unitDivided(by: .minute())
let kg = HKUnit.gramUnit(with: .kilo)
let miles = HKUnit.mile()
let kcal = HKUnit.kilocalorie()
let steps = HKUnit.count()
```

## Reading Health Data — HKSampleQuery

```swift
extension HealthKitManager {
    /// Query recent heart rate samples
    func fetchHeartRateSamples(limit: Int = 10) async throws -> [HKQuantitySample] {
        let heartRateType = HKQuantityType(.heartRate)

        let sortDescriptor = NSSortDescriptor(
            key: HKSampleSortIdentifierStartDate,
            ascending: false
        )

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: heartRateType,
                predicate: nil,
                limit: limit,
                sortDescriptors: [sortDescriptor]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let quantitySamples = samples as? [HKQuantitySample] ?? []
                continuation.resume(returning: quantitySamples)
            }
            healthStore.execute(query)
        }
    }

    /// Query samples within a date range
    func fetchSamples(
        type: HKQuantityType,
        start: Date,
        end: Date = .now,
        limit: Int = HKObjectQueryNoLimit
    ) async throws -> [HKQuantitySample] {
        let predicate = HKQuery.predicateForSamples(
            withStart: start,
            end: end,
            options: .strictStartDate
        )

        let sortDescriptor = NSSortDescriptor(
            key: HKSampleSortIdentifierStartDate,
            ascending: false
        )

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: type,
                predicate: predicate,
                limit: limit,
                sortDescriptors: [sortDescriptor]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let quantitySamples = samples as? [HKQuantitySample] ?? []
                continuation.resume(returning: quantitySamples)
            }
            healthStore.execute(query)
        }
    }
}
```

## HKStatisticsQuery for Aggregated Data

```swift
extension HealthKitManager {
    /// Get today's total step count
    func fetchTodayStepCount() async throws -> Double {
        let stepType = HKQuantityType(.stepCount)

        let startOfDay = Calendar.current.startOfDay(for: .now)
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: .now,
            options: .strictStartDate
        )

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: stepType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, statistics, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let count = statistics?.sumQuantity()?.doubleValue(for: .count()) ?? 0
                continuation.resume(returning: count)
            }
            healthStore.execute(query)
        }
    }

    /// Get average resting heart rate for a period
    func fetchAverageHeartRate(start: Date, end: Date = .now) async throws -> Double {
        let heartRateType = HKQuantityType(.heartRate)
        let predicate = HKQuery.predicateForSamples(
            withStart: start,
            end: end,
            options: .strictStartDate
        )
        let bpmUnit = HKUnit.count().unitDivided(by: .minute())

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: heartRateType,
                quantitySamplePredicate: predicate,
                options: .discreteAverage
            ) { _, statistics, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let avg = statistics?.averageQuantity()?.doubleValue(for: bpmUnit) ?? 0
                continuation.resume(returning: avg)
            }
            healthStore.execute(query)
        }
    }
}
```

## Writing Health Data

```swift
extension HealthKitManager {
    /// Save a body mass measurement
    func saveBodyMass(kg value: Double, date: Date = .now) async throws {
        let bodyMassType = HKQuantityType(.bodyMass)
        let quantity = HKQuantity(unit: .gramUnit(with: .kilo), doubleValue: value)

        let sample = HKQuantitySample(
            type: bodyMassType,
            quantity: quantity,
            start: date,
            end: date
        )

        try await healthStore.save(sample)
    }

    /// Save a step count entry
    func saveSteps(count: Double, start: Date, end: Date) async throws {
        let stepType = HKQuantityType(.stepCount)
        let quantity = HKQuantity(unit: .count(), doubleValue: count)

        let sample = HKQuantitySample(
            type: stepType,
            quantity: quantity,
            start: start,
            end: end
        )

        try await healthStore.save(sample)
    }

    /// Save a sleep analysis entry
    func saveSleep(start: Date, end: Date, value: HKCategoryValueSleepAnalysis) async throws {
        let sleepType = HKCategoryType(.sleepAnalysis)

        let sample = HKCategorySample(
            type: sleepType,
            value: value.rawValue,
            start: start,
            end: end
        )

        try await healthStore.save(sample)
    }
}
```

## HKStatisticsCollectionQuery — Aggregated Data Over Time

```swift
extension HealthKitManager {
    /// Get daily step counts for the last 7 days
    func fetchDailySteps(days: Int = 7) async throws -> [(date: Date, steps: Double)] {
        let stepType = HKQuantityType(.stepCount)
        let calendar = Calendar.current

        let endDate = Date.now
        guard let startDate = calendar.date(byAdding: .day, value: -days, to: endDate) else {
            throw HealthKitError.noData
        }

        let anchorDate = calendar.startOfDay(for: endDate)
        let daily = DateComponents(day: 1)

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )

        return try await withCheckedThrowingContinuation { continuation in
            let query = HKStatisticsCollectionQuery(
                quantityType: stepType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum,
                anchorDate: anchorDate,
                intervalComponents: daily
            )

            query.initialResultsHandler = { _, collection, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }

                var results: [(date: Date, steps: Double)] = []

                collection?.enumerateStatistics(from: startDate, to: endDate) { statistics, _ in
                    let count = statistics.sumQuantity()?.doubleValue(for: .count()) ?? 0
                    results.append((date: statistics.startDate, steps: count))
                }

                continuation.resume(returning: results)
            }

            healthStore.execute(query)
        }
    }
}
```

## HKObserverQuery — Background Delivery

```swift
extension HealthKitManager {
    /// Enable background delivery for step count updates
    func enableBackgroundStepDelivery() async throws {
        let stepType = HKQuantityType(.stepCount)

        try await healthStore.enableBackgroundDelivery(
            for: stepType,
            frequency: .hourly
        )
    }

    /// Observe step count changes in real time
    func observeStepChanges(handler: @escaping (Double) -> Void) {
        let stepType = HKQuantityType(.stepCount)

        let observerQuery = HKObserverQuery(
            sampleType: stepType,
            predicate: nil
        ) { [weak self] _, completionHandler, error in
            guard error == nil, let self else {
                completionHandler()
                return
            }

            Task {
                let steps = try? await self.fetchTodayStepCount()
                await MainActor.run {
                    handler(steps ?? 0)
                }
                completionHandler()
            }
        }

        healthStore.execute(observerQuery)
    }
}
```

## HKWorkoutSession and HKLiveWorkoutBuilder

```swift
import HealthKit

@Observable
class WorkoutManager: NSObject {
    let healthStore = HKHealthStore()
    var workoutSession: HKWorkoutSession?
    var workoutBuilder: HKLiveWorkoutBuilder?

    var isWorkoutActive = false
    var heartRate: Double = 0
    var activeCalories: Double = 0
    var distance: Double = 0
    var elapsedTime: TimeInterval = 0

    func startWorkout(type: HKWorkoutActivityType) async throws {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = type
        configuration.locationType = .outdoor

        workoutSession = try HKWorkoutSession(
            healthStore: healthStore,
            configuration: configuration
        )

        workoutBuilder = workoutSession?.associatedWorkoutBuilder()
        workoutBuilder?.dataSource = HKLiveWorkoutDataSource(
            healthStore: healthStore,
            workoutConfiguration: configuration
        )

        workoutSession?.delegate = self
        workoutBuilder?.delegate = self

        let startDate = Date.now
        workoutSession?.startActivity(with: startDate)
        try await workoutBuilder?.beginCollection(at: startDate)

        isWorkoutActive = true
    }

    func pauseWorkout() {
        workoutSession?.pause()
    }

    func resumeWorkout() {
        workoutSession?.resume()
    }

    func endWorkout() async throws {
        workoutSession?.end()
        guard let builder = workoutBuilder else { return }
        try await builder.endCollection(at: .now)
        try await builder.finishWorkout()

        isWorkoutActive = false
        workoutSession = nil
        workoutBuilder = nil
    }
}

extension WorkoutManager: HKWorkoutSessionDelegate {
    func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didChangeTo toState: HKWorkoutSessionState,
        from fromState: HKWorkoutSessionState,
        date: Date
    ) {
        switch toState {
        case .running:
            isWorkoutActive = true
        case .paused:
            isWorkoutActive = false
        case .ended:
            isWorkoutActive = false
        default:
            break
        }
    }

    func workoutSession(
        _ workoutSession: HKWorkoutSession,
        didFailWithError error: Error
    ) {
        isWorkoutActive = false
    }
}

extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

    func workoutBuilder(
        _ workoutBuilder: HKLiveWorkoutBuilder,
        didCollectDataOf collectedTypes: Set<HKSampleType>
    ) {
        for type in collectedTypes {
            guard let quantityType = type as? HKQuantityType else { continue }
            let statistics = workoutBuilder.statistics(for: quantityType)

            switch quantityType {
            case HKQuantityType(.heartRate):
                let bpmUnit = HKUnit.count().unitDivided(by: .minute())
                heartRate = statistics?.mostRecentQuantity()?.doubleValue(for: bpmUnit) ?? 0

            case HKQuantityType(.activeEnergyBurned):
                activeCalories = statistics?.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? 0

            case HKQuantityType(.distanceWalkingRunning):
                distance = statistics?.sumQuantity()?.doubleValue(for: .meter()) ?? 0

            default:
                break
            }
        }

        elapsedTime = workoutBuilder.elapsedTime
    }
}
```

## Workout Routes with CoreLocation

```swift
import CoreLocation

extension WorkoutManager {
    /// Add a route to a completed workout
    func addRoute(locations: [CLLocation], to workout: HKWorkout) async throws {
        let routeBuilder = HKWorkoutRouteBuilder(
            healthStore: healthStore,
            device: nil
        )

        try await routeBuilder.insertRouteData(locations)
        try await routeBuilder.finishRoute(with: workout, metadata: nil)
    }
}
```

## Complete Step Counter and Workout Tracker

```swift
import SwiftUI
import HealthKit

@Observable
class StepCounterViewModel {
    private let manager = HealthKitManager.shared

    var todaySteps: Double = 0
    var weeklySteps: [(date: Date, steps: Double)] = []
    var goalProgress: Double = 0
    var isLoading = false
    var error: Error?

    let dailyGoal: Double = 10_000

    func loadData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            try await manager.requestAuthorization()
            todaySteps = try await manager.fetchTodayStepCount()
            goalProgress = min(todaySteps / dailyGoal, 1.0)
            weeklySteps = try await manager.fetchDailySteps(days: 7)
        } catch {
            self.error = error
        }
    }
}

struct StepCounterView: View {
    @State private var viewModel = StepCounterViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Circular progress
                    ZStack {
                        Circle()
                            .stroke(.gray.opacity(0.2), lineWidth: 16)

                        Circle()
                            .trim(from: 0, to: viewModel.goalProgress)
                            .stroke(
                                .green.gradient,
                                style: StrokeStyle(lineWidth: 16, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                            .animation(.spring(duration: 1.0), value: viewModel.goalProgress)

                        VStack(spacing: 4) {
                            Image(systemName: "figure.walk")
                                .font(.title)
                                .foregroundStyle(.green)

                            Text("\(Int(viewModel.todaySteps))")
                                .font(.system(size: 44, weight: .bold, design: .rounded))
                                .contentTransition(.numericText())

                            Text("of \(Int(viewModel.dailyGoal)) steps")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(width: 220, height: 220)
                    .padding(.top)

                    // Weekly chart
                    VStack(alignment: .leading, spacing: 12) {
                        Text("This Week")
                            .font(.headline)

                        HStack(alignment: .bottom, spacing: 8) {
                            ForEach(viewModel.weeklySteps, id: \.date) { entry in
                                VStack(spacing: 4) {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(
                                            entry.steps >= viewModel.dailyGoal
                                                ? .green.gradient
                                                : .blue.gradient
                                        )
                                        .frame(
                                            height: max(
                                                4,
                                                CGFloat(entry.steps / viewModel.dailyGoal) * 120
                                            )
                                        )

                                    Text(entry.date.formatted(.dateTime.weekday(.narrow)))
                                        .font(.caption2)
                                        .foregroundStyle(.secondary)
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                        .frame(height: 140)
                    }
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal)
                }
            }
            .navigationTitle("Steps")
            .task {
                await viewModel.loadData()
            }
            .refreshable {
                await viewModel.loadData()
            }
        }
    }
}

struct WorkoutTrackerView: View {
    @State private var workoutManager = WorkoutManager()

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                if workoutManager.isWorkoutActive {
                    // Active workout display
                    VStack(spacing: 20) {
                        // Timer
                        Text(
                            Duration.seconds(workoutManager.elapsedTime)
                                .formatted(.time(pattern: .hourMinuteSecond))
                        )
                        .font(.system(size: 48, weight: .bold, design: .monospaced))

                        // Metrics grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            MetricCard(
                                title: "Heart Rate",
                                value: "\(Int(workoutManager.heartRate))",
                                unit: "BPM",
                                icon: "heart.fill",
                                color: .red
                            )

                            MetricCard(
                                title: "Calories",
                                value: "\(Int(workoutManager.activeCalories))",
                                unit: "kcal",
                                icon: "flame.fill",
                                color: .orange
                            )

                            MetricCard(
                                title: "Distance",
                                value: String(format: "%.2f", workoutManager.distance / 1000),
                                unit: "km",
                                icon: "figure.run",
                                color: .green
                            )
                        }
                        .padding(.horizontal)

                        // Controls
                        HStack(spacing: 24) {
                            Button {
                                workoutManager.pauseWorkout()
                            } label: {
                                Image(systemName: "pause.fill")
                                    .font(.title2)
                                    .frame(width: 60, height: 60)
                                    .background(.yellow.gradient, in: Circle())
                                    .foregroundStyle(.black)
                            }

                            Button {
                                Task { try? await workoutManager.endWorkout() }
                            } label: {
                                Image(systemName: "stop.fill")
                                    .font(.title2)
                                    .frame(width: 60, height: 60)
                                    .background(.red.gradient, in: Circle())
                                    .foregroundStyle(.white)
                            }
                        }
                    }
                } else {
                    // Workout type selection
                    VStack(spacing: 16) {
                        Text("Start a Workout")
                            .font(.title2.bold())

                        ForEach(workoutTypes, id: \.type) { workout in
                            Button {
                                Task {
                                    try? await workoutManager.startWorkout(type: workout.type)
                                }
                            } label: {
                                HStack {
                                    Image(systemName: workout.icon)
                                        .font(.title2)
                                        .frame(width: 44)
                                    Text(workout.name)
                                        .font(.headline)
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .foregroundStyle(.tertiary)
                                }
                                .padding()
                                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Workout")
        }
    }

    var workoutTypes: [(name: String, type: HKWorkoutActivityType, icon: String)] {
        [
            ("Outdoor Run", .running, "figure.run"),
            ("Outdoor Walk", .walking, "figure.walk"),
            ("Cycling", .cycling, "figure.outdoor.cycle"),
            ("Swimming", .swimming, "figure.pool.swim"),
            ("Strength Training", .traditionalStrengthTraining, "dumbbell.fill")
        ]
    }
}

struct MetricCard: View {
    let title: String
    let value: String
    let unit: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .font(.title3)

            Text(value)
                .font(.system(.title, design: .rounded, weight: .bold))
                .contentTransition(.numericText())

            Text(unit)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
```
