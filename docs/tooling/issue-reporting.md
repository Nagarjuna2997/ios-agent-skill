# AI-assisted issue previews

**Availability:** source build; pending the next npm release. The source server
has 36 tools; previously published builds have 35.

When an iOS Agent operation fails, the AI can prepare a report using
`prepare_issue_report`. Report problems with this package, not ordinary errors
in the user's app. A preview is not a diagnosis or proof of a package bug.

Example MCP arguments:

```json
{
  "feature": "asset-generation",
  "symptom": "invalid-output",
  "client": "claude",
  "platform": "macos",
  "reproducibility": "repeated"
}
```

1. Explain the observed package problem and show the complete local preview.
2. Ask before opening the duplicate-search link. It checks a category grouping
   key; broader searches may find related reports with different categories.
3. If the user wants to submit, open the prefilled GitHub link. They can add
   synthetic reproduction steps, review the public content and submit after
   signing in. An AI with separate GitHub access still needs explicit permission
   to submit on the user's behalf.
4. Respect dismissal. Never create repeat reports or background submissions.

The tool takes fixed enums only. Unknown fields and arbitrary text are rejected.
It does not read files, environment variables, project names or machine identity;
collect logs; open URLs; write a report file; or send network requests. It returns
package version, selected categories, a non-user-specific grouping key, preview
text and URLs. Missing client/platform values stay `unknown`.

Opening the URLs sends the fixed fields to GitHub. Submitting creates a public
issue. The grouping key only aids search: this tool does not search remotely,
assert that duplicates are absent, or suppress duplicates automatically.

There is no login-free reporting backend, telemetry, token embedded in npm,
scheduled reporting or automatic code repair. A future opt-in service would need
separate deployment, secure credentials, abuse controls and a clear privacy
policy. Never add private app code, logs, credentials or signing information to
GitHub's form. Security vulnerabilities belong in the repository's security
reporting channel rather than a public issue.
