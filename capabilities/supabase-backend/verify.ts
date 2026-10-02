import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyRow: Codable, Sendable { let id: Int }\n\nstruct VerifyUsage: View {\n    var body: some View {\n        if let client = SupabaseConfiguration.makeClient() {\n            Text(\"\\(SupabaseTable<VerifyRow>(client: client, name: \"rows\").name)\")\n        } else {\n            SupabaseNotConfiguredView()\n        }\n    }\n}\n",
  }),
);
