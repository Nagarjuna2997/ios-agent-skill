import { defineVerify } from "../_sdk/index.js";
export default defineVerify(ctx => ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\nstruct VerifyUsage: View { var body: some View { Text(\"Configure Firebase before sign-in\") } }\nfunc checkAuthAPI(_ session: FirebaseEmailSession) async throws { try await session.signIn(email: \"sample@example.invalid\", password: \"synthetic-password\") }"
  }));
