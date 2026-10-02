import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import AuthenticationServices\nimport SwiftUI\n\nstruct VerifyUsage: View {\n    @Environment(\\.authorizationController) private var authorizationController\n    var body: some View {\n        Button(\"Sign in\") {\n            Task { _ = try? await PasskeyService.fromBundle()?.signIn(challenge: Data(), using: authorizationController) }\n        }\n    }\n}\n",
  }),
);
