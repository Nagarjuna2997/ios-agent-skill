import SwiftUI
import PhotosUI
import Photos

struct PhotoImportView: View {
    @State private var selection: [PhotosPickerItem] = []
    @State private var message = "Choose up to five photos"
    let imported: ([Data]) -> Void
    var body: some View {
        VStack {
            PhotosPicker(selection: $selection, maxSelectionCount: 5, matching: .images) { Label("Import photos", systemImage: "photo") }
            Text(message)
        }
        .task(id: selection) {
            guard !selection.isEmpty else { return }
            do {
                var data: [Data] = []
                for item in selection {
                    try Task.checkCancellation()
                    guard let image = try await item.loadTransferable(type: Data.self) else { throw PhotoLibraryService.Failure.unavailable }
                    data.append(image)
                }
                try Task.checkCancellation()
                imported(data); message = "Imported \(data.count) photos"
            } catch is CancellationError { return }
            catch { message = "Import failed: \(error.localizedDescription)" }
        }
    }
}

enum PhotoLibraryService {
    enum Failure: Error { case denied, unavailable }
    static func saveImage(data: Data) async throws {
        guard await PHPhotoLibrary.requestAuthorization(for: .addOnly) == .authorized else { throw Failure.denied }
        try await PHPhotoLibrary.shared().performChanges {
            PHAssetCreationRequest.forAsset().addResource(with: .photo, data: data, options: nil)
        }
    }
    static func saveVideo(fileURL: URL) async throws {
        guard await PHPhotoLibrary.requestAuthorization(for: .addOnly) == .authorized else { throw Failure.denied }
        try await PHPhotoLibrary.shared().performChanges {
            PHAssetCreationRequest.forAsset().addResource(with: .video, fileURL: fileURL, options: nil)
        }
    }
}
