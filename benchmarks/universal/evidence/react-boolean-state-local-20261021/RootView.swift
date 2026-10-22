import SwiftUI

struct RootView: View {
    @State private var state_node_state_1 = false;
    @State private var state_node_state_2 = true;
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_3: CGFloat = 32
    var body: some View {
        ScrollView { node_node_1 }
        
    }

    private var node_node_3: some View {
        Text(verbatim: "Trip checklist")
        .font(.system(size: scaled_node_node_3, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-3")
    }

    private var node_node_5: some View {
        Text(verbatim: (state_node_state_1 ? "Pack ready" : "Packing incomplete"))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_6: some View {
        Button { state_node_state_1.toggle() } label: { Text(verbatim: "Toggle pack") }
        .buttonStyle(.bordered)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-6")
    }

    private var node_node_7: some View {
        Button { state_node_state_1 = true } label: { Text(verbatim: "Mark packed") }
        .buttonStyle(.bordered)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-7")
    }

    private var node_node_8: some View {
        Button { state_node_state_1 = false } label: { Text(verbatim: "Reset pack") }
        .buttonStyle(.bordered)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-8")
    }

    private var node_node_4: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_5
            node_node_6
            node_node_7
            node_node_8
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_node_10: some View {
        Text(verbatim: (state_node_state_2 ? "Reminder on" : "Reminder off"))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-10")
    }

    private var node_node_11: some View {
        Button { state_node_state_2.toggle() } label: { Text(verbatim: "Toggle reminder") }
        .buttonStyle(.bordered)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-11")
    }

    private var node_node_9: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_10
            node_node_11
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_node_2: some View {
        VStack(alignment: .leading, spacing: 16) {
            node_node_3
            node_node_4
            node_node_9
        }
        .foregroundStyle(Color(red: 0.0784313725490196, green: 0.12549019607843137, blue: 0.09019607843137255))
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 1, green: 1, blue: 1))
    }

    private var node_node_1: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_2
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}



#Preview { RootView() }
