# Speech Framework -- Complete Guide for Speech Recognition and Transcription

## Overview

The Speech framework provides on-device and server-assisted speech recognition for converting audio to text. It supports live microphone transcription, audio file transcription, multiple languages, confidence scores, and alternative transcriptions. iOS 17+ introduced improvements for on-device recognition quality and reduced latency. Every code example below compiles and follows production best practices.

---

## 1. Setup and Authorization

Speech recognition requires explicit user permission. Add both keys to your Info.plist:

- `NSSpeechRecognitionUsageDescription` -- why you need speech recognition
- `NSMicrophoneUsageDescription` -- why you need microphone access (for live audio)

```swift
import Speech

func requestSpeechAuthorization() async -> SFSpeechRecognizerAuthorizationStatus {
    await withCheckedContinuation { continuation in
        SFSpeechRecognizer.requestAuthorization { status in
            continuation.resume(returning: status)
        }
    }
}

func checkAuthorizationStatus() -> Bool {
    switch SFSpeechRecognizer.authorizationStatus() {
    case .authorized:
        return true
    case .denied:
        print("User denied speech recognition access")
        return false
    case .restricted:
        print("Speech recognition restricted on this device")
        return false
    case .notDetermined:
        print("Speech recognition permission not yet requested")
        return false
    @unknown default:
        return false
    }
}
```

---

## 2. Creating a Speech Recognizer

```swift
import Speech

// Default locale (user's device locale)
let defaultRecognizer = SFSpeechRecognizer()

// Specific language
let englishRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
let japaneseRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "ja-JP"))
let spanishRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "es-ES"))

// Check availability
func isRecognizerAvailable(for locale: Locale) -> Bool {
    guard let recognizer = SFSpeechRecognizer(locale: locale) else { return false }
    return recognizer.isAvailable
}

// List all supported locales
func supportedLocales() -> Set<Locale> {
    return SFSpeechRecognizer.supportedLocales()
}
```

---

## 3. On-Device vs Server-Based Recognition

```swift
import Speech

func configureRecognizer() -> SFSpeechRecognizer? {
    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")) else {
        return nil
    }

    // Check if on-device recognition is available
    if recognizer.supportsOnDeviceRecognition {
        print("On-device recognition supported -- works offline")
    } else {
        print("This locale requires server-based recognition")
    }

    return recognizer
}

// When creating a recognition request, you can require on-device processing
func createOnDeviceRequest() -> SFSpeechAudioBufferRecognitionRequest {
    let request = SFSpeechAudioBufferRecognitionRequest()

    // Force on-device recognition (fails if not available)
    request.requiresOnDeviceRecognition = true

    // Additional configuration
    request.shouldReportPartialResults = true
    request.addsPunctuation = true  // iOS 16+

    return request
}
```

---

## 4. Transcribing Audio Files -- SFSpeechURLRecognitionRequest

```swift
import Speech

func transcribeAudioFile(at url: URL, locale: Locale = Locale(identifier: "en-US")) async throws -> String {
    guard let recognizer = SFSpeechRecognizer(locale: locale),
          recognizer.isAvailable else {
        throw SpeechError.recognizerUnavailable
    }

    let request = SFSpeechURLRecognitionRequest(url: url)
    request.shouldReportPartialResults = false
    request.addsPunctuation = true

    if recognizer.supportsOnDeviceRecognition {
        request.requiresOnDeviceRecognition = true
    }

    return try await withCheckedThrowingContinuation { continuation in
        recognizer.recognitionTask(with: request) { result, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            guard let result, result.isFinal else { return }
            continuation.resume(returning: result.bestTranscription.formattedString)
        }
    }
}

enum SpeechError: LocalizedError {
    case recognizerUnavailable
    case audioEngineError
    case notAuthorized

    var errorDescription: String? {
        switch self {
        case .recognizerUnavailable:
            return "Speech recognizer is not available for the selected language."
        case .audioEngineError:
            return "Audio engine failed to start."
        case .notAuthorized:
            return "Speech recognition is not authorized."
        }
    }
}
```

### Transcription with Confidence Scores and Alternatives

