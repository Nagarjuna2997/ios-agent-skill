import SwiftData

/// Builds the app's ModelContainer from its @Model types.
enum PersistenceController {
    /// A container backed by the app's default store, or by memory for previews and tests.
    static func container(for types: [any PersistentModel.Type], inMemory: Bool = false) throws -> ModelContainer {
        let schema = Schema(types)
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: inMemory)
        return try ModelContainer(for: schema, configurations: [configuration])
    }

    /// An in-memory container for #Preview blocks. Previews cannot recover from a
    /// schema error, so this stops with the error instead of showing stale data.
    @MainActor
    static func preview(for types: [any PersistentModel.Type]) -> ModelContainer {
        do {
            return try container(for: types, inMemory: true)
        } catch {
            fatalError("Preview container failed: \(error)")
        }
    }
}
