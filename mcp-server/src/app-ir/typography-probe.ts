// Opt-in benchmark probe, excluded from ordinary generated projects.
export const typographyProbeSwift = String.raw`// Benchmark-only instrumentation. No OCR or opaque character-index/string mapping.

@available(iOS 18.0, *)
private struct WordIdentity: TextAttribute { let index: Int }

@available(iOS 18.0, *)
private struct WordLayoutRenderer: TextRenderer {
    let report: @MainActor @Sendable (String) -> Void
    func draw(layout: Text.Layout, in context: inout GraphicsContext) {
        var rows: [[Int]] = []
        for line in layout {
            var words: [Int] = []
            for run in line {
                if let word = run[WordIdentity.self], !words.contains(word.index) { words.append(word.index) }
            }
            if !words.isEmpty { rows.append(words) }
            context.draw(line)
        }
        // Labels remain the actual text. Measurement is exposed only with the test launch flag.
        if let data = try? JSONSerialization.data(withJSONObject: ["lines": rows, "truncated": layout.isTruncated]), let value = String(data: data, encoding: .utf8) {
            Task { @MainActor in report(value) }
        }
    }
}

struct MeasuredText: View {
    let nodeID: String
    let content: String
    @State private var measurement = ""
    var body: some View {
        if #available(iOS 18.0, *), ProcessInfo.processInfo.arguments.contains("-ios-agent-typography") {
            attributedText
                .textRenderer(WordLayoutRenderer { value in if measurement != value { measurement = value } })
                .accessibilityLabel(content)
                .accessibilityValue(measurement)
                .accessibilityIdentifier(nodeID)
        } else {
            Text(verbatim: content).accessibilityIdentifier(nodeID)
        }
    }
    @available(iOS 18.0, *)
    private var attributedText: Text {
        // The supported importer normalizes whitespace. Whitespace has no word attribute,
        // so a trailing space cannot masquerade as a repeated word on the next line.
        let words = content.components(separatedBy: " ")
        return words.enumerated().reduce(Text(verbatim: "")) { result, entry in
            let separator = entry.offset == 0 ? Text(verbatim: "") : Text(verbatim: " ")
            return result + separator + Text(verbatim: entry.element).customAttribute(WordIdentity(index: entry.offset))
        }
    }
}
`;
