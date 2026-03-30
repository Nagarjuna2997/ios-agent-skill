# Stunning UI Patterns -- Complete SwiftUI Pattern Library

## Overview

This file is a production-ready pattern library of 20 stunning UI components. Every example compiles, uses beautiful colors from the color palettes defined in `color-system.md`, and produces results worthy of a premium App Store feature. Copy, adapt, and compose these into world-class iOS applications.

All examples assume the `Color(hex:)` extension from `color-system.md` is available.

---

## 1. Glass Morphism Card

Frosted glass with a luminous border. Use over images or gradients for maximum effect.

```swift
import SwiftUI

struct GlassMorphismCard: View {
    var body: some View {
        ZStack {
            // Rich background
            LinearGradient(
                colors: [Color(hex: "6C63FF"), Color(hex: "EC4899"), Color(hex: "06B6D4")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "sparkles")
                        .font(.title2)
                        .foregroundStyle(.white)
                    Spacer()
                    Text("PRO")
                        .font(.caption.weight(.bold))
                        .kerning(1.5)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(.white.opacity(0.2), in: Capsule())
                }

                Text("Premium Plan")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white)

                Text("Unlock all features and get early access to new content every week.")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
                    .lineSpacing(4)

                HStack {
                    Text("$9.99/mo")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.white)
                    Spacer()
                    Text("Subscribe")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color(hex: "6C63FF"))
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(.white, in: Capsule())
                }
                .padding(.top, 8)
            }
            .padding(24)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24))
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.5), .white.opacity(0.05)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(color: .black.opacity(0.15), radius: 20, y: 10)
            .padding(24)
        }
    }
}
```

---

## 2. Neumorphic Card

Soft shadows creating the illusion of raised or inset elements on a flat surface.

```swift
struct NeumorphicCard: View {
    @State private var isPressed = false

    var body: some View {
        let bgColor = Color(hex: "E8EDF2")

        ZStack {
            bgColor.ignoresSafeArea()

            VStack(spacing: 32) {
                // Raised card
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "wifi")
                        .font(.title)
                        .foregroundStyle(Color(hex: "6C63FF"))
                    Text("Network Status")
                        .font(.headline)
                    Text("Connected -- 120 Mbps")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(24)
                .background(bgColor)
                .cornerRadius(20)
                .shadow(color: .white.opacity(0.7), radius: 10, x: -5, y: -5)
                .shadow(color: .black.opacity(0.15), radius: 10, x: 5, y: 5)

                // Inset / pressed style
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: "bolt.fill")
                        .font(.title)
                        .foregroundStyle(Color(hex: "F59E0B"))
                    Text("Quick Actions")
                        .font(.headline)
                    Text("Tap to toggle")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(24)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(bgColor)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(Color.black.opacity(0.05), lineWidth: 1)
                        )
                        .innerShadow(bgColor)
                )

                // Neumorphic button
                Button {
                    withAnimation(.spring(response: 0.3)) {
                        isPressed.toggle()
                    }
                } label: {
                    Image(systemName: "power")
                        .font(.title)
                        .foregroundStyle(isPressed ? Color(hex: "2D9F6F") : .gray)
                        .frame(width: 80, height: 80)
                        .background(bgColor)
                        .cornerRadius(40)
                        .shadow(
                            color: isPressed ? .clear : .white.opacity(0.7),
                            radius: isPressed ? 0 : 8, x: -4, y: -4
                        )
                        .shadow(
                            color: isPressed ? .clear : .black.opacity(0.15),
                            radius: isPressed ? 0 : 8, x: 4, y: 4
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 40)
                                .stroke(Color.black.opacity(isPressed ? 0.08 : 0), lineWidth: 1)
                        )
                }
            }
            .padding(24)
        }
    }
}

// Helper modifier for inner shadow
extension View {
    func innerShadow(_ bgColor: Color) -> some View {
        self.overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.black.opacity(0.08), lineWidth: 1)
                .shadow(color: .black.opacity(0.1), radius: 3, x: 2, y: 2)
                .clipShape(RoundedRectangle(cornerRadius: 20))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.5), lineWidth: 1)
                .shadow(color: .white.opacity(0.5), radius: 3, x: -2, y: -2)
                .clipShape(RoundedRectangle(cornerRadius: 20))
        )
    }
}
```

---

## 3. Gradient Card with Floating Shadow

The shadow color matches the card gradient, creating a luminous glow beneath.

```swift
struct GradientShadowCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.title2)
                Text("Revenue")
                    .font(.headline)
                Spacer()
                Text("+24.5%")
                    .font(.subheadline.weight(.bold))
            }
            .foregroundStyle(.white)

            Text("$48,290")
                .font(.system(size: 36, weight: .bold, design: .rounded))
                .foregroundStyle(.white)

            Text("Compared to $38,800 last month")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.7))
        }
        .padding(24)
        .background(
            LinearGradient(
                colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 20)
        )
        // Floating colored shadow
        .shadow(color: Color(hex: "6C63FF").opacity(0.4), radius: 20, y: 12)
        .padding(24)
    }
}
```

---

## 4. Animated Onboarding Screen

