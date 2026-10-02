import SwiftData

extension PersistenceController {
    static let iCloudContainer = "iCloud.__BUNDLE_ID__"

    /// A store synced through the user's private iCloud database.
    static func syncedContainer(for types: [any PersistentModel.Type]) throws -> ModelContainer {
        let schema = Schema(types)
        let configuration = ModelConfiguration(schema: schema, cloudKitDatabase: .private(iCloudContainer))
        return try ModelContainer(for: schema, configurations: [configuration])
    }
}
