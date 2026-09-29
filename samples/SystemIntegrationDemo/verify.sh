#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
xcrun --sdk iphonesimulator swiftc -typecheck -warnings-as-errors -swift-version 6 \
  -target arm64-apple-ios17.0-simulator -sdk "$(xcrun --sdk iphonesimulator --show-sdk-path)" \
  samples/SystemIntegrationDemo/Sources/*.swift
xcodebuild -project samples/SystemIntegrationDemo/SystemIntegrationDemo.xcodeproj \
  -target SystemIntegrationDemo -configuration Debug -sdk iphonesimulator \
  CODE_SIGNING_ALLOWED=NO build
