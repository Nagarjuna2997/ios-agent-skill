# Security policy

Report suspected vulnerabilities privately through [GitHub security advisories](https://github.com/Nagarjuna2997/ios-agent-skill/security/advisories/new). Include affected versions, a minimal reproduction and impact. Do not attach credentials, personal data or proprietary project source. Avoid public issues for undisclosed vulnerabilities.

Security fixes target the latest npm release and current main branch. Older releases have no guaranteed backports. Response and remediation timing depends on maintainer availability; no service-level commitment is implied.

Review/reference tools read local project content; the default server also includes app creation and simulator operations that write files and run Xcode. Builds may fetch dependencies. Model providers may receive tool outputs through your chosen client. Review that client’s permissions and data settings, and grant access only to the intended project. Local screenshot previews use loopback with access tokens; do not expose them publicly.
