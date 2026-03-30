# CoreBluetooth

## CBCentralManager Setup and State Handling

Add to `Info.plist`:
- `NSBluetoothAlwaysUsageDescription` — required for Bluetooth access
- `UIBackgroundModes` — include `bluetooth-central` and/or `bluetooth-peripheral` for background BLE

```swift
import CoreBluetooth

@Observable
class BLEManager: NSObject, CBCentralManagerDelegate {
    static let shared = BLEManager()

    var centralManager: CBCentralManager!
    var isBluetoothReady = false
    var bluetoothState: CBManagerState = .unknown
    var discoveredPeripherals: [CBPeripheral] = []
    var connectedPeripheral: CBPeripheral?

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        bluetoothState = central.state

        switch central.state {
        case .poweredOn:
            isBluetoothReady = true
        case .poweredOff:
            isBluetoothReady = false
        case .unauthorized:
            isBluetoothReady = false
        case .unsupported:
            isBluetoothReady = false
        case .resetting:
            isBluetoothReady = false
        case .unknown:
            break
        @unknown default:
            break
        }
    }
}
```

## Scanning for Peripherals

```swift
// Define service UUIDs to scan for
let heartRateServiceUUID = CBUUID(string: "180D")
let batteryServiceUUID = CBUUID(string: "180F")

extension BLEManager {
    func startScanning() {
        guard isBluetoothReady else { return }

        // Scan for specific services (recommended) or pass nil for all
        centralManager.scanForPeripherals(
            withServices: [heartRateServiceUUID],
            options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
        )
    }

    func stopScanning() {
        centralManager.stopScan()
    }

    func centralManager(
        _ central: CBCentralManager,
        didDiscover peripheral: CBPeripheral,
        advertisementData: [String: Any],
        rssi RSSI: NSNumber
    ) {
        // Filter by signal strength
        guard RSSI.intValue > -80 else { return }

        // Parse advertisement data
        let localName = advertisementData[CBAdvertisementDataLocalNameKey] as? String
        let isConnectable = advertisementData[CBAdvertisementDataIsConnectable] as? Bool ?? false

        if !discoveredPeripherals.contains(where: { $0.identifier == peripheral.identifier }) {
            discoveredPeripherals.append(peripheral)
        }
    }
}
```

## Connecting and Discovering Services/Characteristics

```swift
extension BLEManager: CBPeripheralDelegate {
    func connect(to peripheral: CBPeripheral) {
        centralManager.stopScan()
        peripheral.delegate = self
        centralManager.connect(peripheral, options: nil)
    }

    func disconnect() {
        guard let peripheral = connectedPeripheral else { return }
        centralManager.cancelPeripheralConnection(peripheral)
    }

    // Connection callbacks
    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        connectedPeripheral = peripheral
        // Discover services after connecting
        peripheral.discoverServices([heartRateServiceUUID, batteryServiceUUID])
    }

    func centralManager(
        _ central: CBCentralManager,
        didFailToConnect peripheral: CBPeripheral,
        error: Error?
    ) {
        connectedPeripheral = nil
    }

    func centralManager(
        _ central: CBCentralManager,
        didDisconnectPeripheral peripheral: CBPeripheral,
        error: Error?
    ) {
        connectedPeripheral = nil
        // Auto-reconnect if unexpected disconnect
        if error != nil {
            centralManager.connect(peripheral, options: nil)
        }
    }

    // Service discovery
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard let services = peripheral.services else { return }

        for service in services {
            peripheral.discoverCharacteristics(nil, for: service)
        }
    }

    // Characteristic discovery
    func peripheral(
        _ peripheral: CBPeripheral,
        didDiscoverCharacteristicsFor service: CBService,
        error: Error?
    ) {
        guard let characteristics = service.characteristics else { return }

        for characteristic in characteristics {
            if characteristic.properties.contains(.notify) {
                peripheral.setNotifyValue(true, for: characteristic)
            }
            if characteristic.properties.contains(.read) {
                peripheral.readValue(for: characteristic)
            }
        }
    }
}
```

## Reading, Writing, and Subscribing to Characteristics