TabView with custom animated page indicators and fluid transitions.

```swift
struct OnboardingScreen: View {
    @State private var currentPage = 0

    let pages: [(icon: String, title: String, subtitle: String, colors: [Color])] = [
        ("sparkles", "Welcome", "Discover a new way to organize your life.", [Color(hex: "6C63FF"), Color(hex: "A78BFA")]),
        ("bolt.fill", "Lightning Fast", "Everything you need, instantly at your fingertips.", [Color(hex: "EC4899"), Color(hex: "F472B6")]),
        ("heart.fill", "Made with Love", "Crafted by a team that cares about every detail.", [Color(hex: "2D9F6F"), Color(hex: "22D3EE")]),
    ]

    var body: some View {
        ZStack {
            // Animated background gradient
            LinearGradient(
                colors: pages[currentPage].colors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            .animation(.easeInOut(duration: 0.6), value: currentPage)

            VStack(spacing: 0) {
                TabView(selection: $currentPage) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        VStack(spacing: 24) {
                            Image(systemName: pages[index].icon)
                                .font(.system(size: 80))
                                .foregroundStyle(.white)
                                .shadow(color: .white.opacity(0.3), radius: 20)

                            Text(pages[index].title)
                                .font(.largeTitle.weight(.bold))
                                .foregroundStyle(.white)

                            Text(pages[index].subtitle)
                                .font(.body)
                                .foregroundStyle(.white.opacity(0.8))
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 40)
                        }
                        .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                // Custom page indicator
                HStack(spacing: 10) {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Capsule()
                            .fill(.white.opacity(currentPage == index ? 1 : 0.4))
                            .frame(
                                width: currentPage == index ? 28 : 8,
                                height: 8
                            )
                            .animation(.spring(response: 0.4, dampingFraction: 0.7), value: currentPage)
                    }
                }
                .padding(.bottom, 32)

                // CTA button
                Button {
                    if currentPage < pages.count - 1 {
                        withAnimation { currentPage += 1 }
                    }
                } label: {
                    Text(currentPage == pages.count - 1 ? "Get Started" : "Continue")
                        .font(.headline)
                        .foregroundStyle(pages[currentPage].colors[0])
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
    }
}
```

---

## 5. Hero Image Header with Parallax Scroll

```swift
struct ParallaxHeroHeader: View {
    @State private var scrollOffset: CGFloat = 0

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                GeometryReader { geo in
                    let minY = geo.frame(in: .global).minY
                    ZStack(alignment: .bottomLeading) {
                        // Parallax image
                        Rectangle()
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "0A2463"), Color(hex: "1E88E5")],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .overlay(
                                Image(systemName: "mountain.2.fill")
                                    .resizable()
                                    .scaledToFit()
                                    .foregroundStyle(.white.opacity(0.15))
                                    .padding(40)
                            )
                            .offset(y: minY > 0 ? -minY * 0.5 : 0)

                        // Gradient overlay for text legibility
                        LinearGradient(
                            colors: [.clear, .black.opacity(0.6)],
                            startPoint: .top,
                            endPoint: .bottom
                        )

                        // Title content
                        VStack(alignment: .leading, spacing: 8) {
                            Text("EXPLORE")
                                .font(.caption.weight(.bold))
                                .kerning(2)
                                .foregroundStyle(.white.opacity(0.7))

                            Text("Mountains of\nSwiftUI")
                                .font(.largeTitle.weight(.bold))
                                .foregroundStyle(.white)
                        }
                        .padding(24)
                    }
                    .frame(height: max(350 + (minY > 0 ? minY : 0), 350))
                    .clipped()
                }
                .frame(height: 350)

                // Content below hero
                VStack(spacing: 16) {
                    ForEach(0..<10, id: \.self) { i in
                        HStack(spacing: 16) {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(hex: "1E88E5").opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Image(systemName: "photo")
                                        .foregroundStyle(Color(hex: "1E88E5"))
                                )
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Article \(i + 1)")
                                    .font(.headline)
                                Text("A beautiful description of this content piece.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }
                        .padding(16)
                        .background(Color(.secondarySystemGroupedBackground))
                        .cornerRadius(16)
                    }
                }
                .padding(16)
            }
        }
        .ignoresSafeArea(edges: .top)
    }
}
```

---

## 6. Bottom Sheet with Snap Points

