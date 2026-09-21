import Foundation
public func catalog() throws -> [String] {let url=Bundle.module.url(forResource:"Catalog",withExtension:"json")!;return try JSONDecoder().decode([String].self,from:Data(contentsOf:url))}
