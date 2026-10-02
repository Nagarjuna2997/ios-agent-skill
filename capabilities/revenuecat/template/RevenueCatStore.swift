import Foundation
import Observation
import RevenueCat

@MainActor
@Observable
final class RevenueCatStore {
    static let shared = RevenueCatStore()

    private(set) var packages: [Package] = []
    private(set) var activeEntitlements: Set<String> = []
    private(set) var errorMessage: String?
    private(set) var isConfigured = false

    /// Configures RevenueCat once when a real API key is present.
    func configure(bundle: Bundle = .main) {
        guard !isConfigured,
              let key = bundle.object(forInfoDictionaryKey: "REVENUECAT_API_KEY") as? String,
              key.hasPrefix("appl_") else { return }
        Purchases.configure(withAPIKey: key)
        isConfigured = true
    }

    func loadOfferings() async {
        guard isConfigured else { errorMessage = "Add REVENUECAT_API_KEY to .env and rebuild."; return }
        do {
            packages = try await Purchases.shared.offerings().current?.availablePackages ?? []
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func purchase(_ package: Package) async {
        do {
            let result = try await Purchases.shared.purchase(package: package)
            if !result.userCancelled { update(result.customerInfo) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func restore() async {
        do {
            update(try await Purchases.shared.restorePurchases())
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refresh() async {
        guard isConfigured else { return }
        do {
            update(try await Purchases.shared.customerInfo())
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func isEntitled(_ id: String) -> Bool {
        activeEntitlements.contains(id)
    }

    private func update(_ info: CustomerInfo) {
        activeEntitlements = Set(info.entitlements.active.keys)
    }
}
