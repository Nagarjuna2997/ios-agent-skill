# PhotosUI & AVKit

PhotosUI provides the system photo picker for selecting photos and videos. AVKit and AVFoundation provide video playback, custom camera capture, and Picture-in-Picture support. Together they cover the full media pipeline from capture to display.

## PhotosPicker (Single, Multiple, Filtered by Type)

The SwiftUI `PhotosPicker` presents the system photo picker with privacy-preserving access (no permissions prompt required).

```swift
import SwiftUI
import PhotosUI

struct SinglePhotoPicker: View {
    @State private var selectedItem: PhotosPickerItem?
    @State private var selectedImage: Image?

    var body: some View {
        VStack(spacing: 20) {
            if let selectedImage {
                selectedImage
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 300)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            // Single photo picker
            PhotosPicker(
                selection: $selectedItem,
                matching: .images,  // Only show images
                photoLibrary: .shared()
            ) {
                Label("Select Photo", systemImage: "photo.on.rectangle")
            }
            .buttonStyle(.borderedProminent)
        }
        .onChange(of: selectedItem) { oldValue, newValue in
            Task {
                if let data = try? await newValue?.loadTransferable(type: Data.self),
                   let uiImage = UIImage(data: data) {
                    selectedImage = Image(uiImage: uiImage)
                }
            }
        }
    }
}

// Multiple photo selection with type filtering
struct MultiplePhotoPicker: View {
    @State private var selectedItems: [PhotosPickerItem] = []
    @State private var selectedImages: [UIImage] = []

    var body: some View {
        VStack {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(selectedImages, id: \.self) { image in
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 100, height: 100)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .padding(.horizontal)
            }

            // Multiple selection with max count and filter
            PhotosPicker(
                selection: $selectedItems,
                maxSelectionCount: 10,
                selectionBehavior: .ordered,
                matching: .any(of: [.images, .screenshots, .not(.videos)]),
                preferredItemEncoding: .compatible,
                photoLibrary: .shared()
            ) {
                Label("Select Photos (max 10)", systemImage: "photo.stack")
            }
            .buttonStyle(.bordered)

            // Filter examples:
            // .images                       — all images
            // .videos                       — all videos
            // .livePhotos                   — Live Photos only
            // .screenshots                  — screenshots only
            // .any(of: [.images, .videos])  — images or videos
            // .all(of: [.images, .not(.screenshots)]) — images excluding screenshots
        }
        .onChange(of: selectedItems) { oldValue, newValue in
            Task {
                selectedImages = []
                for item in newValue {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        selectedImages.append(image)
                    }
                }
            }
        }
    }
}
```

## Transferable Protocol for Photo Loading

Use `Transferable` conformance for type-safe photo loading from `PhotosPickerItem`.

```swift
import SwiftUI
import PhotosUI
import CoreTransferable

// Custom Transferable type for loading images
struct PickedImage: Transferable {
    let image: Image
    let uiImage: UIImage

    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(importedContentType: .image) { data in
            guard let uiImage = UIImage(data: data) else {
                throw PickerError.importFailed
            }
            return PickedImage(image: Image(uiImage: uiImage), uiImage: uiImage)
        }
    }
}

// Transferable for video loading
struct PickedVideo: Transferable {
    let url: URL

    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { video in
            SentTransferredFile(video.url)
        } importing: { received in
            // Copy to a permanent location
            let destination = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension("mov")
            try FileManager.default.copyItem(at: received.file, to: destination)
            return PickedVideo(url: destination)
        }
    }
}

enum PickerError: LocalizedError {
    case importFailed

    var errorDescription: String? {
        "Failed to import the selected media."
    }
}

// Usage with Transferable
struct TransferablePickerView: View {
    @State private var selectedItem: PhotosPickerItem?
    @State private var pickedImage: PickedImage?
    @State private var isLoading = false

    var body: some View {
        VStack(spacing: 20) {
            if isLoading {
                ProgressView("Loading...")
            } else if let pickedImage {
                pickedImage.image
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 300)
            }

            PhotosPicker(selection: $selectedItem, matching: .images) {
                Label("Choose Photo", systemImage: "photo")
            }
        }
        .onChange(of: selectedItem) { _, newValue in
            Task {
                isLoading = true
                pickedImage = try? await newValue?.loadTransferable(type: PickedImage.self)
                isLoading = false
            }
        }
    }
}
```

