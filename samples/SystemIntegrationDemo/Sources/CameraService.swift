import SwiftUI
import UIKit
import AVFoundation

/// Present only after authorize() succeeds. The system controller owns capture UI.
struct CameraService: UIViewControllerRepresentable {
    enum Failure: Error { case unavailable, denied }
    let front: Bool
    let result: (Result<UIImage?, Error>) -> Void
    static func authorize() async throws {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else { throw Failure.unavailable }
        guard await AVCaptureDevice.requestAccess(for: .video) else { throw Failure.denied }
    }
    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> UIViewController {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            let unavailable = UIViewController()
            let label = UILabel(); label.text = "Camera unavailable"; label.textAlignment = .center
            unavailable.view = label
            return unavailable
        }
        let picker = UIImagePickerController()
        // Guard even when a caller forgets the preflight; never fall back to a photo-library picker.
        if UIImagePickerController.isSourceTypeAvailable(.camera) {
            picker.sourceType = .camera
            if UIImagePickerController.isCameraDeviceAvailable(front ? .front : .rear) { picker.cameraDevice = front ? .front : .rear }
        }
        picker.delegate = context.coordinator
        return picker
    }
    func updateUIViewController(_ controller: UIViewController, context: Context) { context.coordinator.parent = self }
    final class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        var parent: CameraService
        init(parent: CameraService) { self.parent = parent }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.result(.success(nil)); picker.dismiss(animated: true) }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage { parent.result(.success(image)) }
            else { parent.result(.failure(Failure.unavailable)) }
            picker.dismiss(animated: true)
        }
    }
}
