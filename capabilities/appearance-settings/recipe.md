# Appearance setting

Lets the user choose System, Light or Dark and applies it with `preferredColorScheme` at the root of the app.

## Use

```swift
WindowGroup {
    RootView()
        .appAppearance()
}

Form {
    Section("Appearance") {
        AppearancePicker()
    }
}
```

`DarkModeToggle()` is a single switch for apps whose brief asks for a dark mode toggle; turning it off selects Light.

## Rules

- Apply the modifier once, at the root; nested `preferredColorScheme` calls fight each other.
- Use semantic colors and asset colors with dark variants ([dark mode colors](../../docs/design/dark-mode-colors.md)); never hardcode white text on a fixed background.
- The preference is plain UI state in `@AppStorage` ([state and data flow](../../docs/swiftui/state-and-data-flow.md)); it is not a secret and needs no Keychain.
