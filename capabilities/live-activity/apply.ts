import { defineApply } from "../_sdk/index.js";

// The activity's attributes are compiled into both targets; the controller
// stays in the app; the Lock Screen and Dynamic Island views build only in the
// WidgetKit extension.
export default defineApply((ctx) => {
  ctx.addWidget({
    widget: "ProgressLiveActivity()",
    sources: ["Capabilities/LiveActivity/Shared"],
    extensionOnly: ["Capabilities/LiveActivity/Widget"],
  });
  ctx.note("Updates are local (pushType nil). Remote updates need an APNs key and a server; see the push-notifications catalog entry.");
});
