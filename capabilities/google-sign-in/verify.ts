import { defineVerify } from "../_sdk/index.js";
export default defineVerify(ctx => ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import UIKit\n@MainActor func checkGoogleAPI(_ session: GoogleSession, controller: UIViewController) async throws { _ = try await session.signIn(presenting: controller) }"
  }));
