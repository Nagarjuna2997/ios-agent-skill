import { defineApply } from "../_sdk/index.js";

// SwiftData syncs through CloudKit with an iCloud container, push
// notifications for change delivery, and the remote-notification background mode.
export default defineApply((ctx) => {
  ctx.addEntitlement("com.apple.developer.icloud-container-identifiers", [`iCloud.${ctx.bundleId}`]);
  ctx.addEntitlement("com.apple.developer.icloud-services", ["CloudKit"]);
  ctx.addEntitlement("aps-environment", "development");
  ctx.setInfoPlist("UIBackgroundModes", ["remote-notification"]);
  ctx.note("Models synced with CloudKit need default values or optionals for every property, optional relationships, and no @Attribute(.unique).");
});