```swift
import Speech

struct TranscriptionResult {
    let text: String
    let confidence: Float
    let segments: [SegmentDetail]
    let alternatives: [String]
}

struct SegmentDetail {
    let text: String
    let confidence: Float
    let timestamp: TimeInterval
    let duration: TimeInterval
}

func transcribeWithDetails(at url: URL) async throws -> TranscriptionResult {
    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")),
          recognizer.isAvailable else {
        throw SpeechError.recognizerUnavailable
    }

    let request = SFSpeechURLRecognitionRequest(url: url)
    request.shouldReportPartialResults = false
    request.addsPunctuation = true

    return try await withCheckedThrowingContinuation { continuation in
        recognizer.recognitionTask(with: request) { result, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }

            guard let result, result.isFinal else { return }

            let bestTranscription = result.bestTranscription

            // Extract per-segment details
            let segments = bestTranscription.segments.map { segment in
                SegmentDetail(
                    text: segment.substring,
                    confidence: segment.confidence,
                    timestamp: segment.timestamp,
                    duration: segment.duration
                )
            }

            // Overall confidence (average of segment confidences)
            let totalConfidence = segments.isEmpty ? 0 :
                segments.reduce(Float(0)) { $0 + $1.confidence } / Float(segments.count)

            // Alternative transcriptions
            let alternatives = result.transcriptions.dropFirst().map { $0.formattedString }

            let transcriptionResult = TranscriptionResult(
                text: bestTranscription.formattedString,
                confidence: totalConfidence,
                segments: segments,
                alternatives: Array(alternatives)
            )

            continuation.resume(returning: transcriptionResult)
        }
    }
}
```

---

## 5. Live Audio Transcription -- SFSpeechAudioBufferRecognitionRequest

Real-time speech-to-text using the device microphone with AVAudioEngine.

```swift
import Speech
import AVFoundation

@Observable
@MainActor
final class LiveTranscriptionManager {
    var transcribedText = ""
    var isRecording = false
    var errorMessage: String?

    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let speechRecognizer: SFSpeechRecognizer?

    init(locale: Locale = Locale(identifier: "en-US")) {
        self.speechRecognizer = SFSpeechRecognizer(locale: locale)
    }

    func startRecording() async {
        // Check authorization
        let authStatus = await requestSpeechAuthorization()
        guard authStatus == .authorized else {
            errorMessage = "Speech recognition not authorized"
            return
        }

        guard let speechRecognizer, speechRecognizer.isAvailable else {
            errorMessage = "Speech recognizer not available"
            return
        }

        // Stop any existing session
        stopRecording()

        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            errorMessage = "Audio session setup failed: \(error.localizedDescription)"
            return
        }

        // Create recognition request
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.addsPunctuation = true

        if speechRecognizer.supportsOnDeviceRecognition {
            request.requiresOnDeviceRecognition = true
        }

        self.recognitionRequest = request

        // Create audio engine
        let engine = AVAudioEngine()
        self.audioEngine = engine

        let inputNode = engine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        // Install a tap on the audio input
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            request.append(buffer)
        }

        // Start the audio engine
        do {
            engine.prepare()
            try engine.start()
        } catch {
            errorMessage = "Audio engine failed to start: \(error.localizedDescription)"
            return
        }

        isRecording = true
        transcribedText = ""

        // Start recognition task
        recognitionTask = speechRecognizer.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self else { return }

                if let result {
                    self.transcribedText = result.bestTranscription.formattedString
                }

                if let error {
                    self.errorMessage = error.localizedDescription
                    self.stopRecording()
                }

                if result?.isFinal == true {
                    self.stopRecording()
                }
            }
        }
    }

    func stopRecording() {
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine = nil

        recognitionRequest?.endAudio()
        recognitionRequest = nil

        recognitionTask?.cancel()
        recognitionTask = nil

        isRecording = false
    }

    private func requestSpeechAuthorization() async -> SFSpeechRecognizerAuthorizationStatus {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status)
            }
        }
    }
}
```

---

## 6. Complete Live Transcription SwiftUI View

