import SwiftUI

/// Brand colors from the asset catalog. A namespace avoids clashing with Xcode's generated asset symbols.
enum AppColor {
    static let primary = Color("BrandPrimary")
    static let secondary = Color("BrandSecondary")
    static let accent = Color("BrandAccent")
    static let surface = Color("BrandSurface")
    static let onPrimary = Color("BrandOnPrimary")
}

#Preview {
    VStack(spacing: 12) {
        Text("Primary")
            .padding()
            .foregroundStyle(AppColor.onPrimary)
            .background(AppColor.primary, in: .capsule)
        Text("Surface")
            .padding()
            .background(AppColor.surface, in: .rect(cornerRadius: 12))
    }
}
