import SwiftData
import SwiftUI

struct CartView: View {
    let dependencies: AppDependencies
    let tracking: OrderTrackingModel
    let onOrderPlaced: () -> Void

    @Query(sort: \CartItem.name) private var items: [CartItem]
    @State private var path: [CartRoute] = []

    enum CartRoute: Hashable {
        case checkout
    }

    private var subtotal: Int {
        items.reduce(0) { $0 + $1.priceCents * $1.quantity }
    }

    var body: some View {
        NavigationStack(path: $path) {
            Group {
                if items.isEmpty {
                    AppEmptyStateView(title: "Your cart is empty", message: "Choose a fresh favorite to get started.", symbol: "basket")
                } else {
                    List {
                        ForEach(items) { item in
                            AppCard { row(item) }
                                .listRowSeparator(.hidden)
                                .listRowBackground(Color.clear)
                        }
                        .onDelete { offsets in
                            for index in offsets {
                                dependencies.store.remove(items[index])
                            }
                        }
                    }
                    .safeAreaInset(edge: .bottom) {
                        VStack(spacing: 8) {
                            HStack {
                                Text("Subtotal").font(.headline)
                                Spacer()
                                Text(Money.format(cents: subtotal)).font(.headline).monospacedDigit()
                            }
                            Button {
                                path.append(.checkout)
                            } label: {
                                Text("Checkout").frame(maxWidth: .infinity)
                            }
                            .buttonStyle(AppPrimaryButtonStyle())
                            .controlSize(.large)
                        }
                        .padding()
                        .background(.bar)
                    }
                }
            }
            .navigationTitle("Cart")
            .navigationDestination(for: CartRoute.self) { _ in
                CheckoutView(
                    model: CheckoutViewModel(
                        lines: items.map(\.line),
                        restaurants: dependencies.restaurants,
                        payment: dependencies.payment,
                        store: dependencies.store,
                        tracking: tracking
                    )
                ) {
                    path = []
                    onOrderPlaced()
                }
            }
        }
        .fontDesign(AppTheme.fontDesign)
    }

    private func row(_ item: CartItem) -> some View {
        HStack(spacing: AppTheme.Space.medium) {
            AppIconTile(symbol: "takeoutbag.and.cup.and.straw", accessibilityLabel: "Food item")
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name).font(.headline)
                Text(Money.format(cents: item.priceCents * item.quantity))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Button {
                dependencies.store.setQuantity(item, to: item.quantity - 1)
            } label: {
                Image(systemName: "minus.circle").font(.title2)
            }
            .buttonStyle(.borderless)
            .minimumTapTarget()
            .accessibilityLabel("Decrease quantity of \(item.name)")
            Text("\(item.quantity)")
                .font(.headline)
                .monospacedDigit()
                .accessibilityLabel("Quantity \(item.quantity)")
            Button {
                dependencies.store.setQuantity(item, to: item.quantity + 1)
            } label: {
                Image(systemName: "plus.circle").font(.title2)
            }
            .buttonStyle(.borderless)
            .minimumTapTarget()
            .accessibilityLabel("Increase quantity of \(item.name)")
        }
    }
}

#Preview("With items") {
    let deps = AppDependencies.preview(seeded: true)
    return CartView(dependencies: deps, tracking: deps.makeTrackingModel()) {}
        .modelContainer(deps.container)
}

#Preview("Empty") {
    let deps = AppDependencies.preview()
    return CartView(dependencies: deps, tracking: deps.makeTrackingModel()) {}
        .modelContainer(deps.container)
}
