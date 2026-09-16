# Opt-in issue inbox (not deployed)

A small Node 20+ service receives fixed failure categories and opens issues only
in `Nagarjuna2997/ios-agent-skill`. No user GitHub login is required. GitHub Pages
cannot run this service: deploy it behind HTTPS on a server you operate.

## Operator setup

1. Build the repository's MCP package (`npm ci --prefix mcp-server`, then
   `npm run build --prefix mcp-server`).
2. Provision a dedicated GitHub App installation credential or narrowly scoped
   token with Issues write permission on this repository only. Store it in the
   host's secret manager as `ISSUE_INBOX_GITHUB_TOKEN`, never in source, npm,
   browser code or user configuration. GitHub App tokens require external rotation.
3. Set `ISSUE_INBOX_STATE` to a file in a private persistent directory owned by
   the service account. Run **one instance**: the local store is not a distributed
   database. Missing/ephemeral storage resets limits and must not be used.
4. Run `node services/issue-inbox/server.mjs`. It binds loopback port 8787
   (or `PORT`). Put a trusted HTTPS reverse proxy in front of `/reports`, enforce
   request/body/connection limits, and disable request-body logging. Do not
   expose credentials through proxy errors. The service intentionally ignores
   forwarded-IP headers; behind a proxy all visitors may share one daily slot.
   Configure trusted client-IP handling and abuse controls at the deployment
   layer before expanding access; do not blindly trust X-Forwarded-For.
5. Test against an explicitly authorized test repository only after changing the
   hardcoded destination in a test deployment. The automated test uses a mock
   GitHub transport and creates no real issues.
6. Publish the real endpoint and operator privacy notice before inviting opt-in.
   Monitor failures without logging payloads or credentials. No endpoint is
   deployed or configured in this commit.

## Behavior and limits

- Strict enum payload and bounded semantic version; unknown fields rejected.
- Max 2 KB request body, max 16 pending requests, request/header timeouts.
- Persistent daily ceiling of 20 attempts, one attempt per network peer per day.
  IPs are stored as daily keyed hashes, not raw addresses; transport/proxy still
  sees IPs. Do not claim completely anonymous network communication.
- Search GitHub before filing; persist a category reservation before mutation so
  timeouts do not cause repeated issues. A failed/uncertain mutation may suppress
  a report until an operator reconciles that reservation. No automatic retries.
- Grouped reports are not verified bugs. No automatic fixes, merges, or execution
  of submitted content. Treat report content as untrusted.
- Local state stores counters/hashes/reservations, not app files or raw errors.
  The operator can delete old reservations during maintenance; retain current
  daily counters. Public GitHub issues follow GitHub's retention policies.
- This is deliberately conservative infrastructure, not a production abuse-proof
  public service. Limit anonymous ingress at the reverse proxy and monitor before
  widening access. A coordinated attacker can exhaust the daily quota.

Tests: `node --test services/issue-inbox/server.test.mjs`.
