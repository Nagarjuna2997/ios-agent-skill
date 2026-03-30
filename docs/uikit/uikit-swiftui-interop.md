# UIKit and SwiftUI Interoperability

## UIViewRepresentable — Wrapping UIKit Views for SwiftUI

```swift
import SwiftUI
import UIKit

// Wrap a UITextView with placeholder support
struct PlaceholderTextView: UIViewRepresentable {
    @Binding var text: String
    var placeholder: String = "Enter text..."

    func makeUIView(context: Context) -> UITextView {
        let textView = UITextView()
        textView.font = .preferredFont(forTextStyle: .body)
        textView.delegate = context.coordinator
        textView.backgroundColor = .secondarySystemBackground
        textView.layer.cornerRadius = 8
        return textView
    }

    func updateUIView(_ uiView: UITextView, context: Context) {
        if text.isEmpty && !uiView.isFirstResponder {
            uiView.text = placeholder
            uiView.textColor = .placeholderText
        } else if uiView.textColor == .placeholderText && !text.isEmpty {
            uiView.text = text
            uiView.textColor = .label
        } else if uiView.text != text && uiView.textColor != .placeholderText {
            uiView.text = text
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UITextViewDelegate {
        var parent: PlaceholderTextView

        init(_ parent: PlaceholderTextView) {
            self.parent = parent
        }

        func textViewDidBeginEditing(_ textView: UITextView) {
            if textView.textColor == .placeholderText {
                textView.text = ""
                textView.textColor = .label
            }
        }

        func textViewDidEndEditing(_ textView: UITextView) {
            if textView.text.isEmpty {
                textView.text = parent.placeholder
                textView.textColor = .placeholderText
            }
        }

        func textViewDidChange(_ textView: UITextView) {
            parent.text = textView.text
        }
    }
}

// Usage in SwiftUI
struct NoteView: View {
    @State private var noteText = ""

    var body: some View {
        VStack {
            PlaceholderTextView(text: $noteText, placeholder: "Write your note...")
                .frame(height: 200)
                .padding()
        }
    }
}
```

## UIViewRepresentable — Wrapping MKMapView

```swift
import SwiftUI
import MapKit

struct MapViewWrapper: UIViewRepresentable {
    @Binding var region: MKCoordinateRegion
    var annotations: [MKPointAnnotation]

    func makeUIView(context: Context) -> MKMapView {
        let mapView = MKMapView()
        mapView.delegate = context.coordinator
        mapView.showsUserLocation = true
        return mapView
    }

    func updateUIView(_ uiView: MKMapView, context: Context) {
        uiView.setRegion(region, animated: true)

        uiView.removeAnnotations(uiView.annotations)
        uiView.addAnnotations(annotations)
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, MKMapViewDelegate {
        var parent: MapViewWrapper

        init(_ parent: MapViewWrapper) {
            self.parent = parent
        }

        func mapView(_ mapView: MKMapView, regionDidChangeAnimated animated: Bool) {
            parent.region = mapView.region
        }

        func mapView(_ mapView: MKMapView, viewFor annotation: MKAnnotation) -> MKAnnotationView? {
            guard !(annotation is MKUserLocation) else { return nil }
            let view = MKMarkerAnnotationView(annotation: annotation, reuseIdentifier: "pin")
            view.canShowCallout = true
            return view
        }
    }
}
```

## UIViewControllerRepresentable — Wrapping UIKit View Controllers

```swift
// Wrap UIImagePickerController for SwiftUI
struct ImagePicker: UIViewControllerRepresentable {
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedImage: UIImage?
    var sourceType: UIImagePickerController.SourceType = .photoLibrary

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = sourceType
        picker.delegate = context.coordinator
        picker.allowsEditing = true
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker

        init(_ parent: ImagePicker) {
            self.parent = parent
        }

        func imagePickerController(
            _ picker: UIImagePickerController,
            didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
        ) {
            if let edited = info[.editedImage] as? UIImage {
                parent.selectedImage = edited
            } else if let original = info[.originalImage] as? UIImage {
                parent.selectedImage = original
            }
            parent.dismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
}

// Usage
struct ProfileEditorView: View {
    @State private var showPicker = false
    @State private var avatar: UIImage?

    var body: some View {
        VStack {
            if let avatar {
                Image(uiImage: avatar)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 120, height: 120)
                    .clipShape(Circle())
            }
            Button("Choose Photo") { showPicker = true }
        }
        .sheet(isPresented: $showPicker) {
            ImagePicker(selectedImage: $avatar)
        }
    }
}
```

