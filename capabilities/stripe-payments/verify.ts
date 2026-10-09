import { defineVerify } from "../_sdk/index.js";
export default defineVerify(ctx => ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import UIKit\n@MainActor func checkStripeAPI(_ checkout: StripeCheckout, controller: UIViewController) { checkout.present(from: controller) { _ in } }"
  }));
