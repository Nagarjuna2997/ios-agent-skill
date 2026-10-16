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
    @State private var typeSize: DynamicTypeSize = .large
    @State private var changed = false
    var body: some View {
        VStack {
            Button("Increase type") { typeSize = .xxxLarge }
            Button("Restore type") { typeSize = .large }
            ForEach(Array([DynamicTypeSize.accessibility1, .accessibility2, .accessibility3, .accessibility4, .accessibility5].enumerated()), id: \.offset) { index, size in
                Button("Accessibility size \(index + 1)") { typeSize = size }
            }
            Button("Change content") { changed = true }
            ScrollView {
                FidelityLiveTextContent(content: changed ? "Updated source content remains editable and native." : "A native heading")
                    .dynamicTypeSize(typeSize)
            }
        }
    }
}
