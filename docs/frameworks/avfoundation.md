# AVFoundation

## AVPlayer and AVPlayerViewController

```swift
import AVKit
import AVFoundation

// Simple video player in SwiftUI
struct VideoPlayerView: View {
    let url: URL
    @State private var player: AVPlayer?

    var body: some View {
        VideoPlayer(player: player)
            .onAppear {
                player = AVPlayer(url: url)
                player?.play()
            }
            .onDisappear {
                player?.pause()
                player = nil
            }
    }
}

// Full-featured player with AVPlayerViewController (UIKit wrapper)
struct FullScreenVideoPlayer: UIViewControllerRepresentable {
    let url: URL

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()
        let player = AVPlayer(url: url)
        controller.player = player
        controller.allowsPictureInPicturePlayback = true
        controller.canStartPictureInPictureAutomaticallyFromInline = true
        return controller
    }

    func updateUIViewController(_ uiViewController: AVPlayerViewController, context: Context) {}
}

// Observing player state
@Observable
class VideoPlayerModel {
    var player: AVPlayer?
    var isPlaying = false
    var currentTime: TimeInterval = 0
    var duration: TimeInterval = 0

    private var timeObserver: Any?

    func loadVideo(url: URL) {
        let item = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: item)

        // Observe playback time
        timeObserver = player?.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600),
            queue: .main
        ) { [weak self] time in
            self?.currentTime = time.seconds
        }

        // Observe duration when ready
        Task {
            if let duration = try? await item.asset.load(.duration) {
                self.duration = duration.seconds
            }
        }
    }

    func togglePlayback() {
        if isPlaying {
            player?.pause()
        } else {
            player?.play()
        }
        isPlaying.toggle()
    }

    func seek(to time: TimeInterval) {
        player?.seek(to: CMTime(seconds: time, preferredTimescale: 600))
    }

    deinit {
        if let observer = timeObserver {
            player?.removeTimeObserver(observer)
        }
    }
}
```

## AVAudioPlayer and AVAudioRecorder

```swift
import AVFoundation

@Observable
class AudioManager {
    var isPlaying = false
    var isRecording = false
    var recordingURL: URL?

    private var audioPlayer: AVAudioPlayer?
    private var audioRecorder: AVAudioRecorder?

    // Play audio file
    func play(url: URL) throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default)
        try session.setActive(true)

        audioPlayer = try AVAudioPlayer(contentsOf: url)
        audioPlayer?.prepareToPlay()
        audioPlayer?.play()
        isPlaying = true
    }

    func stopPlayback() {
        audioPlayer?.stop()
        isPlaying = false
    }

    // Record audio
    func startRecording() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .default)
        try session.setActive(true)

        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let audioFilename = documentsPath.appendingPathComponent("\(UUID().uuidString).m4a")
        recordingURL = audioFilename

        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]

        audioRecorder = try AVAudioRecorder(url: audioFilename, settings: settings)
        audioRecorder?.isMeteringEnabled = true
        audioRecorder?.record()
        isRecording = true
    }

    func stopRecording() -> URL? {
        audioRecorder?.stop()
        isRecording = false
        return recordingURL
    }

    // Get audio levels for visualization
    func currentLevel() -> Float {
        audioRecorder?.updateMeters()
        return audioRecorder?.averagePower(forChannel: 0) ?? -160
    }
}
```

## AVCaptureSession — Camera and Video Capture

```swift
import AVFoundation
import UIKit

class CameraManager: NSObject {
    let captureSession = AVCaptureSession()
    private var photoOutput = AVCapturePhotoOutput()
    private var videoOutput = AVCaptureMovieFileOutput()
    private var currentCamera: AVCaptureDevice.Position = .back
    var photoCaptureCompletion: ((UIImage?) -> Void)?

    func setupSession() {
        captureSession.beginConfiguration()
        captureSession.sessionPreset = .photo

        // Add camera input
        guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: camera),
              captureSession.canAddInput(input)
        else { return }
        captureSession.addInput(input)

        // Add photo output
        guard captureSession.canAddOutput(photoOutput) else { return }
        captureSession.addOutput(photoOutput)
        photoOutput.isHighResolutionCaptureEnabled = true

        captureSession.commitConfiguration()
    }

    func startSession() {
        guard !captureSession.isRunning else { return }
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
        }
    }

    func stopSession() {
        guard captureSession.isRunning else { return }
        captureSession.stopRunning()
    }

    func capturePhoto() {
        let settings = AVCapturePhotoSettings()
        settings.flashMode = .auto
        photoOutput.capturePhoto(with: settings, delegate: self)
    }

    func switchCamera() {
        captureSession.beginConfiguration()

        // Remove current input
        if let currentInput = captureSession.inputs.first as? AVCaptureDeviceInput {
            captureSession.removeInput(currentInput)
        }

        // Add new camera
        currentCamera = currentCamera == .back ? .front : .back
        guard let newCamera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: currentCamera),
              let newInput = try? AVCaptureDeviceInput(device: newCamera),
              captureSession.canAddInput(newInput)
        else { return }
        captureSession.addInput(newInput)
        captureSession.commitConfiguration()
    }

    // Check camera permission
    static func requestPermission() async -> Bool {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        switch status {
        case .authorized:
            return true
        case .notDetermined:
            return await AVCaptureDevice.requestAccess(for: .video)
        default:
            return false
        }
    }
}

extension CameraManager: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput,
                     didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data)
        else {
            photoCaptureCompletion?(nil)
            return
        }
        photoCaptureCompletion?(image)
    }
}

// Camera preview layer for UIKit
class CameraPreviewView: UIView {
    override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }

    var previewLayer: AVCaptureVideoPreviewLayer {
        layer as! AVCaptureVideoPreviewLayer
    }

    func configure(session: AVCaptureSession) {
        previewLayer.session = session
        previewLayer.videoGravity = .resizeAspectFill
    }
}
```

