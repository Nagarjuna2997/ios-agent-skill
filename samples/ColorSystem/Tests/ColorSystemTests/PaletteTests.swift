import XCTest
@testable import ColorSystem
final class PaletteTests: XCTestCase {
    func testAllAppearanceKeysMatch() throws {
        let p = try PalettePreview.bundled()
        XCTAssertEqual(p.light.count, 35)
        for colors in [p.dark, p.highContrastLight, p.highContrastDark] { XCTAssertEqual(Set(colors.keys), Set(p.light.keys)) }
    }
    func testDarkIsNotTheLightPalette() throws {
        let p = try PalettePreview.bundled()
        XCTAssertNotEqual(p.light, p.dark)
        XCTAssertNotEqual(p.dark["background"], p.dark["surfaceElevated"])
    }
    func testValuesAreOpaqueSRGB() throws {
        let p = try PalettePreview.bundled()
        for colors in [p.light, p.dark, p.highContrastLight, p.highContrastDark] {
            for color in colors.values { XCTAssertNotNil(color.range(of: "^#[0-9A-F]{6}$", options: .regularExpression)) }
        }
    }
}
