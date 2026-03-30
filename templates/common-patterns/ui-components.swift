// ui-components.swift
// A comprehensive library of beautiful, reusable SwiftUI components.

import SwiftUI

// MARK: - GradientButton

/// A button with gradient background, press animation, and optional loading state.
struct GradientButton: View {
    let title: String
    var gradientColors: [Color] = [Color(hex: "#667EEA"), Color(hex: "#764BA2")]
    var isLoading: Bool = false
    var action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            guard !isLoading else { return }
            action()
        }) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
                Text(title)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                LinearGradient(
                    colors: isLoading ? gradientColors.map { $0.opacity(0.6) } : gradientColors,
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .shadow(color: gradientColors.first?.opacity(0.4) ?? .clear, radius: 8, y: 4)
            .scaleEffect(isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.7), value: isPressed)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
        .disabled(isLoading)
    }
}

// MARK: - GlassCard

/// A frosted glass card with a subtle gradient border.
struct GlassCard<Content: View>: View {
    var cornerRadius: CGFloat = 16
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .padding(16)
            .background(
                .ultraThinMaterial,
                in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [.white.opacity(0.5), .white.opacity(0.08)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(color: .black.opacity(0.08), radius: 10, y: 4)
    }
}

// MARK: - AvatarView

/// A circular avatar image with optional border, badge text, and online indicator.
struct AvatarView: View {
    var image: Image?
    var systemName: String = "person.fill"
    var size: CGFloat = 48
    var borderColor: Color = .blue
    var borderWidth: CGFloat = 2
    var badgeText: String?
    var isOnline: Bool = false

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Group {
                if let image {
                    image
                        .resizable()
                        .scaledToFill()
                } else {
                    Image(systemName: systemName)
                        .resizable()
                        .scaledToFit()
                        .padding(size * 0.22)
                        .foregroundStyle(.white)
                        .background(Color.gray.opacity(0.4))
                }
            }
            .frame(width: size, height: size)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .strokeBorder(borderColor, lineWidth: borderWidth)
            )

            if isOnline {
                Circle()
                    .fill(Color.green)
                    .frame(width: size * 0.26, height: size * 0.26)
                    .overlay(Circle().strokeBorder(.white, lineWidth: 2))
                    .offset(x: 2, y: 2)
            }

            if let badgeText {
                Text(badgeText)
                    .font(.system(size: size * 0.22, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(4)
                    .background(Color.red)
                    .clipShape(Circle())
                    .offset(x: 4, y: -size * 0.65)
            }
        }
    }
}

// MARK: - StatCard

/// Dashboard-style stat card with icon, value, label, and trend indicator.
struct StatCard: View {
    var icon: String = "chart.bar.fill"
    var iconColor: Color = .blue
    var value: String
    var label: String
    var trend: Double? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(iconColor)
                    .frame(width: 36, height: 36)
                    .background(iconColor.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                Spacer()
                if let trend {
                    HStack(spacing: 2) {
                        Image(systemName: trend >= 0 ? "arrow.up.right" : "arrow.down.right")
                            .font(.caption2.bold())
                        Text(String(format: "%.1f%%", abs(trend)))
                            .font(.caption.bold())
                    }
                    .foregroundStyle(trend >= 0 ? .green : .red)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background((trend >= 0 ? Color.green : Color.red).opacity(0.1))
                    .clipShape(Capsule())
                }
            }
            Text(value)
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .shadow(color: .black.opacity(0.06), radius: 8, y: 4)
    }
}

// MARK: - TagView / ChipView

/// A pill-shaped tag with configurable color.
struct TagView: View {
    let text: String
    var color: Color = .blue
    var onRemove: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: 4) {
            Text(text)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(color)
            if let onRemove {
                Button(action: onRemove) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.caption)
                        .foregroundStyle(color.opacity(0.6))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(color.opacity(0.12))
        .clipShape(Capsule())
    }
}

/// Alias for TagView with a slightly different visual weight.
struct ChipView: View {
    let text: String
    var color: Color = .blue
    var isSelected: Bool = false

    var body: some View {
        Text(text)
            .font(.system(size: 14, weight: isSelected ? .semibold : .regular))
            .foregroundStyle(isSelected ? .white : color)
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(isSelected ? color : color.opacity(0.12))
            .clipShape(Capsule())
            .animation(.easeInOut(duration: 0.2), value: isSelected)
    }
}

// MARK: - FlowLayout

