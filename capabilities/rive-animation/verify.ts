import { defineVerify } from "../_sdk/index.js";
export default defineVerify(ctx => ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\nstruct VerifyUsage: View { var body: some View { BundledRiveAnimation(name: \"sample\", label: \"Decorative animation\") } }"
  }));
