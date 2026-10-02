# Supabase database (supabase-swift)

Adds the `Supabase` product of `supabase-swift` and a small typed table helper.

## Use

```swift
struct Restaurant: Codable, Sendable, Identifiable { let id: Int; let name: String }

if let client = SupabaseConfiguration.makeClient() {
    let restaurants = try await SupabaseTable<Restaurant>(client: client, name: "restaurants").fetchAll()
}
```

## Rules

From [Supabase](../../docs/backend/supabase.md):

- Only the anon (publishable) key ships in the app; enable row-level security on every table.
- Keep local, staging and production projects separate.
- Pin the resolved package version after the first build.
