# Development and releases

Run `scripts/hooks/verify-repo.sh` and `node scripts/index-local-library.mjs --check` from the repository root. If reference content changed, regenerate the index with `node scripts/index-local-library.mjs --write`.

For each package (`mcp-server`, `cli`, `ios-simulator-mcp`), run `npm ci`, `npm run typecheck`, `npm run build`, and `npm test` in its directory. On macOS run `swift test` in `samples/AppleRecipes` and `samples/SkillPatterns`; run `python3 verify.py` in `samples/ReadingList` for simulator acceptance.

Edit `SKILL.md` and run `scripts/sync-mirrors.sh` to regenerate agent entry points. The framework catalog has a separate generated check: `node scripts/check-framework-catalog.mjs`.

Repository releases and npm package versions are separate. Update `CHANGELOG.md`, pass checks, push a version tag, and inspect the Release workflow and its assets. npm publishing runs locally using `npm publish --access public` in the package directory; security-key approval may be required. Never store npm tokens in this repo or logs.

For the official MCP Registry, see [registry publication](mcp/registry.md). A committed manifest is not an accepted registry listing.
