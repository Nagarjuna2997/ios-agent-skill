import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import SwiftUI\n\nimport CloudKit\n\nstruct VerifyFavorite: CloudRecordConvertible {\n    static let recordType = \"VerifyFavorite\"\n    let id: String\n    init(id: String) { self.id = id }\n    init?(record: CKRecord) { self.id = record.recordID.recordName }\n    func fill(_ record: CKRecord) {}\n}\n\nstruct VerifyUsage: View {\n    let store: any CloudStore = PreviewCloudStore()\n    var body: some View {\n        Text(\"CloudKit\")\n            .task {\n                try? await store.save(VerifyFavorite(id: \"1\"))\n                let all: [VerifyFavorite] = (try? await store.fetchAll()) ?? []\n                _ = all\n            }\n    }\n}\n",
  }),
);
