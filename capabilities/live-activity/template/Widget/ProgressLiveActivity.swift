import ActivityKit
import SwiftUI
import WidgetKit

struct ProgressLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ProgressActivityAttributes.self) { context in
            ProgressLockScreenView(context: context)
                .padding()
                .activityBackgroundTint(Color(.systemBackground).opacity(0.8))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "shippingbox.fill")
                        .font(.title2)
                        .foregroundStyle(.tint)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if let eta = context.state.eta {
                        Text(eta, style: .timer)
                            .font(.headline)
                            .monospacedDigit()
                            .frame(maxWidth: 64)
                    }
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.stepTitle)
                        .font(.headline)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: context.state.fraction(of: context.attributes.steps.count))
                }
            } compactLeading: {
                Image(systemName: "shippingbox.fill")
                    .foregroundStyle(.tint)
            } compactTrailing: {
                Text("\(context.state.step + 1)/\(context.attributes.steps.count)")
                    .font(.caption2)
                    .monospacedDigit()
            } minimal: {
                Image(systemName: "shippingbox.fill")
                    .foregroundStyle(.tint)
            }
        }
    }
}

struct ProgressLockScreenView: View {
    let context: ActivityViewContext<ProgressActivityAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.title)
                        .font(.headline)
                    Text(context.attributes.subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if let eta = context.state.eta {
                    Text(eta, style: .relative)
                        .font(.subheadline)
                        .monospacedDigit()
                }
            }
            Text(context.state.stepTitle)
                .font(.subheadline.bold())
            ProgressView(value: context.state.fraction(of: context.attributes.steps.count))
        }
        .accessibilityElement(children: .combine)
    }
}
