import SwiftUI

struct OrderStatusView: View {
    let model: OrderTrackingModel

    var body: some View {
        NavigationStack {
            Group {
                if let active = model.active {
                    List {
                        Section {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(active.restaurantName).font(.headline)
                                Text(active.itemSummary).font(.subheadline).foregroundStyle(.secondary)
                                Label(active.address.isEmpty ? "No address" : active.address, systemImage: "mappin.and.ellipse")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                            if let eta = model.eta {
                                HStack {
                                    Label("Estimated arrival", systemImage: "clock")
                                    Spacer()
                                    Text(eta, style: .time).monospacedDigit()
                                }
                                .accessibilityElement(children: .combine)
                            }
                        }
                        Section("Progress") {
                            ProgressView(value: Double(model.stage.index), total: Double(OrderStage.allCases.count - 1))
                                .accessibilityLabel("Order progress")
                                .accessibilityValue(model.stage.rawValue)
                            ForEach(OrderStage.allCases) { stage in
                                stageRow(stage)
                            }
                        }
                        if let message = model.message {
                            Section {
                                Label(message, systemImage: "info.circle")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        if model.stage == .delivered {
                            Section {
                                Button("Done") { model.dismiss() }
                            }
                        }
                    }
                } else {
                    ContentUnavailableView("No active order", systemImage: "bag", description: Text("Place an order and follow its progress here."))
                }
            }
            .navigationTitle("Order Status")
        }
        .fontDesign(AppTheme.fontDesign)
    }

    private func stageRow(_ stage: OrderStage) -> some View {
        let reached = stage.index <= model.stage.index
        let isCurrent = stage == model.stage
        return HStack(spacing: 12) {
            Image(systemName: reached ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(reached ? AppColor.primary : Color.secondary)
            Label(stage.rawValue, systemImage: stage.systemImage)
                .font(isCurrent ? .headline : .body)
                .foregroundStyle(reached ? Color.primary : Color.secondary)
            Spacer()
        }
        .accessibilityElement(children: .combine)
        .accessibilityValue(isCurrent ? "Current step" : (reached ? "Done" : "Upcoming"))
    }
}

#Preview("Active") {
    let deps = AppDependencies.preview()
    let model = deps.makeTrackingModel()
    model.begin(order: Order(restaurantName: "Sakura Sushi", totalCents: 2897, itemSummary: "2× Salmon Nigiri"), address: "1 Infinite Loop, Cupertino")
    return OrderStatusView(model: model)
        .modelContainer(deps.container)
}

#Preview("Empty") {
    let deps = AppDependencies.preview()
    return OrderStatusView(model: deps.makeTrackingModel())
}
