import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var presenter = NotificationPresenter()\n    @State private var model = ReminderModel(scheduler: LocalNotificationScheduler())\n    var body: some View {\n        Form { ReminderSettingsView(model: model) }\n            .task { presenter.install(); await model.refresh() }\n    }\n}\n",
  }),
);