```swift
struct BottomSheetDemo: View {
    @State private var sheetOffset: CGFloat = 500
    @GestureState private var dragOffset: CGFloat = 0

    private let snapPoints: [CGFloat] = [100, 350, 600]

    var body: some View {
        ZStack {
            Color(hex: "0B0B1A").ignoresSafeArea()

            VStack {
                Text("Drag the sheet up")
                    .foregroundStyle(.white)
                    .font(.headline)
            }

            // Sheet
            VStack(spacing: 0) {
                // Handle
                Capsule()
                    .fill(Color(.systemGray3))
                    .frame(width: 40, height: 5)
                    .padding(.top, 10)
                    .padding(.bottom, 16)

                // Sheet content
                VStack(alignment: .leading, spacing: 16) {
                    Text("Discover Nearby")
                        .font(.title2.weight(.bold))

                    ForEach(0..<5, id: \.self) { i in
                        HStack(spacing: 12) {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [Color(hex: "8B5CF6"), Color(hex: "EC4899")],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 44, height: 44)
                                .overlay(
                                    Image(systemName: "mappin")
                                        .foregroundStyle(.white)
                                )
                            VStack(alignment: .leading) {
                                Text("Location \(i + 1)")
                                    .font(.subheadline.weight(.semibold))
                                Text("\(Double.random(in: 0.1...5.0), specifier: "%.1f") km away")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.tertiary)
                        }
                    }
                }
                .padding(.horizontal, 24)

                Spacer()
            }
            .frame(maxWidth: .infinity)
            .background(Color(.systemBackground))
            .cornerRadius(24)
            .shadow(color: .black.opacity(0.2), radius: 20, y: -5)
            .offset(y: sheetOffset + dragOffset)
            .gesture(
                DragGesture()
                    .updating($dragOffset) { value, state, _ in
                        state = value.translation.height
                    }
                    .onEnded { value in
                        let projected = sheetOffset + value.translation.height
                        let nearest = snapPoints.min(by: {
                            abs($0 - projected) < abs($1 - projected)
                        }) ?? snapPoints[1]
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                            sheetOffset = nearest
                        }
                    }
            )
        }
    }
}
```

---

## 7. Animated Tab Bar

```swift
struct AnimatedTabBar: View {
    @State private var selectedTab = 0
    @Namespace private var tabAnimation

    let tabs: [(icon: String, label: String)] = [
        ("house.fill", "Home"),
        ("magnifyingglass", "Search"),
        ("plus.circle.fill", "Add"),
        ("heart.fill", "Saved"),
        ("person.fill", "Profile"),
    ]

    var body: some View {
        VStack {
            Spacer()
            Text("Tab \(selectedTab)")
                .font(.largeTitle.weight(.bold))
                .foregroundStyle(.primary)
            Spacer()

            // Tab bar
            HStack {
                ForEach(0..<tabs.count, id: \.self) { index in
                    Button {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                            selectedTab = index
                        }
                    } label: {
                        VStack(spacing: 4) {
                            ZStack {
                                if selectedTab == index {
                                    Capsule()
                                        .fill(Color(hex: "6C63FF").opacity(0.15))
                                        .frame(width: 56, height: 32)
                                        .matchedGeometryEffect(id: "tabBG", in: tabAnimation)
                                }

                                Image(systemName: tabs[index].icon)
                                    .font(.system(size: index == 2 ? 28 : 20))
                                    .foregroundStyle(
                                        selectedTab == index
                                            ? Color(hex: "6C63FF")
                                            : .gray
                                    )
                                    .scaleEffect(selectedTab == index ? 1.15 : 1.0)
                            }
                            .frame(height: 32)

                            Text(tabs[index].label)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundStyle(
                                    selectedTab == index
                                        ? Color(hex: "6C63FF")
                                        : .gray
                                )
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
            }
            .padding(.top, 8)
            .padding(.bottom, 4)
            .background(
                Rectangle()
                    .fill(.ultraThinMaterial)
                    .ignoresSafeArea(edges: .bottom)
            )
        }
    }
}
```

---

## 8. Profile Card

```swift
struct ProfileCard: View {
    var body: some View {
        VStack(spacing: 0) {
            // Gradient header
            ZStack(alignment: .bottom) {
                LinearGradient(
                    colors: [Color(hex: "8B5CF6"), Color(hex: "EC4899")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .frame(height: 140)

                // Avatar
                Circle()
                    .fill(Color(.systemBackground))
                    .frame(width: 88, height: 88)
                    .overlay(
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "6C63FF"), Color(hex: "A78BFA")],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 80, height: 80)
                            .overlay(
                                Text("JA")
                                    .font(.title.weight(.bold))
                                    .foregroundStyle(.white)
                            )
                    )
                    .offset(y: 44)
            }

            VStack(spacing: 12) {
                Text("Jane Appleseed")
                    .font(.title3.weight(.bold))
                    .padding(.top, 48)

                Text("Senior iOS Engineer")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                HStack(spacing: 32) {
                    statItem(value: "234", label: "Posts")
                    statItem(value: "12.4K", label: "Followers")
                    statItem(value: "891", label: "Following")
                }
                .padding(.top, 8)

                HStack(spacing: 12) {
                    Button {} label: {
                        Text("Follow")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color(hex: "6C63FF"), in: RoundedRectangle(cornerRadius: 12))
                    }

                    Button {} label: {
                        Text("Message")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color(hex: "6C63FF"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(Color(hex: "6C63FF").opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                    }
                }
                .padding(.top, 8)
            }
            .padding(24)
        }
        .background(Color(.systemBackground))
        .cornerRadius(24)
        .shadow(color: .black.opacity(0.1), radius: 16, y: 8)
        .padding(20)
    }

    func statItem(value: String, label: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.headline)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}
```

---

## 9. Dashboard Cards with Charts

