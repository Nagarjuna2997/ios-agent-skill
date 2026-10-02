# Swift Charts dashboard

Reusable pieces for a dashboard screen: `StatTile`, `TrendChart` (a line and area over dates) and `CategoryBarChart` (bars per category) inside `DashboardCard`.

## Use

```swift
ScrollView {
    VStack(spacing: 16) {
        HStack {
            StatTile(title: "Orders", value: "\(model.orderCount)", systemImage: "bag")
            StatTile(title: "Spent", value: model.total.formatted(.currency(code: "USD")), systemImage: "creditcard")
        }
        DashboardCard(title: "Spending") {
            TrendChart(points: model.spendingByDay, valueLabel: "Amount")
        }
        DashboardCard(title: "By restaurant") {
            CategoryBarChart(points: model.spendingByRestaurant, valueLabel: "Amount")
        }
    }
    .padding()
}
```

## Rules

From [Swift Charts](../../docs/frameworks/swift-charts.md):

- Compute series in the view model, not in `body`.
- Give every chart a text summary for VoiceOver; the template derives one from the data.
- Show an explicit empty state instead of an empty axis.
