import SwiftUI

struct RootView: View {
    @State private var expanded_node_node_12 = false;
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_4: CGFloat = 14
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_5: CGFloat = 36
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_6: CGFloat = 18
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_8: CGFloat = 14
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_9: CGFloat = 28
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_10: CGFloat = 18
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_11: CGFloat = 16
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_14: CGFloat = 14
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_1: CGFloat = 17
    var body: some View {
        ScrollView { node_node_1 }
        .background(Color(red: 0.9568627450980393, green: 0.9450980392156862, blue: 0.9215686274509803).ignoresSafeArea())
    }

    private var node_node_4: some View {
        Text(verbatim: "FIELD NOTES · WEEKEND EDITION")
        .font(.system(size: scaled_node_node_4, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-4")
    }

    private var node_node_5: some View {
        Text(verbatim: "A little closer to nature.")
        .font(.system(size: scaled_node_node_5, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_6: some View {
        Text(verbatim: "Three quiet trails, one good weekend. Your next walk starts here.")
        .font(.system(size: scaled_node_node_6, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-6")
    }

    private var node_node_3: some View {
        VStack(alignment: .leading, spacing: 8) {
            node_node_4
            node_node_5
            node_node_6
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-3")
    }

    private var node_node_8: some View {
        Text(verbatim: "THIS WEEK'S WALK")
        .font(.system(size: scaled_node_node_8, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-8")
    }

    private var node_node_9: some View {
        Text(verbatim: "Cedar Loop")
        .font(.system(size: scaled_node_node_9, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-9")
    }

    private var node_node_10: some View {
        Text(verbatim: "4.2 miles · Easy · 90 minutes")
        .font(.system(size: scaled_node_node_10, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-10")
    }

    private var node_node_11: some View {
        Text(verbatim: "A shaded path through tall cedars, with a quiet river stop halfway.")
        .font(.system(size: scaled_node_node_11, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-11")
    }

    private var node_node_7: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_8
            node_node_9
            node_node_10
            node_node_11
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.8666666666666667, green: 0.9098039215686274, blue: 0.8392156862745098))
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .accessibilityIdentifier("node-7")
    }

    private var node_node_13: some View {
        Text(verbatim: "Bring water, comfortable shoes, and a light jacket.")
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-13")
    }

    private var node_node_12: some View {
        DisclosureGroup(isExpanded: $expanded_node_node_12) {
            node_node_13
        } label: { Text(verbatim: "Before you go") }
        .disclosureGroupStyle(ImportedDisclosureStyle())
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 1, green: 1, blue: 1))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .accessibilityIdentifier("node-12")
    }

    private var node_node_14: some View {
        Text(verbatim: "Synthetic demo content. No account or location permission needed.")
        .font(.system(size: scaled_node_node_14, weight: .regular))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-14")
    }

    private var node_node_2: some View {
        VStack(alignment: .leading, spacing: 24) {
            node_node_3
            node_node_7
            node_node_12
            node_node_14
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-2")
    }

    private var node_node_1: some View {
        VStack(alignment: .leading, spacing: 24) {
            node_node_2
        }
        .font(.system(size: scaled_node_node_1, weight: .regular))
        .foregroundStyle(Color(red: 0.1411764705882353, green: 0.23921568627450981, blue: 0.20784313725490197))
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9568627450980393, green: 0.9450980392156862, blue: 0.9215686274509803))
        .accessibilityIdentifier("node-1")
    }
}


private struct ImportedDisclosureStyle: DisclosureGroupStyle {
    func makeBody(configuration: Configuration) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Button {
                configuration.isExpanded.toggle()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "play.fill")
                        .font(.caption)
                        .rotationEffect(.degrees(configuration.isExpanded ? 90 : 0))
                        .accessibilityHidden(true)
                    configuration.label
                }
                .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityValue(configuration.isExpanded ? "Expanded" : "Collapsed")
            if configuration.isExpanded { configuration.content }
        }
    }
}

#Preview { RootView() }