```swift
struct CircularProgressCard: View {
    let progress: Double
    let title: String
    let subtitle: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.subheadline.weight(.semibold))
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()

                ZStack {
                    Circle()
                        .stroke(color.opacity(0.15), lineWidth: 6)
                    Circle()
                        .trim(from: 0, to: progress)
                        .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    Text("\(Int(progress * 100))%")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(color)
                }
                .frame(width: 48, height: 48)
            }

            // Mini bar chart
            HStack(alignment: .bottom, spacing: 4) {
                ForEach(0..<7, id: \.self) { _ in
                    let height = CGFloat.random(in: 12...40)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(color.opacity(Double.random(in: 0.3...1.0)))
                        .frame(height: height)
                }
            }
            .frame(height: 40)
        }
        .padding(20)
        .background(Color(.secondarySystemGroupedBackground))
        .cornerRadius(20)
    }
}

struct DashboardView: View {
    var body: some View {
        ScrollView {
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12),
            ], spacing: 12) {
                CircularProgressCard(
                    progress: 0.78,
                    title: "Steps",
                    subtitle: "7,800 / 10,000",
                    color: Color(hex: "2D9F6F")
                )
                CircularProgressCard(
                    progress: 0.45,
                    title: "Calories",
                    subtitle: "1,350 / 3,000",
                    color: Color(hex: "FF6B35")
                )
                CircularProgressCard(
                    progress: 0.92,
                    title: "Sleep",
                    subtitle: "7.4 / 8.0 hrs",
                    color: Color(hex: "8B5CF6")
                )
                CircularProgressCard(
                    progress: 0.60,
                    title: "Water",
                    subtitle: "1.8 / 3.0 L",
                    color: Color(hex: "0A6EBD")
                )
            }
            .padding(16)
        }
    }
}
```

---

## 10. Floating Action Button

```swift
struct FloatingActionButton: View {
    @State private var isExpanded = false

    let actions: [(icon: String, color: Color, label: String)] = [
        ("camera.fill", Color(hex: "EC4899"), "Photo"),
        ("doc.fill", Color(hex: "F59E0B"), "Document"),
        ("link", Color(hex: "0A6EBD"), "Link"),
    ]

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            Color.clear // Takes full space

            VStack(spacing: 12) {
                if isExpanded {
                    ForEach(Array(actions.enumerated()), id: \.offset) { index, action in
                        HStack(spacing: 12) {
                            Text(action.label)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(.primary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(.ultraThinMaterial, in: Capsule())

                            Button {} label: {
                                Image(systemName: action.icon)
                                    .font(.system(size: 18))
                                    .foregroundStyle(.white)
                                    .frame(width: 48, height: 48)
                                    .background(action.color, in: Circle())
                                    .shadow(color: action.color.opacity(0.3), radius: 8, y: 4)
                            }
                        }
                        .transition(.asymmetric(
                            insertion: .scale.combined(with: .opacity).combined(with: .offset(y: 20)),
                            removal: .scale.combined(with: .opacity)
                        ))
                    }
                }

                Button {
                    withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                        isExpanded.toggle()
                    }
                } label: {
                    Image(systemName: "plus")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.white)
                        .frame(width: 60, height: 60)
                        .background(
                            LinearGradient(
                                colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            in: Circle()
                        )
                        .shadow(color: Color(hex: "6C63FF").opacity(0.4), radius: 12, y: 6)
                        .rotationEffect(.degrees(isExpanded ? 45 : 0))
                }
            }
            .padding(24)
        }
    }
}
```

---

## 11. Custom Toggle with Animation

```swift
struct PremiumToggle: View {
    @Binding var isOn: Bool

    var body: some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                isOn.toggle()
            }
        } label: {
            ZStack(alignment: isOn ? .trailing : .leading) {
                Capsule()
                    .fill(
                        isOn
                            ? LinearGradient(
                                colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6")],
                                startPoint: .leading, endPoint: .trailing
                              )
                            : LinearGradient(
                                colors: [Color(hex: "E2E8F0"), Color(hex: "CBD5E1")],
                                startPoint: .leading, endPoint: .trailing
                              )
                    )
                    .frame(width: 56, height: 32)

                Circle()
                    .fill(.white)
                    .frame(width: 26, height: 26)
                    .shadow(color: .black.opacity(0.15), radius: 4, y: 2)
                    .padding(3)
            }
        }
        .buttonStyle(.plain)
    }
}

struct ToggleShowcase: View {
    @State private var darkMode = false
    @State private var notifications = true

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Label("Dark Mode", systemImage: "moon.fill")
                Spacer()
                PremiumToggle(isOn: $darkMode)
            }
            Divider()
            HStack {
                Label("Notifications", systemImage: "bell.fill")
                Spacer()
                PremiumToggle(isOn: $notifications)
            }
        }
        .padding(20)
        .background(Color(.secondarySystemGroupedBackground))
        .cornerRadius(16)
        .padding(20)
    }
}
```

---

## 12. Swipeable Card Stack

