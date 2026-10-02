import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    let location: any LocationProviding = PreviewLocationProvider()\n    var body: some View {\n        Button(\"Locate\") {\n            Task { _ = try? await location.currentLocation() }\n        }\n    }\n}\n",
  }),
);
