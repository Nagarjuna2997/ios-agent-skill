import SwiftUI

struct SplitGallery: View {
    private let topics = ["Planning", "Design", "Build", "Review"]
    @State private var selection: String?

    var body: some View {
        NavigationSplitView {
            List(topics, id: \.self, selection: $selection) { topic in
                NavigationLink(topic, value: topic)
            }
            .navigationTitle("Topics")
        } detail: {
            if let selection {
                VStack(alignment: .leading, spacing: 12) {
                    Text(selection).font(.title.bold())
                    Text("The sidebar and detail adapt to the available space.")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .navigationTitle(selection)
            } else {
                ContentUnavailableView("Choose a topic", systemImage: "sidebar.left", description: Text("Select a topic from the list."))
            }
        }
    }
}

#Preview {
    SplitGallery()
}
