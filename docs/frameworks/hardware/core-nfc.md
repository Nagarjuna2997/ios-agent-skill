# CoreNFC

## NFCNDEFReaderSession Setup and Entitlements

Requirements:
- iPhone 7 or later
- Add `Near Field Communication Tag Reading` capability in Xcode
- Add `NFCReaderUsageDescription` to `Info.plist`
- Add NFC entitlement to your provisioning profile

`Info.plist` entries:
```xml
<key>NFCReaderUsageDescription</key>
<string>This app reads NFC tags to retrieve information.</string>

<!-- For background tag reading -->
<key>com.apple.developer.associated-application-identifier</key>
<string>$(TeamIdentifierPrefix)com.example.app</string>
```

Entitlements file (`.entitlements`):
```xml
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
    <string>NDEF</string>
    <string>TAG</string>
</array>
```

```swift
import CoreNFC

@Observable
class NFCManager: NSObject {
    var scannedMessage: String = ""
    var scannedRecords: [NFCRecord] = []
    var isScanning = false
    var error: Error?

    private var ndefSession: NFCNDEFReaderSession?
    private var writeMessage: NFCNDEFMessage?

    var isNFCAvailable: Bool {
        NFCNDEFReaderSession.readingAvailable
    }
}

struct NFCRecord: Identifiable {
    let id = UUID()
    let type: String
    let payload: String
    let rawData: Data
}
```

## Reading NDEF Tags

```swift
extension NFCManager: NFCNDEFReaderSessionDelegate {
    func startReading() {
        guard isNFCAvailable else {
            error = NFCError.notAvailable
            return
        }

        ndefSession = NFCNDEFReaderSession(
            delegate: self,
            queue: nil,
            invalidateAfterFirstRead: true
        )
        ndefSession?.alertMessage = "Hold your iPhone near an NFC tag."
        ndefSession?.begin()
        isScanning = true
    }

    // MARK: - NFCNDEFReaderSessionDelegate

    func readerSessionDidBecomeActive(_ session: NFCNDEFReaderSession) {
        // Session is active and scanning
    }

    func readerSession(
        _ session: NFCNDEFReaderSession,
        didDetectNDEFs messages: [NFCNDEFMessage]
    ) {
        var records: [NFCRecord] = []

        for message in messages {
            for record in message.records {
                let parsed = parseNDEFRecord(record)
                records.append(parsed)
            }
        }

        Task { @MainActor in
            self.scannedRecords = records
            self.scannedMessage = records.map(\.payload).joined(separator: "\n")
            self.isScanning = false
        }
    }

    func readerSession(
        _ session: NFCNDEFReaderSession,
        didInvalidateWithError error: Error
    ) {
        let readerError = error as? NFCReaderError

        Task { @MainActor in
            // User cancelled is not a real error
            if readerError?.code != .readerSessionInvalidationErrorUserCanceled {
                self.error = error
            }
            self.isScanning = false
        }
    }
}
```

## Parsing NDEF Payloads — URL, Text, Custom

