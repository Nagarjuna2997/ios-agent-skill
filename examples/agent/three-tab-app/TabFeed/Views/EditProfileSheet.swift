import SwiftUI

/// Form layout for editing the profile photo, name and bio.
struct EditProfileSheet: View {
    @Bindable var model: ProfileViewModel

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(spacing: AppTheme.Space.medium) {
                        ProfileAvatarView(image: model.draftImage, initials: model.draftInitials, size: 96)
                        PhotoPickerField(title: "Choose Photo", image: $model.draftImage)
                        if model.draftImage != nil {
                            Button("Remove Photo", role: .destructive) { model.removeDraftPhoto() }
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
                Section("Details") {
                    TextField("Name", text: $model.draftName)
                        .textContentType(.name)
                    TextField("Bio", text: $model.draftBio, axis: .vertical)
                        .lineLimit(1...4)
                }
                if let message = model.draftError {
                    Section {
                        Label(message, systemImage: "exclamationmark.triangle")
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { model.cancelEditing() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { model.save() }
                }
            }
        }
        .fontDesign(AppTheme.fontDesign)
    }
}

#Preview {
    let container = PreviewSupport.seededContainer()
    EditProfileSheet(model: PreviewSupport.editingProfileViewModel(in: container))
        .modelContainer(container)
}