/// A horizontal wrapping layout for tags and chips.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrangeSubviews(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func arrangeSubviews(proposal: ProposedViewSize, subviews: Subviews) -> ArrangementResult {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0
        var totalSize: CGSize = .zero

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth, currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            positions.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
            totalSize.width = max(totalSize.width, currentX - spacing)
            totalSize.height = max(totalSize.height, currentY + lineHeight)
        }
        return ArrangementResult(positions: positions, size: totalSize)
    }

    private struct ArrangementResult {
        let positions: [CGPoint]
        let size: CGSize
    }
}

// MARK: - RatingView

/// An interactive star rating view (1-5).
struct RatingView: View {
    @Binding var rating: Int
    var maxRating: Int = 5
    var starSize: CGFloat = 28
    var filledColor: Color = .yellow
    var emptyColor: Color = .gray.opacity(0.3)

    var body: some View {
        HStack(spacing: 4) {
            ForEach(1...maxRating, id: \.self) { index in
                Image(systemName: index <= rating ? "star.fill" : "star")
                    .font(.system(size: starSize))
                    .foregroundStyle(index <= rating ? filledColor : emptyColor)
                    .scaleEffect(index <= rating ? 1.1 : 1.0)
                    .animation(.spring(response: 0.25, dampingFraction: 0.6), value: rating)
                    .onTapGesture {
                        withAnimation { rating = index }
                    }
            }
        }
    }
}

// MARK: - CircularProgress

/// Animated circular progress indicator with percentage text.
struct CircularProgress: View {
    var progress: Double
    var lineWidth: CGFloat = 8
    var size: CGFloat = 80
    var trackColor: Color = Color.gray.opacity(0.15)
    var progressColor: Color = .blue

    @State private var animatedProgress: Double = 0

    var body: some View {
        ZStack {
            Circle()
                .stroke(trackColor, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
            Circle()
                .trim(from: 0, to: animatedProgress)
                .stroke(
                    AngularGradient(
                        colors: [progressColor, progressColor.opacity(0.6)],
                        center: .center
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))

            Text("\(Int(animatedProgress * 100))%")
                .font(.system(size: size * 0.22, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)
        }
        .frame(width: size, height: size)
        .onAppear {
            withAnimation(.easeOut(duration: 1.0)) {
                animatedProgress = min(max(progress, 0), 1)
            }
        }
        .onChange(of: progress) { _, newValue in
            withAnimation(.easeOut(duration: 0.6)) {
                animatedProgress = min(max(newValue, 0), 1)
            }
        }
    }
}

// MARK: - AnimatedCounter

/// A number that animates when its value changes.
struct AnimatedCounter: View {
    var value: Int
    var font: Font = .system(size: 32, weight: .bold, design: .rounded)
    var textColor: Color = .primary

    @State private var displayedValue: Int = 0

    var body: some View {
        Text("\(displayedValue)")
            .font(font)
            .foregroundStyle(textColor)
            .contentTransition(.numericText(value: displayedValue))
            .onAppear { displayedValue = value }
            .onChange(of: value) { _, newValue in
                withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                    displayedValue = newValue
                }
            }
    }
}

// MARK: - GradientText

/// Text rendered with a gradient color.
struct GradientText: View {
    let text: String
    var font: Font = .title.bold()
    var colors: [Color] = [Color(hex: "#667EEA"), Color(hex: "#764BA2")]

    var body: some View {
        Text(text)
            .font(font)
            .foregroundStyle(
                LinearGradient(
                    colors: colors,
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
    }
}

// MARK: - CustomToggle

/// A beautiful animated toggle switch.
struct CustomToggle: View {
    @Binding var isOn: Bool
    var onColor: Color = .green
    var offColor: Color = Color.gray.opacity(0.3)
    var thumbSize: CGFloat = 26

    var body: some View {
        ZStack(alignment: isOn ? .trailing : .leading) {
            Capsule()
                .fill(isOn ? onColor : offColor)
                .frame(width: thumbSize * 2, height: thumbSize + 4)
                .animation(.easeInOut(duration: 0.25), value: isOn)

            Circle()
                .fill(.white)
                .frame(width: thumbSize, height: thumbSize)
                .shadow(color: .black.opacity(0.15), radius: 4, y: 2)
                .padding(2)
        }
        .onTapGesture {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                isOn.toggle()
            }
        }
    }
}

// MARK: - SkeletonView

/// Loading placeholder with animated shimmer effect.
struct SkeletonView: View {
    var width: CGFloat? = nil
    var height: CGFloat = 16
    var cornerRadius: CGFloat = 8

