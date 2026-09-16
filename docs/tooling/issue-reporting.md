# AI-assisted issue previews

**Availability:** ios-agent-mcp 2.7.0 and later, with 36 unified tools.

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

The unified server appends troubleshooting guidance to returned unified tool errors, preserving the original diagnostic and structured result. The agent should explain the observed error, distinguish evidence from guesses, attempt a bounded fix within the approved task, and show the verification result. Compiler/test failures returned as successful tool calls and thrown transport errors are covered by agent instructions rather than this error-result decorator. Actual presentation depends on the coding client and agent following those instructions.

This feedback stays in the coding session, not in the generated app or the public website. Redact secrets before repeating diagnostics. It does not transmit additional details or confirm a GitHub submission. Repeated failures get local attention and public submission remains separately authorized. For an actionable public bug report, separately review and authorize a minimal synthetic reproduction; never attach private app code or raw logs automatically.
