// Emitted only for a source row that explicitly opts into wrapping.
export const wrappingRowSwift = `
private struct ImportedWrappingRow: Layout {
    let gap: CGFloat

    private struct Line {
        var items: [(index: Int, size: CGSize)] = []
        var width: CGFloat = 0
        var height: CGFloat = 0
    }

    private func lines(for availableWidth: CGFloat?, subviews: Subviews) -> [Line] {
        let width = availableWidth ?? .infinity
        var result: [Line] = []
        var line = Line()
        for (index, view) in subviews.enumerated() {
            var size = view.sizeThatFits(.unspecified)
            if size.width > width {
                size = view.sizeThatFits(ProposedViewSize(width: width, height: nil))
            }
            if !line.items.isEmpty && line.width + gap + size.width > width {
                result.append(line)
                line = Line()
            }
            if !line.items.isEmpty { line.width += gap }
            line.items.append((index, size))
            line.width += size.width
            line.height = max(line.height, size.height)
        }
        if !line.items.isEmpty { result.append(line) }
        return result
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = lines(for: proposal.width, subviews: subviews)
        let contentWidth = rows.map(\\.width).max() ?? 0
        let height = rows.reduce(0) { $0 + $1.height } + CGFloat(max(0, rows.count - 1)) * gap
        return CGSize(width: proposal.width.flatMap { $0.isFinite ? $0 : nil } ?? contentWidth, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var top = bounds.minY
        for row in lines(for: bounds.width, subviews: subviews) {
            var left = bounds.minX
            for item in row.items {
                let point = CGPoint(x: left, y: top + (row.height - item.size.height) / 2)
                subviews[item.index].place(at: point, anchor: .topLeading, proposal: ProposedViewSize(item.size))
                left += item.size.width + gap
            }
            top += row.height + gap
        }
    }
}
`;
