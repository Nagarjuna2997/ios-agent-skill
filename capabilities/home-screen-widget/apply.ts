import { defineApply } from "../_sdk/index.js";

// The widget runs in the app's WidgetKit extension. The app and the extension
// share an App Group so the app can publish a snapshot the widget reads.
export default defineApply((ctx) => {
  const group = [`group.${ctx.bundleId}`];
  ctx.addEntitlement("com.apple.security.application-groups", group);
  ctx.addWidget({
    widget: "SummaryWidget()",
    sources: ["Capabilities/HomeScreenWidget/Shared"],
    extensionOnly: ["Capabilities/HomeScreenWidget/Widget"],
    entitlements: { "com.apple.security.application-groups": group },
  });
  ctx.note(`App Group group.${ctx.bundleId} must be registered for the team before device builds; the simulator does not need it.`);
});
