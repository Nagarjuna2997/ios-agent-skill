# Firebase authentication

Configure FirebaseEmailSession at the composition root with your own GoogleService-Info.plist. Handle missing configuration visibly; use fake services for sample data. Enable email/password in Firebase. Account deletion may require reauthentication. Never embed admin credentials.

Verification compiles a minimal app; it does not test a production account, payment, database rules or OAuth configuration.
