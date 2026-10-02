import StoreKit
import SwiftUI

enum StoreProducts {
    static let monthly = "__BUNDLE_ID__.premium.monthly"
    static let yearly = "__BUNDLE_ID__.premium.yearly"
    static let all = [monthly, yearly]
}

enum PurchaseOutcome: Equatable, Sendable {
    case purchased(String)
    case pending
    case cancelled
}

enum StoreError: LocalizedError {
    case failedVerification

    var errorDescription: String? { "The App Store could not verify this purchase." }
}

protocol PurchaseService: Sendable {
    func products(for ids: [String]) async throws -> [Product]
    func purchase(_ product: Product) async throws -> PurchaseOutcome
    func entitledProductIDs() async -> Set<String>
    func sync() async throws
}

struct StoreKitPurchaseService: PurchaseService {
    func products(for ids: [String]) async throws -> [Product] {
        try await Product.products(for: ids)
    }

    func purchase(_ product: Product) async throws -> PurchaseOutcome {
        switch try await product.purchase() {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            return .purchased(transaction.productID)
        case .pending:
            return .pending
        case .userCancelled:
            return .cancelled
        @unknown default:
            return .cancelled
        }
    }

    func entitledProductIDs() async -> Set<String> {
        var ids = Set<String>()
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result, transaction.revocationDate == nil {
                ids.insert(transaction.productID)
            }
        }
        return ids
    }

    func sync() async throws {
        try await AppStore.sync()
    }
}

func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
    switch result {
    case .verified(let value): value
    case .unverified: throw StoreError.failedVerification
    }
}

@MainActor
@Observable
final class StoreModel {
    enum State: Equatable {
        case idle
        case loading
        case purchasing
        case pending
        case failed(String)
    }

    private(set) var products: [Product] = []
    private(set) var entitled: Set<String> = []
    private(set) var state: State = .idle
    let productIDs: [String]
    private let service: any PurchaseService

    init(productIDs: [String], service: any PurchaseService) {
        self.productIDs = productIDs
        self.service = service
    }

    var isPremium: Bool { !entitled.isEmpty }

    func load() async {
        state = .loading
        do {
            products = try await service.products(for: productIDs).sorted { $0.price < $1.price }
            entitled = await service.entitledProductIDs()
            state = .idle
        } catch {
            state = .failed("Products could not be loaded: \(error.localizedDescription)")
        }
    }

    func buy(_ product: Product) async {
        state = .purchasing
        do {
            switch try await service.purchase(product) {
            case .purchased:
                entitled = await service.entitledProductIDs()
                state = .idle
            case .pending:
                state = .pending
            case .cancelled:
                state = .idle
            }
        } catch {
            state = .failed(error.localizedDescription)
        }
    }

    func restore() async {
        state = .loading
        do {
            try await service.sync()
            entitled = await service.entitledProductIDs()
            state = .idle
        } catch {
            state = .failed("Restore failed: \(error.localizedDescription)")
        }
    }

    /// Keeps entitlements current for renewals, refunds and purchases on other devices.
    func listenForTransactions() async {
        for await result in Transaction.updates {
            if case .verified(let transaction) = result {
                await transaction.finish()
            }
            entitled = await service.entitledProductIDs()
        }
    }
}

struct PaywallView: View {
    let model: StoreModel
    let features: [String]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(features, id: \.self) { feature in
                        Label(feature, systemImage: "checkmark.circle.fill")
                    }
                }
                Section {
                    if model.products.isEmpty, model.state != .loading {
                        ContentUnavailableView("No plans available", systemImage: "cart", description: Text("Check the StoreKit configuration or your connection."))
                    }
                    ForEach(model.products, id: \.id) { product in
                        Button {
                            Task { await model.buy(product) }
                        } label: {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(product.displayName).font(.headline)
                                    Text(product.description).font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(product.displayPrice).bold()
                            }
                        }
                        .disabled(model.state == .purchasing || model.entitled.contains(product.id))
                    }
                }
                Section {
                    Button("Restore Purchases") { Task { await model.restore() } }
                    switch model.state {
                    case .loading, .purchasing: ProgressView()
                    case .pending: Text("Purchase pending approval.")
                    case .failed(let message): Text(message).foregroundStyle(.red)
                    case .idle: EmptyView()
                    }
                    if model.isPremium {
                        Label("Premium is active", systemImage: "star.fill")
                    }
                }
            }
            .navigationTitle("Go Premium")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}

private struct PreviewPurchaseService: PurchaseService {
    func products(for ids: [String]) async throws -> [Product] { [] }
    func purchase(_ product: Product) async throws -> PurchaseOutcome { .cancelled }
    func entitledProductIDs() async -> Set<String> { [] }
    func sync() async throws {}
}

#Preview {
    PaywallView(model: StoreModel(productIDs: StoreProducts.all, service: PreviewPurchaseService()), features: ["Feature one", "Feature two"])
}
