import SwiftUI
import AppKit
// Usage: swift render-preview.swift COMPILED_ASSET_BUNDLE OUTPUT_DIRECTORY
// Compile sample Assets.xcassets for macosx with actool first.
@MainActor
func render() throws {
    guard CommandLine.arguments.count == 3,
          let bundle = Bundle(path: CommandLine.arguments[1]) else { fatalError("Supply compiled asset bundle and output directory") }
    _ = NSApplication.shared
    for dark in [false, true] {
        for high in [false, true] {
            let name = (dark ? "dark" : "light") + (high ? "-high" : "")
            let appearance = NSAppearance(named: high ? (dark ? .accessibilityHighContrastDarkAqua : .accessibilityHighContrastAqua) : (dark ? .darkAqua : .aqua))!
            let color: (String) -> Color = { token in
                var resolved: NSColor?
                appearance.performAsCurrentDrawingAppearance {
                    resolved = NSColor(named: NSColor.Name(token), bundle: bundle)?.usingColorSpace(.sRGB)
                }
                guard let resolved else { fatalError("Missing asset: \(token)") }
                return Color(nsColor: resolved)
            }
            let view = VStack(alignment: .leading, spacing: 24) {
                HStack { Text("Monthly overview").font(.largeTitle.bold()); Spacer(); Image(systemName: "chart.bar.fill").font(.title).foregroundStyle(color("Primary")) }
                Text("A calm, semantic color system").foregroundStyle(color("TextSecondary"))
                VStack(alignment: .leading, spacing: 16) {
                    Text("Your plan").font(.title2.bold())
                    Text("All accounts are up to date.").foregroundStyle(color("TextSecondary"))
                    Label("Saved successfully", systemImage: "checkmark.circle.fill").foregroundStyle(color("Success"))
                        .padding(12).background(color("SuccessContainer"), in: RoundedRectangle(cornerRadius: 12))
                    Text("Continue").font(.headline).foregroundStyle(color("OnPrimary"))
                        .frame(maxWidth: .infinity).padding(16).background(color("Primary"), in: Capsule())
                }.padding(24).frame(maxWidth: .infinity, alignment: .leading).background(color("Surface"), in: RoundedRectangle(cornerRadius: 24))
                HStack(spacing: 12) {
                    ForEach(["Primary","Secondary","Success","Warning","Error"], id: \.self) { token in
                        VStack(spacing: 8) { RoundedRectangle(cornerRadius: 12).fill(color(token)).frame(height: 40); Text(token).font(.caption) }.frame(maxWidth: .infinity)
                    }
                }
                Text("\(dark ? "Dark" : "Light") appearance · \(high ? "Increased" : "Standard") contrast").font(.caption).foregroundStyle(color("TextSecondary"))
            }.padding(32).frame(width: 680).foregroundStyle(color("TextPrimary")).background(color("Background"))
                .environment(\.colorScheme, dark ? .dark : .light)
            let renderer = ImageRenderer(content: view)
            renderer.scale = 2
            guard let image = renderer.nsImage, let tiff = image.tiffRepresentation,
                  let bitmap = NSBitmapImageRep(data: tiff), let png = bitmap.representation(using: .png, properties: [:]) else { throw CocoaError(.fileWriteUnknown) }
            try png.write(to: URL(fileURLWithPath: CommandLine.arguments[2]).appendingPathComponent("palette-\(name).png"))
        }
    }
}
try MainActor.assumeIsolated { try render() }
