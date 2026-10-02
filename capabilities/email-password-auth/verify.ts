import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var model = EmailAuthModel(service: SupabaseEmailAuth.fromBundle(), store: InMemorySecureStore())\n    var body: some View {\n        EmailAuthForm(model: model)\n            .task { model.restore() }\n    }\n}\n",
  }),
);
