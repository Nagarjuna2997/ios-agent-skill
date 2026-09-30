# Installed Xcode documentation resources

Local inspection: September 29, 2026. Xcode Developer Documentation is an Apple-managed local resource, separate from this repository's original guides and examples.

## Verified local snapshot

- `xcodebuild -version`: Xcode 27.0, build `27A266a`.
- The local Apple MobileAsset catalog lists documentation build `10M13950` for Xcode 27.0 and macOS 27.0, with an unarchived size of 1,731,604,480 bytes.
- Installed asset metadata identifies Xcode 27.0 and OS 27.0. The installed `Info.plist` does not itself expose `10M13950`; the catalog and Xcode Components UI supply that build identifier.
- The asset contains `AssetData/config.json`, `documentation-cache` and `documentation-db`. Configuration identifies a read-only vector-search database.

This verifies a local installation and catalog, not that every Apple article or later SDK release is present. It does not prove an Xcode MCP documentation query succeeded.

## Find and inspect the archive on a Mac

In Xcode, open Settings > Components > Developer Documentation to see the installed version and manage downloads. To locate the underlying asset without changing it:

```sh
xcode-select -p
xcodebuild -version
ls /System/Library/AssetsV2/com_apple_MobileAsset_AppleDeveloperDocumentation/
```

Under that directory, look for an installed `*.asset` folder. Its name is machine/version-specific; do not hardcode the asset hash in an app or MCP configuration. `Info.plist` contains installation metadata; `AssetData/config.json` describes the database. Read metadata with `plutil -p` or open the configuration in an editor. Use Xcode's documentation browser for the actual documentation.

The MobileAsset location and database layout are inspected implementation details, not a supported stable parsing API. Do not modify the system asset, copy it into GitHub/npm, or assume this repository's local-reference tools search it. Current local-reference tools search the repository's bundled library. Xcode documentation tools are a separate client integration; discover the tools exposed by the installed Xcode version and verify a query before claiming integration.

## Keep repository guidance current

```text
Installed documentation version + Apple release notes
  -> select affected guide / symbol
  -> verify availability and behavior against the selected SDK
  -> update original guidance and regression fixtures
  -> rebuild the local reference index
  -> report verified changes and remaining gaps
```

Refresh the release-note directory with `python3 scripts/sync-apple-updates.py`; it retrieves landing-page topic maps, not every article body. After guide changes run `node scripts/index-local-library.mjs --write` and its `--check` variant. The snapshot date applies to fetched entries, not every document in the repository. Preserve historical build/test evidence rather than replacing old toolchain versions with the newly installed version.

For UI templates and Figma provenance, see [Apple design resources](../design/apple-design-resources.md). For separate Xcode agent configuration, see [Xcode agent workflows](xcode-27-agents.md).
