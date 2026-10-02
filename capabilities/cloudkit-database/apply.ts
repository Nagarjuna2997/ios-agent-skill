import { defineApply } from "../_sdk/index.js";

// The iCloud container is named after the bundle identifier. It must be created
// for the team (Xcode does this when signing in with a paid account).
export default defineApply((ctx) => {
  ctx.addEntitlement("com.apple.developer.icloud-container-identifiers", [`iCloud.${ctx.bundleId}`]);
  ctx.addEntitlement("com.apple.developer.icloud-services", ["CloudKit"]);
  ctx.note(`Uses the iCloud container iCloud.${ctx.bundleId}; create it in the developer account before running on a device signed into iCloud.`);
});
