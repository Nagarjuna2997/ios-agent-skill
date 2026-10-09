import SwiftUI
import RiveRuntime

struct BundledRiveAnimation: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let name: String
    let label: String
    var body: some View {
        if reduceMotion || Bundle.main.url(forResource: name, withExtension: "riv") == nil {
            Image(systemName: "sparkles").accessibilityLabel(label)
        } else {
            RivePlayback(name: name).accessibilityLabel(label)
        }
    }
}
private struct RivePlayback: View {
    @State private var model: RiveViewModel
    init(name: String) { _model = State(initialValue: RiveViewModel(fileName: name)) }
    var body: some View { model.view().onAppear { model.play() }.onDisappear { model.pause() } }
}