    @State private var shimmerOffset: CGFloat = -1

    var body: some View {
        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            .fill(Color.gray.opacity(0.15))
            .frame(width: width, height: height)
            .overlay(
                GeometryReader { geo in
                    LinearGradient(
                        colors: [.clear, .white.opacity(0.35), .clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geo.size.width * 0.5)
                    .offset(x: shimmerOffset * geo.size.width)
                }
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            )
            .onAppear {
                withAnimation(
                    .linear(duration: 1.4)
                    .repeatForever(autoreverses: false)
                ) {
                    shimmerOffset = 1.5
                }
            }
    }
}

// MARK: - ToastView

/// A popup notification that auto-dismisses.
struct ToastView: View {
    enum Style {
        case success, error, warning, info

        var icon: String {
            switch self {
            case .success: return "checkmark.circle.fill"
            case .error:   return "xmark.circle.fill"
            case .warning: return "exclamationmark.triangle.fill"
            case .info:    return "info.circle.fill"
            }
        }

        var color: Color {
            switch self {
            case .success: return .green
            case .error:   return .red
            case .warning: return .orange
            case .info:    return .blue
            }
        }
    }

    let message: String
    var style: Style = .info
    @Binding var isShowing: Bool
    var duration: Double = 3.0

    var body: some View {
        if isShowing {
            HStack(spacing: 10) {
                Image(systemName: style.icon)
                    .font(.title3)
                    .foregroundStyle(style.color)
                Text(message)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.primary)
                Spacer()
                Button {
                    withAnimation { isShowing = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.caption.bold())
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
            }
            .padding(14)
            .background(
                .regularMaterial,
                in: RoundedRectangle(cornerRadius: 14, style: .continuous)
            )
            .shadow(color: .black.opacity(0.1), radius: 10, y: 4)
            .padding(.horizontal, 16)
            .transition(.move(edge: .top).combined(with: .opacity))
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                    withAnimation(.easeInOut) { isShowing = false }
                }
            }
        }
    }
}

// MARK: - StepIndicator

/// Horizontal step progress indicator (1, 2, 3...).
struct StepIndicator: View {
    let totalSteps: Int
    var currentStep: Int
    var activeColor: Color = .blue
    var inactiveColor: Color = Color.gray.opacity(0.25)

    var body: some View {
        HStack(spacing: 0) {
            ForEach(1...totalSteps, id: \.self) { step in
                // Step circle
                ZStack {
                    Circle()
                        .fill(step <= currentStep ? activeColor : inactiveColor)
                        .frame(width: 32, height: 32)
                    if step < currentStep {
                        Image(systemName: "checkmark")
                            .font(.caption.bold())
                            .foregroundStyle(.white)
                    } else {
                        Text("\(step)")
                            .font(.caption.bold())
                            .foregroundStyle(step <= currentStep ? .white : .secondary)
                    }
                }
                .animation(.spring(response: 0.35, dampingFraction: 0.7), value: currentStep)

                // Connector line
                if step < totalSteps {
                    Rectangle()
                        .fill(step < currentStep ? activeColor : inactiveColor)
                        .frame(height: 3)
                        .animation(.easeInOut(duration: 0.3), value: currentStep)
                }
            }
        }
    }
}

// MARK: - EmptyStateView

/// Beautiful empty state with icon, title, message, and action button.
struct EmptyStateView: View {
    var systemImage: String = "tray"
    var title: String = "Nothing Here"
    var message: String = "There are no items to display."
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: systemImage)
                .font(.system(size: 56))
                .foregroundStyle(.secondary.opacity(0.5))
                .padding(.bottom, 4)

            Text(title)
                .font(.title2.bold())
                .foregroundStyle(.primary)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 280)

            if let actionTitle, let action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.blue)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
                .padding(.top, 4)
            }
        }
        .padding(32)
    }
}

// MARK: - SearchBar

/// Custom search bar with focus animation.
struct SearchBar: View {
    @Binding var text: String
    var placeholder: String = "Search..."
    var onSubmit: (() -> Void)? = nil

    @FocusState private var isFocused: Bool
    @State private var isEditing = false

