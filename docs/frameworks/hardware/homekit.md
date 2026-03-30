# HomeKit and Matter

## HMHomeManager Setup

Add the HomeKit capability in Xcode under Signing & Capabilities. Add `NSHomeKitUsageDescription` to `Info.plist`.

```swift
import HomeKit

@Observable
class HomeManager: NSObject, HMHomeManagerDelegate {
    static let shared = HomeManager()

    let homeManager = HMHomeManager()

    var homes: [HMHome] = []
    var primaryHome: HMHome?
    var isReady = false
    var error: Error?

    override init() {
        super.init()
        homeManager.delegate = self
    }

    func homeManagerDidUpdateHomes(_ manager: HMHomeManager) {
        homes = manager.homes
        primaryHome = manager.primaryHome
        isReady = true
    }

    func homeManagerDidUpdatePrimaryHome(_ manager: HMHomeManager) {
        primaryHome = manager.primaryHome
    }
}
```

## Homes, Rooms, and Zones

```swift
extension HomeManager {
    // MARK: - Homes

    func addHome(named name: String) async throws -> HMHome {
        try await withCheckedThrowingContinuation { continuation in
            homeManager.addHome(withName: name) { home, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let home {
                    continuation.resume(returning: home)
                }
            }
        }
    }

    func removeHome(_ home: HMHome) async throws {
        try await withCheckedThrowingContinuation { continuation in
            homeManager.removeHome(home) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // MARK: - Rooms

    func addRoom(named name: String, to home: HMHome) async throws -> HMRoom {
        try await withCheckedThrowingContinuation { continuation in
            home.addRoom(withName: name) { room, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let room {
                    continuation.resume(returning: room)
                }
            }
        }
    }

    // MARK: - Zones

    func addZone(named name: String, to home: HMHome) async throws -> HMZone {
        try await withCheckedThrowingContinuation { continuation in
            home.addZone(withName: name) { zone, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let zone {
                    continuation.resume(returning: zone)
                }
            }
        }
    }

    func addRoom(_ room: HMRoom, to zone: HMZone) async throws {
        try await withCheckedThrowingContinuation { continuation in
            zone.addRoom(room) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }
}
```

## Accessories and Services

```swift
@Observable
class AccessoryManager: NSObject, HMHomeDelegate {
    var accessories: [HMAccessory] = []
    var home: HMHome

    init(home: HMHome) {
        self.home = home
        super.init()
        home.delegate = self
        accessories = home.accessories
    }

    // Add accessory via setup code
    func addAccessory() async throws {
        // This presents the system UI for adding accessories
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            home.addAndSetupAccessories { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
        accessories = home.accessories
    }

    // Remove an accessory
    func removeAccessory(_ accessory: HMAccessory) async throws {
        try await withCheckedThrowingContinuation { continuation in
            home.removeAccessory(accessory) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
        accessories = home.accessories
    }

    // Assign accessory to a room
    func assignAccessory(_ accessory: HMAccessory, to room: HMRoom) async throws {
        try await withCheckedThrowingContinuation { continuation in
            home.assignAccessory(accessory, to: room) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // Get services for an accessory
    func services(for accessory: HMAccessory) -> [HMService] {
        accessory.services.filter { service in
            // Filter out information services
            service.serviceType != HMServiceTypeAccessoryInformation
        }
    }

    // HMHomeDelegate — accessory updates
    func home(_ home: HMHome, didAdd accessory: HMAccessory) {
        accessories = home.accessories
    }

    func home(_ home: HMHome, didRemove accessory: HMAccessory) {
        accessories = home.accessories
    }

    func home(
        _ home: HMHome,
        didUpdate room: HMRoom,
        for accessory: HMAccessory
    ) {
        // Accessory moved to a different room
    }
}
```

## Characteristics — Reading, Writing, Subscribing

