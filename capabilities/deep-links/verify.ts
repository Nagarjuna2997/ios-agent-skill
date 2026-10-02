import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var router = DeepLinkRouter()\n    var body: some View {\n        Text(DeepLink.item(screen: \"orders\", id: \"1\").url?.absoluteString ?? \"\")\n            .onOpenURL { router.open($0) }\n    }\n}\n",
  }),
);
