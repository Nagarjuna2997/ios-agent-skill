import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Models/VerifyItem.swift": "import Foundation\nimport SwiftData\n\n@Model\nfinal class VerifyItem {\n    var title: String\n    init(title: String) { self.title = title }\n}\n",
    "Views/VerifyUsage.swift": "import SwiftData\nimport SwiftUI\n\nstruct VerifyUsage: View {\n    @Query private var items: [VerifyItem]\n    var body: some View { List(items) { Text($0.title) } }\n}\n\n#Preview {\n    VerifyUsage().modelContainer(PersistenceController.preview(for: [VerifyItem.self]))\n}\n",
  }),
);
