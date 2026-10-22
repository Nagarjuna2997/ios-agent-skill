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
        if ProcessInfo.processInfo.arguments.contains("-fidelity-live-text") { FidelityLiveTextHarness() } else { ScrollView { node_node_1 }
        .background(Color(red: 0.9568627450980393, green: 0.9450980392156862, blue: 0.9215686274509803).ignoresSafeArea())
        }
    }

    private var node_node_4: some View {
        MeasuredText(nodeID: "node-4", content: "FIELD NOTES · WEEKEND EDITION")
        .font(.system(size: scaled_node_node_4, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-4")
    }

    private var node_node_5: some View {
        FidelityNativeText(nodeID: "node-5", content: "A little closer to nature.", size: scaled_node_node_5, bold: true, color: UIColor(red: 0.1411764705882353, green: 0.23921568627450981, blue: 0.20784313725490197, alpha: 1), centered: false)
        .font(.system(size: scaled_node_node_5, weight: .bold))
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


// Text.LayoutKey observes native layout; no custom renderer or OCR.

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

#Preview { RootView() }

// Benchmark-only TextKit candidate; production rendering does not import this file.
final class FidelityTextView: UITextView {
    override func layoutSubviews() {
        super.layoutSubviews()
        guard ProcessInfo.processInfo.arguments.contains("-ios-agent-typography") else { accessibilityValue = nil; return }
        layoutManager.ensureLayout(for: textContainer)
        let content = text ?? ""
        let matches = (try? NSRegularExpression(pattern: "\\S+").matches(in: content, range: NSRange(location: 0, length: (content as NSString).length))) ?? []
        var rows: [[Int]] = []
        var truncated = false
        layoutManager.enumerateLineFragments(forGlyphRange: NSRange(location: 0, length: layoutManager.numberOfGlyphs)) { rect, used, _, glyphs, _ in
            let chars = self.layoutManager.characterRange(forGlyphRange: glyphs, actualGlyphRange: nil)
            let words = matches.enumerated().compactMap { NSIntersectionRange($0.element.range, chars).length > 0 ? $0.offset : nil }
            if !words.isEmpty { rows.append(words) }
            if used.maxY > self.bounds.height + 0.5 || used.width > self.bounds.width + 0.5 { truncated = true }
        }
        guard let data = try? JSONSerialization.data(withJSONObject: ["lines": rows, "truncated": truncated]), let value = String(data: data, encoding: .utf8) else { accessibilityValue = nil; return }
        accessibilityValue = value
    }
}
struct FidelityNativeText: UIViewRepresentable {
    let nodeID: String
    let content: String
    let size: CGFloat
    let bold: Bool
    let color: UIColor
    let centered: Bool
    func makeUIView(context: Context) -> FidelityTextView {
        let view = FidelityTextView(usingTextLayoutManager: false)
        view.isScrollEnabled = false; view.isEditable = false; view.isSelectable = false
        view.backgroundColor = .clear; view.textContainerInset = .zero
        view.textContainer.lineFragmentPadding = 0
        view.isAccessibilityElement = true; view.accessibilityTraits = .staticText
        return view
    }
    func updateUIView(_ view: FidelityTextView, context: Context) {
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineBreakStrategy = []; paragraph.alignment = centered ? .center : .left
        view.attributedText = NSAttributedString(string: content, attributes: [.font: UIFont.systemFont(ofSize: size, weight: bold ? .bold : .regular), .foregroundColor: color, .paragraphStyle: paragraph])
        view.accessibilityIdentifier = nodeID; view.accessibilityLabel = content
        view.accessibilityValue = nil
        view.invalidateIntrinsicContentSize(); view.setNeedsLayout()
    }
    func sizeThatFits(_ proposal: ProposedViewSize, uiView: FidelityTextView, context: Context) -> CGSize? {
        guard let width = proposal.width, width > 0 else { return nil }
        let fitted = uiView.sizeThatFits(CGSize(width: width, height: .greatestFiniteMagnitude))
        return CGSize(width: width, height: fitted.height)
    }
}

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
