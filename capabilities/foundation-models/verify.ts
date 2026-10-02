import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var text = \"\"\n    var body: some View {\n        Text(OnDeviceAI.isAvailable ? text : \"Unavailable\")\n            .task { text = (try? await OnDeviceAI.respond(to: \"Hi\", instructions: \"Reply briefly.\")) ?? \"\" }\n    }\n}\n",
  }),
);
