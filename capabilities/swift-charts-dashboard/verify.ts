import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    var body: some View {\n        DashboardCard(title: \"Trend\") {\n            TrendChart(points: [ChartPoint(label: \"A\", value: 1)])\n            CategoryBarChart(points: [])\n            StatTile(title: \"Total\", value: \"1\", systemImage: \"sum\")\n        }\n    }\n}\n",
  }),
);
