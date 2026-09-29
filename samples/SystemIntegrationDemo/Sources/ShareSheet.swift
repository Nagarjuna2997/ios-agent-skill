import SwiftUI
import UIKit

/// Present with .sheet on iPhone/iPad. AirDrop availability is controlled by the system.
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any] // String, URL (including local PDF/file), or UIImage supplied by the caller.
    let completion: UIActivityViewController.CompletionWithItemsHandler?
    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(activityItems: items, applicationActivities: nil)
        controller.completionWithItemsHandler = completion
        return controller
    }
    func updateUIViewController(_ controller: UIActivityViewController, context: Context) {}
}
struct ShareFileLink: View {
    let file: URL
    var body: some View { ShareLink(item: file) }
}
