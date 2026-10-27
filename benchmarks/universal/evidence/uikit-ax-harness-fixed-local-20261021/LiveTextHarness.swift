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

    // The audit covers the controls as well as the heading. Give each label its
    // natural height and a full touch target instead of compressing a plain Button.
    private func control(_ title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, minHeight: 44)
        }
        .buttonStyle(.plain)
        .foregroundStyle(.tint)
    }

    var body: some View {
        VStack {
            VStack(spacing: 0) {
                control("Increase type") { typeSize = .xxxLarge }
                control("Restore type") { typeSize = .large }
                ForEach(Array([DynamicTypeSize.accessibility1, .accessibility2, .accessibility3, .accessibility4, .accessibility5].enumerated()), id: \.offset) { index, size in
                    control("Accessibility size \(index + 1)") { typeSize = size }
                }
                control("Change content") { changed = true }
            }
            .fixedSize(horizontal: false, vertical: true)
            ScrollView {
                FidelityLiveTextContent(content: changed ? "Updated source content remains editable and native." : "A native heading")
                    .dynamicTypeSize(typeSize)
            }
        }
    }
}
