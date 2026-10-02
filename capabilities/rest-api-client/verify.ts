import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    var body: some View {\n        if APIConfiguration.makeClient() == nil {\n            APINotConfiguredView()\n        }\n    }\n}\n",
  }),
);