```swift
struct SwipeableCardStack: View {
    @State private var cards: [CardData] = [
        CardData(title: "Explore Tokyo", color: Color(hex: "6C63FF"), icon: "airplane"),
        CardData(title: "Visit Paris", color: Color(hex: "EC4899"), icon: "building.columns.fill"),
        CardData(title: "Surf Bali", color: Color(hex: "06B6D4"), icon: "water.waves"),
        CardData(title: "Hike Patagonia", color: Color(hex: "2D9F6F"), icon: "mountain.2.fill"),
        CardData(title: "Safari Kenya", color: Color(hex: "F59E0B"), icon: "leaf.fill"),
    ]

    struct CardData: Identifiable {
        let id = UUID()
        let title: String
        let color: Color
        let icon: String
    }

    var body: some View {
        ZStack {
            ForEach(Array(cards.enumerated().reversed()), id: \.element.id) { index, card in
                SwipeCard(card: card) {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                        cards.removeAll { $0.id == card.id }
                    }
                }
                .scaleEffect(1.0 - CGFloat(index) * 0.04)
                .offset(y: CGFloat(index) * 8)
                .allowsHitTesting(index == 0)
            }
        }
        .padding(32)
    }
}

struct SwipeCard: View {
    let card: SwipeableCardStack.CardData
    let onRemove: () -> Void

    @State private var offset: CGSize = .zero
    @State private var rotation: Double = 0

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: card.icon)
                .font(.system(size: 60))
                .foregroundStyle(.white)

            Text(card.title)
                .font(.title.weight(.bold))
                .foregroundStyle(.white)

            HStack(spacing: 40) {
                Image(systemName: "xmark")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white.opacity(offset.width < -20 ? 1 : 0.3))
                Image(systemName: "heart.fill")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white.opacity(offset.width > 20 ? 1 : 0.3))
            }
        }
        .frame(maxWidth: .infinity)
        .frame(height: 400)
        .background(
            LinearGradient(
                colors: [card.color, card.color.opacity(0.7)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            in: RoundedRectangle(cornerRadius: 24)
        )
        .shadow(color: card.color.opacity(0.3), radius: 16, y: 8)
        .offset(offset)
        .rotationEffect(.degrees(rotation))
        .gesture(
            DragGesture()
                .onChanged { value in
                    offset = value.translation
                    rotation = Double(value.translation.width / 20)
                }
                .onEnded { value in
                    if abs(value.translation.width) > 120 {
                        withAnimation(.easeOut(duration: 0.3)) {
                            offset = CGSize(
                                width: value.translation.width > 0 ? 500 : -500,
                                height: 0
                            )
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            onRemove()
                        }
                    } else {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) {
                            offset = .zero
                            rotation = 0
                        }
                    }
                }
        )
    }
}
```

---

## 13. Pull-to-Refresh with Custom Animation

```swift
struct CustomRefreshView: View {
    @State private var items = (1...20).map { "Item \($0)" }
    @State private var isRefreshing = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(items, id: \.self) { item in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [Color(hex: "6C63FF"), Color(hex: "A78BFA")],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 40, height: 40)
                            .overlay(
                                Image(systemName: "star.fill")
                                    .foregroundStyle(.white)
                                    .font(.caption)
                            )
                        Text(item)
                            .font(.body)
                    }
                    .padding(.vertical, 4)
                }
            }
            .refreshable {
                isRefreshing = true
                try? await Task.sleep(for: .seconds(2))
                items.shuffle()
                isRefreshing = false
            }
            .navigationTitle("Feed")
        }
    }
}
```

---

## 14. Skeleton Loading / Shimmer Effect

```swift
struct ShimmerEffect: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                LinearGradient(
                    stops: [
                        .init(color: .clear, location: phase - 0.2),
                        .init(color: .white.opacity(0.5), location: phase),
                        .init(color: .clear, location: phase + 0.2),
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .mask(content)
            )
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1.2
                }
            }
    }
}

extension View {
    func shimmer() -> some View {
        modifier(ShimmerEffect())
    }
}

struct SkeletonLoadingCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Avatar + name skeleton
            HStack(spacing: 12) {
                Circle()
                    .fill(Color(.systemGray5))
                    .frame(width: 44, height: 44)

                VStack(alignment: .leading, spacing: 6) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(.systemGray5))
                        .frame(width: 120, height: 14)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(.systemGray5))
                        .frame(width: 80, height: 10)
                }
            }

            // Image placeholder
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray5))
                .frame(height: 180)

            // Text lines
            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
                .frame(height: 14)

            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
                .frame(width: 250, height: 14)

            RoundedRectangle(cornerRadius: 4)
                .fill(Color(.systemGray5))
                .frame(width: 180, height: 14)
        }
        .padding(16)
        .shimmer()
    }
}

struct SkeletonDemo: View {
    @State private var isLoading = true

    var body: some View {
        VStack {
            if isLoading {
                SkeletonLoadingCard()
                SkeletonLoadingCard()
            } else {
                Text("Content loaded!")
                    .font(.title)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                withAnimation { isLoading = false }
            }
        }
    }
}
```

---

## 15. Toast / Snackbar Notification

