import CloudKit
import Foundation

/// A value stored as one CloudKit record. The id becomes the record name.
protocol CloudRecordConvertible: Sendable {
    static var recordType: String { get }
    var id: String { get }
    init?(record: CKRecord)
    func fill(_ record: CKRecord)
}

enum CloudStoreError: LocalizedError, Equatable {
    case account(String)
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .account(let message), .failed(let message): message
        }
    }
}

protocol CloudStore: Sendable {
    /// A message to show when iCloud cannot be used, or nil when it can.
    func accountProblem() async -> String?
    func save<T: CloudRecordConvertible>(_ value: T) async throws
    func fetchAll<T: CloudRecordConvertible>() async throws -> [T]
    func delete<T: CloudRecordConvertible>(_ value: T) async throws
}

struct CloudKitStore: CloudStore {
    let container: CKContainer
    let database: CKDatabase

    static func privateDatabase() -> CloudKitStore {
        let container = CKContainer(identifier: "iCloud.__BUNDLE_ID__")
        return CloudKitStore(container: container, database: container.privateCloudDatabase)
    }

    func accountProblem() async -> String? {
        do {
            switch try await container.accountStatus() {
            case .available: return nil
            case .noAccount: return "Sign in to iCloud in Settings to sync your data."
            case .restricted: return "iCloud is restricted on this device."
            case .temporarilyUnavailable: return "iCloud is temporarily unavailable. Try again shortly."
            case .couldNotDetermine: return "iCloud status could not be determined."
            @unknown default: return "iCloud is unavailable."
            }
        } catch {
            return error.localizedDescription
        }
    }

    func save<T: CloudRecordConvertible>(_ value: T) async throws {
        let id = CKRecord.ID(recordName: value.id)
        let record: CKRecord
        do {
            record = try await database.record(for: id)
        } catch let error as CKError where error.code == .unknownItem {
            record = CKRecord(recordType: T.recordType, recordID: id)
        } catch {
            throw Self.wrap(error)
        }
        value.fill(record)
        do {
            _ = try await database.save(record)
        } catch {
            throw Self.wrap(error)
        }
    }

    func fetchAll<T: CloudRecordConvertible>() async throws -> [T] {
        let query = CKQuery(recordType: T.recordType, predicate: NSPredicate(value: true))
        do {
            let (results, _) = try await database.records(matching: query, resultsLimit: CKQueryOperation.maximumResults)
            return results.compactMap { _, result in (try? result.get()).flatMap(T.init(record:)) }
        } catch {
            throw Self.wrap(error)
        }
    }

    func delete<T: CloudRecordConvertible>(_ value: T) async throws {
        do {
            _ = try await database.deleteRecord(withID: CKRecord.ID(recordName: value.id))
        } catch let error as CKError where error.code == .unknownItem {
            return
        } catch {
            throw Self.wrap(error)
        }
    }

    private static func wrap(_ error: Error) -> Error {
        if error is CancellationError { return error }
        if let error = error as? CKError, error.code == .notAuthenticated {
            return CloudStoreError.account("Sign in to iCloud in Settings to sync your data.")
        }
        return CloudStoreError.failed(error.localizedDescription)
    }
}

/// Keeps values in memory. For previews and tests.
actor PreviewCloudStore: CloudStore {
    private var storage: [String: any CloudRecordConvertible] = [:]

    func accountProblem() async -> String? { nil }

    func save<T: CloudRecordConvertible>(_ value: T) async throws {
        storage[value.id] = value
    }

    func fetchAll<T: CloudRecordConvertible>() async throws -> [T] {
        storage.values.compactMap { $0 as? T }
    }

    func delete<T: CloudRecordConvertible>(_ value: T) async throws {
        storage[value.id] = nil
    }
}