## PHPickerViewController (UIKit)

For UIKit codebases, use `PHPickerViewController` which provides the same privacy-preserving picker.

```swift
import UIKit
import PhotosUI

class PhotoPickerViewController: UIViewController, PHPickerViewControllerDelegate {
    private var selectedImages: [UIImage] = []

    func presentPicker() {
        var config = PHPickerConfiguration(photoLibrary: .shared())
        config.selectionLimit = 5          // 0 = unlimited
        config.filter = .images            // .videos, .livePhotos, .any(of:)
        config.preferredAssetRepresentationMode = .current
        config.selection = .ordered        // Maintain selection order

        let picker = PHPickerViewController(configuration: config)
        picker.delegate = self
        present(picker, animated: true)
    }

    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        dismiss(animated: true)

        selectedImages = []

        for result in results {
            let provider = result.itemProvider

            if provider.canLoadObject(ofClass: UIImage.self) {
                provider.loadObject(ofClass: UIImage.self) { [weak self] image, error in
                    if let image = image as? UIImage {
                        DispatchQueue.main.async {
                            self?.selectedImages.append(image)
                            self?.updateUI()
                        }
                    }
                }
            }

            // Load video
            if provider.hasItemConformingToTypeIdentifier("public.movie") {
                provider.loadFileRepresentation(forTypeIdentifier: "public.movie") { url, error in
                    guard let url else { return }
                    // Copy video to permanent location before the temporary file is deleted
                    let destination = FileManager.default.temporaryDirectory
                        .appendingPathComponent(UUID().uuidString + ".mov")
                    try? FileManager.default.copyItem(at: url, to: destination)
                }
            }
        }
    }

    private func updateUI() {
        // Update your collection view or image views
    }
}
```

## AVCaptureSession for Custom Camera

Build a custom camera interface using `AVCaptureSession`, `AVCaptureDeviceInput`, and preview layers.

```swift
import AVFoundation
import UIKit

class CameraManager: NSObject {
    let session = AVCaptureSession()
    private let photoOutput = AVCapturePhotoOutput()
    private let videoOutput = AVCaptureVideoDataOutput()
    private var currentDevice: AVCaptureDevice?

    enum CameraPosition {
        case front, back
    }

    func configure(position: CameraPosition = .back) throws {
        session.beginConfiguration()
        defer { session.commitConfiguration() }

        session.sessionPreset = .photo

        // Remove existing inputs
        session.inputs.forEach { session.removeInput($0) }

        // Select camera device
        let devicePosition: AVCaptureDevice.Position = position == .back ? .back : .front
        guard let device = AVCaptureDevice.default(
            .builtInWideAngleCamera,
            for: .video,
            position: devicePosition
        ) else {
            throw CameraError.deviceNotAvailable
        }

        currentDevice = device

        // Add input
        let input = try AVCaptureDeviceInput(device: device)
        guard session.canAddInput(input) else {
            throw CameraError.cannotAddInput
        }
        session.addInput(input)

        // Add photo output
        guard session.canAddOutput(photoOutput) else {
            throw CameraError.cannotAddOutput
        }
        session.addOutput(photoOutput)
        photoOutput.isHighResolutionCaptureEnabled = true
        photoOutput.maxPhotoQualityPrioritization = .quality
    }

    func start() {
        guard !session.isRunning else { return }
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.startRunning()
        }
    }

    func stop() {
        guard session.isRunning else { return }
        session.stopRunning()
    }

    func switchCamera() throws {
        let newPosition: CameraPosition = currentDevice?.position == .back ? .front : .back
        try configure(position: newPosition)
    }
}

enum CameraError: LocalizedError {
    case deviceNotAvailable
    case cannotAddInput
    case cannotAddOutput
    case permissionDenied

    var errorDescription: String? {
        switch self {
        case .deviceNotAvailable: return "Camera device not available."
        case .cannotAddInput: return "Cannot add camera input."
        case .cannotAddOutput: return "Cannot add camera output."
        case .permissionDenied: return "Camera access denied."
        }
    }
}
```

