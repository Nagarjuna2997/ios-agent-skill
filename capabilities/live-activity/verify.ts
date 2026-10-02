import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var controller = LiveActivityController()\n    var body: some View {\n        Button(\"Start\") {\n            try? controller.start(title: \"Order\", subtitle: \"Kitchen\", steps: [\"Placed\", \"Done\"])\n        }\n    }\n}\n",
  }),
);
