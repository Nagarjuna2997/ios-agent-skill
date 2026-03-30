# CoreMotion

## CMMotionManager Setup

Only one `CMMotionManager` should exist per app. Create it as a shared instance.

```swift
import CoreMotion

@Observable
class MotionManager {
    static let shared = MotionManager()

    let motionManager = CMMotionManager()

    var accelerometerData: CMAccelerometerData?
    var gyroData: CMGyroData?
    var deviceMotion: CMDeviceMotion?

    var isAccelerometerAvailable: Bool { motionManager.isAccelerometerAvailable }
    var isGyroAvailable: Bool { motionManager.isGyroAvailable }
    var isDeviceMotionAvailable: Bool { motionManager.isDeviceMotionAvailable }

    deinit {
        stopAllUpdates()
    }

    func stopAllUpdates() {
        motionManager.stopAccelerometerUpdates()
        motionManager.stopGyroUpdates()
        motionManager.stopDeviceMotionUpdates()
    }
}
```

## Accelerometer Data (CMAccelerometerData)

Measures acceleration along x, y, z axes in G-force units. Includes gravity.

```swift
extension MotionManager {
    /// Start accelerometer updates at the given frequency
    func startAccelerometer(frequency: Double = 60.0) {
        guard isAccelerometerAvailable else { return }

        motionManager.accelerometerUpdateInterval = 1.0 / frequency

        motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, error in
            guard let data, error == nil else { return }
            self?.accelerometerData = data

            // Access raw values
            let x = data.acceleration.x  // lateral
            let y = data.acceleration.y  // longitudinal
            let z = data.acceleration.z  // vertical
            let magnitude = sqrt(x * x + y * y + z * z)
        }
    }

    /// Poll-based accelerometer reading (no callback)
    func readAccelerometer() -> CMAccelerometerData? {
        motionManager.startAccelerometerUpdates()
        return motionManager.accelerometerData
    }

    func stopAccelerometer() {
        motionManager.stopAccelerometerUpdates()
    }
}
```

## Gyroscope Data (CMGyroData)

Measures rotation rate in radians per second around x, y, z axes.

```swift
extension MotionManager {
    func startGyroscope(frequency: Double = 60.0) {
        guard isGyroAvailable else { return }

        motionManager.gyroUpdateInterval = 1.0 / frequency

        motionManager.startGyroUpdates(to: .main) { [weak self] data, error in
            guard let data, error == nil else { return }
            self?.gyroData = data

            let rotationX = data.rotationRate.x  // pitch rate
            let rotationY = data.rotationRate.y  // yaw rate
            let rotationZ = data.rotationRate.z  // roll rate
        }
    }

    func stopGyroscope() {
        motionManager.stopGyroUpdates()
    }
}
```

## Device Motion (CMDeviceMotion)

Combines accelerometer, gyroscope, and magnetometer into processed motion data. Separates user acceleration from gravity and provides attitude (orientation).

```swift
extension MotionManager {
    func startDeviceMotion(
        frequency: Double = 60.0,
        referenceFrame: CMAttitudeReferenceFrame = .xArbitraryZVertical
    ) {
        guard isDeviceMotionAvailable else { return }

        motionManager.deviceMotionUpdateInterval = 1.0 / frequency

        motionManager.startDeviceMotionUpdates(
            using: referenceFrame,
            to: .main
        ) { [weak self] motion, error in
            guard let motion, error == nil else { return }
            self?.deviceMotion = motion

            // Attitude — device orientation
            let pitch = motion.attitude.pitch   // radians, nose up/down
            let roll = motion.attitude.roll     // radians, tilt left/right
            let yaw = motion.attitude.yaw       // radians, compass heading

            // Rotation rate (processed, bias removed)
            let rotRate = motion.rotationRate

            // Gravity vector (unit gravity direction in device frame)
            let gx = motion.gravity.x
            let gy = motion.gravity.y
            let gz = motion.gravity.z

            // User acceleration (gravity removed)
            let ux = motion.userAcceleration.x
            let uy = motion.userAcceleration.y
            let uz = motion.userAcceleration.z

            // Magnetic field (calibrated)
            let field = motion.magneticField.field
            let accuracy = motion.magneticField.accuracy
        }
    }

    func stopDeviceMotion() {
        motionManager.stopDeviceMotionUpdates()
    }

    /// Detect device orientation from gravity
    func currentOrientation() -> String {
        guard let gravity = deviceMotion?.gravity else { return "Unknown" }

        if gravity.z < -0.8 { return "Face Up" }
        if gravity.z > 0.8 { return "Face Down" }
        if gravity.x < -0.8 { return "Landscape Left" }
        if gravity.x > 0.8 { return "Landscape Right" }
        if gravity.y < -0.8 { return "Portrait" }
        if gravity.y > 0.8 { return "Portrait Upside Down" }
        return "Unknown"
    }
}
```