```swift
extension NFCManager {
    func parseNDEFRecord(_ record: NFCNDEFPayload) -> NFCRecord {
        let typeString = String(data: record.type, encoding: .utf8) ?? "Unknown"

        switch record.typeNameFormat {
        case .nfcWellKnown:
            return parseWellKnownRecord(record, typeString: typeString)
        case .media:
            let mimeType = typeString
            let payload = String(data: record.payload, encoding: .utf8) ?? ""
            return NFCRecord(type: mimeType, payload: payload, rawData: record.payload)
        case .absoluteURI:
            let uri = String(data: record.payload, encoding: .utf8) ?? ""
            return NFCRecord(type: "URI", payload: uri, rawData: record.payload)
        case .nfcExternal:
            let payload = String(data: record.payload, encoding: .utf8) ?? ""
            return NFCRecord(type: "External: \(typeString)", payload: payload, rawData: record.payload)
        default:
            return NFCRecord(
                type: "Unknown",
                payload: record.payload.map { String(format: "%02x", $0) }.joined(),
                rawData: record.payload
            )
        }
    }

    private func parseWellKnownRecord(
        _ record: NFCNDEFPayload,
        typeString: String
    ) -> NFCRecord {
        switch typeString {
        case "T":
            // Text record
            return parseTextRecord(record)
        case "U":
            // URI record
            return parseURIRecord(record)
        default:
            let payload = String(data: record.payload, encoding: .utf8) ?? ""
            return NFCRecord(type: typeString, payload: payload, rawData: record.payload)
        }
    }

    private func parseTextRecord(_ record: NFCNDEFPayload) -> NFCRecord {
        let payload = record.payload
        guard !payload.isEmpty else {
            return NFCRecord(type: "Text", payload: "", rawData: payload)
        }

        let statusByte = payload[0]
        let languageCodeLength = Int(statusByte & 0x3F)
        let isUTF16 = (statusByte & 0x80) != 0

        let textStartIndex = 1 + languageCodeLength
        guard textStartIndex < payload.count else {
            return NFCRecord(type: "Text", payload: "", rawData: payload)
        }

        let textData = payload.subdata(in: textStartIndex..<payload.count)
        let encoding: String.Encoding = isUTF16 ? .utf16 : .utf8
        let text = String(data: textData, encoding: encoding) ?? ""

        return NFCRecord(type: "Text", payload: text, rawData: payload)
    }

    private func parseURIRecord(_ record: NFCNDEFPayload) -> NFCRecord {
        // Use Apple's built-in helper
        if let url = record.wellKnownTypeURIPayload() {
            return NFCRecord(type: "URL", payload: url.absoluteString, rawData: record.payload)
        }

        // Manual parsing fallback
        let prefixes = [
            0x00: "",
            0x01: "http://www.",
            0x02: "https://www.",
            0x03: "http://",
            0x04: "https://",
            0x05: "tel:",
            0x06: "mailto:"
        ]

        let payload = record.payload
        guard !payload.isEmpty else {
            return NFCRecord(type: "URL", payload: "", rawData: payload)
        }

        let prefix = prefixes[Int(payload[0])] ?? ""
        let remainder = String(data: payload.subdata(in: 1..<payload.count), encoding: .utf8) ?? ""

        return NFCRecord(type: "URL", payload: prefix + remainder, rawData: payload)
    }
}
```

## Writing to NDEF Tags

```swift
extension NFCManager {
    func startWriting(text: String) {
        guard isNFCAvailable else {
            error = NFCError.notAvailable
            return
        }

        // Create NDEF message to write
        guard let textPayload = NFCNDEFPayload.wellKnownTypeTextPayload(
            string: text,
            locale: .current
        ) else {
            error = NFCError.invalidPayload
            return
        }

        writeMessage = NFCNDEFMessage(records: [textPayload])

        ndefSession = NFCNDEFReaderSession(
            delegate: self,
            queue: nil,
            invalidateAfterFirstRead: false  // false to allow writing
        )
        ndefSession?.alertMessage = "Hold your iPhone near an NFC tag to write."
        ndefSession?.begin()
        isScanning = true
    }

    func startWritingURL(_ url: URL) {
        guard isNFCAvailable else {
            error = NFCError.notAvailable
            return
        }

        guard let urlPayload = NFCNDEFPayload.wellKnownTypeURIPayload(url: url) else {
            error = NFCError.invalidPayload
            return
        }

        writeMessage = NFCNDEFMessage(records: [urlPayload])

        ndefSession = NFCNDEFReaderSession(
            delegate: self,
            queue: nil,
            invalidateAfterFirstRead: false
        )
        ndefSession?.alertMessage = "Hold your iPhone near an NFC tag to write."
        ndefSession?.begin()
        isScanning = true
    }

    // Called when a writable tag is detected
    func readerSession(
        _ session: NFCNDEFReaderSession,
        didDetect tags: [any NFCNDEFTag]
    ) {
        guard let tag = tags.first else {
            session.invalidate(errorMessage: "No tag found.")
            return
        }

        session.connect(to: tag) { [weak self] connectionError in
            guard connectionError == nil, let self else {
                session.invalidate(errorMessage: "Connection failed.")
                return
            }

            tag.queryNDEFStatus { status, capacity, error in
                guard error == nil else {
                    session.invalidate(errorMessage: "Failed to query tag.")
                    return
                }

                switch status {
                case .notSupported:
                    session.invalidate(errorMessage: "Tag is not NDEF formatted.")
                case .readOnly:
                    session.invalidate(errorMessage: "Tag is read-only.")
                case .readWrite:
                    guard let message = self.writeMessage else {
                        session.invalidate(errorMessage: "No message to write.")
                        return
                    }

                    // Check capacity
                    let messageLength = message.length
                    guard messageLength <= capacity else {
                        session.invalidate(
                            errorMessage: "Message too large for tag (\(messageLength)/\(capacity) bytes)."
                        )
                        return
                    }

                    tag.writeNDEF(message) { writeError in
                        if let writeError {
                            session.invalidate(errorMessage: "Write failed: \(writeError.localizedDescription)")
                        } else {
                            session.alertMessage = "Successfully wrote to tag!"
                            session.invalidate()
                        }
                    }
                @unknown default:
                    session.invalidate(errorMessage: "Unknown tag status.")
                }
            }
        }
    }
}
```