## AVCapturePhotoOutput and AVCaptureVideoDataOutput

Capture photos and process live video frames from the camera session.

```swift
import AVFoundation
import UIKit

// Photo capture delegate
class PhotoCaptureDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    private let completion: (Result<UIImage, Error>) -> Void

    init(completion: @escaping (Result<UIImage, Error>) -> Void) {
        self.completion = completion
    }

    func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        if let error {
            completion(.failure(error))
            return
        }

        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else {
            completion(.failure(CameraError.cannotAddOutput))
            return
        }

        completion(.success(image))
    }
}

// Extend CameraManager with photo capture
extension CameraManager {
    private static var captureDelegate: PhotoCaptureDelegate?

    func capturePhoto(completion: @escaping (Result<UIImage, Error>) -> Void) {
        let settings = AVCapturePhotoSettings()
        settings.flashMode = .auto
        settings.isHighResolutionPhotoEnabled = true

        // Configure format
        if let previewPixelType = settings.availablePreviewPhotoPixelFormatTypes.first {
            settings.previewPhotoFormat = [
                kCVPixelBufferPixelFormatTypeKey as String: previewPixelType
            ]
        }

        let delegate = PhotoCaptureDelegate(completion: completion)
        Self.captureDelegate = delegate  // Retain the delegate
        photoOutput.capturePhoto(with: settings, delegate: delegate)
    }
}

// Video frame processing (for real-time analysis, filters, etc.)
class VideoFrameProcessor: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
    let processingQueue = DispatchQueue(label: "com.app.videoProcessing")
    var onFrameCaptured: ((CVPixelBuffer, CMTime) -> Void)?

    func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let timestamp = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        onFrameCaptured?(pixelBuffer, timestamp)
    }

    func captureOutput(
        _ output: AVCaptureOutput,
        didDrop sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        // Frame was dropped due to processing backpressure
        print("Frame dropped")
    }
}

// Adding video output to camera manager
extension CameraManager {
    func addVideoOutput(processor: VideoFrameProcessor) {
        let videoOutput = AVCaptureVideoDataOutput()
        videoOutput.setSampleBufferDelegate(processor, queue: processor.processingQueue)
        videoOutput.alwaysDiscardsLateVideoFrames = true

        if session.canAddOutput(videoOutput) {
            session.addOutput(videoOutput)
        }
    }
}
```

## VideoPlayer in SwiftUI with Custom Controls

Use `AVKit.VideoPlayer` for standard playback or build custom controls with `AVPlayer`.