```swift
extension AccessoryManager {
    // Read a characteristic value
    func readCharacteristic(_ characteristic: HMCharacteristic) async throws -> Any? {
        try await withCheckedThrowingContinuation { continuation in
            characteristic.readValue { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: characteristic.value)
                }
            }
        }
    }

    // Write a characteristic value
    func writeCharacteristic(_ characteristic: HMCharacteristic, value: Any) async throws {
        try await withCheckedThrowingContinuation { continuation in
            characteristic.writeValue(value) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // Subscribe to characteristic changes
    func subscribeToCharacteristic(_ characteristic: HMCharacteristic) async throws {
        try await withCheckedThrowingContinuation { continuation in
            characteristic.enableNotification(true) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // Common operations
    func toggleLight(_ service: HMService) async throws {
        guard let powerState = service.characteristics.first(where: {
            $0.characteristicType == HMCharacteristicTypePowerState
        }) else { return }

        let currentValue = powerState.value as? Bool ?? false
        try await writeCharacteristic(powerState, value: !currentValue)
    }

    func setBrightness(_ service: HMService, to value: Int) async throws {
        guard let brightness = service.characteristics.first(where: {
            $0.characteristicType == HMCharacteristicTypeBrightness
        }) else { return }

        let clamped = max(0, min(100, value))
        try await writeCharacteristic(brightness, value: clamped)
    }

    func setThermostat(_ service: HMService, targetTemp: Double) async throws {
        guard let targetTemperature = service.characteristics.first(where: {
            $0.characteristicType == HMCharacteristicTypeTargetTemperature
        }) else { return }

        try await writeCharacteristic(targetTemperature, value: targetTemp)
    }

    func getLockState(_ service: HMService) async throws -> Bool {
        guard let lockState = service.characteristics.first(where: {
            $0.characteristicType == HMCharacteristicTypeCurrentLockMechanismState
        }) else { return false }

        let value = try await readCharacteristic(lockState)
        // 0 = unsecured, 1 = secured
        return (value as? Int) == 1
    }
}
```

## Automations and Triggers

```swift
extension HomeManager {
    // MARK: - Timer Trigger (time-based automation)

    func createTimerTrigger(
        name: String,
        fireDate: DateComponents,
        recurrence: DateComponents? = nil,
        actionSet: HMActionSet,
        in home: HMHome
    ) async throws {
        let trigger = HMTimerTrigger(
            name: name,
            fireDate: fireDate,
            timeZone: .current,
            recurrence: recurrence,
            recurrenceCalendar: .current
        )

        try await withCheckedThrowingContinuation { continuation in
            home.addTrigger(trigger) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }

        // Add action set to trigger
        try await withCheckedThrowingContinuation { continuation in
            trigger.addActionSet(actionSet) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }

        // Enable the trigger
        try await withCheckedThrowingContinuation { continuation in
            trigger.enable(true) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // MARK: - Event Trigger (condition-based automation)

    func createSunsetTrigger(
        name: String,
        offset: TimeInterval = 0,
        actionSet: HMActionSet,
        in home: HMHome
    ) async throws {
        let sunsetEvent = HMSignificantTimeEvent(
            significantEvent: .sunset,
            offset: DateComponents(second: Int(offset))
        )

        let trigger = HMEventTrigger(
            name: name,
            events: [sunsetEvent],
            predicate: nil
        )

        try await withCheckedThrowingContinuation { continuation in
            home.addTrigger(trigger) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }

        try await withCheckedThrowingContinuation { continuation in
            trigger.addActionSet(actionSet) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // Create a characteristic event trigger (when a value changes)
    func createCharacteristicTrigger(
        name: String,
        characteristic: HMCharacteristic,
        targetValue: Any,
        actionSet: HMActionSet,
        in home: HMHome
    ) async throws {
        let event = HMCharacteristicEvent(
            characteristic: characteristic,
            triggerValue: targetValue as? NSCopying
        )

        let trigger = HMEventTrigger(
            name: name,
            events: [event],
            predicate: nil
        )

        try await withCheckedThrowingContinuation { continuation in
            home.addTrigger(trigger) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }

        try await withCheckedThrowingContinuation { continuation in
            trigger.addActionSet(actionSet) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }
}
```

## Action Sets and Scenes