```swift
let heartRateMeasurementUUID = CBUUID(string: "2A37")
let bodySensorLocationUUID = CBUUID(string: "2A38")

extension BLEManager {
    // Read a characteristic value
    func readCharacteristic(_ characteristic: CBCharacteristic) {
        guard let peripheral = connectedPeripheral else { return }
        peripheral.readValue(for: characteristic)
    }

    // Write a value to a characteristic
    func writeCharacteristic(
        _ characteristic: CBCharacteristic,
        data: Data,
        withResponse: Bool = true
    ) {
        guard let peripheral = connectedPeripheral else { return }
        let type: CBCharacteristicWriteType = withResponse ? .withResponse : .withoutResponse
        peripheral.writeValue(data, for: characteristic, type: type)
    }

    // Subscribe to notifications
    func subscribeToCharacteristic(_ characteristic: CBCharacteristic) {
        guard let peripheral = connectedPeripheral else { return }
        peripheral.setNotifyValue(true, for: characteristic)
    }

    // Handle updated values
    func peripheral(
        _ peripheral: CBPeripheral,
        didUpdateValueFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        guard let data = characteristic.value, error == nil else { return }

        switch characteristic.uuid {
        case heartRateMeasurementUUID:
            let heartRate = parseHeartRate(from: data)
            // Update UI with heart rate
        case bodySensorLocationUUID:
            let location = parseSensorLocation(from: data)
            // Update UI with sensor location
        default:
            break
        }
    }

    // Write confirmation
    func peripheral(
        _ peripheral: CBPeripheral,
        didWriteValueFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        if let error {
            // Handle write error
        }
    }

    private func parseHeartRate(from data: Data) -> Int {
        let bytes = [UInt8](data)
        // Bit 0 of first byte indicates format: 0 = UInt8, 1 = UInt16
        let isUInt16 = (bytes[0] & 0x01) == 1
        if isUInt16 {
            return Int(UInt16(bytes[1]) | (UInt16(bytes[2]) << 8))
        } else {
            return Int(bytes[1])
        }
    }

    private func parseSensorLocation(from data: Data) -> String {
        let bytes = [UInt8](data)
        switch bytes[0] {
        case 0: return "Other"
        case 1: return "Chest"
        case 2: return "Wrist"
        case 3: return "Finger"
        case 4: return "Hand"
        case 5: return "Ear Lobe"
        case 6: return "Foot"
        default: return "Unknown"
        }
    }
}
```

## CBPeripheralManager — Acting as a Peripheral

```swift
@Observable
class BLEPeripheralManager: NSObject, CBPeripheralManagerDelegate {
    var peripheralManager: CBPeripheralManager!
    var isAdvertising = false

    private var heartRateCharacteristic: CBMutableCharacteristic?
    private var subscribedCentrals: [CBCentral] = []

    override init() {
        super.init()
        peripheralManager = CBPeripheralManager(delegate: self, queue: nil)
    }

    func peripheralManagerDidUpdateState(_ peripheral: CBPeripheralManager) {
        guard peripheral.state == .poweredOn else { return }
        setupServices()
    }

    private func setupServices() {
        // Create characteristic
        let heartRateChar = CBMutableCharacteristic(
            type: CBUUID(string: "2A37"),
            properties: [.notify, .read],
            value: nil,
            permissions: [.readable]
        )
        heartRateCharacteristic = heartRateChar

        // Create service
        let heartRateService = CBMutableService(
            type: CBUUID(string: "180D"),
            primary: true
        )
        heartRateService.characteristics = [heartRateChar]

        peripheralManager.add(heartRateService)
    }

    func peripheralManager(
        _ peripheral: CBPeripheralManager,
        didAdd service: CBService,
        error: Error?
    ) {
        guard error == nil else { return }
        startAdvertising()
    }

    func startAdvertising() {
        peripheralManager.startAdvertising([
            CBAdvertisementDataServiceUUIDsKey: [CBUUID(string: "180D")],
            CBAdvertisementDataLocalNameKey: "MyHeartMonitor"
        ])
        isAdvertising = true
    }

    func stopAdvertising() {
        peripheralManager.stopAdvertising()
        isAdvertising = false
    }

    // Handle subscription from central
    func peripheralManager(
        _ peripheral: CBPeripheralManager,
        central: CBCentral,
        didSubscribeTo characteristic: CBCharacteristic
    ) {
        subscribedCentrals.append(central)
    }

    // Send updated heart rate to subscribers
    func updateHeartRate(_ bpm: Int) {
        guard let characteristic = heartRateCharacteristic else { return }

        var data = Data()
        data.append(UInt8(0x00)) // Flags: UInt8 format
        data.append(UInt8(bpm))

        let didSend = peripheralManager.updateValue(
            data,
            for: characteristic,
            onSubscribedCentrals: nil
        )

        if !didSend {
            // Queue is full; will retry when peripheralManagerIsReady is called
        }
    }

    func peripheralManagerIsReadyToUpdateSubscribers(_ peripheral: CBPeripheralManager) {
        // Retry sending queued updates
    }
}
```

## Background BLE Execution Modes

Add to `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
</array>
```