```swift
import SwiftUI
import AVKit

// Simple video player with built-in controls
struct SimpleVideoPlayerView: View {
    @State private var player = AVPlayer(url: URL(string: "https://example.com/video.mp4")!)

    var body: some View {
        VideoPlayer(player: player) {
            // Optional overlay content
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("Live")
                        .font(.caption.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(.red)
                        .foregroundStyle(.white)
                        .clipShape(Capsule())
                        .padding()
                }
            }
        }
        .frame(height: 300)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .onDisappear {
            player.pause()
        }
    }
}

// Custom video player with custom controls
struct CustomVideoPlayerView: View {
    let url: URL

    @State private var player: AVPlayer?
    @State private var isPlaying = false
    @State private var currentTime: Double = 0
    @State private var duration: Double = 0
    @State private var showControls = true

    var body: some View {
        ZStack {
            // Video layer
            VideoPlayerLayer(player: player)
                .onTapGesture {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        showControls.toggle()
                    }
                }

            // Custom controls overlay
            if showControls {
                controlsOverlay
                    .transition(.opacity)
            }
        }
        .frame(height: 300)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .onAppear {
            setupPlayer()
        }
        .onDisappear {
            player?.pause()
        }
    }

    private var controlsOverlay: some View {
        ZStack {
            // Semi-transparent background
            Color.black.opacity(0.4)

            VStack {
                Spacer()

                // Play/Pause button
                Button {
                    togglePlayback()
                } label: {
                    Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 50))
                        .foregroundStyle(.white)
                }

                Spacer()

                // Progress bar
                HStack(spacing: 12) {
                    Text(formatTime(currentTime))
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.white)

                    Slider(value: $currentTime, in: 0...max(duration, 1)) { editing in
                        if !editing {
                            player?.seek(to: CMTime(seconds: currentTime, preferredTimescale: 600))
                        }
                    }
                    .tint(.white)

                    Text(formatTime(duration))
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.white)
                }
                .padding(.horizontal)
                .padding(.bottom, 16)
            }
        }
    }

    private func setupPlayer() {
        player = AVPlayer(url: url)

        // Observe time
        player?.addPeriodicTimeObserver(
            forInterval: CMTime(seconds: 0.5, preferredTimescale: 600),
            queue: .main
        ) { time in
            currentTime = time.seconds
        }

        // Get duration
        Task {
            if let durationCM = try? await player?.currentItem?.asset.load(.duration) {
                duration = durationCM.seconds
            }
        }
    }

    private func togglePlayback() {
        if isPlaying {
            player?.pause()
        } else {
            player?.play()
        }
        isPlaying.toggle()
    }

    private func formatTime(_ seconds: Double) -> String {
        let mins = Int(seconds) / 60
        let secs = Int(seconds) % 60
        return String(format: "%d:%02d", mins, secs)
    }
}

// UIViewRepresentable for AVPlayerLayer
struct VideoPlayerLayer: UIViewRepresentable {
    let player: AVPlayer?

    func makeUIView(context: Context) -> PlayerUIView {
        PlayerUIView(player: player)
    }

    func updateUIView(_ uiView: PlayerUIView, context: Context) {
        uiView.playerLayer.player = player
    }
}

class PlayerUIView: UIView {
    var playerLayer: AVPlayerLayer

    init(player: AVPlayer?) {
        playerLayer = AVPlayerLayer(player: player)
        super.init(frame: .zero)
        playerLayer.videoGravity = .resizeAspectFill
        layer.addSublayer(playerLayer)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        playerLayer.frame = bounds
    }
}
```

## Picture-in-Picture (AVPictureInPictureController)

Enable Picture-in-Picture for video playback so users can continue watching in a floating window.

```swift
import AVKit
import SwiftUI

class PiPManager: NSObject, AVPictureInPictureControllerDelegate {
    private var pipController: AVPictureInPictureController?
    var onPiPStatusChanged: ((Bool) -> Void)?

    func setup(with playerLayer: AVPlayerLayer) {
        guard AVPictureInPictureController.isPictureInPictureSupported() else {
            print("PiP is not supported on this device")
            return
        }

        pipController = AVPictureInPictureController(playerLayer: playerLayer)
        pipController?.delegate = self
        pipController?.canStartPictureInPictureAutomaticallyFromInline = true
    }

    func togglePiP() {
        guard let pipController else { return }

        if pipController.isPictureInPictureActive {
            pipController.stopPictureInPicture()
        } else {
            pipController.startPictureInPicture()
        }
    }

    var isPiPActive: Bool {
        pipController?.isPictureInPictureActive ?? false
    }

    var isPiPPossible: Bool {
        pipController?.isPictureInPicturePossible ?? false
    }

    // MARK: - AVPictureInPictureControllerDelegate

    func pictureInPictureControllerWillStartPictureInPicture(
        _ pictureInPictureController: AVPictureInPictureController
    ) {
        onPiPStatusChanged?(true)
    }

    func pictureInPictureControllerDidStopPictureInPicture(
        _ pictureInPictureController: AVPictureInPictureController
    ) {
        onPiPStatusChanged?(false)
    }

    func pictureInPictureController(
        _ pictureInPictureController: AVPictureInPictureController,
        failedToStartPictureInPictureWithError error: Error
    ) {
        print("PiP failed to start: \(error.localizedDescription)")
    }

    func pictureInPictureController(
        _ pictureInPictureController: AVPictureInPictureController,
        restoreUserInterfaceForPictureInPictureStopWithCompletionHandler completionHandler: @escaping (Bool) -> Void
    ) {
        // Restore your UI when PiP stops
        completionHandler(true)
    }
}

// Configure audio session for PiP background audio
import AVFAudio

func configureAudioSession() {
    do {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .moviePlayback)
        try session.setActive(true)
    } catch {
        print("Audio session configuration failed: \(error)")
    }
}
```

