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
