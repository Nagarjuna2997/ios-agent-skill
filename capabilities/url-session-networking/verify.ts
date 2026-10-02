import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nstruct Item: Decodable, Sendable { let id: Int }\n\nstruct VerifyUsage: View {\n    let client: any APIClient = StubAPIClient(responses: [\"items\": \"[{\\\"id\\\": 1}]\"])\n    @State private var count = 0\n    var body: some View {\n        Text(\"\\(count)\")\n            .task { count = (try? await client.send(APIRequest<[Item]>.get(\"items\")))?.count ?? 0 }\n    }\n}\n",
  }),
);
