import { defineApply } from "../_sdk/index.js";

// SwiftUI's .backgroundTask(.appRefresh) needs the identifier in Info.plist
// and the "fetch" background mode.
export default defineApply((ctx) => {
  ctx.setInfoPlist("BGTaskSchedulerPermittedIdentifiers", [`${ctx.bundleId}.refresh`]);
  ctx.setInfoPlist("UIBackgroundModes", ["fetch"]);
});