## CMPedometer — Steps, Distance, Floors, Cadence

No special permissions needed; data is available if the hardware supports it. Use `CMPedometer` instead of `CMMotionManager` for step counting.

```swift
@Observable
class PedometerManager {
    let pedometer = CMPedometer()

    var steps: Int = 0
    var distance: Double = 0        // meters
    var floorsAscended: Int = 0
    var floorsDescended: Int = 0
    var currentCadence: Double = 0  // steps per second
    var currentPace: Double = 0     // seconds per meter
    var isAvailable: Bool { CMPedometer.isStepCountingAvailable() }

    /// Query historical pedometer data
    func fetchSteps(from start: Date, to end: Date = .now) async throws -> CMPedometerData {
        try await withCheckedThrowingContinuation { continuation in
            pedometer.queryPedometerData(from: start, to: end) { data, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                guard let data else {
                    continuation.resume(throwing: PedometerError.noData)
                    return
                }
                continuation.resume(returning: data)
            }
        }
    }

    /// Start live pedometer updates from a given date
    func startLiveUpdates(from date: Date = Calendar.current.startOfDay(for: .now)) {
        guard isAvailable else { return }

        pedometer.startUpdates(from: date) { [weak self] data, error in
            guard let data, error == nil else { return }

            Task { @MainActor in
                self?.steps = data.numberOfSteps.intValue
                self?.distance = data.distance?.doubleValue ?? 0
                self?.floorsAscended = data.floorsAscended?.intValue ?? 0
                self?.floorsDescended = data.floorsDescended?.intValue ?? 0
                self?.currentCadence = data.currentCadence?.doubleValue ?? 0
                self?.currentPace = data.currentPace?.doubleValue ?? 0
            }
        }
    }

    func stopLiveUpdates() {
        pedometer.stopUpdates()
    }
}

enum PedometerError: LocalizedError {
    case noData
    case notAvailable

    var errorDescription: String? {
        switch self {
        case .noData: return "No pedometer data available."
        case .notAvailable: return "Step counting is not available on this device."
        }
    }
}
```

## CMMotionActivityManager — Activity Recognition

Detects whether the user is walking, running, driving, cycling, or stationary. Requires `NSMotionUsageDescription` in `Info.plist`.

```swift
import CoreMotion

@Observable
class ActivityManager {
    let activityManager = CMMotionActivityManager()

    var currentActivity: String = "Unknown"
    var confidence: CMMotionActivityConfidence = .low
    var isStationary = false
    var isWalking = false
    var isRunning = false
    var isAutomotive = false
    var isCycling = false

    var isAvailable: Bool { CMMotionActivityManager.isActivityAvailable() }

    func startActivityUpdates() {
        guard isAvailable else { return }

        activityManager.startActivityUpdates(to: .main) { [weak self] activity in
            guard let activity, let self else { return }

            self.confidence = activity.confidence
            self.isStationary = activity.stationary
            self.isWalking = activity.walking
            self.isRunning = activity.running
            self.isAutomotive = activity.automotive
            self.isCycling = activity.cycling

            self.currentActivity = self.activityDescription(activity)
        }
    }

    func stopActivityUpdates() {
        activityManager.stopActivityUpdates()
    }

    /// Query historical activities
    func fetchActivities(from start: Date, to end: Date = .now) async throws -> [CMMotionActivity] {
        try await withCheckedThrowingContinuation { continuation in
            activityManager.queryActivityStarting(
                from: start,
                to: end,
                to: .main
            ) { activities, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                continuation.resume(returning: activities ?? [])
            }
        }
    }

    private func activityDescription(_ activity: CMMotionActivity) -> String {
        if activity.running { return "Running" }
        if activity.cycling { return "Cycling" }
        if activity.automotive { return "Driving" }
        if activity.walking { return "Walking" }
        if activity.stationary { return "Stationary" }
        return "Unknown"
    }
}
```

