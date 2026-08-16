# VisionKit

## Context

Use VisionKit when the app needs Apple-provided camera/document UI for scanning, data capture, Live Text-style interaction, or visual lookup workflows. Use Vision when you need lower-level image analysis requests. Use AVFoundation when you need a custom camera pipeline.

VisionKit is a UI-facing framework: it gives you system experiences that already handle camera presentation, capture affordances, and platform interaction patterns. Keep business logic outside the VisionKit view/controller and pass extracted results into an injected service.

## Pattern

Wrap VisionKit behind a protocol so SwiftUI views can preview without camera hardware:

```swift
import Foundation

protocol DocumentScanning {
    func scanReceipt() async throws -> ScannedDocument
}

struct ScannedDocument: Sendable, Equatable {
    var pages: [Data]
    var recognizedText: String
}
```

The UI layer asks for a scan; it does not own parsing, persistence, or network upload:

```swift
import SwiftUI

@MainActor
@Observable
final class ReceiptScanModel {
    private let scanner: any DocumentScanning

    var document: ScannedDocument?
    var errorMessage: String?

    init(scanner: any DocumentScanning) {
        self.scanner = scanner
    }

    func scan() async {
        do {
            document = try await scanner.scanReceipt()
        } catch {
            errorMessage = "Scanning failed. Please try again."
        }
    }
}
```

For UIKit-backed VisionKit controllers, keep the delegate bridge small and mark UI updates as main-actor work. Do not store scanned images in `UserDefaults`; persist them through the app's document store, SwiftData/Core Data metadata, or an encrypted file path.

## Framework Choice

| Need | Prefer |
|---|---|
| System document scanner UI | VisionKit |
| Live Text / visual lookup style interaction | VisionKit |
| Barcode/text/object analysis without system UI | Vision |
| Fully custom camera preview and capture | AVFoundation |
| OCR results feeding an on-device LLM | VisionKit or Vision -> Foundation Models, with private local context |

## Availability and Privacy

- Gate VisionKit features by platform and API availability.
- Provide camera usage copy when the flow opens camera capture.
- Keep extracted text and images local unless the user explicitly exports or syncs them.
- Show a manual fallback for unsupported devices, simulator runs, parental controls, or camera denial.

## Anti-Patterns

```swift
// WRONG: force camera-only scanning with no fallback.
Button("Scan") {
    showScanner = true
}
```

```swift
// RIGHT: branch by availability and authorization, then offer import/manual entry.
if scannerIsAvailable {
    Button("Scan") {
        showScanner = true
    }
} else {
    Button("Import File") {
        showImporter = true
    }
}
```

```swift
// WRONG: upload recognized text automatically.
try await api.upload(scan.recognizedText)
```

```swift
// RIGHT: make export explicit and explain where content goes.
try await exporter.share(scan, destination: selectedDestination)
```

## Checklist

- [ ] VisionKit is chosen for system UI, not low-level image analysis.
- [ ] Camera permission copy explains the user-visible scanning purpose.
- [ ] The simulator and unsupported devices have a manual/import fallback.
- [ ] Extracted text/images do not leave the device without explicit user action.
- [ ] The SwiftUI screen previews with a fake `DocumentScanning` implementation.
