import { defineVerify } from "../_sdk/index.js";

export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyDesignSystem.swift": "import SwiftUI\n\nstruct VerifyDesignSystem: View {\n    var body: some View {\n        VStack(spacing: AppTheme.Space.large) {\n            HeroHeader(title: \"Today\", subtitle: \"A calm start\", symbol: \"sun.max\")\n            HStack {\n                AppStatTile(title: \"Streak\", value: \"4\", symbol: \"flame\")\n                AppProgressRing(title: \"Progress\", value: 0.5)\n            }\n            AppChip(title: \"Focus\", selected: true)\n            ThumbnailPlaceholder(symbol: \"leaf\")\n            SkeletonBlock()\n            Button(\"Continue\") {}.buttonStyle(AppPrimaryButtonStyle())\n            AppEmptyStateView(title: \"Nothing yet\", message: \"Add the first item.\")\n        }\n    }\n}\n",
  }),
);
