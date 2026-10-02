import SwiftUI

/// Shows the animated splash over the app's root view, then fades it out.
/// The first frame matches the static launch screen (same color and logo).
struct SplashContainer<Content: View>: View {
    @ViewBuilder var content: () -> Content
    @State private var finished = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            content()
            if !finished {
                SplashView()
                    .transition(.opacity)
                    .zIndex(1)
            }
        }
        .task {
            // Agent screenshot launches open a specific screen; skip the splash for them.
            if AgentLaunch.requestedScreen != nil {
                finished = true
                return
            }
            try? await Task.sleep(for: .milliseconds(reduceMotion ? 300 : 1100))
            withAnimation(.easeOut(duration: reduceMotion ? 0.1 : 0.35)) {
                finished = true
            }
        }
    }
}

/// The logo on the launch background, scaling in with a spring.
struct SplashView: View {
    @State private var appeared = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            Color("LaunchBackground")
                .ignoresSafeArea()
            Image("LaunchLogo")
                .resizable()
                .scaledToFit()
                .frame(width: 120, height: 120)
                .scaleEffect(appeared || reduceMotion ? 1 : 0.82)
                .opacity(appeared ? 1 : 0.7)
                .accessibilityLabel(Text("Tab Feed"))
        }
        .onAppear {
            withAnimation(reduceMotion ? nil : .spring(duration: 0.8, bounce: 0.35)) {
                appeared = true
            }
        }
    }
}

#Preview {
    SplashView()
}
