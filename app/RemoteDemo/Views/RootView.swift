import SwiftUI

struct RootView: View {
    var body: some View {
        ContentUnavailableView("RemoteDemo", systemImage: "hammer", description: Text("The agent replaces this view with the planned screens."))
    }
}

#Preview {
    RootView()
}
