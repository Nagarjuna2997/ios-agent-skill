import PhotosUI
import SwiftUI

/// A single-photo picker with a thumbnail, loading state and error message.
struct PhotoPickerField: View {
    let title: LocalizedStringKey
    @Binding var image: UIImage?
    var maxPixelSize: CGFloat = 2048

    @State private var selection: PhotosPickerItem?
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 12) {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 120, height: 120)
                    .clipShape(.rect(cornerRadius: 16))
                    .accessibilityLabel(Text("Selected photo"))
            }
            PhotosPicker(selection: $selection, matching: .images, photoLibrary: .shared()) {
                if isLoading {
                    ProgressView()
                } else {
                    Label(title, systemImage: "photo.on.rectangle")
                }
            }
            .disabled(isLoading)
            if let errorMessage {
                Text(errorMessage)
                    .font(.footnote)
                    .foregroundStyle(.red)
            }
        }
        .task(id: selection) {
            await load(selection)
        }
    }

    private func load(_ item: PhotosPickerItem?) async {
        guard let item else { return }
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            guard let data = try await item.loadTransferable(type: Data.self), let picked = UIImage(data: data) else {
                errorMessage = "That photo could not be opened."
                return
            }
            image = picked.downscaled(toMaxPixelSize: maxPixelSize)
        } catch is CancellationError {
            return
        } catch {
            errorMessage = "Loading the photo failed: \(error.localizedDescription)"
        }
    }
}

extension UIImage {
    func downscaled(toMaxPixelSize maxPixelSize: CGFloat) -> UIImage {
        let largest = max(size.width, size.height) * scale
        guard largest > maxPixelSize else { return self }
        let ratio = maxPixelSize / largest
        let target = CGSize(width: size.width * scale * ratio, height: size.height * scale * ratio)
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        return UIGraphicsImageRenderer(size: target, format: format).image { _ in
            draw(in: CGRect(origin: .zero, size: target))
        }
    }
}

private struct PhotoPickerFieldPreview: View {
    @State private var image: UIImage?

    var body: some View {
        PhotoPickerField(title: "Add photo", image: $image)
    }
}

#Preview {
    PhotoPickerFieldPreview()
}
