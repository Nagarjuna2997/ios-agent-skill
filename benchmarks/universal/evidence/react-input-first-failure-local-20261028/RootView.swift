import SwiftUI

struct RootView: View {
    @State private var state_node_state_1 = "";
    @State private var state_node_state_2 = "River walk";
    @State private var state_node_state_3 = true;
    @ScaledMetric(relativeTo: .body) private var scaled_node_node_3: CGFloat = 32
    var body: some View {
        ScrollView { node_node_1 }
        
    }

    private var node_node_3: some View {
        Text(verbatim: "Plan your walk")
        .font(.system(size: scaled_node_node_3, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-3")
    }

    private var node_node_4: some View {
        TextField("", text: $state_node_state_1, prompt: Text(verbatim: "Enter your name"))
        .accessibilityLabel(Text(verbatim: "Your name"))
        .textFieldStyle(.roundedBorder)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-4")
    }

    private var node_node_5: some View {
        Text(verbatim: collapsedInputText(state_node_state_1))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_9: some View {
        TextField("", text: $state_node_state_2, prompt: Text(verbatim: ""))
        .accessibilityLabel(Text(verbatim: "Destination"))
        .textFieldStyle(.roundedBorder)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-9")
    }

    private var node_node_10: some View {
        Text(verbatim: collapsedInputText(state_node_state_2))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-10")
    }

    private var node_node_8: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_9
            node_node_10
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder private var node_node_6: some View {
        if state_node_state_3 {
            node_node_8
        } else {
            EmptyView()
        }
    }

    private var node_node_11: some View {
        Button { state_node_state_3.toggle() } label: { Text(verbatim: "Show or hide destination") }
        .buttonStyle(.bordered)
        .frame(minHeight: 44)
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-11")
    }

    private var node_node_2: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_3
            node_node_4
            node_node_5
            node_node_6
            node_node_11
        }
        .padding(24)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var node_node_1: some View {
        VStack(alignment: .leading, spacing: 12) {
            node_node_2
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}


private func collapsedInputText(_ value: String) -> String {
    value.split(whereSeparator: { [" ", "\t", "\n", "\r", "\u{c}"].contains(String($0)) }).joined(separator: " ")
}


#Preview { RootView() }
