import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var count = 0\n    var body: some View {\n        Button(\"Tap\") { count += 1 }\n            .appFeedback(.success, trigger: count)\n    }\n}\n",
  }),
);
