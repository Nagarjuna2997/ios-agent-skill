# Photo picker

`PhotoPickerField` wraps SwiftUI's `PhotosPicker`. The picker runs out of process, so the app needs no photo library permission or usage string.

## Use

```swift
@State private var photo: UIImage?

PhotoPickerField(title: "Add photo", image: $photo)
```

## Rules

From [PhotosUI](../../docs/frameworks/photosui.md):

- Prefer `PhotosPicker` over requesting library access.
- Load the selection asynchronously and show progress; large photos take time.
- Downscale before storing or uploading.
