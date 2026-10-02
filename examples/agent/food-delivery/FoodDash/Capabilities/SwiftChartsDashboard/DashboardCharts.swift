import Charts
import SwiftUI

/// One value for a chart: a date for trends or a label for categories.
struct ChartPoint: Identifiable, Hashable, Sendable {
    let id: String
    let label: String
    let date: Date
    let value: Double

    init(label: String, date: Date = .now, value: Double) {
        self.id = "\(label)-\(date.timeIntervalSince1970)"
        self.label = label
        self.date = date
        self.value = value
    }
}

struct DashboardCard<Content: View>: View {
    let title: LocalizedStringKey
    @ViewBuilder var content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            content()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background.secondary, in: .rect(cornerRadius: 16))
    }
}

struct StatTile: View {
    let title: LocalizedStringKey
    let value: String
    let systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: systemImage)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title2.bold())
                .monospacedDigit()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.background.secondary, in: .rect(cornerRadius: 16))
        .accessibilityElement(children: .combine)
    }
}

/// Values over time: a line with a soft area underneath.
struct TrendChart: View {
    let points: [ChartPoint]
    var valueLabel: String = "Value"

    var body: some View {
        if points.isEmpty {
            ContentUnavailableView("No data yet", systemImage: "chart.line.uptrend.xyaxis")
        } else {
            Chart(points) { point in
                AreaMark(x: .value("Date", point.date), y: .value(valueLabel, point.value))
                    .foregroundStyle(.tint.opacity(0.15))
                LineMark(x: .value("Date", point.date), y: .value(valueLabel, point.value))
                    .interpolationMethod(.catmullRom)
            }
            .frame(minHeight: 180)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(summary))
        }
    }

    private var summary: String {
        let values = points.map(\.value)
        guard let first = values.first, let last = values.last, let low = values.min(), let high = values.max() else { return "No data" }
        return "\(valueLabel) from \(first.formatted()) to \(last.formatted()); lowest \(low.formatted()), highest \(high.formatted())."
    }
}

/// One bar per label.
struct CategoryBarChart: View {
    let points: [ChartPoint]
    var valueLabel: String = "Value"

    var body: some View {
        if points.isEmpty {
            ContentUnavailableView("No data yet", systemImage: "chart.bar")
        } else {
            Chart(points) { point in
                BarMark(x: .value("Category", point.label), y: .value(valueLabel, point.value))
                    .annotation(position: .top) {
                        Text(point.value.formatted())
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
            }
            .frame(minHeight: 180)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Text(points.map { "\($0.label) \($0.value.formatted())" }.joined(separator: ", ")))
        }
    }
}

#Preview {
    let days = (0..<7).map { offset in
        ChartPoint(label: "Day \(offset + 1)", date: Calendar.current.date(byAdding: .day, value: -6 + offset, to: .now) ?? .now, value: Double(10 + offset * 3))
    }
    return ScrollView {
        VStack(spacing: 16) {
            HStack {
                StatTile(title: "Orders", value: "12", systemImage: "bag")
                StatTile(title: "Average", value: "18", systemImage: "chart.bar")
            }
            DashboardCard(title: "Trend") { TrendChart(points: days) }
            DashboardCard(title: "By category") {
                CategoryBarChart(points: [ChartPoint(label: "A", value: 4), ChartPoint(label: "B", value: 7)])
            }
        }
        .padding()
    }
}
