import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var store = StoreModel(productIDs: StoreProducts.all, service: StoreKitPurchaseService())\n    var body: some View {\n        PaywallView(model: store, features: [\"A\"])\n            .task { await store.load() }\n            .task { await store.listenForTransactions() }\n    }\n}\n",
  }),
);
