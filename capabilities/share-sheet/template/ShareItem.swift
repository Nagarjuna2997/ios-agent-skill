import CoreTransferable
import SwiftUI
import UniformTypeIdentifiers

/// Something the user can share: a title for the preview, text, and an optional link.
struct SharedItem: Transferable, Equatable, Sendable {
    var title: String
    var text: String
    var url: URL?

    var shareText: String {
        [text, url?.absoluteString].compactMap { $0 }.joined(separator: "\n")
    }

    static var transferRepresentation: some TransferRepresentation {
        ProxyRepresentation(exporting: \.shareText)
    }
}

struct ShareItemButton: View {
    let item: SharedItem
    var label: LocalizedStringKey = "Share"

    var body: some View {
        ShareLink(item: item, preview: SharePreview(item.title)) {
            Label(label, systemImage: "square.and.arrow.up")
        }
    }
}

#Preview {
    ShareItemButton(item: SharedItem(title: "Sample", text: "Have a look", url: URL(string: "https://example.com")))
}