    var body: some View {
        HStack(spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(isEditing ? .primary : .secondary)
                    .animation(.easeInOut(duration: 0.2), value: isEditing)

                TextField(placeholder, text: $text)
                    .focused($isFocused)
                    .onSubmit { onSubmit?() }
                    .autocorrectionDisabled()

                if !text.isEmpty {
                    Button {
                        withAnimation { text = "" }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                    .buttonStyle(.plain)
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .padding(12)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color.gray.opacity(0.1))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(isEditing ? Color.blue.opacity(0.5) : .clear, lineWidth: 1.5)
            )
            .animation(.easeInOut(duration: 0.2), value: isEditing)

            if isEditing {
                Button("Cancel") {
                    withAnimation {
                        text = ""
                        isFocused = false
                    }
                }
                .font(.subheadline)
                .transition(.move(edge: .trailing).combined(with: .opacity))
            }
        }
        .onChange(of: isFocused) { _, focused in
            withAnimation { isEditing = focused }
        }
    }
}

// MARK: - SegmentedControl

/// Custom segmented picker with a sliding background indicator.
struct SegmentedControl: View {
    let items: [String]
    @Binding var selectedIndex: Int

    @Namespace private var segmentNamespace

    var body: some View {
        HStack(spacing: 0) {
            ForEach(items.indices, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                        selectedIndex = index
                    }
                } label: {
                    Text(items[index])
                        .font(.subheadline.weight(selectedIndex == index ? .semibold : .regular))
                        .foregroundStyle(selectedIndex == index ? .primary : .secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(
                            ZStack {
                                if selectedIndex == index {
                                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                                        .fill(.background)
                                        .shadow(color: .black.opacity(0.06), radius: 4, y: 2)
                                        .matchedGeometryEffect(id: "segment", in: segmentNamespace)
                                }
                            }
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color.gray.opacity(0.1))
        )
    }
}

// MARK: - Previews

#Preview("Components Gallery") {
    ScrollView {
        VStack(spacing: 24) {
            GradientText(text: "Component Gallery")

            GradientButton(title: "Get Started", action: {})

            GradientButton(title: "Loading...", isLoading: true, action: {})

            GlassCard {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Glass Card").font(.headline)
                    Text("Beautiful frosted glass effect.").font(.subheadline).foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            HStack(spacing: 16) {
                AvatarView(size: 56, isOnline: true)
                AvatarView(size: 56, borderColor: .purple, badgeText: "3")
                AvatarView(size: 56, borderColor: .orange)
            }

            StatCard(
                icon: "dollarsign.circle.fill",
                iconColor: .green,
                value: "$12,450",
                label: "Revenue",
                trend: 12.5
            )

            FlowLayout(spacing: 8) {
                TagView(text: "SwiftUI", color: .blue)
                TagView(text: "iOS 17", color: .purple)
                TagView(text: "Design", color: .orange, onRemove: {})
                ChipView(text: "Selected", color: .green, isSelected: true)
                ChipView(text: "Default", color: .gray)
            }

            PreviewRatingRow()

            HStack(spacing: 20) {
                CircularProgress(progress: 0.75, progressColor: .blue)
                CircularProgress(progress: 0.45, progressColor: .orange)
            }

            PreviewToggleRow()

            HStack(spacing: 12) {
                SkeletonView(height: 60, cornerRadius: 12)
                VStack(spacing: 8) {
                    SkeletonView(width: 120, height: 14)
                    SkeletonView(width: 80, height: 14)
                }
            }

            StepIndicator(totalSteps: 4, currentStep: 2)

            PreviewSearchRow()

            PreviewSegmentRow()

            EmptyStateView(
                systemImage: "magnifyingglass",
                title: "No Results",
                message: "Try adjusting your search to find what you are looking for.",
                actionTitle: "Clear Search",
                action: {}
            )
        }
        .padding(16)
    }
}

// MARK: - Preview Helpers (stateful wrappers)

private struct PreviewRatingRow: View {
    @State private var rating = 3
    var body: some View {
        RatingView(rating: $rating)
    }
}

private struct PreviewToggleRow: View {
    @State private var isOn = true
    var body: some View {
        HStack {
            Text("Custom Toggle")
            Spacer()
            CustomToggle(isOn: $isOn)
        }
        .padding(.horizontal)
    }
}

private struct PreviewSearchRow: View {
    @State private var query = ""
    var body: some View {
        SearchBar(text: $query, placeholder: "Search components...")
    }
}

private struct PreviewSegmentRow: View {
    @State private var selected = 0
    var body: some View {
        SegmentedControl(items: ["All", "Active", "Archived"], selectedIndex: $selected)
    }
}
