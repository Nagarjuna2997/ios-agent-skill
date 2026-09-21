import Foundation
func saveCache(_ data:Data, to url:URL, write:(Data,URL) throws -> Void) throws {
 let temporary=url.deletingLastPathComponent().appendingPathComponent(UUID().uuidString)
 defer { try? FileManager.default.removeItem(at:temporary) }
 try write(data,temporary)
 let complete=try Data(contentsOf:temporary)
 try complete.write(to:url,options:.atomic)
}
