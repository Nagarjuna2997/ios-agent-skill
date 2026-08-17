# Sound Analysis

## Context

Load this when an app needs sound classification, audio-event detection, built-in sound labels, custom Core ML sound classifiers, live microphone sound analysis, file-based audio tagging, or sound timestamps.

Use Sound Analysis for non-speech sounds. Use Speech for spoken-word transcription, ShazamKit for music recognition/matching, AVFoundation for capture/playback, and Core ML when the app owns a model that is not routed through `SNClassifySoundRequest`.

## Choosing the analyzer

| Need | Use |
|---|---|
| Analyze an existing audio file | `SNAudioFileAnalyzer` |
| Analyze microphone or live stream buffers | `SNAudioStreamAnalyzer` |
| Use Apple's built-in sound classifier | `SNClassifySoundRequest(classifierIdentifier:)` |
| Use a custom sound classifier | `SNClassifySoundRequest(mlModel:)` |
| Receive results | `SNResultsObserving` |

## Audio file analysis

```swift
import Foundation
import SoundAnalysis

final class SoundFileClassifier {
    private var observer: SoundResultsObserver?

    func classifyFile(at url: URL) throws {
        let request = try SNClassifySoundRequest(classifierIdentifier: .version1)
        let analyzer = try SNAudioFileAnalyzer(url: url)

        let observer = SoundResultsObserver()
        self.observer = observer

        try analyzer.add(request, withObserver: observer)
        analyzer.analyze()
    }
}

final class SoundResultsObserver: NSObject, SNResultsObserving {
    func request(_ request: SNRequest, didProduce result: SNResult) {
        guard let result = result as? SNClassificationResult,
              let best = result.classifications.first else {
            return
        }

        let time = result.timeRange.start.seconds
        print("Sound at \(time): \(best.identifier), confidence \(best.confidence)")
    }

    func request(_ request: SNRequest, didFailWithError error: Error) {
        print("Sound analysis failed: \(error)")
    }

    func requestDidComplete(_ request: SNRequest) {
        print("Sound analysis complete")
    }
}
```

Important: keep a strong reference to the observer. Sound analyzers do not keep observers alive for you.

## Live audio stream analysis

For microphone analysis:

1. Request microphone permission with clear purpose text.
2. Configure `AVAudioEngine`.
3. Create `SNAudioStreamAnalyzer` with the input format.
4. Add `SNClassifySoundRequest`.
5. Feed audio buffers from the audio tap.
6. Stop the engine and remove taps when the feature ends.

Rules:

- Keep audio work off the main actor.
- Avoid retaining raw audio unless the product explicitly needs it.
- Debounce classifications before updating UI.
- Treat low-confidence labels as suggestions, not facts.

## Custom sound classifiers

Use a custom Core ML sound classifier when built-in labels are not enough.

Rules:

- Train with representative audio from the real environment.
- Keep train/test splits clean.
- Validate noisy rooms, silence, overlapping sounds, and device microphones.
- Version the model and labels together.
- Keep confidence thresholds product-specific.

## Privacy and UX

- Explain microphone use before requesting permission.
- Show when live listening is active.
- Provide a clear stop control.
- Avoid background listening unless the product, entitlement, and policy story are explicit.
- Do not upload raw audio by default.
- Tell users when results are approximate.

## Verification checklist

- [ ] Microphone permission states are tested.
- [ ] File-based and stream-based paths are tested separately.
- [ ] Observer lifetime is strong and documented.
- [ ] Confidence threshold is defined.
- [ ] Silence, noise, and overlapping sounds are tested.
- [ ] Audio engine stop/removal is tested.
- [ ] Memory and battery are measured for long sessions.
- [ ] Privacy copy matches the audio data path.

## Source anchor

Use only to verify API signatures and availability: <https://developer.apple.com/documentation/soundanalysis>
