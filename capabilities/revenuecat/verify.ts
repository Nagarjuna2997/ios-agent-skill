import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    var body: some View {\n        Text(RevenueCatStore.shared.isEntitled(\"premium\") ? \"Premium\" : \"Free\")\n            .task { RevenueCatStore.shared.configure(); await RevenueCatStore.shared.refresh() }\n    }\n}\n",
  }),
);
