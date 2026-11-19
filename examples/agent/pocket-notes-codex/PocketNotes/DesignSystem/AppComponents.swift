import SwiftUI

struct AppIconTile: View {
    let symbol: String
    var tint: Color = AppColor.primary
    var accessibilityLabel: String? = nil

    var body: some View {
        Image(systemName: symbol)
            .font(.title3.weight(.semibold))
            .foregroundStyle(tint)
            .frame(width: 48, height: 48)
            .background(tint.opacity(0.12), in: RoundedRectangle(cornerRadius: AppTheme.Radius.control, style: .continuous))
            .accessibilityLabel(accessibilityLabel ?? symbol.replacingOccurrences(of: ".", with: " "))
    }
}

struct AppCard<Content: View>: View {
    private let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(AppTheme.cardPadding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppColor.surface, in: RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous)
                    .strokeBorder(.primary.opacity(0.06), lineWidth: 1)
            }
    }
}

struct HeroHeader: View {
    let title: String
    let subtitle: String
    var symbol: String = "sparkles"

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Space.medium) {
            Image(systemName: symbol)
                .font(.title2.weight(.semibold))
                .foregroundStyle(AppColor.primary)
                .accessibilityHidden(true)
            Text(title)
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .accessibilityElement(children: .combine)
    }
}

struct AppStatTile: View {
    let title: String
    let value: String
    var symbol: String = "chart.bar.fill"

    var body: some View {
        AppCard {
            VStack(alignment: .leading, spacing: AppTheme.Space.medium) {
                Image(systemName: symbol)
                    .font(.headline)
                    .foregroundStyle(AppColor.primary)
                    .accessibilityHidden(true)
                Text(value)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.primary)
                    .contentTransition(.numericText())
                Text(title)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .accessibilityElement(children: .combine)
    }
}

struct AppChip: View {
    let title: String
    var selected = false

    var body: some View {
        Text(title)
            .font(.subheadline.weight(.medium))
            .foregroundStyle(selected ? AppColor.onPrimary : .primary)
            .padding(.horizontal, AppTheme.Space.large)
            .padding(.vertical, AppTheme.Space.small)
            .background(selected ? AppColor.primary : AppColor.surface, in: Capsule())
            .overlay { Capsule().strokeBorder(.primary.opacity(selected ? 0 : 0.08), lineWidth: 1) }
            .accessibilityAddTraits(selected ? .isSelected : [])
    }
}

struct AppSectionHeader: View {
    let title: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title).font(.headline)
            Spacer(minLength: AppTheme.Space.small)
            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppColor.primary)
            }
        }
    }
}

struct AppProgressRing: View {
    let title: String
    let value: Double

    private var clampedValue: Double { min(max(value, 0), 1) }

    var body: some View {
        ProgressView(value: clampedValue) {
            Text(title).font(.subheadline)
        } currentValueLabel: {
            Text(clampedValue, format: .percent.precision(.fractionLength(0)))
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
        }
        .progressViewStyle(.circular)
        .tint(AppColor.primary)
        .accessibilityValue(Text(clampedValue, format: .percent.precision(.fractionLength(0))))
    }
}

struct AppEmptyStateView: View {
    let title: String
    let message: String
    var symbol: String = "tray"
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: AppTheme.Space.large) {
            Image(systemName: symbol)
                .font(.system(size: 34, weight: .regular))
                .foregroundStyle(AppColor.primary)
                .padding(AppTheme.Space.large)
                .background(AppColor.primary.opacity(0.1), in: Circle())
                .accessibilityHidden(true)
            Text(title).font(.title3.weight(.semibold)).multilineTextAlignment(.center)
            Text(message).font(.body).foregroundStyle(.secondary).multilineTextAlignment(.center)
            if let actionTitle, let action {
                Button(actionTitle, action: action).buttonStyle(.borderedProminent)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Space.xLarge)
        .accessibilityElement(children: .contain)
    }
}

struct AppErrorStateView: View {
    let title: String
    let message: String
    var retryTitle: String = "Try again"
    let retry: () -> Void

    var body: some View {
        VStack(spacing: AppTheme.Space.large) {
            AppIconTile(symbol: "exclamationmark.triangle", tint: .orange, accessibilityLabel: "Error")
            Text(title).font(.title3.weight(.semibold)).multilineTextAlignment(.center)
            Text(message).font(.body).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Button(retryTitle, action: retry).buttonStyle(AppPrimaryButtonStyle())
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Space.xLarge)
        .accessibilityElement(children: .contain)
    }
}

struct ThumbnailPlaceholder: View {
    let symbol: String
    var title: String? = nil

    var body: some View {
        ZStack {
            LinearGradient(colors: [AppColor.primary.opacity(0.85), AppColor.secondary.opacity(0.75)], startPoint: .topLeading, endPoint: .bottomTrailing)
            Image(systemName: symbol)
                .font(.largeTitle.weight(.medium))
                .foregroundStyle(.white.opacity(0.95))
        }
        .frame(minHeight: 120)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.Radius.card, style: .continuous))
        .accessibilityLabel(title ?? "Illustration")
    }
}

struct AppPrimaryButtonStyle: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(minHeight: AppTheme.controlMinimumHeight)
            .padding(.horizontal, AppTheme.Space.large)
            .foregroundStyle(AppColor.onPrimary)
            .background(AppColor.primary, in: RoundedRectangle(cornerRadius: AppTheme.Radius.control, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(reduceMotion || AppTheme.motionDuration == 0 ? nil : .snappy(duration: AppTheme.motionDuration), value: configuration.isPressed)
    }
}

struct SkeletonBlock: View {
    var height: CGFloat = 18

    var body: some View {
        RoundedRectangle(cornerRadius: AppTheme.Radius.control, style: .continuous)
            .fill(.quaternary)
            .frame(height: height)
            .redacted(reason: .placeholder)
            .accessibilityHidden(true)
    }
}
