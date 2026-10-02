import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct VerifyUsage: View {\n    @State private var query = \"\"\n    private let items = [\"Cr\u00e8me br\u00fbl\u00e9e\", \"Apple pie\"]\n    var body: some View {\n        NavigationStack {\n            List(items.filter { $0.matchesSearch(query) }, id: \\.self) { Text($0) }\n                .searchable(text: $query)\n                .overlay { if !query.isEmpty, items.filter({ $0.matchesSearch(query) }).isEmpty { SearchNoResultsView(query: query) } }\n        }\n    }\n}\n",
  }),
);