## CMAltimeter — Relative Altitude

Measures relative altitude changes using the barometric pressure sensor.

```swift
@Observable
class AltimeterManager {
    let altimeter = CMAltimeter()

    var relativeAltitude: Double = 0  // meters, relative to start
    var pressure: Double = 0          // kilopascals

    var isAvailable: Bool { CMAltimeter.isRelativeAltitudeAvailable() }

    func startAltimeterUpdates() {
        guard isAvailable else { return }

        altimeter.startRelativeAltitudeUpdates(to: .main) { [weak self] data, error in
            guard let data, error == nil else { return }

            self?.relativeAltitude = data.relativeAltitude.doubleValue
            self?.pressure = data.pressure.doubleValue
        }
    }

    func stopAltimeterUpdates() {
        altimeter.stopRelativeAltitudeUpdates()
    }
}
```

## Motion Data Frequency and Battery Considerations

```swift
/// Frequency guidelines:
/// - UI updates (tilt, orientation): 10-30 Hz
/// - Games and AR: 60 Hz
/// - Gesture detection: 50-100 Hz
/// - Avoid > 100 Hz unless necessary — major battery drain

extension MotionManager {
    /// Configure for low-power UI-driven usage
    func configureLowPower() {
        motionManager.accelerometerUpdateInterval = 1.0 / 10.0  // 10 Hz
        motionManager.gyroUpdateInterval = 1.0 / 10.0
        motionManager.deviceMotionUpdateInterval = 1.0 / 10.0
    }

    /// Configure for high-fidelity game/AR usage
    func configureHighFidelity() {
        motionManager.accelerometerUpdateInterval = 1.0 / 60.0  // 60 Hz
        motionManager.gyroUpdateInterval = 1.0 / 60.0
        motionManager.deviceMotionUpdateInterval = 1.0 / 60.0
    }
}

/// Best practices:
/// - Stop updates when the app enters the background
/// - Use the lowest frequency that meets your needs
/// - Prefer CMDeviceMotion over raw accelerometer/gyro (sensor fusion is better)
/// - Use CMPedometer for step counting instead of raw accelerometer
/// - Process data on a background queue, update UI on main queue
```

## Complete Pedometer and Motion Tracking Examples

