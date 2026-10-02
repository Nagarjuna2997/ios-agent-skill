import SwiftData
import SwiftUI

struct DashboardView: View {
    @Query(sort: \Order.placedAt, order: .reverse) private var orders: [Order]

    var body: some View {
        NavigationStack {
            Group {
                if orders.isEmpty {
                    ContentUnavailableView("No past orders", systemImage: "chart.bar", description: Text("Your spending stats and order history will appear here."))
                } else {
                    dashboard
                }
            }
            .navigationTitle("Past Orders")
        }
    }

    private var dashboard: some View {
        let stats = OrderStats(orders: orders)
        return ScrollView {
            VStack(spacing: 16) {
                HStack(spacing: 12) {
                    StatTile(title: "Orders", value: "\(stats.count)", systemImage: "bag")
                    StatTile(title: "Spent", value: Money.format(cents: stats.totalCents), systemImage: "creditcard")
                }
                StatTile(title: "Average order", value: Money.format(cents: stats.averageCents), systemImage: "chart.bar")
                DashboardCard(title: "Spending over time") {
                    TrendChart(points: stats.trend, valueLabel: "Dollars")
                }
                DashboardCard(title: "Top restaurants") {
                    CategoryBarChart(points: stats.byRestaurant, valueLabel: "Dollars")
                }
                DashboardCard(title: "History") {
                    ForEach(orders) { order in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(order.restaurantName).font(.headline)
                                Spacer()
                                Text(Money.format(cents: order.totalCents)).font(.headline).monospacedDigit()
                            }
                            Text(order.itemSummary).font(.subheadline).foregroundStyle(.secondary)
                            HStack {
                                Text(order.placedAt, format: .dateTime.month().day().hour().minute())
                                Spacer()
                                Text(order.status)
                                    .foregroundStyle(order.status == OrderStage.delivered.rawValue ? Color.green : Color.orange)
                            }
                            .font(.caption)
                            Divider()
                        }
                        .accessibilityElement(children: .combine)
                    }
                }
            }
            .padding()
        }
    }
}

#Preview("With orders") {
    let deps = AppDependencies.preview(seeded: true)
    return DashboardView()
        .modelContainer(deps.container)
}

#Preview("Empty") {
    let deps = AppDependencies.preview()
    return DashboardView()
        .modelContainer(deps.container)
}
