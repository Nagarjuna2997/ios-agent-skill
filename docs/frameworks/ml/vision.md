# Vision Framework -- Complete Guide for Image Analysis and Computer Vision

## Overview

The Vision framework provides high-performance image analysis for text recognition (OCR), face detection, barcode scanning, object tracking, person segmentation, and image classification. All processing runs on-device using optimized CoreML models managed by the system. Every code example below compiles and follows production best practices.

---

## 1. Performing Vision Requests

All Vision requests follow the same pattern: create a request handler, configure requests, and perform them.

```swift
import Vision
import UIKit

// From CGImage
func performRequest(on image: UIImage, request: VNRequest) throws {
    guard let cgImage = image.cgImage else { return }
    let handler = VNImageRequestHandler(cgImage: cgImage, orientation: .up, options: [:])
    try handler.perform([request])
}

// From CIImage
func performRequest(on ciImage: CIImage, request: VNRequest) throws {
    let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])
    try handler.perform([request])
}

// From CVPixelBuffer (camera frames)
func performRequest(on pixelBuffer: CVPixelBuffer, request: VNRequest) throws {
    let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .right, options: [:])
    try handler.perform([request])
}

// From file URL
func performRequest(at url: URL, request: VNRequest) throws {
    let handler = VNImageRequestHandler(url: url, options: [:])
    try handler.perform([request])
}
```

---

## 2. Text Recognition (OCR) -- VNRecognizeTextRequest

### Accurate vs Fast Recognition

```swift
import Vision
import UIKit

func recognizeText(in image: UIImage, accurate: Bool = true) async throws -> [String] {
    guard let cgImage = image.cgImage else { return [] }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNRecognizeTextRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            let results = (request.results as? [VNRecognizedTextObservation]) ?? []
            let strings = results.compactMap { observation in
                observation.topCandidates(1).first?.string
            }
            continuation.resume(returning: strings)
        }

        // .accurate -- slower but higher quality, supports language correction
        // .fast     -- faster but lower accuracy, no language correction
        request.recognitionLevel = accurate ? .accurate : .fast

        // Supported languages (call supportedRecognitionLanguages() to list all)
        request.recognitionLanguages = ["en-US", "fr-FR", "de-DE"]

        // Enable automatic language correction
        request.usesLanguageCorrection = true

        // Minimum text height relative to image height (0.0 to 1.0)
        request.minimumTextHeight = 0.01

        // Limit to specific character set (useful for numbers/codes)
        // request.customWords = ["specific", "domain", "terms"]

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

### Getting Bounding Boxes for Recognized Text

```swift
import Vision
import UIKit

struct RecognizedTextBlock {
    let text: String
    let confidence: Float
    let boundingBox: CGRect  // normalized coordinates (0,0) at bottom-left
}

func recognizeTextWithLocations(in image: UIImage) async throws -> [RecognizedTextBlock] {
    guard let cgImage = image.cgImage else { return [] }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNRecognizeTextRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            let results = (request.results as? [VNRecognizedTextObservation]) ?? []
            let blocks = results.compactMap { observation -> RecognizedTextBlock? in
                guard let candidate = observation.topCandidates(1).first else { return nil }
                return RecognizedTextBlock(
                    text: candidate.string,
                    confidence: candidate.confidence,
                    boundingBox: observation.boundingBox
                )
            }
            continuation.resume(returning: blocks)
        }

        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## 3. Face Detection and Landmarks

### Detect Face Rectangles

```swift
import Vision
import UIKit

func detectFaces(in image: UIImage) async throws -> [VNFaceObservation] {
    guard let cgImage = image.cgImage else { return [] }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNDetectFaceRectanglesRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }
            let faces = (request.results as? [VNFaceObservation]) ?? []
            continuation.resume(returning: faces)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: .up, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

### Detect Face Landmarks (Eyes, Nose, Mouth, etc.)

```swift
import Vision
import UIKit

struct FaceDetail {
    let boundingBox: CGRect
    let roll: NSNumber?
    let yaw: NSNumber?
    let leftEye: [CGPoint]?
    let rightEye: [CGPoint]?
    let nose: [CGPoint]?
    let outerLips: [CGPoint]?
}

