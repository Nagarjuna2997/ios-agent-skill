import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    let count = 2\n    var body: some View {\n        VStack {\n            Text(\"Welcome\")\n            Text(\"\\(count) items\")\n        }\n    }\n}\n",
  }),
);
