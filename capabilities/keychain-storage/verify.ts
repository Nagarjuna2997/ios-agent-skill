import { defineVerify } from "../_sdk/index.js";

// Builds the capability into a minimal app together with a file that uses its public API.
export default defineVerify((ctx) =>
  ctx.buildMinimalApp({
    "Views/VerifyUsage.swift": "import Foundation\n\n@MainActor\nfunc verifyKeychainUsage() throws -> String? {\n    let store: any SecureStore = InMemorySecureStore()\n    try store.setString(\"value\", for: \"key\")\n    _ = KeychainStore()\n    return try store.string(for: \"key\")\n}\n",
  }),
);
