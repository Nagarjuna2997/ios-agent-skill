import Foundation

/// Aggregates for the dashboard, computed from persisted orders.
struct OrderStats {
    let count: Int
    let totalCents: Int
    let trend: [ChartPoint]
    let byRestaurant: [ChartPoint]

    var averageCents: Int { count == 0 ? 0 : totalCents / count }

    init(orders: [Order], calendar: Calendar = .current) {
        let byDay = Dictionary(grouping: orders) { calendar.startOfDay(for: $0.placedAt) }
        let trendPoints = byDay.keys.sorted().map { day in
            let cents = byDay[day, default: []].reduce(0) { $0 + $1.totalCents }
            return ChartPoint(label: day.formatted(.dateTime.month().day()), date: day, value: Double(cents) / 100)
        }
        let byName = Dictionary(grouping: orders, by: \.restaurantName)
        let restaurantPoints = byName
            .map { entry in
                ChartPoint(label: entry.key, value: Double(entry.value.reduce(0) { $0 + $1.totalCents }) / 100)
            }
            .sorted { $0.value > $1.value }
        count = orders.count
        totalCents = orders.reduce(0) { $0 + $1.totalCents }
        trend = trendPoints
        byRestaurant = Array(restaurantPoints.prefix(5))
    }
}
