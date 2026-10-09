# Firebase Firestore

Inject a configured Firestore instance into FirestoreDocuments<Row>. Configure FirebaseCore once before constructing it. Use authenticated per-user paths and restrictive Firestore rules, tested with the emulator; a client wrapper does not deploy or prove security rules. Use synthetic in-memory services in previews.

Verification compiles a minimal app; it does not test a production account, payment, database rules or OAuth configuration.