```swift
struct ToastModifier: ViewModifier {
    @Binding var isShowing: Bool
    let message: String
    let icon: String
    let color: Color

    func body(content: Content) -> some View {
        ZStack(alignment: .top) {
            content

            if isShowing {
                HStack(spacing: 12) {
                    Image(systemName: icon)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(.white)

                    Text(message)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.white)

                    Spacer()

                    Button {
                        withAnimation(.spring(response: 0.3)) { isShowing = false }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }
                .padding(16)
                .background(color, in: RoundedRectangle(cornerRadius: 14))
                .shadow(color: color.opacity(0.3), radius: 12, y: 6)
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .transition(.move(edge: .top).combined(with: .opacity))
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        withAnimation(.spring(response: 0.3)) { isShowing = false }
                    }
                }
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: isShowing)
    }
}

extension View {
    func toast(isShowing: Binding<Bool>, message: String, icon: String = "checkmark.circle.fill", color: Color = Color(hex: "2D9F6F")) -> some View {
        modifier(ToastModifier(isShowing: isShowing, message: message, icon: icon, color: color))
    }
}

struct ToastDemo: View {
    @State private var showSuccess = false
    @State private var showError = false

    var body: some View {
        VStack(spacing: 16) {
            Button("Show Success") {
                showSuccess = true
            }
            .buttonStyle(.borderedProminent)

            Button("Show Error") {
                showError = true
            }
            .buttonStyle(.bordered)
        }
        .toast(isShowing: $showSuccess, message: "Saved successfully!")
        .toast(isShowing: $showError, message: "Something went wrong.", icon: "exclamationmark.circle.fill", color: Color(hex: "DC2626"))
    }
}
```

---

## 16. Expandable Card with matchedGeometryEffect

```swift
struct ExpandableCardDemo: View {
    @Namespace private var animation
    @State private var selectedCard: Int? = nil

    let cards = [
        (title: "Design", icon: "paintbrush.fill", color: Color(hex: "8B5CF6")),
        (title: "Develop", icon: "chevron.left.forwardslash.chevron.right", color: Color(hex: "0A6EBD")),
        (title: "Deploy", icon: "rocket.fill", color: Color(hex: "2D9F6F")),
    ]

    var body: some View {
        ZStack {
            // Grid of collapsed cards
            if selectedCard == nil {
                VStack(spacing: 12) {
                    ForEach(0..<cards.count, id: \.self) { index in
                        let card = cards[index]
                        HStack(spacing: 16) {
                            Image(systemName: card.icon)
                                .font(.title2)
                                .foregroundStyle(.white)
                                .frame(width: 48, height: 48)
                                .background(card.color, in: RoundedRectangle(cornerRadius: 12))
                                .matchedGeometryEffect(id: "icon\(index)", in: animation)

                            Text(card.title)
                                .font(.headline)
                                .matchedGeometryEffect(id: "title\(index)", in: animation)

                            Spacer()

                            Image(systemName: "chevron.right")
                                .foregroundStyle(.tertiary)
                        }
                        .padding(16)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color(.secondarySystemGroupedBackground))
                                .matchedGeometryEffect(id: "bg\(index)", in: animation)
                        )
                        .onTapGesture {
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                                selectedCard = index
                            }
                        }
                    }
                }
                .padding(16)
            }

            // Expanded card
            if let selected = selectedCard {
                let card = cards[selected]
                VStack(spacing: 20) {
                    HStack {
                        Button {
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                                selectedCard = nil
                            }
                        } label: {
                            Image(systemName: "xmark")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                                .frame(width: 36, height: 36)
                                .background(.ultraThinMaterial, in: Circle())
                        }
                        Spacer()
                    }

                    Image(systemName: card.icon)
                        .font(.system(size: 48))
                        .foregroundStyle(.white)
                        .frame(width: 96, height: 96)
                        .background(card.color, in: RoundedRectangle(cornerRadius: 24))
                        .matchedGeometryEffect(id: "icon\(selected)", in: animation)

                    Text(card.title)
                        .font(.largeTitle.weight(.bold))
                        .matchedGeometryEffect(id: "title\(selected)", in: animation)

                    Text("This is the expanded view for the \(card.title) card. Here you can place detailed content, forms, or any additional UI elements.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 20)

                    Spacer()
                }
                .padding(24)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 24)
                        .fill(Color(.secondarySystemGroupedBackground))
                        .matchedGeometryEffect(id: "bg\(selected)", in: animation)
                        .ignoresSafeArea()
                )
            }
        }
    }
}
```

---

## 17. Animated Gradient Background

```swift
struct AnimatedGradientBackground: View {
    @State private var animateGradient = false

    var body: some View {
        LinearGradient(
            colors: [
                Color(hex: "6C63FF"),
                Color(hex: "EC4899"),
                Color(hex: "06B6D4"),
                Color(hex: "8B5CF6"),
            ],
            startPoint: animateGradient ? .topLeading : .bottomLeading,
            endPoint: animateGradient ? .bottomTrailing : .topTrailing
        )
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 5).repeatForever(autoreverses: true)) {
                animateGradient.toggle()
            }
        }
        .overlay(
            VStack(spacing: 16) {
                Text("Welcome Back")
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(.white)
                Text("Your animated gradient background")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.8))
            }
        )
    }
}
```

---

## 18. Blurred Header that Changes on Scroll