## NFCTagReaderSession — ISO 14443, ISO 15693, FeliCa

```swift
@Observable
class NFCTagReader: NSObject, NFCTagReaderSessionDelegate {
    var tagID: String = ""
    var tagType: String = ""

    private var tagSession: NFCTagReaderSession?

    func startTagReading(pollingOption: NFCTagReaderSession.PollingOption = .iso14443) {
        guard NFCTagReaderSession.readingAvailable else { return }

        tagSession = NFCTagReaderSession(
            pollingOption: pollingOption,
            delegate: self,
            queue: nil
        )
        tagSession?.alertMessage = "Hold your iPhone near the tag."
        tagSession?.begin()
    }

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {}

    func tagReaderSession(
        _ session: NFCTagReaderSession,
        didInvalidateWithError error: Error
    ) {}

    func tagReaderSession(
        _ session: NFCTagReaderSession,
        didDetect tags: [NFCTag]
    ) {
        guard let tag = tags.first else { return }

        session.connect(to: tag) { error in
            guard error == nil else {
                session.invalidate(errorMessage: "Connection failed.")
                return
            }

            switch tag {
            case .iso7816(let iso7816Tag):
                // ISO 14443 Type A/B — used by payment cards, passports
                let identifier = iso7816Tag.identifier
                    .map { String(format: "%02x", $0) }
                    .joined(separator: ":")

                Task { @MainActor in
                    self.tagID = identifier
                    self.tagType = "ISO 7816 (ISO 14443)"
                }

                // Send APDU command
                let apdu = NFCISO7816APDU(
                    instructionClass: 0x00,
                    instructionCode: 0xB0,
                    p1Parameter: 0x00,
                    p2Parameter: 0x00,
                    data: Data(),
                    expectedResponseLength: 256
                )
                iso7816Tag.sendCommand(apdu: apdu) { responseData, sw1, sw2, error in
                    // Process response
                    session.alertMessage = "Tag read successfully."
                    session.invalidate()
                }

            case .iso15693(let iso15693Tag):
                // ISO 15693 — NFC-V, vicinity cards
                let identifier = iso15693Tag.identifier
                    .map { String(format: "%02x", $0) }
                    .joined(separator: ":")

                Task { @MainActor in
                    self.tagID = identifier
                    self.tagType = "ISO 15693"
                }
                session.alertMessage = "Tag read successfully."
                session.invalidate()

            case .feliCa(let feliCaTag):
                // FeliCa — used in Japan (Suica, etc.)
                let idm = feliCaTag.currentIDm
                    .map { String(format: "%02x", $0) }
                    .joined(separator: ":")

                Task { @MainActor in
                    self.tagID = idm
                    self.tagType = "FeliCa"
                }
                session.alertMessage = "Tag read successfully."
                session.invalidate()

            case .miFare(let miFareTag):
                // MiFare — NXP tags
                let identifier = miFareTag.identifier
                    .map { String(format: "%02x", $0) }
                    .joined(separator: ":")

                Task { @MainActor in
                    self.tagID = identifier
                    self.tagType = "MiFare (\(miFareTag.mifareFamily))"
                }
                session.alertMessage = "Tag read successfully."
                session.invalidate()

            @unknown default:
                session.invalidate(errorMessage: "Unsupported tag type.")
            }
        }
    }
}
```

## Background Tag Reading

Add to `Info.plist` for Universal Links-style NFC launch:
```xml
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:example.com</string>
</array>
```

