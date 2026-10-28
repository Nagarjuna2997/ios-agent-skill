# Rejected intrinsic-height diagnostic — 2026-10-28

Isolated generated-project experiment only. Added `.font(.body)` and
`.fixedSize(horizontal: false, vertical: true)` to the native field style.
Production generator unchanged. Xcode 27.0 / iOS 27 / iPhone 18 Pro, light, Large.
The selected accessibility test built and ran: 0 passed, 1 failed (Text clipped).
No other native tests ran; no fidelity result or baseline promotion. Candidate rejected.

The temporary shell wrapper encountered a read-only `status` variable after
xcodebuild finished. The xcresult and full test log independently record the
failure; attachments were exported manually afterward. The owned simulator was
deleted by cleanup. Original xcresult remains under
`/tmp/universal-input-intrinsic-height-20261028/result.xcresult`. Video omitted.