```swift
import SwiftUI
import CoreMotion

struct PedometerView: View {
    @State private var pedometerManager = PedometerManager()
    @State private var activityManager = ActivityManager()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Step counter ring
                    ZStack {
                        Circle()
                            .stroke(.gray.opacity(0.2), lineWidth: 12)

                        Circle()
                            .trim(from: 0, to: min(Double(pedometerManager.steps) / 10000.0, 1.0))
                            .stroke(
                                .green.gradient,
                                style: StrokeStyle(lineWidth: 12, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                            .animation(.spring(duration: 0.8), value: pedometerManager.steps)

                        VStack(spacing: 4) {
                            Image(systemName: "figure.walk")
                                .font(.largeTitle)
                                .foregroundStyle(.green)

                            Text("\(pedometerManager.steps)")
                                .font(.system(size: 48, weight: .bold, design: .rounded))
                                .contentTransition(.numericText())

                            Text("steps today")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(width: 200, height: 200)

                    // Current activity
                    HStack {
                        Image(systemName: activityIcon)
                            .font(.title2)
                            .foregroundStyle(.blue)
                            .frame(width: 44, height: 44)
                            .background(.blue.opacity(0.1), in: Circle())

                        VStack(alignment: .leading) {
                            Text("Current Activity")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(activityManager.currentActivity)
                                .font(.headline)
                        }

                        Spacer()
                    }
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal)

                    // Metrics grid
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        MotionMetricCard(
                            title: "Distance",
                            value: String(
                                format: "%.1f",
                                pedometerManager.distance / 1000
                            ),
                            unit: "km",
                            icon: "location.fill",
                            color: .blue
                        )

                        MotionMetricCard(
                            title: "Floors Up",
                            value: "\(pedometerManager.floorsAscended)",
                            unit: "floors",
                            icon: "arrow.up",
                            color: .orange
                        )

                        MotionMetricCard(
                            title: "Cadence",
                            value: String(
                                format: "%.0f",
                                pedometerManager.currentCadence * 60
                            ),
                            unit: "steps/min",
                            icon: "metronome.fill",
                            color: .purple
                        )

                        MotionMetricCard(
                            title: "Floors Down",
                            value: "\(pedometerManager.floorsDescended)",
                            unit: "floors",
                            icon: "arrow.down",
                            color: .teal
                        )
                    }
                    .padding(.horizontal)
                }
                .padding(.top)
            }
            .navigationTitle("Pedometer")
            .onAppear {
                pedometerManager.startLiveUpdates()
                activityManager.startActivityUpdates()
            }
            .onDisappear {
                pedometerManager.stopLiveUpdates()
                activityManager.stopActivityUpdates()
            }
        }
    }

    var activityIcon: String {
        if activityManager.isRunning { return "figure.run" }
        if activityManager.isCycling { return "figure.outdoor.cycle" }
        if activityManager.isAutomotive { return "car.fill" }
        if activityManager.isWalking { return "figure.walk" }
        return "figure.stand"
    }
}

struct MotionMetricCard: View {
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
                .font(.system(.title2, design: .rounded, weight: .bold))
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

struct MotionTrackerView: View {
    @State private var motionManager = MotionManager()

    var body: some View {
        NavigationStack {
            List {
                if let motion = motionManager.deviceMotion {
                    Section("Attitude (degrees)") {
                        MotionRow(label: "Pitch", value: degrees(motion.attitude.pitch))
                        MotionRow(label: "Roll", value: degrees(motion.attitude.roll))
                        MotionRow(label: "Yaw", value: degrees(motion.attitude.yaw))
                    }

                    Section("User Acceleration (G)") {
                        MotionRow(label: "X", value: motion.userAcceleration.x)
                        MotionRow(label: "Y", value: motion.userAcceleration.y)
                        MotionRow(label: "Z", value: motion.userAcceleration.z)
                    }

                    Section("Gravity (G)") {
                        MotionRow(label: "X", value: motion.gravity.x)
                        MotionRow(label: "Y", value: motion.gravity.y)
                        MotionRow(label: "Z", value: motion.gravity.z)
                    }

                    Section("Rotation Rate (rad/s)") {
                        MotionRow(label: "X", value: motion.rotationRate.x)
                        MotionRow(label: "Y", value: motion.rotationRate.y)
                        MotionRow(label: "Z", value: motion.rotationRate.z)
                    }

                    Section("Orientation") {
                        Text(motionManager.currentOrientation())
                            .font(.headline)
                    }
                } else {
                    ContentUnavailableView(
                        "No Motion Data",
                        systemImage: "gyroscope",
                        description: Text("Waiting for device motion updates.")
                    )
                }
            }
            .navigationTitle("Motion Tracker")
            .onAppear {
                motionManager.startDeviceMotion(frequency: 30)
            }
            .onDisappear {
                motionManager.stopDeviceMotion()
            }
        }
    }

    func degrees(_ radians: Double) -> Double {
        radians * 180.0 / .pi
    }
}

struct MotionRow: View {
    let label: String
    let value: Double

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(String(format: "%.3f", value))
                .monospacedDigit()
                .contentTransition(.numericText())
        }
    }
}
```