```swift
import SwiftUI

// Handle background tag reading in your App
@main
struct NFCApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onContinueUserActivity(
                    NSUserActivityTypeBrowsingWeb
                ) { userActivity in
                    // Handle NFC tag scanned in background
                    guard let url = userActivity.webpageURL else { return }
                    handleNFCURL(url)
                }
        }
    }

    func handleNFCURL(_ url: URL) {
        // Process the URL from the NFC tag
        // This is called when the user taps the NFC notification
    }
}
```

## Error Handling

```swift
enum NFCError: LocalizedError {
    case notAvailable
    case invalidPayload
    case tagNotWritable
    case messageTooLarge(needed: Int, capacity: Int)
    case connectionFailed
    case readFailed(Error)
    case writeFailed(Error)

    var errorDescription: String? {
        switch self {
        case .notAvailable:
            return "NFC is not available on this device."
        case .invalidPayload:
            return "The NFC payload is invalid."
        case .tagNotWritable:
            return "This NFC tag is read-only."
        case .messageTooLarge(let needed, let capacity):
            return "Message (\(needed) bytes) exceeds tag capacity (\(capacity) bytes)."
        case .connectionFailed:
            return "Failed to connect to the NFC tag."
        case .readFailed(let error):
            return "Read failed: \(error.localizedDescription)"
        case .writeFailed(let error):
            return "Write failed: \(error.localizedDescription)"
        }
    }
}
```

## Complete NFC Tag Reader/Writer Example

```swift
import SwiftUI
import CoreNFC

struct NFCReaderWriterView: View {
    @State private var nfcManager = NFCManager()
    @State private var writeText = ""
    @State private var writeURL = ""
    @State private var selectedMode: NFCMode = .read

    enum NFCMode: String, CaseIterable {
        case read = "Read"
        case writeText = "Write Text"
        case writeURL = "Write URL"
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Mode picker
                Picker("Mode", selection: $selectedMode) {
                    ForEach(NFCMode.allCases, id: \.self) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                switch selectedMode {
                case .read:
                    readModeView
                case .writeText:
                    writeTextView
                case .writeURL:
                    writeURLView
                }

                Spacer()

                // NFC availability indicator
                if !nfcManager.isNFCAvailable {
                    Label("NFC not available on this device", systemImage: "xmark.circle")
                        .foregroundStyle(.red)
                        .font(.caption)
                }
            }
            .navigationTitle("NFC Tags")
        }
    }

    var readModeView: some View {
        VStack(spacing: 20) {
            Image(systemName: "wave.3.right")
                .font(.system(size: 60))
                .foregroundStyle(.blue)
                .symbolEffect(.variableColor.iterative, isActive: nfcManager.isScanning)

            Button {
                nfcManager.startReading()
            } label: {
                Label("Scan NFC Tag", systemImage: "sensor.tag.radiowaves.forward.fill")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.blue.gradient, in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(.white)
                    .font(.headline)
            }
            .disabled(!nfcManager.isNFCAvailable)
            .padding(.horizontal)

            // Results
            if !nfcManager.scannedRecords.isEmpty {
                List(nfcManager.scannedRecords) { record in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(record.type)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(.blue.opacity(0.1), in: Capsule())

                        Text(record.payload)
                            .font(.body)
                            .textSelection(.enabled)
                    }
                    .padding(.vertical, 4)
                }
                .listStyle(.insetGrouped)
            }
        }
    }

    var writeTextView: some View {
        VStack(spacing: 20) {
            TextField("Enter text to write", text: $writeText, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(3...6)
                .padding(.horizontal)

            Button {
                nfcManager.startWriting(text: writeText)
            } label: {
                Label("Write to Tag", systemImage: "square.and.pencil")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.green.gradient, in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(.white)
                    .font(.headline)
            }
            .disabled(writeText.isEmpty || !nfcManager.isNFCAvailable)
            .padding(.horizontal)
        }
    }

    var writeURLView: some View {
        VStack(spacing: 20) {
            TextField("https://example.com", text: $writeURL)
                .textFieldStyle(.roundedBorder)
                .keyboardType(.URL)
                .autocapitalization(.none)
                .padding(.horizontal)

            Button {
                if let url = URL(string: writeURL) {
                    nfcManager.startWritingURL(url)
                }
            } label: {
                Label("Write URL to Tag", systemImage: "link")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.orange.gradient, in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(.white)
                    .font(.headline)
            }
            .disabled(URL(string: writeURL) == nil || !nfcManager.isNFCAvailable)
            .padding(.horizontal)
        }
    }
}
```