```swift
struct BlurredScrollHeader: View {
    @State private var scrollOffset: CGFloat = 0
    private let headerTitle = "Discover"

    var body: some View {
        ZStack(alignment: .top) {
            ScrollView {
                VStack(spacing: 0) {
                    // Spacer for the header
                    Color.clear.frame(height: 100)

                    // Content
                    LazyVStack(spacing: 12) {
                        ForEach(0..<25, id: \.self) { i in
                            HStack(spacing: 12) {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                Color(hex: "6C63FF").opacity(Double(i % 5 + 1) / 5.0),
                                                Color(hex: "EC4899").opacity(Double(i % 5 + 1) / 5.0),
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 56, height: 56)
                                    .overlay(
                                        Image(systemName: "music.note")
                                            .foregroundStyle(.white)
                                    )
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Track \(i + 1)")
                                        .font(.headline)
                                    Text("Artist Name")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text("3:4\(i % 10)")
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                        }
                    }
                }
                .background(
                    GeometryReader { geo in
                        Color.clear.preference(
                            key: ScrollOffsetKey.self,
                            value: geo.frame(in: .named("scroll")).minY
                        )
                    }
                )
            }
            .coordinateSpace(name: "scroll")
            .onPreferenceChange(ScrollOffsetKey.self) { value in
                scrollOffset = value
            }

            // Floating header
            VStack(spacing: 0) {
                HStack {
                    Text(headerTitle)
                        .font(scrollOffset < -20 ? .headline : .largeTitle.weight(.bold))
                        .animation(.easeInOut(duration: 0.2), value: scrollOffset < -20)
                    Spacer()
                    Image(systemName: "magnifyingglass")
                        .font(.title3)
                        .foregroundStyle(.primary)
                }
                .padding(.horizontal, 16)
                .padding(.top, 56)
                .padding(.bottom, 12)
                .background(
                    Rectangle()
                        .fill(.ultraThinMaterial)
                        .opacity(scrollOffset < -10 ? 1 : 0)
                        .ignoresSafeArea(edges: .top)
                )
            }
        }
    }
}

struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
```

---

## 19. Chip / Tag Flow Layout

```swift
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: ProposedViewSize(result.sizes[index])
            )
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> LayoutResult {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var sizes: [CGSize] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            sizes.append(size)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return LayoutResult(
            size: CGSize(width: maxWidth, height: y + rowHeight),
            positions: positions,
            sizes: sizes
        )
    }

    struct LayoutResult {
        var size: CGSize
        var positions: [CGPoint]
        var sizes: [CGSize]
    }
}

struct ChipView: View {
    let label: String
    let color: Color
    @State private var isSelected = false

    var body: some View {
        Button {
            withAnimation(.spring(response: 0.3)) {
                isSelected.toggle()
            }
        } label: {
            Text(label)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(isSelected ? .white : color)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(
                    isSelected ? AnyShapeStyle(color) : AnyShapeStyle(color.opacity(0.1)),
                    in: Capsule()
                )
                .overlay(
                    Capsule()
                        .stroke(color.opacity(isSelected ? 0 : 0.3), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }
}

struct ChipFlowDemo: View {
    let tags = [
        ("SwiftUI", Color(hex: "6C63FF")),
        ("iOS 18", Color(hex: "EC4899")),
        ("Design", Color(hex: "2D9F6F")),
        ("Animation", Color(hex: "FF6B35")),
        ("Accessibility", Color(hex: "0A6EBD")),
        ("Performance", Color(hex: "8B5CF6")),
        ("Dark Mode", Color(hex: "1E1B4B")),
        ("Typography", Color(hex: "F59E0B")),
        ("Color System", Color(hex: "06B6D4")),
        ("Layout", Color(hex: "DC2626")),
    ]

    var body: some View {
        FlowLayout(spacing: 8) {
            ForEach(tags, id: \.0) { tag in
                ChipView(label: tag.0, color: tag.1)
            }
        }
        .padding(20)
    }
}
```

---

## 20. Rating Stars Component

```swift
struct RatingStars: View {
    @Binding var rating: Int
    let maxRating: Int
    let starSize: CGFloat
    let activeColor: Color
    let inactiveColor: Color

    init(
        rating: Binding<Int>,
        maxRating: Int = 5,
        starSize: CGFloat = 28,
        activeColor: Color = Color(hex: "F59E0B"),
        inactiveColor: Color = Color(hex: "E2E8F0")
    ) {
        self._rating = rating
        self.maxRating = maxRating
        self.starSize = starSize
        self.activeColor = activeColor
        self.inactiveColor = inactiveColor
    }

    var body: some View {
        HStack(spacing: 6) {
            ForEach(1...maxRating, id: \.self) { index in
                Image(systemName: index <= rating ? "star.fill" : "star")
                    .font(.system(size: starSize))
                    .foregroundStyle(index <= rating ? activeColor : inactiveColor)
                    .symbolEffect(.bounce, value: rating)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                            rating = index
                        }
                    }
            }
        }
    }
}

struct RatingDemo: View {
    @State private var rating1 = 3
    @State private var rating2 = 4

    var body: some View {
        VStack(spacing: 32) {
            VStack(spacing: 8) {
                Text("Rate your experience")
                    .font(.headline)
                RatingStars(rating: $rating1)
                Text("\(rating1) out of 5")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 8) {
                Text("Custom style")
                    .font(.headline)
                RatingStars(
                    rating: $rating2,
                    starSize: 36,
                    activeColor: Color(hex: "EC4899"),
                    inactiveColor: Color(hex: "FCE7F3")
                )
            }
        }
        .padding(24)
    }
}
```

