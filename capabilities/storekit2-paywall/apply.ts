import { defineApply } from "../_sdk/index.js";

// The StoreKit configuration lets purchases run locally in the simulator from
// Xcode. It is referenced by the Run scheme and kept out of the app bundle.
export default defineApply((ctx) => {
  const config = "Capabilities/Storekit2Paywall/Products.storekit";
  ctx.excludeFromBuild(config);
  ctx.setStoreKitConfiguration(config);
  ctx.note("Product ids are placeholders (<bundle id>.premium.monthly and .yearly) with placeholder prices; create matching products in App Store Connect before release.");
});
