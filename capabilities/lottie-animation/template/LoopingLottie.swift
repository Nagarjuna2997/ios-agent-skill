import Lottie
import SwiftUI

/// Plays a bundled Lottie animation. Shows the first frame when Reduce Motion is on.
struct LoopingLottie: View {
    let name: String
    var loop: Bool = true
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        LottieView(animation: .named(name))
            .playbackMode(playbackMode)
            .accessibilityHidden(true)
    }

    private var playbackMode: LottiePlaybackMode {
        if reduceMotion {
            return .paused(at: .progress(0))
        }
        return .playing(.fromProgress(0, toProgress: 1, loopMode: loop ? .loop : .playOnce))
    }
}

#Preview {
    LoopingLottie(name: "pulse")
        .frame(width: 160, height: 160)
}
