import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var on = false\n    private let spacing = ScaledSpacing()\n    var body: some View {\n        VStack(spacing: spacing.standard) {\n            Button(\"Toggle\") { on.toggle() }\n                .minimumTapTarget()\n                .motionAwareAnimation(.default, value: on)\n        }\n    }\n}\n",
  }),
);