## PHPhotoLibrary for Saving Photos and Videos

Save captured photos and videos to the user's photo library with proper permissions handling.

```swift
import Photos
import UIKit

class PhotoLibraryManager {
    // Check and request authorization
    static func requestAuthorization() async -> PHAuthorizationStatus {
        let status = PHPhotoLibrary.authorizationStatus(for: .addOnly)

        switch status {
        case .notDetermined:
            return await PHPhotoLibrary.requestAuthorization(for: .addOnly)
        default:
            return status
        }
    }

    // Save a UIImage to the photo library
    static func saveImage(_ image: UIImage) async throws {
        let status = await requestAuthorization()
        guard status == .authorized || status == .limited else {
            throw PhotoLibraryError.permissionDenied
        }

        try await PHPhotoLibrary.shared().performChanges {
            let request = PHAssetCreationRequest.forAsset()
            guard let imageData = image.jpegData(compressionQuality: 0.9) else {
                return
            }
            request.addResource(with: .photo, data: imageData, options: nil)
            request.creationDate = Date()
        }
    }

    // Save a video file to the photo library
    static func saveVideo(at url: URL) async throws {
        let status = await requestAuthorization()
        guard status == .authorized || status == .limited else {
            throw PhotoLibraryError.permissionDenied
        }

        try await PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: url)
        }
    }

    // Save to a specific album (create if needed)
    static func saveImage(_ image: UIImage, toAlbum albumName: String) async throws {
        let status = await requestAuthorization()
        guard status == .authorized else {
            throw PhotoLibraryError.permissionDenied
        }

        // Find or create the album
        let album = try await findOrCreateAlbum(named: albumName)

        try await PHPhotoLibrary.shared().performChanges {
            let assetRequest = PHAssetCreationRequest.forAsset()
            guard let imageData = image.jpegData(compressionQuality: 0.9) else { return }
            assetRequest.addResource(with: .photo, data: imageData, options: nil)

            guard let placeholder = assetRequest.placeholderForCreatedAsset,
                  let albumChangeRequest = PHAssetCollectionChangeRequest(for: album) else {
                return
            }
            albumChangeRequest.addAssets([placeholder] as NSFastEnumeration)
        }
    }

    private static func findOrCreateAlbum(named name: String) async throws -> PHAssetCollection {
        // Search for existing album
        let fetchOptions = PHFetchOptions()
        fetchOptions.predicate = NSPredicate(format: "title = %@", name)
        let collections = PHAssetCollection.fetchAssetCollections(
            with: .album,
            subtype: .any,
            options: fetchOptions
        )

        if let existing = collections.firstObject {
            return existing
        }

        // Create new album
        var placeholder: PHObjectPlaceholder?
        try await PHPhotoLibrary.shared().performChanges {
            let request = PHAssetCollectionChangeRequest.creationRequestForAssetCollection(withTitle: name)
            placeholder = request.placeholderForCreatedAssetCollection
        }

        guard let placeholder,
              let album = PHAssetCollection.fetchAssetCollections(
                  withLocalIdentifiers: [placeholder.localIdentifier],
                  options: nil
              ).firstObject else {
            throw PhotoLibraryError.albumCreationFailed
        }

        return album
    }
}

enum PhotoLibraryError: LocalizedError {
    case permissionDenied
    case albumCreationFailed

    var errorDescription: String? {
        switch self {
        case .permissionDenied:
            return "Photo library access denied. Enable it in Settings."
        case .albumCreationFailed:
            return "Failed to create photo album."
        }
    }
}
```

## Complete Photo Picker and Custom Camera Example

A full-featured media capture app with both a photo picker and custom camera interface.

