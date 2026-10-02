import Foundation
import Supabase
import SwiftUI

enum SupabaseConfiguration {
    /// nil until SUPABASE_URL and SUPABASE_ANON_KEY replace the placeholders.
    static func makeClient(bundle: Bundle = .main) -> SupabaseClient? {
        guard let url = bundle.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              let key = bundle.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String,
              url != "REPLACE_ME", key != "REPLACE_ME", !key.isEmpty,
              let base = URL(string: url), base.scheme == "https" else { return nil }
        return SupabaseClient(supabaseURL: base, supabaseKey: key)
    }
}

/// Typed access to one table. Rows must match the table's columns.
struct SupabaseTable<Row: Codable & Sendable> {
    let client: SupabaseClient
    let name: String

    func fetchAll() async throws -> [Row] {
        try await client.from(name).select().execute().value
    }

    func insert(_ row: Row) async throws {
        try await client.from(name).insert(row).execute()
    }
}

struct SupabaseNotConfiguredView: View {
    var body: some View {
        ContentUnavailableView(
            "Database not configured",
            systemImage: "externaldrive.badge.xmark",
            description: Text("Add SUPABASE_URL and SUPABASE_ANON_KEY to the project's .env file, then rebuild.")
        )
    }
}
