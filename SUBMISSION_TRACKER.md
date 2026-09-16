# Submission tracker — iOS Agent Skill

Last verified: **2026-09-16**. This replaces the May preparation checklist with actual submission links and current outcomes. **Submitted does not mean accepted, merged or indexed.** No acceptance date, stars, forks or traffic increase is guaranteed.

Project: [Nagarjuna2997/ios-agent-skill](https://github.com/Nagarjuna2997/ios-agent-skill) · [Website](https://nagarjuna2997.github.io/ios-agent-skill/) · [npm](https://www.npmjs.com/package/ios-agent-mcp)

## Current project description

**iOS Agent Skill provides editable Swift source, Apple guides and a unified MCP connection for iOS development.** Published `ios-agent-mcp@2.5.1` includes 34 tools: 11 read-only Swift reviews, 8 Apple reference tools, 14 simulator tools and app scaffolding. Node.js 20+ is required; simulator operations require macOS/Xcode. No separate simulator installation or MCP connection is needed. The unified connection includes write and simulator operations; it is not entirely read-only.

The repository also includes a [Reading List demo](samples/ReadingList/README.md) with persistence, search, reading progress and error states, plus a [resumable app-building loop preview](docs/tooling/app-building-loop.md). The demo passed 3 unit tests and 2 simulator UI tests with six screenshot artifacts. The loop/MCP Node suite passed 147 tests. [GitHub CI passed for the loop commit](https://github.com/Nagarjuna2997/ios-agent-skill/actions/runs/35143498584).

**Keep the release distinction:** the loop is available from a source checkout, not npm 2.5.1. Real Claude planning/repair remains unverified because the development OAuth session expired. The deterministic repair fixture does not establish real-model performance. No API keys, credentials or local runtime logs are included in submissions.

## Original tracker targets

| Target | Verified status | Submission / next action |
|---|---|---|
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | **New PR submitted** | [PR #1920](https://github.com/ComposioHQ/awesome-claude-skills/pull/1920). Added one external Development & Code Tools entry. Its current CI requires README-only submissions, so the initial folder addition was removed. Current validation checks pass; await maintainer review. |
| [composio-community/awesome-codex-skills](https://github.com/composio-community/awesome-codex-skills) | **New PR submitted** | [PR #293](https://github.com/composio-community/awesome-codex-skills/pull/293). The old ComposioHQ URL now redirects to this owner. Added the skill and directory entry. Await maintainer review. |
| [PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) | **New PR submitted** | [PR #380](https://github.com/PatrickJS/awesome-cursorrules/pull/380). Added a scoped `.mdc` rule and Mobile Development entry. Current rules require `.mdc`, not the old proposed `.cursorrules` folder. Addressed reviewer feedback by requiring user opt-in before optional npm download/execution. Current rule/README/security checks pass. |
| [github/awesome-copilot](https://github.com/github/awesome-copilot) | **External plugin submitted** | [Issue #3228](https://github.com/github/awesome-copilot/issues/3228). Uses the current external-plugin issue form, not the obsolete proposed instructions PR against `staged`. Submitted an immutable SHA and version 1.0.0 of the [Copilot plugin](plugins/ios-agent-copilot/README.md). Automated Vally lint, install smoke test and version match **passed**; labeled **ready-for-review**. Non-blocking Agent Plugins 1.0 schema warnings remain because this uses the supported legacy manifest. Await maintainer decision. |
| [awesomeskills.dev](https://www.awesomeskills.dev/en/skill/nagarjuna2997-ios-agent-skill) | **Already indexed** | Submission form returned “This skill is already indexed” and linked this profile. No duplicate created. The form auto-detects repository metadata; no separate metadata-edit control was available in the submission flow. |
| [Skills Directory](https://www.skillsdirectory.com/submit) | **Blocked: sign-in** | Submission page currently requires GitHub sign-in. No successful submission receipt obtained. Owner login is needed before continuing. |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | **Previously closed without merge** | [PR #533](https://github.com/VoltAgent/awesome-agent-skills/pull/533) and [PR #555](https://github.com/VoltAgent/awesome-agent-skills/pull/555). No third duplicate submission made. Their [rules](https://github.com/VoltAgent/awesome-agent-skills/blob/main/CONTRIBUTING.md) require real community usage. Closures did not provide a specific reason; collect stronger user evidence or maintainer guidance before resubmitting. |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | **Manual-only under current rules** | The repository now has 33 stars, above their 10-star threshold, but their [contribution rules](https://github.com/travisvn/awesome-claude-skills/blob/main/CONTRIBUTING.md) still prohibit AI-assisted PR generation/submission. No AI-authored PR or ready-made submission copy supplied for that destination. |

## Existing MCP and Gemini submissions

| Target | Verified status | Latest action |
|---|---|---|
| [TensorBlock MCP Index](https://tensorblock.co/mcp/servers/github-nagarjuna2997-ios-agent-skill-5617d495) | **Original listing merged; metadata update pending** | Original [issue #2302](https://github.com/TensorBlock/awesome-mcp-servers/issues/2302) led to merged [PR #2303](https://github.com/TensorBlock/awesome-mcp-servers/pull/2303). Submitted [metadata correction #2448](https://github.com/TensorBlock/awesome-mcp-servers/issues/2448) for unified installation, Node.js 20+, tool count and write capabilities. Its automation created [draft PR #2449](https://github.com/TensorBlock/awesome-mcp-servers/pull/2449). The correction is not yet a deployed profile update. |
| [Piebald-AI/awesome-gemini-cli](https://github.com/Piebald-AI/awesome-gemini-cli) | **Accepted / merged** | [PR #121](https://github.com/Piebald-AI/awesome-gemini-cli/pull/121) is merged and the README contains the project. Existing concise entry remains accurate; no duplicate submitted. |
| [GetBindu/awesome-claude-code-and-skills](https://github.com/GetBindu/awesome-claude-code-and-skills) | **Existing PR updated** | [PR #204](https://github.com/GetBindu/awesome-claude-code-and-skills/pull/204). Updated its entry and body for unified tools and current requirements; documented demo evidence and the source-only loop limitation. Await review. |
| [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) | **Existing PR updated; Glama requirement unresolved** | [PR #14145](https://github.com/punkpeye/awesome-mcp-servers/pull/14145). Corrected entry/body for the unified server. Maintainer requires a claimed Glama listing with a quality score and score badge. No unverified badge added. |
| [MCP Bridge](https://github.com/stormlive-ai/mcp-bridge-docs/issues/7) | **Existing submission updated** | Updated issue #7 with npm 2.5.1, Node.js 20+, unified tools, demo evidence and source-preview limitations. Await directory review. |
| [Glama](https://glama.ai/mcp/servers) | **Blocked: sign-in / listing not confirmed** | Current browser session is signed out; Add Server opens sign-up/sign-in. Exact repository search did not return this project. Owner sign-in, claiming and quality assessment remain necessary for the punkpeye PR. |

## Other previously explored channels

These entries preserve earlier work; they are not new successful submissions in this refresh.

| Channel | Recorded status |
|---|---|
| [MCP.Directory](https://mcp.directory/submit) | Previous submission returned “Server Submitted!”; live publication has not been verified. Avoid submitting a duplicate until the existing receipt/listing is resolved. |
| [skills.sh](https://skills.sh/docs/faq) | The skill is discoverable with `npx skills add Nagarjuna2997/ios-agent-skill --list`. Install discovery is not evidence of a leaderboard listing. Do not generate artificial installs. |
| [PulseMCP](https://www.pulsemcp.com/submit) | Previously paused submissions. No new submission or current availability claim in this refresh. |
| [MCP.so](https://mcp.so/submit?type=server) | Previous form requested payment; no purchase authorized or made. |
| [Official MCP Registry](https://modelcontextprotocol.io/registry/quickstart) | Not submitted. Requires registry metadata/publisher authentication and a compatible npm release. This refresh did not publish another npm version. |

## Submission evidence and maintenance

- New submissions disclose AI assistance and link the source project. Descriptions distinguish the read-only review tools from write/simulator operations.
- Copilot submission pins commit `d444100` (full SHA in issue #3228), plugin version `1.0.0`, path `plugins/ios-agent-copilot`. Microsoft Vally passed both spec and reference checks. An isolated Copilot CLI install discovered one skill and the pinned MCP configuration. This is installation evidence, not a real-model app-building evaluation.
- Skill frontmatter was validated before submission. Cursor uses `alwaysApply: false` and Swift-specific globs. No fabricated compatibility, token-saving percentage, automatic app-completion promise or acceptance timeline was included.
- Search existing entries and all open/closed submissions before creating another PR. Respond to concrete maintainer feedback on the existing thread; do not bump every directory with repetitive promotional comments.
- Update this tracker only after verifying an outcome. A closed PR can mean merged or declined—check the merge status.
- Historical preparation text and obsolete inline patches remain available through this file's Git history. Do not reuse them: they contain superseded versions, paths and guarantees.
