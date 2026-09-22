import Foundation
public struct PalettePreview: Decodable, Sendable {
    public let light: [String: String]
    public let dark: [String: String]
    public let highContrastLight: [String: String]
    public let highContrastDark: [String: String]
    public static func bundled() throws -> Self {
        guard let url = Bundle.module.url(forResource: "palette", withExtension: "json") else { throw CocoaError(.fileNoSuchFile) }
        return try JSONDecoder().decode(Self.self, from: Data(contentsOf: url))
    }
}
