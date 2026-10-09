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
        .fontDesign(AppTheme.fontDesign)
    }

    private var dashboard: some View {
        let stats = OrderStats(orders: orders)
        return ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Space.large) {
                HeroHeader(title: "Your table, lately", subtitle: "A little history of good meals.", symbol: "chart.bar.xaxis")
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: AppTheme.Space.medium) {
                    AppStatTile(title: "Orders", value: "\(stats.count)", symbol: "bag")
                    AppStatTile(title: "Total spent", value: Money.format(cents: stats.totalCents), symbol: "creditcard")
                }
                AppStatTile(title: "Average order", value: Money.format(cents: stats.averageCents), symbol: "chart.bar")
                AppCard {
                    VStack(alignment: .leading, spacing: AppTheme.Space.medium) {
                        AppSectionHeader(title: "Spending over time")
                        TrendChart(points: stats.trend, valueLabel: "Dollars")
                    }
                }
                AppCard {
                    VStack(alignment: .leading, spacing: AppTheme.Space.medium) {
                        AppSectionHeader(title: "Top restaurants")
                        CategoryBarChart(points: stats.byRestaurant, valueLabel: "Dollars")
                    }
                }
                AppCard {
                    VStack(alignment: .leading, spacing: AppTheme.Space.medium) {
                        AppSectionHeader(title: "Recent meals")
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
            }
            .padding(AppTheme.screenInset)
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
