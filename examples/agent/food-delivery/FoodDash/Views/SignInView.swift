import SwiftUI

struct SignInView: View {
    let auth: AuthCoordinator
    @State private var showEmail = false
    @State private var spacing = ScaledSpacing()

    var body: some View {
        VStack(spacing: spacing.roomy) {
            Spacer()
            Image(systemName: "fork.knife.circle.fill")
                .font(.system(size: 80))
                .foregroundStyle(AppColor.primary)
                .accessibilityHidden(true)
            Text("FoodDash")
                .font(.largeTitle.bold())
                .accessibilityAddTraits(.isHeader)
            Text("Your favorite restaurants, delivered.")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Spacer()
            VStack(spacing: spacing.compact) {
                AppleSignInView(model: auth.apple)
                Button {
                    showEmail = true
                } label: {
                    Label("Continue with email", systemImage: "envelope")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .controlSize(.large)
                .minimumTapTarget()
                .padding(.horizontal)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .sheet(isPresented: $showEmail) {
            NavigationStack {
                EmailAuthForm(model: auth.email)
                    .navigationTitle("Email")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) {
                            Button("Close") { showEmail = false }
                        }
                    }
            }
        }
        .fontDesign(AppTheme.fontDesign)
    }
}

#Preview {
    SignInView(auth: .preview())
}