## AVAsset and AVAssetExportSession

```swift
// Get video metadata
func getVideoInfo(url: URL) async throws -> (duration: TimeInterval, size: CGSize) {
    let asset = AVURLAsset(url: url)
    let duration = try await asset.load(.duration)

    let tracks = try await asset.loadTracks(withMediaType: .video)
    let size = try await tracks.first?.load(.naturalSize) ?? .zero

    return (duration.seconds, size)
}

// Export/compress video
func compressVideo(inputURL: URL, outputURL: URL) async throws {
    let asset = AVURLAsset(url: inputURL)

    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetMediumQuality) else {
        throw ExportError.sessionCreationFailed
    }

    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4
    exportSession.shouldOptimizeForNetworkUse = true

    await exportSession.export()

    if let error = exportSession.error {
        throw error
    }
}

// Trim video
func trimVideo(inputURL: URL, outputURL: URL, startTime: TimeInterval, endTime: TimeInterval) async throws {
    let asset = AVURLAsset(url: inputURL)

    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetHighestQuality) else {
        throw ExportError.sessionCreationFailed
    }

    let start = CMTime(seconds: startTime, preferredTimescale: 600)
    let end = CMTime(seconds: endTime, preferredTimescale: 600)
    exportSession.timeRange = CMTimeRange(start: start, end: end)
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4

    await exportSession.export()
}

// Generate thumbnail
func generateThumbnail(url: URL, at time: TimeInterval) async throws -> UIImage {
    let asset = AVURLAsset(url: url)
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    generator.maximumSize = CGSize(width: 320, height: 320)

    let cmTime = CMTime(seconds: time, preferredTimescale: 600)
    let (image, _) = try await generator.image(at: cmTime)
    return UIImage(cgImage: image)
}

enum ExportError: Error {
    case sessionCreationFailed
}
```

## Audio Session Configuration

```swift
import AVFoundation

class AudioSessionManager {

    // Playback only (music, podcasts)
    static func configureForPlayback() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default, options: [])
        try session.setActive(true)
    }

    // Recording
    static func configureForRecording() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .default, options: [])
        try session.setActive(true)
    }

    // Play and record simultaneously (voice chat)
    static func configureForVoiceChat() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .voiceChat, options: [
            .defaultToSpeaker,
            .allowBluetooth,
        ])
        try session.setActive(true)
    }

    // Handle interruptions (phone calls)
    static func observeInterruptions(handler: @escaping (Bool) -> Void) {
        NotificationCenter.default.addObserver(
            forName: AVAudioSession.interruptionNotification,
            object: AVAudioSession.sharedInstance(),
            queue: .main
        ) { notification in
            guard let typeValue = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
                  let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }
            handler(type == .began)
        }
    }
}
```

## Now Playing Info and Remote Commands

```swift
import MediaPlayer

class NowPlayingManager {
    static let shared = NowPlayingManager()

    func setupRemoteCommands(
        onPlay: @escaping () -> Void,
        onPause: @escaping () -> Void,
        onNext: @escaping () -> Void,
        onPrevious: @escaping () -> Void
    ) {
        let commandCenter = MPRemoteCommandCenter.shared()

        commandCenter.playCommand.addTarget { _ in
            onPlay()
            return .success
        }
        commandCenter.pauseCommand.addTarget { _ in
            onPause()
            return .success
        }
        commandCenter.nextTrackCommand.addTarget { _ in
            onNext()
            return .success
        }
        commandCenter.previousTrackCommand.addTarget { _ in
            onPrevious()
            return .success
        }
    }

    func updateNowPlaying(title: String, artist: String, duration: TimeInterval, currentTime: TimeInterval, artwork: UIImage?) {
        var info = [String: Any]()
        info[MPMediaItemPropertyTitle] = title
        info[MPMediaItemPropertyArtist] = artist
        info[MPMediaItemPropertyPlaybackDuration] = duration
        info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = currentTime
        info[MPNowPlayingInfoPropertyPlaybackRate] = 1.0

        if let image = artwork {
            info[MPMediaItemPropertyArtwork] = MPMediaItemArtwork(boundsSize: image.size) { _ in image }
        }

        MPNowPlayingInfoCenter.default().nowPlayingInfo = info
    }
}
```