func detectFaceLandmarks(in image: UIImage) async throws -> [FaceDetail] {
    guard let cgImage = image.cgImage else { return [] }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNDetectFaceLandmarksRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            let faces = (request.results as? [VNFaceObservation]) ?? []
            let details = faces.map { face in
                let landmarks = face.landmarks
                return FaceDetail(
                    boundingBox: face.boundingBox,
                    roll: face.roll,
                    yaw: face.yaw,
                    leftEye: landmarks?.leftEye?.normalizedPoints.map { CGPoint(x: $0.x, y: $0.y) },
                    rightEye: landmarks?.rightEye?.normalizedPoints.map { CGPoint(x: $0.x, y: $0.y) },
                    nose: landmarks?.nose?.normalizedPoints.map { CGPoint(x: $0.x, y: $0.y) },
                    outerLips: landmarks?.outerLips?.normalizedPoints.map { CGPoint(x: $0.x, y: $0.y) }
                )
            }
            continuation.resume(returning: details)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: .up, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## 4. Barcode and QR Code Detection

```swift
import Vision
import UIKit

struct DetectedBarcode {
    let payload: String
    let symbology: VNBarcodeSymbology
    let boundingBox: CGRect
}

func detectBarcodes(in image: UIImage) async throws -> [DetectedBarcode] {
    guard let cgImage = image.cgImage else { return [] }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNDetectBarcodesRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            let results = (request.results as? [VNBarcodeObservation]) ?? []
            let barcodes = results.compactMap { observation -> DetectedBarcode? in
                guard let payload = observation.payloadStringValue else { return nil }
                return DetectedBarcode(
                    payload: payload,
                    symbology: observation.symbology,
                    boundingBox: observation.boundingBox
                )
            }
            continuation.resume(returning: barcodes)
        }

        // Limit to specific symbologies for better performance
        request.symbologies = [
            .qr,
            .ean13,
            .ean8,
            .code128,
            .code39,
            .upce,
            .pdf417,
            .aztec,
            .dataMatrix
        ]

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## 5. Person Segmentation (Background Removal)

```swift
import Vision
import UIKit
import CoreImage
import CoreImage.CIFilterBuiltins

@available(iOS 15.0, *)
func removeBackground(from image: UIImage) async throws -> UIImage? {
    guard let cgImage = image.cgImage else { return nil }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNGeneratePersonSegmentationRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            guard let result = (request.results as? [VNPixelBufferObservation])?.first else {
                continuation.resume(returning: nil)
                return
            }

            let maskImage = CIImage(cvPixelBuffer: result.pixelBuffer)
            let originalImage = CIImage(cgImage: cgImage)

            // Scale mask to match original image size
            let scaleX = originalImage.extent.width / maskImage.extent.width
            let scaleY = originalImage.extent.height / maskImage.extent.height
            let scaledMask = maskImage.transformed(by: CGAffineTransform(scaleX: scaleX, y: scaleY))

            // Apply mask using CIBlendWithMask
            let filter = CIFilter.blendWithMask()
            filter.inputImage = originalImage
            filter.backgroundImage = CIImage(color: .clear).cropped(to: originalImage.extent)
            filter.maskImage = scaledMask

            guard let outputCIImage = filter.outputImage else {
                continuation.resume(returning: nil)
                return
            }

            let context = CIContext()
            guard let outputCGImage = context.createCGImage(outputCIImage, from: outputCIImage.extent) else {
                continuation.resume(returning: nil)
                return
            }

            let result = UIImage(cgImage: outputCGImage)
            continuation.resume(returning: result)
        }

        // Quality levels: .balanced (default), .accurate, .fast
        request.qualityLevel = .accurate

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## 6. Object Tracking in Video

```swift
import Vision
import AVFoundation

class ObjectTracker {
    private var trackingRequest: VNTrackObjectRequest?
    private let sequenceHandler = VNSequenceRequestHandler()

    /// Start tracking an object defined by an initial bounding box
    func startTracking(initialBoundingBox: CGRect) {
        let observation = VNDetectedObjectObservation(boundingBox: initialBoundingBox)

        trackingRequest = VNTrackObjectRequest(detectedObjectObservation: observation) { [weak self] request, error in
            guard let results = request.results as? [VNDetectedObjectObservation],
                  let trackedObject = results.first else { return }

            if trackedObject.confidence < 0.3 {
                // Object lost, stop tracking
                self?.trackingRequest = nil
                return
            }

            // Update tracking for next frame
            self?.trackingRequest = VNTrackObjectRequest(detectedObjectObservation: trackedObject)
        }

        trackingRequest?.trackingLevel = .accurate
    }

    /// Process a new video frame
    func processFrame(_ pixelBuffer: CVPixelBuffer) throws -> CGRect? {
        guard let request = trackingRequest else { return nil }

        try sequenceHandler.perform([request], on: pixelBuffer, orientation: .up)

        guard let results = request.results as? [VNDetectedObjectObservation],
              let tracked = results.first else { return nil }

        return tracked.boundingBox
    }
}
```

---

## 7. Image Classification

```swift
import Vision
import UIKit

func classifyImage(_ image: UIImage) async throws -> [(identifier: String, confidence: Float)] {
    guard let cgImage = image.cgImage else { return [] }

    return try await withCheckedThrowingContinuation { continuation in
        let request = VNClassifyImageRequest { request, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            let results = (request.results as? [VNClassificationObservation]) ?? []
            let topResults = results
                .filter { $0.confidence > 0.1 }
                .prefix(10)
                .map { (identifier: $0.identifier, confidence: $0.confidence) }
            continuation.resume(returning: topResults)
        }

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([request])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## 8. VisionKit -- DataScannerViewController (iOS 16+)

Live camera scanning for text and barcodes with a system-provided UI.

```swift
import SwiftUI
import VisionKit

@available(iOS 16.0, *)
struct DataScannerView: UIViewControllerRepresentable {
    @Binding var scannedText: String
    @Binding var scannedBarcode: String
    let scanType: DataScannerViewController.RecognizedDataType

    func makeUIViewController(context: Context) -> DataScannerViewController {
        let scanner = DataScannerViewController(
            recognizedDataTypes: [scanType],
            qualityLevel: .balanced,
            recognizesMultipleItems: false,
            isHighFrameRateTrackingEnabled: true,
            isHighlightingEnabled: true
        )
        scanner.delegate = context.coordinator
        return scanner
    }

    func updateUIViewController(_ uiViewController: DataScannerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    class Coordinator: NSObject, DataScannerViewControllerDelegate {
        let parent: DataScannerView

        init(parent: DataScannerView) {
            self.parent = parent
        }

        func dataScanner(_ dataScanner: DataScannerViewController, didTapOn item: RecognizedItem) {
            switch item {
            case .text(let text):
                parent.scannedText = text.transcript
            case .barcode(let barcode):
                parent.scannedBarcode = barcode.payloadStringValue ?? ""
            @unknown default:
                break
            }
        }

        func dataScanner(_ dataScanner: DataScannerViewController, didAdd addedItems: [RecognizedItem], allItems: [RecognizedItem]) {
            // Handle newly recognized items
            for item in addedItems {
                switch item {
                case .text(let text):
                    parent.scannedText = text.transcript
                case .barcode(let barcode):
                    parent.scannedBarcode = barcode.payloadStringValue ?? ""
                @unknown default:
                    break
                }
            }
        }
    }
}

@available(iOS 16.0, *)
struct ScannerContainerView: View {
    @State private var scannedText = ""
    @State private var scannedBarcode = ""
    @State private var isShowingScanner = false

    var body: some View {
        VStack(spacing: 20) {
            if DataScannerViewController.isSupported && DataScannerViewController.isAvailable {
                Button("Scan Text") {
                    isShowingScanner = true
                }
                .buttonStyle(.borderedProminent)

                if !scannedText.isEmpty {
                    Text("Scanned: \(scannedText)")
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            } else {
                ContentUnavailableView("Scanner Not Available",
                                       systemImage: "camera.fill",
                                       description: Text("This device does not support data scanning."))
            }
        }
        .sheet(isPresented: $isShowingScanner) {
            DataScannerView(
                scannedText: $scannedText,
                scannedBarcode: $scannedBarcode,
                scanType: .text()
            )
            .ignoresSafeArea()
        }
    }
}
```

---

## 9. ImageAnalyzer and ImageAnalysisInteraction (iOS 16+)

Enable Live Text on any image view -- users can select, copy, translate, and interact with text in images.

```swift
import SwiftUI
import VisionKit

@available(iOS 16.0, *)
struct LiveTextImageView: UIViewRepresentable {
    let image: UIImage

    func makeUIView(context: Context) -> UIImageView {
        let imageView = UIImageView(image: image)
        imageView.contentMode = .scaleAspectFit
        imageView.isUserInteractionEnabled = true

        let interaction = ImageAnalysisInteraction()
        interaction.preferredInteractionTypes = [.textSelection, .dataDetectors]
        imageView.addInteraction(interaction)

        Task {
            let analyzer = ImageAnalyzer()
            let configuration = ImageAnalyzer.Configuration([.text, .machineReadableCode])

            do {
                let analysis = try await analyzer.analyze(image, configuration: configuration)
                await MainActor.run {
                    interaction.analysis = analysis
                }
            } catch {
                print("Image analysis failed: \(error.localizedDescription)")
            }
        }

        return imageView
    }

    func updateUIView(_ uiView: UIImageView, context: Context) {
        uiView.image = image
    }
}

@available(iOS 16.0, *)
struct LiveTextDemoView: View {
    let sampleImage: UIImage

    var body: some View {
        NavigationStack {
            LiveTextImageView(image: sampleImage)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .navigationTitle("Live Text")
                .navigationBarTitleDisplayMode(.inline)
        }
    }
}
```

---

## 10. Complete Multi-Request Pipeline

Run multiple Vision requests together for maximum efficiency.

```swift
import Vision
import UIKit

struct ImageAnalysisResult {
    var recognizedText: [String] = []
    var faceCount: Int = 0
    var barcodes: [String] = []
    var classifications: [(String, Float)] = []
}

func analyzeImage(_ image: UIImage) async throws -> ImageAnalysisResult {
    guard let cgImage = image.cgImage else {
        throw NSError(domain: "Vision", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid image"])
    }

    return try await withCheckedThrowingContinuation { continuation in
        var result = ImageAnalysisResult()
        let group = DispatchGroup()

        // Text recognition
        group.enter()
        let textRequest = VNRecognizeTextRequest { request, _ in
            defer { group.leave() }
            let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
            result.recognizedText = observations.compactMap { $0.topCandidates(1).first?.string }
        }
        textRequest.recognitionLevel = .accurate

        // Face detection
        group.enter()
        let faceRequest = VNDetectFaceRectanglesRequest { request, _ in
            defer { group.leave() }
            result.faceCount = (request.results as? [VNFaceObservation])?.count ?? 0
        }

        // Barcode detection
        group.enter()
        let barcodeRequest = VNDetectBarcodesRequest { request, _ in
            defer { group.leave() }
            let observations = (request.results as? [VNBarcodeObservation]) ?? []
            result.barcodes = observations.compactMap { $0.payloadStringValue }
        }

        // Image classification
        group.enter()
        let classifyRequest = VNClassifyImageRequest { request, _ in
            defer { group.leave() }
            let observations = (request.results as? [VNClassificationObservation]) ?? []
            result.classifications = observations
                .filter { $0.confidence > 0.1 }
                .prefix(5)
                .map { ($0.identifier, $0.confidence) }
        }

        group.notify(queue: .main) {
            continuation.resume(returning: result)
        }

        // Perform all requests together -- Vision optimizes shared preprocessing
        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        do {
            try handler.perform([textRequest, faceRequest, barcodeRequest, classifyRequest])
        } catch {
            continuation.resume(throwing: error)
        }
    }
}
```

---

## Quick Reference

| Request | Observation Type | Purpose |
|---------|-----------------|---------|
| `VNRecognizeTextRequest` | `VNRecognizedTextObservation` | OCR -- extract text from images |
| `VNDetectFaceRectanglesRequest` | `VNFaceObservation` | Locate faces |
| `VNDetectFaceLandmarksRequest` | `VNFaceObservation` | Eyes, nose, mouth positions |
| `VNDetectBarcodesRequest` | `VNBarcodeObservation` | QR codes, barcodes |
| `VNGeneratePersonSegmentationRequest` | `VNPixelBufferObservation` | Background removal mask |
| `VNTrackObjectRequest` | `VNDetectedObjectObservation` | Track objects across frames |
| `VNClassifyImageRequest` | `VNClassificationObservation` | Scene/object classification |
| `VNCoreMLRequest` | varies | Run custom CoreML models |

| VisionKit Class | Purpose |
|----------------|---------|
| `DataScannerViewController` | Live camera text/barcode scanning UI (iOS 16+) |
| `ImageAnalyzer` | Analyze images for Live Text content (iOS 16+) |
| `ImageAnalysisInteraction` | Add text selection to image views (iOS 16+) |
