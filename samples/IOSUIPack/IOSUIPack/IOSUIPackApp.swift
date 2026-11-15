import SwiftUI

@main
struct IOSUIPackApp: App {
    var body: some Scene {
        WindowGroup {
            GalleryRoot()
        }
    }
}

struct GalleryRoot: View {
    var body: some View {
        TabView {
            ControlsGallery()
                .tabItem { Label("Controls", systemImage: "slider.horizontal.3") }
            FormGallery()
                .tabItem { Label("Forms", systemImage: "square.and.pencil") }
            NavigationGallery()
                .tabItem { Label("Lists", systemImage: "list.bullet") }
            StatesGallery()
                .tabItem { Label("States", systemImage: "circle.lefthalf.filled") }
            SplitGallery()
                .tabItem { Label("Adaptive", systemImage: "sidebar.left") }
        }
    }
}

#Preview {
    GalleryRoot()
}