---

## Bonus: Combining Patterns -- Premium App Screen

A full composition showing how multiple patterns work together.

```swift
struct PremiumHomeScreen: View {
    @State private var selectedTab = 0
    @State private var showToast = false

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    // Hero gradient header
                    ZStack(alignment: .bottomLeading) {
                        LinearGradient(
                            colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6"), Color(hex: "EC4899")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        .frame(height: 220)
                        .cornerRadius(24)

                        VStack(alignment: .leading, spacing: 8) {
                            Text("Good Morning")
                                .font(.subheadline)
                                .foregroundStyle(.white.opacity(0.8))
                            Text("Jane")
                                .font(.largeTitle.weight(.bold))
                                .foregroundStyle(.white)
                        }
                        .padding(24)
                    }
                    .padding(.horizontal, 16)

                    // Chip tags
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(["All", "Design", "Code", "Health", "Finance"], id: \.self) { tag in
                                Text(tag)
                                    .font(.subheadline.weight(.medium))
                                    .foregroundStyle(tag == "All" ? .white : .primary)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(
                                        tag == "All"
                                            ? AnyShapeStyle(Color(hex: "6C63FF"))
                                            : AnyShapeStyle(Color(.secondarySystemGroupedBackground)),
                                        in: Capsule()
                                    )
                            }
                        }
                        .padding(.horizontal, 16)
                    }

                    // Dashboard grid
                    LazyVGrid(columns: [
                        GridItem(.flexible(), spacing: 12),
                        GridItem(.flexible(), spacing: 12),
                    ], spacing: 12) {
                        CircularProgressCard(
                            progress: 0.72,
                            title: "Tasks",
                            subtitle: "18 / 25",
                            color: Color(hex: "6C63FF")
                        )
                        CircularProgressCard(
                            progress: 0.45,
                            title: "Goals",
                            subtitle: "3 / 7",
                            color: Color(hex: "2D9F6F")
                        )
                    }
                    .padding(.horizontal, 16)

                    // Glass card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "sparkles")
                                .foregroundStyle(Color(hex: "F59E0B"))
                            Text("Featured")
                                .font(.headline)
                            Spacer()
                            Text("NEW")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color(hex: "EC4899"), in: Capsule())
                        }
                        Text("Unlock premium features and take your productivity to the next level.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)

                        Button {
                            showToast = true
                        } label: {
                            Text("Upgrade Now")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(
                                    LinearGradient(
                                        colors: [Color(hex: "6C63FF"), Color(hex: "8B5CF6")],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    ),
                                    in: RoundedRectangle(cornerRadius: 12)
                                )
                        }
                    }
                    .padding(20)
                    .background(Color(.secondarySystemGroupedBackground))
                    .cornerRadius(20)
                    .padding(.horizontal, 16)

                    // Bottom spacing for tab bar
                    Color.clear.frame(height: 80)
                }
            }
        }
        .toast(isShowing: $showToast, message: "Welcome to Premium!")
    }
}
```

---

## Quick Reference

| Pattern                    | Key Techniques                                      |
|----------------------------|-----------------------------------------------------|
| Glass Morphism             | `.ultraThinMaterial`, gradient border stroke         |
| Neumorphism                | Dual shadows (light + dark), same-as-background fill|
| Gradient Shadow            | Shadow color matching card gradient                  |
| Onboarding                 | `TabView(.page)`, custom indicators, `matchedGeometryEffect` |
| Parallax Hero              | `GeometryReader`, offset based on `minY`            |
| Bottom Sheet               | `DragGesture`, snap points, spring animation        |
| Animated Tab Bar           | `matchedGeometryEffect`, `@Namespace`               |
| Profile Card               | Gradient header, overlapping avatar, stat row        |
| Dashboard Cards            | `Circle().trim()`, mini bar charts                  |
| FAB                        | Expand/collapse with spring, rotation               |
| Custom Toggle              | `ZStack` alignment toggle, spring animation         |
| Swipe Cards                | `DragGesture`, rotation, threshold-based removal    |
| Pull-to-Refresh            | `.refreshable` async modifier                       |
| Skeleton/Shimmer           | `ViewModifier`, animated `LinearGradient` overlay   |
| Toast                      | `ViewModifier`, auto-dismiss, slide transition      |
| Expandable Card            | `matchedGeometryEffect`, `@Namespace`               |
| Animated Gradient          | `repeatForever` animation on gradient points        |
| Blurred Scroll Header      | `PreferenceKey`, `.ultraThinMaterial` opacity        |
| Chip Flow Layout           | Custom `Layout` protocol, `Capsule` backgrounds     |
| Rating Stars               | `symbolEffect(.bounce)`, tap gesture                |
