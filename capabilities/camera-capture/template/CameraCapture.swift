import SwiftUI
import UIKit

@MainActor
enum CameraCapture {
    static var isAvailable: Bool { UIImagePickerController.isSourceTypeAvailable(.camera) }
}

struct CameraCaptureButton: View {
    @Binding var image: UIImage?
    var title: LocalizedStringKey = "Take photo"
    @State private var isPresented = false

    var body: some View {
        VStack(spacing: 6) {
            Button {
                isPresented = true
            } label: {
                Label(title, systemImage: "camera")
            }
            .disabled(!CameraCapture.isAvailable)
            if !CameraCapture.isAvailable {
                Text("No camera is available on this device.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .fullScreenCover(isPresented: $isPresented) {
            CameraPicker(image: $image)
                .ignoresSafeArea()
        }
    }
}

/// The system camera interface.
struct CameraPicker: UIViewControllerRepresentable {
    @Binding var image: UIImage?
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ controller: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: CameraPicker

        init(parent: CameraPicker) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.image = info[.originalImage] as? UIImage
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

private struct CameraCapturePreview: View {
    @State private var image: UIImage?

    var body: some View {
        CameraCaptureButton(image: $image)
    }
}

#Preview {
    CameraCapturePreview()
}
