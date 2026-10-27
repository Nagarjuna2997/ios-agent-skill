// Opt-in benchmark observer; native Text drawing remains untouched.
export const typographyProbeSwift = String.raw`// Text.LayoutKey observes native layout; no custom renderer or OCR.

@available(iOS 18.0, *)
private struct WordIdentity: TextAttribute { let index: Int }


struct MeasuredText: View {
    let nodeID: String
    let content: String
    @State private var measurement = ""
    var body: some View {
        if #available(iOS 18.0, *), ProcessInfo.processInfo.arguments.contains("-ios-agent-typography") {
            attributedText
                 .onPreferenceChange(Text.LayoutKey.self) { layouts in
                    guard layouts.count == 1 else { measurement = ""; return }
                    let layout = layouts[0].layout
                    var rows: [[Int]] = []
                    for line in layout {
                        var words: [Int] = []
                        for run in line {
                            if let word = run[WordIdentity.self], !words.contains(word.index) { words.append(word.index) }
                        }
                        if !words.isEmpty { rows.append(words) }
                    }
                    if let data = try? JSONSerialization.data(withJSONObject: ["lines": rows, "truncated": layout.isTruncated]), let value = String(data: data, encoding: .utf8) {
                        // Commit synchronously: a queued update could restore stale evidence.
                        if measurement != value { measurement = value }
                    } else { measurement = "" }
                }
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

#Preview { RootView() }
`;