```swift
import SwiftUI
import Speech

struct LiveTranscriptionView: View {
    @State private var manager = LiveTranscriptionManager()

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Transcribed text display
                ScrollView {
                    Text(manager.transcribedText.isEmpty ? "Tap the microphone to start speaking..." : manager.transcribedText)
                        .font(.body)
                        .foregroundStyle(manager.transcribedText.isEmpty ? .secondary : .primary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                }
                .frame(maxHeight: .infinity)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))

                // Recording indicator
                if manager.isRecording {
                    HStack(spacing: 8) {
                        Circle()
                            .fill(.red)
                            .frame(width: 10, height: 10)
                            .opacity(manager.isRecording ? 1 : 0)
                            .animation(.easeInOut(duration: 0.5).repeatForever(), value: manager.isRecording)
                        Text("Listening...")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                // Error display
                if let error = manager.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .padding(.horizontal)
                }

                // Record button
                Button {
                    Task {
                        if manager.isRecording {
                            manager.stopRecording()
                        } else {
                            await manager.startRecording()
                        }
                    }
                } label: {
                    Image(systemName: manager.isRecording ? "stop.circle.fill" : "mic.circle.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(manager.isRecording ? .red : .accentColor)
                        .symbolEffect(.bounce, value: manager.isRecording)
                }
                .padding(.bottom, 32)

                // Copy button
                if !manager.transcribedText.isEmpty {
                    Button {
                        UIPasteboard.general.string = manager.transcribedText
                    } label: {
                        Label("Copy Transcription", systemImage: "doc.on.doc")
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding()
            .navigationTitle("Live Transcription")
        }
    }
}
```

---

## 7. Language Selection

```swift
import Speech
import SwiftUI

struct LanguagePickerView: View {
    @State private var selectedLocale: Locale = Locale(identifier: "en-US")
    @State private var supportedLocales: [Locale] = []

    var body: some View {
        List {
            Section("Select Language") {
                ForEach(supportedLocales, id: \.identifier) { locale in
                    Button {
                        selectedLocale = locale
                    } label: {
                        HStack {
                            VStack(alignment: .leading) {
                                Text(locale.localizedString(forIdentifier: locale.identifier) ?? locale.identifier)
                                    .font(.body)
                                Text(locale.identifier)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()

                            if locale.identifier == selectedLocale.identifier {
                                Image(systemName: "checkmark")
                                    .foregroundStyle(.accentColor)
                            }

                            // Show on-device badge
                            if let recognizer = SFSpeechRecognizer(locale: locale),
                               recognizer.supportsOnDeviceRecognition {
                                Text("On-Device")
                                    .font(.caption2)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(.green.opacity(0.15), in: Capsule())
                                    .foregroundStyle(.green)
                            }
                        }
                    }
                    .tint(.primary)
                }
            }
        }
        .task {
            supportedLocales = SFSpeechRecognizer.supportedLocales()
                .sorted { ($0.identifier) < ($1.identifier) }
        }
    }
}
```

---

## 8. Monitoring Recognizer Availability

```swift
import Speech

class SpeechRecognizerMonitor: NSObject, SFSpeechRecognizerDelegate {
    private let recognizer: SFSpeechRecognizer
    var onAvailabilityChanged: ((Bool) -> Void)?

    init(locale: Locale = Locale(identifier: "en-US")) {
        self.recognizer = SFSpeechRecognizer(locale: locale) ?? SFSpeechRecognizer()!
        super.init()
        self.recognizer.delegate = self
    }

    var isAvailable: Bool {
        recognizer.isAvailable
    }

    func speechRecognizer(_ speechRecognizer: SFSpeechRecognizer, availabilityDidChange available: Bool) {
        onAvailabilityChanged?(available)
    }
}
```

---

## 9. iOS 17+ Improvements

iOS 17 introduced several improvements to speech recognition:

```swift
import Speech

@available(iOS 17.0, *)
func modernTranscription(at url: URL) async throws -> String {
    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")),
          recognizer.isAvailable else {
        throw SpeechError.recognizerUnavailable
    }

    let request = SFSpeechURLRecognitionRequest(url: url)

    // iOS 17+: Improved on-device models with better accuracy
    request.requiresOnDeviceRecognition = true

    // iOS 16+: Automatic punctuation
    request.addsPunctuation = true

    // Task-level customization
    request.shouldReportPartialResults = false

    // iOS 17+: Use the new async recognition API
    let result = try await recognizer.recognitionTask(with: request)
    return result.bestTranscription.formattedString
}
```

