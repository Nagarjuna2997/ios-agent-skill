import { createHash } from 'node:crypto';
import { z } from 'zod';
import { VERSION } from './version.js';

const features = ['installation', 'swift-review', 'local-references', 'app-starter', 'asset-generation', 'simulator', 'app-loop', 'client-connection'] as const;
const symptoms = ['unexpected-error', 'timeout', 'incorrect-result', 'missing-result', 'invalid-output', 'documentation-mismatch', 'missing-guidance', 'incorrect-guidance'] as const;
const clients = ['claude', 'chatgpt-codex', 'gemini-cli', 'muse', 'unknown'] as const;
const platforms = ['macos', 'linux', 'windows', 'unknown'] as const;
const repeats = ['once', 'repeated', 'unknown'] as const;
export const issueReportSchema = z.object({
  feature: z.enum(features), symptom: z.enum(symptoms),
  client: z.enum(clients).default('unknown'), platform: z.enum(platforms).default('unknown'),
  reproducibility: z.enum(repeats).default('unknown'),
}).strict();

export const issueReportTool = {
  name: 'prepare_issue_report',
  description: 'Prepare a LOCAL issue preview for a significant ios-agent-mcp knowledge gap, incorrect guidance or blocking package failure, not a minor warning or defect in the user app. Accepts fixed categories only, never source, logs, paths or credentials. Makes no network requests or submissions. Show the complete preview and public destination. If the user has requested GitHub reporting for this issue or enabled opening major-issue drafts in this session, use the client browser capability to open submissionUrl; otherwise ask first. The user reviews and clicks Submit on GitHub. Never submit automatically. GitHub sign-in is required to submit. Do not repeatedly suggest a report after dismissal.',
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: { type: 'object' as const, properties: {
    feature: { type: 'string', enum: [...features] }, symptom: { type: 'string', enum: [...symptoms] },
    client: { type: 'string', enum: [...clients], default: 'unknown' },
    platform: { type: 'string', enum: [...platforms], default: 'unknown' },
    reproducibility: { type: 'string', enum: [...repeats], default: 'unknown' },
  }, required: ['feature', 'symptom'], additionalProperties: false },
};

export function prepareIssueReport(raw: unknown, reportedVersion: string = VERSION) {
  const version = z.string().regex(/^\d{1,4}\.\d{1,4}\.\d{1,4}$/).parse(reportedVersion);
  const input = issueReportSchema.parse(raw);
  // Grouping key only; never includes user identity, project data or machine metadata.
  const fingerprint = createHash('sha256').update(JSON.stringify({ version, ...input })).digest('hex').slice(0, 16);
  const title = `[AI-assisted report] ${input.feature}: ${input.symptom}`;
  const body = `## Package issue preview\n\nThis is a category-only report, not a verified diagnosis.\n\n- Package: ios-agent-mcp ${version}\n- Feature: ${input.feature}\n- Symptom: ${input.symptom}\n- Client: ${input.client}\n- Platform: ${input.platform}\n- Reproducibility: ${input.reproducibility}\n- Grouping key: ios-agent-${fingerprint}\n\n## Before submitting\n\nSearch existing issues first. Explain expected versus actual behavior and reproduction steps using a synthetic example in the GitHub form if possible. Do not include app source, logs, personal paths, credentials, signing data or private project names. Review everything added to this public issue.\n\nGenerated locally with fixed fields; no diagnostics were collected or uploaded.\n`;
  const submit = new URL('https://github.com/Nagarjuna2997/ios-agent-skill/issues/new');
  submit.searchParams.set('title', title); submit.searchParams.set('body', body);
  const search = new URL('https://github.com/Nagarjuna2997/ios-agent-skill/issues');
  search.searchParams.set('q', `is:issue "ios-agent-${fingerprint}"`);
  return { status: 'local-preview', submitted: false, title, body, fingerprint,
    searchUrl: search.href, submissionUrl: submit.href,
    notice: 'Nothing sent. Show this preview. With user authorization to open issue drafts, open submissionUrl using the coding client; otherwise ask first. The user must click Submit on GitHub. Opening a link sends these fixed fields to GitHub; submitting creates a public issue and requires GitHub sign-in. Duplicate lookup has not been performed.' };
}
