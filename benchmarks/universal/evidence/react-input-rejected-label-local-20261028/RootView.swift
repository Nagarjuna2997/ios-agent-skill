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
        TextField(text: $state_node_state_1, prompt: Text(verbatim: "Enter your name")) { Text(verbatim: "Your name") }
        .textFieldStyle(ImportedTextFieldStyle())
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-4")
    }

    private var node_node_5: some View {
        Text(verbatim: collapsedInputText(state_node_state_1))
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityIdentifier("node-5")
    }

    private var node_node_9: some View {
        TextField(text: $state_node_state_2, prompt: Text(verbatim: "")) { Text(verbatim: "Destination") }
        .textFieldStyle(ImportedTextFieldStyle())
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
        Button { state_node_state_3.toggle() } label: { Text(verbatim: "Show or hide destination").frame(minHeight: 44) }
        .buttonStyle(.plain)
        .frame(minHeight: 44)
        .foregroundStyle(Color(red: 0.06666666666666667, green: 0.06666666666666667, blue: 0.06666666666666667))
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.9333333333333333, green: 0.9333333333333333, blue: 0.9333333333333333))
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


private struct ImportedTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .textFieldStyle(.plain)
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
            .frame(minHeight: 44)
            .background(Color(uiColor: .secondarySystemBackground), in: RoundedRectangle(cornerRadius: 8))
    }
}

private func collapsedInputText(_ value: String) -> String {
    value.split(whereSeparator: { [" ", "\t", "\n", "\r", "\u{c}"].contains(String($0)) }).joined(separator: " ")
}


#Preview { RootView() }
