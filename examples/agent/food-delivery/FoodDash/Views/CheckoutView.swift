import SwiftUI

struct CheckoutView: View {
    @State private var model: CheckoutViewModel
    let onPlaced: () -> Void
    @AppStorage("deliveryAddress") private var address = ""

    init(model: CheckoutViewModel, onPlaced: @escaping () -> Void) {
        _model = State(initialValue: model)
        self.onPlaced = onPlaced
    }

    private var isPaying: Bool { model.phase == .paying }

    var body: some View {
        Form {
            Section(model.restaurantName) {
                ForEach(model.lines) { line in
                    HStack {
                        Text("\(line.quantity)× \(line.name)")
                        Spacer()
                        Text(Money.format(cents: line.totalCents)).monospacedDigit()
                    }
                    .accessibilityElement(children: .combine)
                }
            }
            Section("Delivery address") {
                TextField("Street, city", text: $address, axis: .vertical)
                    .textContentType(.fullStreetAddress)
            }
            Section("Summary") {
                summaryRow("Subtotal", model.subtotalCents)
                summaryRow("Delivery", model.deliveryFeeCents)
                summaryRow("Total", model.totalCents).font(.headline)
            }
            Section {
                Button {
                    Task { await model.pay(address: address.trimmingCharacters(in: .whitespacesAndNewlines)) }
                } label: {
                    HStack {
                        if isPaying { ProgressView() }
                        Text("Pay \(Money.format(cents: model.totalCents))")
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(isPaying || address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || model.lines.isEmpty)
                if address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    Text("Enter a delivery address to continue.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
                if case .failed(let message) = model.phase {
                    Label(message, systemImage: "exclamationmark.triangle.fill")
                        .font(.footnote)
                        .foregroundStyle(.red)
                }
            } footer: {
                Text("Payment is processed securely by the App Store.")
            }
        }
        .navigationTitle("Checkout")
        .navigationBarTitleDisplayMode(.inline)
        .task { await model.loadRestaurantName() }
        .appFeedback(.success, trigger: model.paidCount)
        .appFeedback(.error, trigger: model.failCount)
        .onChange(of: model.phase) { _, newPhase in
            if newPhase == .completed {
                Task {
                    try? await Task.sleep(for: .milliseconds(400))
                    onPlaced()
                }
            }
        }
        .fontDesign(AppTheme.fontDesign)
    }

    private func summaryRow(_ title: LocalizedStringKey, _ cents: Int) -> some View {
        HStack {
            Text(title)
            Spacer()
            Text(Money.format(cents: cents)).monospacedDigit()
        }
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    let deps = AppDependencies.preview(seeded: true)
    let lines = deps.store.cartItems().map(\.line)
    return NavigationStack {
        CheckoutView(
            model: CheckoutViewModel(lines: lines, restaurants: deps.restaurants, payment: deps.payment, store: deps.store, tracking: deps.makeTrackingModel())
        ) {}
    }
    .modelContainer(deps.container)
}
