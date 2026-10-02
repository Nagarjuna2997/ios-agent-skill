import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var image: UIImage?\n    var body: some View {\n        CameraCaptureButton(image: $image)\n    }\n}\n",
  }),
);