## Wrapping a Document Picker

```swift
struct DocumentPicker: UIViewControllerRepresentable {
    @Binding var selectedURL: URL?
    var contentTypes: [UTType] = [.pdf, .plainText]

    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: contentTypes)
        picker.delegate = context.coordinator
        picker.allowsMultipleSelection = false
        return picker
    }

    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: DocumentPicker

        init(_ parent: DocumentPicker) {
            self.parent = parent
        }

        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            parent.selectedURL = urls.first
        }
    }
}
```

## UIHostingController — Embedding SwiftUI in UIKit

```swift
// Embed a SwiftUI view inside a UIKit view controller
class SettingsViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Settings"

        let swiftUIView = SettingsContentView(
            onLogout: { [weak self] in
                self?.handleLogout()
            }
        )

        let hostingController = UIHostingController(rootView: swiftUIView)
        addChild(hostingController)
        view.addSubview(hostingController.view)

        hostingController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            hostingController.view.topAnchor.constraint(equalTo: view.topAnchor),
            hostingController.view.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            hostingController.view.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            hostingController.view.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
        hostingController.didMove(toParent: self)
    }

    private func handleLogout() {
        navigationController?.popToRootViewController(animated: true)
    }
}

struct SettingsContentView: View {
    var onLogout: () -> Void

    var body: some View {
        List {
            Section("Account") {
                NavigationLink("Profile") { Text("Profile") }
                NavigationLink("Privacy") { Text("Privacy") }
            }
            Section {
                Button("Log Out", role: .destructive, action: onLogout)
            }
        }
    }
}
```

## Embedding SwiftUI in UITableViewCell

```swift
class SwiftUITableViewCell: UITableViewCell {

    private var hostingController: UIHostingController<AnyView>?

    func configure<Content: View>(with view: Content, parent: UIViewController) {
        // Remove existing hosting controller
        hostingController?.view.removeFromSuperview()
        hostingController?.removeFromParent()

        let hosting = UIHostingController(rootView: AnyView(view))
        hosting.view.backgroundColor = .clear
        hosting.view.translatesAutoresizingMaskIntoConstraints = false

        parent.addChild(hosting)
        contentView.addSubview(hosting.view)

        NSLayoutConstraint.activate([
            hosting.view.topAnchor.constraint(equalTo: contentView.topAnchor),
            hosting.view.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            hosting.view.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            hosting.view.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
        ])
        hosting.didMove(toParent: parent)
        hostingController = hosting
    }
}
```

## Data Flow Between UIKit and SwiftUI

```swift
// Observable object shared between UIKit and SwiftUI
@Observable
class AppState {
    var username: String = ""
    var isLoggedIn: Bool = false
    var cartItems: [CartItem] = []
}

// UIKit side: pass the shared state
class MainTabController: UITabBarController {
    let appState = AppState()

    override func viewDidLoad() {
        super.viewDidLoad()

        // UIKit tab
        let profileVC = UIKitProfileViewController(appState: appState)

        // SwiftUI tab embedded via UIHostingController
        let cartView = CartView(appState: appState)
        let cartVC = UIHostingController(rootView: cartView)
        cartVC.tabBarItem = UITabBarItem(title: "Cart", image: UIImage(systemName: "cart"), tag: 1)

        viewControllers = [profileVC, cartVC]
    }
}

// SwiftUI side: use the shared state
struct CartView: View {
    @Bindable var appState: AppState

    var body: some View {
        NavigationStack {
            List(appState.cartItems) { item in
                Text(item.name)
            }
            .navigationTitle("Cart (\(appState.cartItems.count))")
        }
    }
}

// UIKit side: observe changes
class UIKitProfileViewController: UIViewController {
    let appState: AppState

    init(appState: AppState) {
        self.appState = appState
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError() }
}
```
