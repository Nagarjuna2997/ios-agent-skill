# AWS Amplify in a Swift app

Amplify fits teams already operating Cognito, AppSync, S3 and Lambda with explicit cloud ownership. It is less suitable when IAM, multiple auth modes and deployment configuration would exceed the team's operational capacity.

## Install and environment

Use `https://github.com/aws-amplify/amplify-swift` and the documented products/plugins for Auth, API and Storage. Pin the SDK. Initialize plugins and configure once in the composition root before repositories issue work. Match generated backend configuration to the environment and SDK generation; do not combine an old amplifyconfiguration.json recipe with new outputs without following the migration guide.

Cognito Auth handles user-pool sessions and supported social/hosted UI flows. Configure redirect sign-in/sign-out URLs and native provider identifiers; use the documented web authentication session integration. Inspect credential persistence and never store AWS secret access keys in the app. Temporary identity credentials and server IAM permissions are different from hardcoded administrator keys.

## Data, files and functions

AppSync/GraphQL needs a deliberate authorization mode: Cognito, IAM, API key or other configured identity paths have different access boundaries. A client API key is not user authorization. Generated models and schema belong in reviewed source/code-generation workflows. Keep UI code behind repositories instead of exposing generated network types everywhere.

S3 Storage requires prefix/object authorization, upload cancellation and cleanup. Invoke Lambda/serverless integrations through authenticated APIs with server validation; never ship deployment credentials. Push support is product/provider-specific: confirm the currently supported AWS integration and APNs setup instead of assuming an installed Auth plugin delivers notifications.

## Recovery and production

GraphQL cache behavior and DataStore synchronization are distinct; do not claim all Amplify API requests have automatic offline replay. Choose a local cache/outbox with conflict rules, cursor pagination and idempotent writes. Own async tasks/listeners, preserve cancellation and avoid multiplying retries already performed by an SDK. Reconcile on foreground; iOS background execution is bounded.

Test configuration selection, auth restoration/revocation, cross-user denial, upload progress/cancel, subscription recovery and schema evolution. Use dependency injection for offline tests and an isolated AWS environment for separately authorized integration tests. No deployment or Amplify SDK compilation occurred in this change. Follow [privacy](privacy.md) for Cognito identities, cloud files, telemetry and deletion across services.

Primary sources: [Amplify Swift](https://docs.amplify.aws/swift/start/), [Auth](https://docs.amplify.aws/swift/frontend/auth/), [Data API](https://docs.amplify.aws/swift/frontend/data/connect-to-API/).
