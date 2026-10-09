# Google Sign-In

Construct GoogleSession with the iOS client ID, use GoogleSignInButton, pass the current presenting view controller and forward .onOpenURL to handle. Register the reversed client ID URL scheme in the app spec before building. Validate tokens on your backend; userID is not server authentication. Check Apple login-services rules.

Verification compiles a minimal app; it does not test a production account, payment, database rules or OAuth configuration.
