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

1. Report only significant missing/incorrect guidance or a blocking package failure.
   Minor warnings and normal bugs in the generated app do not belong here.
2. Show the complete category-only preview and say the GitHub issue will be public.
3. If the developer requested reporting for this issue or enabled opening major-issue
   drafts for this session, the AI opens the prefilled `submissionUrl` through its
   client's browser capability. Otherwise ask before opening. If browser access is
   unavailable, display the link. Never claim the tool itself launches a browser.
4. The developer reviews the draft, signs into GitHub if needed, and clicks Submit.
   Opening the draft does not submit it. No automatic submission or private backend
   is needed. Do not open repeat drafts after dismissal or for the same failure.

The source also supports `missing-guidance` and `incorrect-guidance` symptoms;
these additions are pending the next npm release. Use `feature: "local-references"`
for knowledge gaps. Disclose missing knowledge and label any outside research as
external, rather than attributing it to this repository.

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

## Private feedback from the AI chat — source preview only

The source adds `private_feedback` as a 37th tool. It is not in npm 2.7.0 and the
receiver is not deployed. Without `IOS_AGENT_PRIVATE_FEEDBACK_URL`, it returns
`not-configured` and sends nothing. There is no automatic public fallback.

Once an operator deploys the receiver, the user does not need a GitHub account:

1. The AI calls `private_feedback` with `action: "preview"` and a `report` containing
   the same fixed categories shown above. No raw errors, logs, app source or names.
2. Show the complete payload, destination and privacy notice in chat. Ask whether
   to send it privately; declining must not interrupt development or cause repeated prompts.
3. Only after explicit approval, call it with `action: "submit"`, the returned
   `previewId`, and `userApproved: true`. Approval expires after 15 minutes and is
   consumed on the first attempt. The AI must never assert approval on its own.
4. Tell the user whether the receiver confirmed it. An unknown/network result is
   not success; do not retry silently. No issue URL or private issue content is returned.

Example preview arguments:

```json
{"action":"preview","report":{"feature":"simulator","symptom":"timeout","client":"claude"}}
```

Only the category fields and package version leave the device. The hosting provider
sees the request IP and may retain access logs; repository collaborators and GitHub
can access reports. Private repository access is not end-to-end encryption. Category
reports show patterns, not enough detail to prove or fix every bug. Any detailed
reproduction needs a separately approved privacy review.

The receiver rechecks that its fixed destination is private before every submission,
reserves uncertain requests against duplication, and applies bounded limits. It cannot
independently prove that an AI obtained consent; client instructions and the coding
client’s tool-approval controls remain important. There is no background failure hook
or automatic report on every tool call. See the [operator setup](../../services/private-feedback/README.md).
