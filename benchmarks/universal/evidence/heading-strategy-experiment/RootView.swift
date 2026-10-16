import SwiftUI
import UIKit

struct RootView: View {
    @State private var expanded_node_node_12 = false;
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_4: CGFloat = 14
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_5: CGFloat = 36
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_6: CGFloat = 18
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_8: CGFloat = 14
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_9: CGFloat = 28
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_10: CGFloat = 18
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_11: CGFloat = 16
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_14: CGFloat = 14
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_1: CGFloat = 17
    var body: some View {
        ScrollView { node_node_1 }
        .background(Color(red: 0.9568627450980393, green: 0.9450980392156862, blue: 0.9215686274509803).ignoresSafeArea())
    }

    private var node_node_4: some View {
        MeasuredText(nodeID: "node-4", content: "FIELD NOTES · WEEKEND EDITION")
        .font(.system(size: scaled_node_node_4, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-4")
    }

    private var node_node_5: some View {
        Group {
            if ProcessInfo.processInfo.arguments.contains("-native-greedy") {
                NativeHeading(content: "A little closer to nature.", size: scaled_node_node_5, color: UIColor(red: 0.1411764705882353, green: 0.23921568627450981, blue: 0.20784313725490197, alpha: 1))
            } else if ProcessInfo.processInfo.arguments.contains("-proposal") {
                ProposalObserver {
                    MeasuredText(nodeID: "node-5", content: "A little closer to nature.")
                        .font(.system(size: scaled_node_node_5, weight: .bold))
                }
            } else {
                MeasuredText(nodeID: "node-5", content: "A little closer to nature." + (ProcessInfo.processInfo.arguments.contains("-trailing-space") ? " " : ""))
                    .font(.system(size: scaled_node_node_5, weight: .bold))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_6: some View {
        MeasuredText(nodeID: "node-6", content: "Three quiet trails, one good weekend. Your next walk starts here.")
        .font(.system(size: scaled_node_node_6, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-6")
    }

    private var node_node_3: some View {
        VStack(alignment: .leading, spacing: 8) {
            node_node_4
            node_node_5
            node_node_6
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_node_8: some View {
        MeasuredText(nodeID: "node-8", content: "THIS WEEK'S WALK")
        .font(.system(size: scaled_node_node_8, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-8")
    }

    private var node_node_9: some View {
        MeasuredText(nodeID: "node-9", content: "Cedar Loop")
        .font(.system(size: scaled_node_node_9, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-9")
    }

    private var node_node_10: some View {
        MeasuredText(nodeID: "node-10", content: "4.2 miles · Easy · 90 minutes")
        .font(.system(size: scaled_node_node_10, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-10")
    }

    private var node_node_11: some View {
        MeasuredText(nodeID: "node-11", content: "A shaded path through tall cedars, with a quiet river stop halfway.")
        .font(.system(size: scaled_node_node_11, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-11")
    }

    private var node_node_7: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_8
            node_node_9
            node_node_10
            node_node_11
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.8666666666666667, green: 0.9098039215686274, blue: 0.8392156862745098))
        .clipShape(RoundedRectangle(cornerRadius: 24))
    }

    private var node_node_13: some View {
        MeasuredText(nodeID: "node-13", content: "Bring water, comfortable shoes, and a light jacket.")
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-13")
    }

    private var node_node_12: some View {
        DisclosureGroup(isExpanded: $expanded_node_node_12) {
            node_node_13
        } label: { MeasuredText(nodeID: "node-12", content: "Before you go") }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 1, green: 1, blue: 1))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .accessibilityIdentifier("node-12")
    }

    private var node_node_14: some View {
        MeasuredText(nodeID: "node-14", content: "Synthetic demo content. No account or location permission needed.")
        .font(.system(size: scaled_node_node_14, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-14")
    }

    private var node_node_2: some View {
        VStack(alignment: .leading, spacing: 24) {
            node_node_3
            node_node_7
            node_node_12
            node_node_14
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_node_1: some View {
        VStack(alignment: .leading, spacing: 24) {
            node_node_2
        }
        .font(.system(size: scaled_node_node_1, weight: .regular))
        .foregroundStyle(Color(red: 0.1411764705882353, green: 0.23921568627450981, blue: 0.20784313725490197))
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9568627450980393, green: 0.9450980392156862, blue: 0.9215686274509803))
    }
}


// Benchmark-only instrumentation. No OCR or opaque character-index/string mapping.

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
                        if measurement != value { measurement = value }
                    }
                }
                .accessibilityLabel(content)
                .accessibilityValue(measurement)
                .accessibilityIdentifier(nodeID)
        } else if #available(iOS 18.0, *), ProcessInfo.processInfo.arguments.contains("-attributes-only") {
            attributedText.accessibilityIdentifier(nodeID)
        } else if #available(iOS 18.0, *), ProcessInfo.processInfo.arguments.contains("-renderer-only") {
            Text(verbatim: content).textRenderer(WordLayoutRenderer { _ in }).accessibilityIdentifier(nodeID)
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

private func diagnostic(_ name: String, _ value: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) else { return }
    let path = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(name + ".json")
    try? data.write(to: path, options: .atomic)
}
struct ProposalObserver: Layout {
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let size = subviews[0].sizeThatFits(proposal)
        diagnostic("proposal", ["proposedWidth": proposal.width ?? -1, "proposedHeight": proposal.height ?? -1, "returnedWidth": size.width, "returnedHeight": size.height])
        return size
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        subviews[0].place(at: bounds.origin, proposal: proposal)
    }
}
final class ObservedTextView: UITextView {
    override func layoutSubviews() {
        super.layoutSubviews()
        guard ProcessInfo.processInfo.arguments.contains("-native-measure") else { return }
        layoutManager.ensureLayout(for: textContainer)
        var rows: [[String: Any]] = []
        layoutManager.enumerateLineFragments(forGlyphRange: NSRange(location: 0, length: layoutManager.numberOfGlyphs)) { rect, used, _, glyphs, _ in
            let chars = self.layoutManager.characterRange(forGlyphRange: glyphs, actualGlyphRange: nil)
            rows.append(["text": (self.text as NSString).substring(with: chars), "availableWidth": rect.width, "usedWidth": used.width, "y": used.minY])
        }
        diagnostic("native-greedy", ["lines": rows, "width": bounds.width, "fontName": font?.fontName ?? "unknown", "fontSize": font?.pointSize ?? -1])
    }
}
struct NativeHeading: UIViewRepresentable {
    let content: String
    let size: CGFloat
    let color: UIColor
    func makeUIView(context: Context) -> ObservedTextView {
        let view = ObservedTextView(usingTextLayoutManager: false)
        view.isScrollEnabled = false; view.isEditable = false; view.isSelectable = false
        view.backgroundColor = .clear; view.textContainerInset = .zero
        view.textContainer.lineFragmentPadding = 0
        view.isAccessibilityElement = true; view.accessibilityTraits = .staticText
        view.accessibilityIdentifier = "node-5"
        return view
    }
    func updateUIView(_ view: ObservedTextView, context: Context) {
        let paragraph = NSMutableParagraphStyle(); paragraph.lineBreakStrategy = []
        view.attributedText = NSAttributedString(string: content, attributes: [.font: UIFont.systemFont(ofSize: size, weight: .bold), .foregroundColor: color, .paragraphStyle: paragraph])
        view.accessibilityLabel = content
    }
    func sizeThatFits(_ proposal: ProposedViewSize, uiView: ObservedTextView, context: Context) -> CGSize? {
        guard let width = proposal.width else { return nil }
        let fitted = uiView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude))
        return CGSize(width: width, height: fitted.height)
    }
}
