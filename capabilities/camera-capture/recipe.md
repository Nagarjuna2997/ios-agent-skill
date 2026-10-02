# Camera photo capture

`CameraCaptureButton` presents the system camera (`UIImagePickerController` with the camera source) and returns the photo. It needs `NSCameraUsageDescription`, which the manifest adds.

## Use

```swift
@State private var photo: UIImage?

CameraCaptureButton(image: $photo)
PhotoPickerField(title: "Choose from library", image: $photo)   // photos-picker
```

## Rules

From [AVFoundation](../../docs/frameworks/avfoundation.md):

- The Simulator has no camera; test capture on a device.
- Explain the camera use in the purpose string; the system asks once.
- Use AVCaptureSession only when the system interface is not enough.
