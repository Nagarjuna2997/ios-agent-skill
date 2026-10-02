import SwiftUI

struct ProfileView: View {
    @Bindable var model: ProfileViewModel

    var body: some View {
        NavigationStack {
            Group {
                if model.isLoading {
                    ProgressView("Loading profile…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    form
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { model.save() }
                        .disabled(model.isLoading)
                }
            }
        }
        .task { model.load() }
    }

    private var form: some View {
        Form {
            Section {
                VStack(spacing: 12) {
                    avatar
                    PhotoPickerField(title: "Choose Photo", image: $model.image)
                    if model.image != nil {
                        Button("Remove Photo", role: .destructive) { model.removePhoto() }
                    }
                }
                .frame(maxWidth: .infinity)
            }
            Section("Details") {
                TextField("Name", text: $model.displayName)
                    .textContentType(.name)
                TextField("Bio", text: $model.bio, axis: .vertical)
                    .lineLimit(1...4)
            }
            Section("Preferences") {
                AppearancePicker()
            }
            if let message = model.errorMessage {
                Section {
                    Label(message, systemImage: "exclamationmark.triangle")
                        .foregroundStyle(.red)
                        .font(.footnote)
                }
            }
            if model.didSave {
                Section {
                    Label("Profile saved", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .font(.footnote)
                }
            }
        }
    }

    @ViewBuilder
    private var avatar: some View {
        if model.image == nil {
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 80))
                .foregroundStyle(.secondary)
                .accessibilityLabel("No profile photo")
        }
    }
}

#Preview {
    let container = PreviewSupport.container()
    ProfileView(model: PreviewSupport.profileViewModel(in: container))
        .modelContainer(container)
}
