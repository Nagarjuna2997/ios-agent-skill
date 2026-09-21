import Foundation
func saveCache(_ data:Data, to url:URL, write:(Data,URL) throws -> Void) throws { try write(data,url) }
