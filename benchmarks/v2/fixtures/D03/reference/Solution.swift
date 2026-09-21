import Foundation
struct Record: Codable, Equatable { let id:Int; let name:String; let note:String? }
func decodeRecord(_ data:Data) throws -> Record { try JSONDecoder().decode(Record.self,from:data) }