```swift
// Initialize with state restoration for background operation
class BackgroundBLEManager: NSObject, CBCentralManagerDelegate {
    static let restorationIdentifier = "com.app.ble.central"

    var centralManager: CBCentralManager!

    override init() {
        super.init()
        centralManager = CBCentralManager(
            delegate: self,
            queue: nil,
            options: [
                CBCentralManagerOptionRestoreIdentifierKey: Self.restorationIdentifier
            ]
        )
    }

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        if central.state == .poweredOn {
            // Scanning in background requires specific service UUIDs
            central.scanForPeripherals(
                withServices: [CBUUID(string: "180D")],
                options: [CBCentralManagerScanOptionAllowDuplicatesKey: false]
            )
        }
    }

    // State restoration — called when app is relaunched in background
    func centralManager(
        _ central: CBCentralManager,
        willRestoreState dict: [String: Any]
    ) {
        // Restore previously connected peripherals
        if let peripherals = dict[CBCentralManagerRestoredStatePeripheralsKey] as? [CBPeripheral] {
            for peripheral in peripherals {
                peripheral.delegate = self // reassign delegate
                // Re-discover services if needed
                if peripheral.state == .connected {
                    peripheral.discoverServices([CBUUID(string: "180D")])
                }
            }
        }

        // Restore scan services
        if let scanServices = dict[CBCentralManagerRestoredStateScanServicesKey] as? [CBUUID] {
            // App was scanning for these services
        }
    }
}

extension BackgroundBLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {}
    func peripheral(
        _ peripheral: CBPeripheral,
        didDiscoverCharacteristicsFor service: CBService,
        error: Error?
    ) {}
    func peripheral(
        _ peripheral: CBPeripheral,
        didUpdateValueFor characteristic: CBCharacteristic,
        error: Error?
    ) {}
}
```

## Error Handling and Timeout Patterns

```swift
enum BLEError: LocalizedError {
    case bluetoothUnavailable
    case connectionTimeout
    case connectionFailed(Error?)
    case serviceNotFound
    case characteristicNotFound
    case writeFailed(Error?)
    case readFailed(Error?)

    var errorDescription: String? {
        switch self {
        case .bluetoothUnavailable:
            return "Bluetooth is not available on this device."
        case .connectionTimeout:
            return "Connection to the device timed out."
        case .connectionFailed(let error):
            return "Failed to connect: \(error?.localizedDescription ?? "Unknown error")"
        case .serviceNotFound:
            return "Required service not found on device."
        case .characteristicNotFound:
            return "Required characteristic not found."
        case .writeFailed(let error):
            return "Write failed: \(error?.localizedDescription ?? "Unknown error")"
        case .readFailed(let error):
            return "Read failed: \(error?.localizedDescription ?? "Unknown error")"
        }
    }
}

actor BLEConnectionManager {
    private var connectionContinuation: CheckedContinuation<CBPeripheral, Error>?
    private var centralManager: CBCentralManager
    private var delegate: BLEConnectionDelegate

    init(centralManager: CBCentralManager) {
        self.centralManager = centralManager
        self.delegate = BLEConnectionDelegate()
    }

    func connect(to peripheral: CBPeripheral, timeout: Duration = .seconds(10)) async throws -> CBPeripheral {
        try await withThrowingTaskGroup(of: CBPeripheral.self) { group in
            group.addTask {
                try await withCheckedThrowingContinuation { continuation in
                    Task { await self.storeContinuation(continuation) }
                    self.centralManager.connect(peripheral, options: nil)
                }
            }

            group.addTask {
                try await Task.sleep(for: timeout)
                throw BLEError.connectionTimeout
            }

            let result = try await group.next()!
            group.cancelAll()
            return result
        }
    }

    private func storeContinuation(_ continuation: CheckedContinuation<CBPeripheral, Error>) {
        connectionContinuation = continuation
    }

    func didConnect(_ peripheral: CBPeripheral) {
        connectionContinuation?.resume(returning: peripheral)
        connectionContinuation = nil
    }

    func didFailToConnect(_ peripheral: CBPeripheral, error: Error?) {
        connectionContinuation?.resume(throwing: BLEError.connectionFailed(error))
        connectionContinuation = nil
    }
}

private class BLEConnectionDelegate: NSObject {}
```

## Complete BLE Heart Rate Monitor Example

