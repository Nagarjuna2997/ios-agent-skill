#if canImport(UIKit)
import SwiftUI
import UIKit
// Add the generated Assets.xcassets to the app target before using this view.
// Assets are loaded from that app's bundle, not from the Swift package JSON resource.
@MainActor
public enum AppColors {
    public static let primary = Color("Primary")
    public static let onPrimary = Color("OnPrimary")
    public static let background = Color("Background")
    public static let surface = Color("Surface")
    public static let textPrimary = Color("TextPrimary")
    public static let textSecondary = Color("TextSecondary")
}
public struct ColorPreview: View {
    public init() {}
    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Your monthly overview").font(.title).foregroundStyle(AppColors.textPrimary)
                Text("All accounts are up to date.").foregroundStyle(AppColors.textSecondary)
                Label("Saved successfully", systemImage: "checkmark.circle.fill")
                    .foregroundStyle(.primary) // Meaning survives Differentiate Without Color.
                Button {} label: {
                    Text("Continue").frame(maxWidth: .infinity).padding()
                        .foregroundStyle(AppColors.onPrimary).background(AppColors.primary, in: Capsule())
                }
                Button("Delete draft", role: .destructive) {}
            }.padding().background(AppColors.surface, in: RoundedRectangle(cornerRadius: 20)).padding()
        }.background(AppColors.background).tint(AppColors.primary)
    }
}
@MainActor
public func applyPalette(to button: UIButton, bundle: Bundle = .main) throws {
    guard let primary = UIColor(named: "Primary", in: bundle, compatibleWith: nil),
          let foreground = UIColor(named: "OnPrimary", in: bundle, compatibleWith: nil) else {
        throw CocoaError(.fileNoSuchFile)
    }
    var config = UIButton.Configuration.filled()
    config.title = "Continue"
    config.baseBackgroundColor = primary
    config.baseForegroundColor = foreground
    button.configuration = config
}
#endif
