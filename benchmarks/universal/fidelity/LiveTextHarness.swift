// Test-only host for in-place environment and source updates, never a generated-app feature.
private struct FidelityLiveTextContent: View {
    let content: String
    @ScaledMetric(relativeTo: .body) private var size: CGFloat = 36
    var body: some View {
        FidelityNativeText(nodeID: "live-heading", content: content, size: size, bold: true, color: .label, centered: false)
            .frame(width: 300)
    }
}
struct FidelityLiveTextHarness: View {
    @State private var large = false
    @State private var changed = false
    var body: some View {
        VStack {
            FidelityLiveTextContent(content: changed ? "Updated source content remains editable and native." : "A native heading")
                .dynamicTypeSize(large ? .xxxLarge : .large)
            Button("Increase type") { large = true }
            Button("Restore type") { large = false }
            Button("Change content") { changed = true }
        }
    }
}