```swift
import SwiftUI
import CoreBluetooth

@Observable
class HeartRateMonitor: NSObject, CBCentralManagerDelegate, CBPeripheralDelegate {
    var heartRate: Int = 0
    var sensorLocation: String = "Unknown"
    var isConnected = false
    var isScanning = false
    var discoveredDevices: [CBPeripheral] = []
    var statusMessage = "Tap Scan to find devices"

    private var centralManager: CBCentralManager!
    private var heartRatePeripheral: CBPeripheral?

    private let heartRateServiceUUID = CBUUID(string: "180D")
    private let heartRateMeasurementUUID = CBUUID(string: "2A37")
    private let bodySensorLocationUUID = CBUUID(string: "2A38")

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: nil)
    }

    func startScan() {
        guard centralManager.state == .poweredOn else {
            statusMessage = "Bluetooth is not ready"
            return
        }
        discoveredDevices.removeAll()
        centralManager.scanForPeripherals(
            withServices: [heartRateServiceUUID],
            options: nil
        )
        isScanning = true
        statusMessage = "Scanning..."
    }

    func stopScan() {
        centralManager.stopScan()
        isScanning = false
    }

    func connect(to peripheral: CBPeripheral) {
        stopScan()
        heartRatePeripheral = peripheral
        peripheral.delegate = self
        centralManager.connect(peripheral, options: nil)
        statusMessage = "Connecting to \(peripheral.name ?? "device")..."
    }

    func disconnectDevice() {
        guard let peripheral = heartRatePeripheral else { return }
        centralManager.cancelPeripheralConnection(peripheral)
    }

    // MARK: - CBCentralManagerDelegate

    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            statusMessage = "Ready to scan"
        case .poweredOff:
            statusMessage = "Bluetooth is off"
        case .unauthorized:
            statusMessage = "Bluetooth permission denied"
        default:
            statusMessage = "Bluetooth unavailable"
        }
    }

    func centralManager(
        _ central: CBCentralManager,
        didDiscover peripheral: CBPeripheral,
        advertisementData: [String: Any],
        rssi RSSI: NSNumber
    ) {
        if !discoveredDevices.contains(where: { $0.identifier == peripheral.identifier }) {
            discoveredDevices.append(peripheral)
        }
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        isConnected = true
        statusMessage = "Connected to \(peripheral.name ?? "device")"
        peripheral.discoverServices([heartRateServiceUUID])
    }

    func centralManager(
        _ central: CBCentralManager,
        didDisconnectPeripheral peripheral: CBPeripheral,
        error: Error?
    ) {
        isConnected = false
        heartRate = 0
        statusMessage = "Disconnected"
    }

    // MARK: - CBPeripheralDelegate

    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        guard let services = peripheral.services else { return }
        for service in services where service.uuid == heartRateServiceUUID {
            peripheral.discoverCharacteristics(
                [heartRateMeasurementUUID, bodySensorLocationUUID],
                for: service
            )
        }
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didDiscoverCharacteristicsFor service: CBService,
        error: Error?
    ) {
        guard let characteristics = service.characteristics else { return }
        for characteristic in characteristics {
            switch characteristic.uuid {
            case heartRateMeasurementUUID:
                peripheral.setNotifyValue(true, for: characteristic)
            case bodySensorLocationUUID:
                peripheral.readValue(for: characteristic)
            default:
                break
            }
        }
    }

    func peripheral(
        _ peripheral: CBPeripheral,
        didUpdateValueFor characteristic: CBCharacteristic,
        error: Error?
    ) {
        guard let data = characteristic.value else { return }
        let bytes = [UInt8](data)

        switch characteristic.uuid {
        case heartRateMeasurementUUID:
            let isUInt16 = (bytes[0] & 0x01) == 1
            heartRate = isUInt16
                ? Int(UInt16(bytes[1]) | (UInt16(bytes[2]) << 8))
                : Int(bytes[1])

        case bodySensorLocationUUID:
            let locations = ["Other", "Chest", "Wrist", "Finger", "Hand", "Ear Lobe", "Foot"]
            let index = Int(bytes[0])
            sensorLocation = index < locations.count ? locations[index] : "Unknown"

        default:
            break
        }
    }
}

struct HeartRateView: View {
    @State private var monitor = HeartRateMonitor()

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Heart rate display
                VStack(spacing: 8) {
                    Image(systemName: "heart.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.red)
                        .symbolEffect(.pulse, isActive: monitor.isConnected)

                    Text("\(monitor.heartRate)")
                        .font(.system(size: 72, weight: .bold, design: .rounded))
                        .contentTransition(.numericText())
                        .animation(.spring, value: monitor.heartRate)

                    Text("BPM")
                        .font(.title3)
                        .foregroundStyle(.secondary)

                    Text("Sensor: \(monitor.sensorLocation)")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding()

                Text(monitor.statusMessage)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                // Device list
                if !monitor.discoveredDevices.isEmpty {
                    List(monitor.discoveredDevices, id: \.identifier) { device in
                        Button {
                            monitor.connect(to: device)
                        } label: {
                            HStack {
                                Image(systemName: "heart.circle")
                                Text(device.name ?? "Unknown Device")
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundStyle(.tertiary)
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                }

                Spacer()
            }
            .navigationTitle("Heart Rate")
            .toolbar {
                if monitor.isConnected {
                    Button("Disconnect") {
                        monitor.disconnectDevice()
                    }
                } else {
                    Button(monitor.isScanning ? "Stop" : "Scan") {
                        if monitor.isScanning {
                            monitor.stopScan()
                        } else {
                            monitor.startScan()
                        }
                    }
                }
            }
        }
    }
}
```