```swift
import SwiftUI
import PhotosUI
import AVFoundation

// MARK: - Main View

struct MediaCaptureView: View {
    @State private var selectedTab = 0
    @State private var capturedImages: [UIImage] = []

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Photo grid
                ScrollView {
                    if capturedImages.isEmpty {
                        ContentUnavailableView(
                            "No Photos Yet",
                            systemImage: "photo.on.rectangle.angled",
                            description: Text("Take a photo or pick from your library.")
                        )
                    } else {
                        LazyVGrid(columns: [
                            GridItem(.flexible(), spacing: 2),
                            GridItem(.flexible(), spacing: 2),
                            GridItem(.flexible(), spacing: 2)
                        ], spacing: 2) {
                            ForEach(capturedImages.indices, id: \.self) { index in
                                Image(uiImage: capturedImages[index])
                                    .resizable()
                                    .scaledToFill()
                                    .frame(minHeight: 120)
                                    .clipped()
                            }
                        }
                    }
                }

                // Bottom toolbar
                MediaToolbar(
                    onPhotoPicked: { images in
                        capturedImages.append(contentsOf: images)
                    },
                    onPhotoTaken: { image in
                        capturedImages.append(image)
                    }
                )
            }
            .navigationTitle("Photos")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if !capturedImages.isEmpty {
                        Button("Save All") {
                            saveAllPhotos()
                        }
                    }
                }
            }
        }
    }

    private func saveAllPhotos() {
        Task {
            for image in capturedImages {
                try? await PhotoLibraryManager.saveImage(image, toAlbum: "My App")
            }
        }
    }
}

// MARK: - Media Toolbar

struct MediaToolbar: View {
    let onPhotoPicked: ([UIImage]) -> Void
    let onPhotoTaken: (UIImage) -> Void

    @State private var selectedItems: [PhotosPickerItem] = []
    @State private var showCamera = false

    var body: some View {
        HStack(spacing: 40) {
            // Photo picker button
            PhotosPicker(
                selection: $selectedItems,
                maxSelectionCount: 20,
                matching: .images
            ) {
                VStack(spacing: 4) {
                    Image(systemName: "photo.on.rectangle")
                        .font(.title2)
                    Text("Library")
                        .font(.caption)
                }
            }

            // Camera button
            Button {
                showCamera = true
            } label: {
                VStack(spacing: 4) {
                    Image(systemName: "camera.fill")
                        .font(.title2)
                    Text("Camera")
                        .font(.caption)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(.ultraThinMaterial)
        .onChange(of: selectedItems) { _, newValue in
            Task {
                var images: [UIImage] = []
                for item in newValue {
                    if let data = try? await item.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        images.append(image)
                    }
                }
                onPhotoPicked(images)
                selectedItems = []
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraView(onCapture: onPhotoTaken)
        }
    }
}

// MARK: - Camera View

struct CameraView: View {
    let onCapture: (UIImage) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var cameraManager = SwiftUICameraManager()
    @State private var lastCapturedImage: UIImage?
    @State private var flashEnabled = false
    @State private var isFrontCamera = false

    var body: some View {
        ZStack {
            // Camera preview
            CameraPreviewView(session: cameraManager.session)
                .ignoresSafeArea()

            VStack {
                // Top bar
                HStack {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundStyle(.white)

                    Spacer()

                    Button {
                        flashEnabled.toggle()
                    } label: {
                        Image(systemName: flashEnabled ? "bolt.fill" : "bolt.slash")
                            .foregroundStyle(.white)
                            .font(.title3)
                    }
                }
                .padding()

                Spacer()

                // Bottom controls
                HStack(spacing: 60) {
                    // Last captured thumbnail
                    if let lastImage = lastCapturedImage {
                        Image(uiImage: lastImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 50, height: 50)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    } else {
                        Color.clear.frame(width: 50, height: 50)
                    }

                    // Capture button
                    Button {
                        capturePhoto()
                    } label: {
                        Circle()
                            .fill(.white)
                            .frame(width: 70, height: 70)
                            .overlay(
                                Circle()
                                    .stroke(.white, lineWidth: 3)
                                    .frame(width: 80, height: 80)
                            )
                    }

                    // Switch camera
                    Button {
                        switchCamera()
                    } label: {
                        Image(systemName: "camera.rotate")
                            .font(.title2)
                            .foregroundStyle(.white)
                            .frame(width: 50, height: 50)
                    }
                }
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            Task {
                await cameraManager.checkPermissionAndStart()
            }
        }
        .onDisappear {
            cameraManager.stop()
        }
    }

    private func capturePhoto() {
        cameraManager.capturePhoto { result in
            if case .success(let image) = result {
                lastCapturedImage = image
                onCapture(image)
            }
        }
    }

    private func switchCamera() {
        isFrontCamera.toggle()
        try? cameraManager.switchCamera()
    }
}

// MARK: - Camera Preview (UIViewRepresentable)

struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> CameraPreviewUIView {
        CameraPreviewUIView(session: session)
    }

    func updateUIView(_ uiView: CameraPreviewUIView, context: Context) {}
}

class CameraPreviewUIView: UIView {
    private var previewLayer: AVCaptureVideoPreviewLayer

    init(session: AVCaptureSession) {
        previewLayer = AVCaptureVideoPreviewLayer(session: session)
        super.init(frame: .zero)
        previewLayer.videoGravity = .resizeAspectFill
        layer.addSublayer(previewLayer)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        previewLayer.frame = bounds
    }
}

// MARK: - SwiftUI Camera Manager

@Observable
class SwiftUICameraManager {
    let session = AVCaptureSession()
    private let photoOutput = AVCapturePhotoOutput()
    private var captureDelegate: PhotoCaptureHandler?

    func checkPermissionAndStart() async {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupAndStart()
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            if granted { setupAndStart() }
        default:
            break
        }
    }

    private func setupAndStart() {
        session.beginConfiguration()
        session.sessionPreset = .photo

        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
              let input = try? AVCaptureDeviceInput(device: device),
              session.canAddInput(input) else {
            session.commitConfiguration()
            return
        }

        session.addInput(input)

        if session.canAddOutput(photoOutput) {
            session.addOutput(photoOutput)
        }

        session.commitConfiguration()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.session.startRunning()
        }
    }

    func stop() {
        session.stopRunning()
    }

    func switchCamera() throws {
        session.beginConfiguration()
        defer { session.commitConfiguration() }

        guard let currentInput = session.inputs.first as? AVCaptureDeviceInput else { return }
        session.removeInput(currentInput)

        let newPosition: AVCaptureDevice.Position = currentInput.device.position == .back ? .front : .back
        guard let newDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: newPosition),
              let newInput = try? AVCaptureDeviceInput(device: newDevice),
              session.canAddInput(newInput) else {
            // Re-add old input if switch fails
            if session.canAddInput(currentInput) { session.addInput(currentInput) }
            return
        }
        session.addInput(newInput)
    }

    func capturePhoto(completion: @escaping (Result<UIImage, Error>) -> Void) {
        let settings = AVCapturePhotoSettings()
        let handler = PhotoCaptureHandler(completion: completion)
        captureDelegate = handler
        photoOutput.capturePhoto(with: settings, delegate: handler)
    }
}

class PhotoCaptureHandler: NSObject, AVCapturePhotoCaptureDelegate {
    private let completion: (Result<UIImage, Error>) -> Void

    init(completion: @escaping (Result<UIImage, Error>) -> Void) {
        self.completion = completion
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error {
            DispatchQueue.main.async { self.completion(.failure(error)) }
            return
        }
        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else {
            DispatchQueue.main.async { self.completion(.failure(CameraError.cannotAddOutput)) }
            return
        }
        DispatchQueue.main.async { self.completion(.success(image)) }
    }
}
```

## Key Considerations

- **PhotosPicker**: No permissions prompt required. The system mediates access. Available iOS 16+.
- **Camera permissions**: Add `NSCameraUsageDescription` to Info.plist. Always check authorization before accessing `AVCaptureSession`.
- **Photo library permissions**: Add `NSPhotoLibraryAddUsageDescription` for save-only access. Add `NSPhotoLibraryUsageDescription` for full read/write access.
- **Background audio**: Set the audio session category to `.playback` and enable the "Audio, AirPlay, and Picture in Picture" background mode for PiP.
- **Memory**: Large photos can consume significant memory. Use `CGImageSource` for progressive loading of very large images.
- **Thread safety**: `AVCaptureSession` configuration must happen on a single thread. Never call `startRunning()` on the main thread.
- **Transferable**: Use `Transferable` with `PhotosPickerItem` for type-safe, modern photo loading (iOS 16+).
- **Video**: For video playback, prefer `AVPlayer` with `VideoPlayer` in SwiftUI. For recording, use `AVCaptureMovieFileOutput`.
