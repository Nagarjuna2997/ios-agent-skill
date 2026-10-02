import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nimport SwiftData\n\n@Model\nfinal class VerifySynced {\n    var title: String = \"\"\n    init(title: String = \"\") { self.title = title }\n}\n\nstruct VerifyUsage: View {\n    var body: some View {\n        Text((try? PersistenceController.syncedContainer(for: [VerifySynced.self])) == nil ? \"no\" : \"yes\")\n    }\n}\n",
  }),
);