```swift
extension HomeManager {
    // Create an action set (scene)
    func createScene(
        named name: String,
        actions: [(characteristic: HMCharacteristic, value: Any)],
        in home: HMHome
    ) async throws -> HMActionSet {
        let actionSet = try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<HMActionSet, Error>) in
            home.addActionSet(withName: name) { actionSet, error in
                if let error {
                    continuation.resume(throwing: error)
                } else if let actionSet {
                    continuation.resume(returning: actionSet)
                }
            }
        }

        // Add actions to the set
        for action in actions {
            let writeAction = HMCharacteristicWriteAction(
                characteristic: action.characteristic,
                targetValue: action.value as! NSCopying
            )

            try await withCheckedThrowingContinuation { continuation in
                actionSet.addAction(writeAction) { error in
                    if let error {
                        continuation.resume(throwing: error)
                    } else {
                        continuation.resume()
                    }
                }
            }
        }

        return actionSet
    }

    // Execute a scene
    func executeScene(_ actionSet: HMActionSet, in home: HMHome) async throws {
        try await withCheckedThrowingContinuation { continuation in
            home.executeActionSet(actionSet) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }

    // Get built-in action sets
    func builtInScenes(for home: HMHome) -> (
        homeArrive: HMActionSet?,
        homeLeave: HMActionSet?,
        sleep: HMActionSet?,
        wake: HMActionSet?
    ) {
        let sets = home.actionSets
        return (
            homeArrive: sets.first { $0.actionSetType == HMActionSetTypeHomeArrival },
            homeLeave: sets.first { $0.actionSetType == HMActionSetTypHomeDeparture },
            sleep: sets.first { $0.actionSetType == HMActionSetTypeSleep },
            wake: sets.first { $0.actionSetType == HMActionSetTypeWakeUp }
        )
    }
}
```

## Matter Support

Requires iOS 16.1+. Add the Matter capability in Xcode.

```swift
import MatterSupport

@Observable
class MatterManager {
    /// Request to add a Matter device to the home
    func addMatterDevice() async throws {
        let topology = MatterAddDeviceRequest.Topology(
            ecosystemName: "My Home App",
            homes: [
                MatterAddDeviceRequest.Home(displayName: "My Home")
            ]
        )

        let request = MatterAddDeviceRequest(topology: topology)

        // This presents the system Matter pairing UI
        try await request.perform()
    }
}

// Handle Matter setup in your App struct
extension MatterManager {
    /// Commission a device with a setup code
    func addDeviceWithSetupCode() async throws {
        let topology = MatterAddDeviceRequest.Topology(
            ecosystemName: "My Home App",
            homes: [
                MatterAddDeviceRequest.Home(displayName: "My Home")
            ]
        )

        let request = MatterAddDeviceRequest(
            topology: topology,
            setupPayload: nil  // System will prompt user to scan QR or enter code
        )

        try await request.perform()
    }
}
```

## Complete Smart Home Controller Example

