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

## Local developer feedback on every failed step

Source builds append troubleshooting guidance to returned unified tool errors, preserving the original diagnostic and structured result. The agent should explain the observed error, distinguish evidence from guesses, attempt a bounded fix within the approved task, and show the verification result. Compiler/test failures returned as successful tool calls and thrown transport errors are covered by agent instructions rather than this error-result decorator. Actual presentation depends on the coding client and agent following those instructions.

This feedback stays in the coding session, not in the generated app or the public website. Redact secrets before repeating diagnostics. It does not transmit additional details or confirm a GitHub submission. Repeated failures get local attention while public reporting keeps duplicate and rate controls. For an actionable public bug report, separately review and authorize a minimal synthetic reproduction; never attach private app code or raw logs automatically.

## Automatic mode: one-time opt-in (source only)

The source now includes an optional client and [receiving service](../../services/issue-inbox/README.md).
The service is **not deployed**, so automatic submission is not live. Once its
operator publishes an HTTPS endpoint and privacy notice, a user can enable it:

```sh
ios-agent-mcp reporting enable --endpoint https://YOUR-REPORTING-HOST/reports
ios-agent-mcp reporting status
ios-agent-mcp reporting disable
```

The endpoint above is a placeholder. Enabling is a one-time explicit consent to
send fixed package-failure categories, package version and platform, potentially
as public GitHub issues. The host receives the network IP. AI agents must explain
this before enabling and must never enable it without user authorization. After
opt-in, no form or per-report approval is needed. Disable stops future reporting;
it does not delete previous issues.

Only error results from the unified MCP's supported review, reference, simulator
and app-starter tools trigger it. Ordinary review findings, user-app compile
errors reported as successful tool results, standalone CLI failures and the local
preview itself do not trigger reports. Raw tool arguments, outputs, exceptions,
source, paths and credentials are never passed to the reporter. Categories are
coarse, so maintainers may still need a synthetic reproduction to diagnose a bug.

Client settings are stored outside the app under `~/.config/ios-agent/`. Reporting
is off by default. The client attempts a category at most once per day per package
version; it reserves before sending, uses a three-second timeout, rejects redirects
and never interrupts the user's build on reporting failure. The single-instance
service applies persistent attempt limits and duplicate reservations. Multiple
client processes may race locally; the service remains the submission gate.

Reports appear in [GitHub Issues](https://github.com/Nagarjuna2997/ios-agent-skill/issues).
There is no automatic code repair or daily publishing. Never include security
vulnerabilities in public reports: use the repository's private security channel.
