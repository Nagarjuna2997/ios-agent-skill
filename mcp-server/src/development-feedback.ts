/** Local agent guidance only. Never receives a reporter or transmits diagnostics. */
export const DEVELOPMENT_FAILURE_GUIDANCE = `Developer workflow for this failed operation:
Explain the actual diagnostic above to the developer in their current coding session. Separate observed evidence from a suspected cause; do not treat an ordinary app bug as an ios-agent package bug.
State the smallest next check or fix within the approved task, run the relevant verification, then show what passed and what remains blocked. Keep retries bounded and preserve cancellation. Do not claim success without evidence.
Keep project-specific details in this session; do not put troubleshooting banners, reporting controls or maintainer branding into the app being built. Redact secrets from any explanation.
This tool result is not confirmation of a public report. Never upload source, paths, raw logs or exception text. Automatic reporting is not implemented. Use prepare_issue_report for a local preview; public reproduction steps require a separately reviewed, authorized submission.`;

export function withDevelopmentFeedback<T extends Record<string, unknown>>(result: T): T {
  if (result.isError !== true || !Array.isArray(result.content)) return result;
  return {...result, content:[...result.content, {type:'text', text:DEVELOPMENT_FAILURE_GUIDANCE}]};
}