```swift
import SwiftUI
import HomeKit

struct SmartHomeView: View {
    @State private var homeManager = HomeManager.shared
    @State private var selectedHome: HMHome?
    @State private var showAddAccessory = false

    var body: some View {
        NavigationStack {
            Group {
                if homeManager.isReady, let home = selectedHome ?? homeManager.primaryHome {
                    HomeDetailView(home: home)
                } else if !homeManager.isReady {
                    ProgressView("Loading homes...")
                } else {
                    ContentUnavailableView(
                        "No Home",
                        systemImage: "house",
                        description: Text("Add a home to get started.")
                    )
                }
            }
            .navigationTitle("My Home")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        ForEach(homeManager.homes, id: \.uniqueIdentifier) { home in
                            Button(home.name) {
                                selectedHome = home
                            }
                        }
                        Divider()
                        Button("Add Home", systemImage: "plus") {
                            Task {
                                _ = try? await homeManager.addHome(named: "New Home")
                            }
                        }
                    } label: {
                        Image(systemName: "house.fill")
                    }
                }
            }
        }
    }
}

struct HomeDetailView: View {
    let home: HMHome
    @State private var accessoryManager: AccessoryManager?

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                // Rooms section
                ForEach(home.rooms, id: \.uniqueIdentifier) { room in
                    RoomCard(room: room, accessoryManager: accessoryManager)
                }

                // Scenes section
                if !home.actionSets.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Scenes")
                            .font(.headline)
                            .padding(.horizontal)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(home.actionSets, id: \.uniqueIdentifier) { scene in
                                    SceneButton(
                                        scene: scene,
                                        home: home
                                    )
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
            }
            .padding(.vertical)
        }
        .onAppear {
            accessoryManager = AccessoryManager(home: home)
        }
    }
}

struct RoomCard: View {
    let room: HMRoom
    let accessoryManager: AccessoryManager?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(room.name)
                .font(.headline)

            let roomAccessories = room.accessories
            if roomAccessories.isEmpty {
                Text("No accessories")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 10) {
                    ForEach(roomAccessories, id: \.uniqueIdentifier) { accessory in
                        AccessoryTile(
                            accessory: accessory,
                            accessoryManager: accessoryManager
                        )
                    }
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal)
    }
}

struct AccessoryTile: View {
    let accessory: HMAccessory
    let accessoryManager: AccessoryManager?
    @State private var isOn = false

    var body: some View {
        Button {
            toggleAccessory()
        } label: {
            VStack(spacing: 8) {
                Image(systemName: iconForAccessory)
                    .font(.title2)
                    .foregroundStyle(isOn ? .yellow : .secondary)

                Text(accessory.name)
                    .font(.caption)
                    .lineLimit(1)
                    .foregroundStyle(.primary)

                Text(isOn ? "On" : "Off")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                isOn ? Color.yellow.opacity(0.15) : Color.gray.opacity(0.1),
                in: RoundedRectangle(cornerRadius: 12)
            )
        }
        .buttonStyle(.plain)
        .task { await loadState() }
    }

    var iconForAccessory: String {
        for service in accessory.services {
            switch service.serviceType {
            case HMServiceTypeLightbulb: return "lightbulb.fill"
            case HMServiceTypeFan: return "fan.fill"
            case HMServiceTypeThermostat: return "thermometer"
            case HMServiceTypeLockMechanism: return "lock.fill"
            case HMServiceTypeGarageDoorOpener: return "door.garage.closed"
            case HMServiceTypeSwitch: return "switch.2"
            default: continue
            }
        }
        return "house.fill"
    }

    func loadState() async {
        for service in accessory.services {
            if let powerChar = service.characteristics.first(where: {
                $0.characteristicType == HMCharacteristicTypePowerState
            }) {
                let value = try? await accessoryManager?.readCharacteristic(powerChar)
                isOn = value as? Bool ?? false
                return
            }
        }
    }

    func toggleAccessory() {
        for service in accessory.services {
            if let powerChar = service.characteristics.first(where: {
                $0.characteristicType == HMCharacteristicTypePowerState
            }) {
                Task {
                    try? await accessoryManager?.writeCharacteristic(powerChar, value: !isOn)
                    isOn.toggle()
                }
                return
            }
        }
    }
}

struct SceneButton: View {
    let scene: HMActionSet
    let home: HMHome

    var body: some View {
        Button {
            Task {
                try? await HomeManager.shared.executeScene(scene, in: home)
            }
        } label: {
            VStack(spacing: 8) {
                Image(systemName: iconForScene)
                    .font(.title2)
                    .foregroundStyle(.blue)

                Text(scene.name)
                    .font(.caption)
                    .foregroundStyle(.primary)
            }
            .frame(width: 80, height: 80)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }

    var iconForScene: String {
        switch scene.actionSetType {
        case HMActionSetTypeHomeArrival: return "house.fill"
        case HMActionSetTypHomeDeparture: return "figure.walk"
        case HMActionSetTypeSleep: return "moon.fill"
        case HMActionSetTypeWakeUp: return "sun.max.fill"
        default: return "sparkles"
        }
    }
}
```
