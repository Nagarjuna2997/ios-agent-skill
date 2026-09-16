# Private feedback receiver — not deployed

A single-instance Node 20+ backend for the source-only `private_feedback` MCP tool.
The target `Nagarjuna2997/ios-agent-issues` is private. Repository creation is complete;
HTTPS hosting and a dedicated server-side credential are still required. GitHub Pages
cannot run this service. No user GitHub login is required after the service is deployed.
Do not advertise this as live or put credentials in npm, the site, or an AI chat.

## Operator setup

1. Deploy a maintained Node service behind HTTPS. Build the repository's MCP package
   (`npm ci --prefix mcp-server && npm run build --prefix mcp-server`). The receiver
   reuses its strict local category validator. Keep the service and MCP source from
   the same commit; npm 2.7.0 does not include the private feedback client.
2. Create a GitHub App or narrowly scoped credential with metadata read and Issues
   write access only to the private inbox. Store it as the backend secret
   `PRIVATE_FEEDBACK_GITHUB_TOKEN`. Short-lived App tokens need an operator-managed
   refresh process; this prototype does not mint them. Never reuse developer tokens
   in public clients. The receiver refuses public or inaccessible repositories.
3. Set `PRIVATE_FEEDBACK_STATE` to a persistent file path in an existing private
   directory. Back it up, and run exactly one process against it. It contains daily
   counters, salted peer hashes and category receipts, not raw IPs or diagnostics.
4. Run `node services/private-feedback/server.mjs`. It binds `127.0.0.1:8787`
   (override `PORT` if needed). Forward only HTTPS `POST /reports`; keep request/access
   logs disabled or minimized, enforce a 2 KB body limit and add provider abuse controls.
   The receiver trusts no forwarded-IP headers. Behind a proxy, the conservative
   five-attempt daily peer quota is shared by all traffic from that proxy. Configure
   authenticated edge rate limits before considering a larger public deployment.
5. Publish the operator identity, hosting/access-log policy, retention and deletion
   contact before inviting users. GitHub issues remain until the operator deletes
   them; local deduplication reservations expire after 30 days, which does not delete
   issues. Document collaborator access and repository visibility changes honestly.
6. Test with synthetic categories and the destination's privacy check, then configure
   users' source MCP servers with `IOS_AGENT_PRIVATE_FEEDBACK_URL=https://YOUR-HOST/reports`.
   Do not point them at a placeholder or claim successful deployment from unit tests.

The receiver accepts only fixed categories and package version. It returns an opaque
receipt, never issue URLs, issue content or credentials. No public fallback, browsing
inbox or arbitrary message field exists. Twenty attempts/day globally and five per
peer/day cap abuse; duplicate categories are recorded once per 30-day window. Failed
or uncertain GitHub writes reserve the category and require operator investigation;
they are never returned as confirmed duplicates. Stop ingress while investigating.
A lost local state file can allow duplicates. Multi-instance hosting needs a transactional
shared store before deployment. Privacy checks cannot prevent an administrator from
later changing repository visibility; do not describe private issues as secret forever.

```sh
node --test services/private-feedback/server.test.mjs
```

Tests use mocked GitHub responses and synthetic categories. They do not send real reports.
