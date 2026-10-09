import { defineVerify } from "../_sdk/index.js";
export default defineVerify(ctx => ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import Foundation\nstruct VerifyRow: Codable { let title: String }\n@MainActor func checkFirestoreAPI(_ store: FirestoreDocuments<VerifyRow>) async throws { _ = try await store.load(id: \"synthetic\") }"
  }));