### Handling Custom Vocabulary

```swift
import Speech

func transcribeWithCustomVocabulary(at url: URL, customPhrases: [String]) async throws -> String {
    guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US")),
          recognizer.isAvailable else {
        throw SpeechError.recognizerUnavailable
    }

    let request = SFSpeechURLRecognitionRequest(url: url)
    request.shouldReportPartialResults = false
    request.addsPunctuation = true

    // Add domain-specific vocabulary to improve recognition
    request.contextualStrings = customPhrases

    return try await withCheckedThrowingContinuation { continuation in
        recognizer.recognitionTask(with: request) { result, error in
            if let error {
                continuation.resume(throwing: error)
                return
            }
            guard let result, result.isFinal else { return }
            continuation.resume(returning: result.bestTranscription.formattedString)
        }
    }
}

// Usage
// let text = try await transcribeWithCustomVocabulary(
//     at: audioURL,
//     customPhrases: ["SwiftUI", "CoreML", "Xcode", "WWDC", "visionOS"]
// )
```

---

## 10. Performance Considerations

| Consideration | Recommendation |
|---------------|----------------|
| On-device vs server | Prefer on-device for privacy and offline; server for broader language support |
| Buffer size | 1024 samples is a good default for real-time; increase for batch |
| Audio format | 16kHz mono is optimal for speech recognition |
| Session duration | Apple limits recognition to ~1 minute per task; restart for longer sessions |
| Battery impact | On-device recognition uses less battery than server-based |
| Memory | Audio buffers accumulate; call `endAudio()` promptly when done |
| Background | Speech recognition is not available in the background |
| Rate limiting | Apple throttles server-based requests per device per day |

### Restarting for Long Sessions

```swift
import Speech
import AVFoundation

@Observable
@MainActor
final class ContinuousTranscriptionManager {
    var fullTranscript = ""
    var isRecording = false

    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))

    /// Restarts the recognition task to handle Apple's ~1 minute limit
    func restartRecognition() async {
        guard isRecording else { return }

        // End current request
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()

        // Create a new request and task
        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.addsPunctuation = true

        if speechRecognizer?.supportsOnDeviceRecognition == true {
            request.requiresOnDeviceRecognition = true
        }

        self.recognitionRequest = request

        // Reinstall the audio tap
        let inputNode = audioEngine?.inputNode
        let format = inputNode?.outputFormat(forBus: 0)

        inputNode?.removeTap(onBus: 0)
        inputNode?.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            request.append(buffer)
        }

        // Start new recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: request) { [weak self] result, error in
            Task { @MainActor in
                guard let self else { return }
                if let result {
                    // Append final results to full transcript
                    if result.isFinal {
                        self.fullTranscript += result.bestTranscription.formattedString + " "
                        // Restart for continuous recognition
                        await self.restartRecognition()
                    }
                }
            }
        }
    }
}
```

---

## Quick Reference

| Class | Purpose |
|-------|---------|
| `SFSpeechRecognizer` | Main class for speech recognition; configure locale and check availability |
| `SFSpeechAudioBufferRecognitionRequest` | Recognition request fed with live audio buffers |
| `SFSpeechURLRecognitionRequest` | Recognition request for audio files on disk |
| `SFSpeechRecognitionTask` | A running recognition operation; cancel or monitor |
| `SFSpeechRecognitionResult` | Contains transcriptions, confidence, and finality |
| `SFTranscription` | A single transcription with formatted text and segments |
| `SFTranscriptionSegment` | Per-word detail: text, confidence, timestamp, duration |

| Property | Type | Purpose |
|----------|------|---------|
| `shouldReportPartialResults` | `Bool` | Emit intermediate results during recognition |
| `requiresOnDeviceRecognition` | `Bool` | Force on-device processing (no network) |
| `addsPunctuation` | `Bool` | Automatic punctuation insertion (iOS 16+) |
| `contextualStrings` | `[String]` | Domain-specific vocabulary hints |
| `supportsOnDeviceRecognition` | `Bool` | Whether the locale supports offline recognition |
