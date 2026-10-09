import SwiftUI
import WebKit

struct LocalWebAnimation: UIViewRepresentable {
    let html: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    func makeCoordinator() -> Coordinator { Coordinator() }
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = false
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        view.isOpaque = false
        return view
    }
    func updateUIView(_ view: WKWebView, context: Context) {
        let document = "<meta http-equiv='Content-Security-Policy' content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:;\"><style>" + (reduceMotion ? "*{animation:none!important;transition:none!important}" : "") + "</style>" + html
        guard context.coordinator.document != document else { return }
        context.coordinator.document = document
        view.loadHTMLString(document, baseURL: nil)
    }
    @MainActor final class Coordinator: NSObject, WKNavigationDelegate {
        var document: String?
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(action.request.url?.absoluteString == "about:blank" ? .allow : .cancel)
        }
    }
}
