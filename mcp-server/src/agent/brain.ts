// Headless Claude Code as the loop's planner and Swift author. The model gets
// no tools: it returns JSON, and the agent validates and writes every file.
import { VISUAL_CHECKLIST, VisualAssessmentSchema, type VisualInput, type VisualRound } from "./visual-review.js";
import type { Diagnostic } from "./build.js";
import type { Brain, CapabilityBrief, SourceFile } from "./loop.js";
import { DesignSchema, PlanSchema, type Plan } from "./plan.js";
import type { FileChangeInput } from "./project.js";
import type { CommandRunner } from "./runner.js";
import type { AppSpec } from "./spec.js";

const SWIFT_RULES = `Write native SwiftUI for iOS. Rules:
- MVVM: every view model the UI observes is \`@MainActor @Observable final class\`. Inject services through protocols and initializers; no singletons resolved inside view models; no default argument that constructs a live service.
- Swift 6 language mode with strict concurrency. Use async/await; no DispatchQueue.main.async in async code; no Task.detached; no @unchecked Sendable.
- Use SwiftData (@Model, ModelContainer, @Query) only for models marked persisted; otherwise plain value types.
- NavigationStack (never NavigationView); a TabView with one NavigationStack per tab for tab navigation.
- Follow the approved plan's complete design direction. Apply \`.fontDesign(AppTheme.fontDesign)\` at each screen root, use AppTheme spacing/radius tokens and compose feature screens from \`AppCard\`, \`HeroHeader\`, \`AppStatTile\`, \`AppIconTile\`, \`AppChip\`, \`AppEmptyStateView\`, \`AppErrorStateView\`, \`AppSectionHeader\`, \`AppProgressRing\`, \`SkeletonBlock\` and \`ThumbnailPlaceholder\`. Match each screen's planned layout kind: list, detail, dashboard, feed, form, settings, map, cart, checkout, onboarding, paywall, auth, profile or search. Use \`List\`/\`Form\` for settings and data-entry forms. Use semantic colors, Dynamic Type text styles and SF Symbols; label icon-only buttons for VoiceOver; support dark mode and Reduce Motion.
- Define a \`SampleData\` namespace with realistic, synthetic examples for every planned model. Reuse the plan's examples in \`#Preview\` providers. When \`AgentLaunch.usesSampleData\` is true, initialize the visible dashboard/feed/list with those examples; otherwise preserve the normal empty or persisted-data behavior. Make the first screenshot content-rich, with varied records, useful metrics and image-free illustration placeholders where media is unavailable. Never use real personal data.
- Every view gets a #Preview that works without network or disk (use in-memory containers and SampleData).
- Use only Apple frameworks plus the capability templates already in the project; do not add packages.
- Never embed credentials. Read client keys from Bundle.main.object(forInfoDictionaryKey:) as the capability templates do.
- The app must build with no errors for the iOS Simulator.`;

const ROOT_CONTRACT = (spec: AppSpec) => `Project contract:
- Write files only under ${spec.name}/ (e.g. ${spec.name}/Views/..., ${spec.name}/Models/..., ${spec.name}/ViewModels/..., ${spec.name}/Services/...). Do not write project.yml, Info.plist or xcconfig files.
- ${spec.name}/App/${spec.name}App.swift is the @main entry. Replace it if the app needs a modelContainer or environment setup; keep the type name ${spec.name}App.
- ${spec.name}/Views/RootView.swift must define \`struct RootView: View\` and be what the app shows at launch.
- RootView must honor \`AgentLaunch.requestedScreen\` (already defined in ${spec.name}/App/AgentLaunch.swift): when it equals a top-level screen id, start on that screen (select that tab, or show it), so the agent can screenshot each screen. Unknown or nil values show the default first screen.
- Use \`AgentLaunch.usesSampleData\` (already defined in ${spec.name}/App/AgentLaunch.swift) to seed preview/demo state only when launched with \`-ios-agent-sample-data YES\`; keep production state and persistence paths unchanged otherwise.
- Deployment target is iOS ${spec.deploymentTarget}; do not use newer APIs without availability checks.`;

const OUTPUT = `Return ONLY a JSON object, no prose and no code fences: {"files":[{"path":"<AppName>/Views/Example.swift","content":"<entire file>"}],"notes":"<one short sentence>"}. Each file's content is the complete file. To delete a file, use {"path":"...","delete":true}.`;

function filesBlock(files: SourceFile[], maxChars = 200_000): string {
  let used = 0;
  const parts: string[] = [];
  for (const file of files) {
    if (used + file.content.length > maxChars) {
      parts.push(`--- ${file.path} (omitted, ${file.content.length} chars)`);
      continue;
    }
    used += file.content.length;
    parts.push(`--- ${file.path}\n${file.content}`);
  }
  return parts.join("\n");
}

const capabilityBlock = (capabilities: CapabilityBrief[]) =>
  capabilities.length
    ? capabilities.map((c) => `- ${c.id} (${c.name}): ${c.usage ?? c.description}${c.credentials.length ? ` Credentials: ${c.credentials.join(", ")} (placeholders until the user adds them; the app must still build and show a clear configuration message).` : ""}`).join("\n")
    : "- none";

/** Extract the first complete JSON object from model output, tolerating fences or a preamble. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    if (start < 0) throw new Error("The model did not return JSON.");
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let i = start; i < trimmed.length; i++) {
      const ch = trimmed[i]!;
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === '"') inString = false;
        continue;
      }
      if (ch === '"') inString = true;
      else if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) return JSON.parse(trimmed.slice(start, i + 1));
    }
    throw new Error("The model's JSON was incomplete.");
  }
}

export function filesFrom(value: unknown): FileChangeInput[] {
  const files = (value as { files?: unknown })?.files;
  if (!Array.isArray(files)) throw new Error("The model's JSON has no files array.");
  return files.map((f) => {
    const file = f as { path?: unknown; content?: unknown; delete?: unknown };
    if (typeof file.path !== "string") throw new Error("A returned file has no path.");
    return file.delete === true ? { path: file.path, delete: true } : { path: file.path, content: String(file.content ?? "") };
  });
}

export interface ClaudeBrainOptions {
  runner: CommandRunner;
  model?: string;
  timeoutMs?: number;
  command?: string;
}

/** Calls `claude -p` with tools disabled; prompts and image blocks travel on stdin. */
export class ClaudeCodeBrain implements Brain {
  constructor(private readonly options: ClaudeBrainOptions) {}

  private async ask(prompt: string): Promise<unknown> {
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "ios-agent-brain-"));
    try {
      const result = await this.options.runner.run(this.options.command ?? "claude", ["-p", "--output-format", "json", "--max-turns", "1", "--no-session-persistence", "--tools", "", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', ...(this.options.model ? ["--model", this.options.model] : [])], {
        cwd: dir, timeoutMs: this.options.timeoutMs ?? 15 * 60_000, input: prompt,
      });
      if (result.exitCode !== 0) throw new Error(`claude exited with ${result.exitCode}: ${(result.stderr || result.stdout).slice(-600)}`);
      const envelope = JSON.parse(result.stdout) as { result?: string; is_error?: boolean; subtype?: string };
      if (envelope.is_error || typeof envelope.result !== "string") throw new Error(`claude returned no result (${envelope.subtype ?? "error"}).`);
      return extractJson(envelope.result);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  async plan(input: Parameters<Brain["plan"]>[0]): Promise<unknown> {
    const modules = input.capabilities.map((c) => `- ${c.id} [${c.category}]${c.default ? " (Apple-native default)" : ""}: ${c.description}`).join("\n") || "- none";
    const catalog = input.catalog.map((c) => `${c.id} [${c.category}]`).join(", ");
    const proposal = await this.ask(`You plan native iOS apps for non-developers. Turn the request into a build plan.

Request: ${input.description}

Return ONLY JSON matching:
{"appName":"UpperCamelCase Swift identifier, not App/View/Test","displayName":"<=30 chars","summary":"2-3 sentences","navigation":"tabs|stack|split",
 "design":{"mood":"short visual direction","palette":{"name":"...","primary":"#RRGGBB","secondary":"#RRGGBB","accent":"#RRGGBB"},"typography":"system|rounded|serif","shape":"square|soft|rounded|organic","density":"compact|comfortable|spacious","motion":"minimal|subtle|expressive"},
 "screens":[{"id":"kebab-case","title":"...","purpose":"one line","kind":"list|detail|dashboard|feed|form|settings|map|cart|checkout|onboarding|paywall|auth|profile|search","topLevel":true,"capabilities":[]}],
 "models":[{"name":"UpperCamelCase","persisted":true,"fields":[{"name":"lowerCamel","type":"Swift type","optional":false}],"sampleData":[{"field":"synthetic example"},{"field":"second example"}]}],
 "capabilities":[{"id":"<capability id>","reason":"why the app needs it"}],
 "features":["..."],"assumptions":["what you assumed about unclear requirements"]}

Also include "designDirections": 2 or 3 objects {"id":"kebab-case","name":"short name","rationale":"why it suits this app","design":<complete design object>}. Make alternatives meaningfully different in layout density, palette and typography while honoring requirements. Do not include selectedDesign: the user chooses before generation.
Rules: at most 5 top-level screens for tabs; mark persisted only data that must survive relaunch; deployment floor iOS ${input.deploymentFloor}. Choose a specific visual mood and a domain-appropriate readable palette (honor colors the user requested), not a random brand hue. Select the best layout kind for every screen. Include 2-3 synthetic sampleData records for each model, covering varied realistic content without personal information. For a plan with no models, use an empty models array.
List every capability the app needs. Prefer these implemented modules (ids exactly as written; Apple-native defaults first):
${modules}
If the app needs something with no module, still list it using the closest catalog id so the plan shows it as not built yet. Catalog ids: ${catalog || "none"}.
Do not invent costs.`);
    const plan = PlanSchema.parse(proposal);
    if (!plan.designDirections || plan.selectedDesign) throw new Error("New plans require 2-3 unselected design directions for the user to choose.");
    return plan;
  }

  async reviewDesign(input: VisualInput): Promise<unknown> {
    const { mkdtemp, rm } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = await mkdtemp(join(tmpdir(), "ios-agent-vision-"));
    const prompt = `${VISUAL_CHECKLIST}\nApproved brief: ${JSON.stringify(input.plan.design)}\nScreen: ${JSON.stringify(input.screen)}\nImages follow in light, dark, xxl order. Return ONLY JSON: {"verdict":"pass|needs_changes|unknown","findings":[{"variant":"light|dark|xxl","category":"layout|hierarchy|contrast|states|dark-mode|dynamic-type","observation":"visible evidence and location","repair":"minimal view repair"}],"limitations":["unverifiable areas"]}. A blank, wrong or unreadable capture is unknown, never pass.`;
    const message = { type: "user", message: { role: "user", content: [{type: "text", text: prompt}, ...input.images.map(i => ({type: "image", source: {type: "base64", media_type: "image/png", data: i.data}}))] } };
    try {
      const result = await this.options.runner.run(this.options.command ?? "claude", ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose", "--max-turns", "1", "--no-session-persistence", "--tools", "", "--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}', ...(this.options.model ? ["--model", this.options.model] : [])], {cwd: dir, timeoutMs: this.options.timeoutMs ?? 120_000, input: JSON.stringify(message) + "\n"});
      if (result.exitCode !== 0) throw new Error(`Visual provider failed (exit ${result.exitCode}); review incomplete.`);
      const envelope = result.stdout.trim().split("\n").map(line => JSON.parse(line)).find(e => e.type === "result");
      if (!envelope || envelope.is_error || typeof envelope.result !== "string") throw new Error("Visual provider returned no successful result; review incomplete.");
      return VisualAssessmentSchema.parse(extractJson(envelope.result));
    } finally { await rm(dir, { recursive: true, force: true }); }
  }

  async repairDesign(input: { plan: Plan; spec: AppSpec; files: SourceFile[]; review: VisualRound }): Promise<FileChangeInput[]> {
    return filesFrom(await this.ask(`${SWIFT_RULES}\n${ROOT_CONTRACT(input.spec)}\nRepair only the observed visual findings, preserving every feature, navigation and sample-data contract. Only replace Swift files in ${input.spec.name}/Views/. No deletions or business logic changes. Approved plan: ${JSON.stringify(input.plan)}\nFindings: ${JSON.stringify(input.review)}\nSource:\n${filesBlock(input.files)}\n${OUTPUT}`));
  }

  async generate(input: Parameters<Brain["generate"]>[0]): Promise<FileChangeInput[]> {
    return filesFrom(
      await this.ask(`${SWIFT_RULES}

${ROOT_CONTRACT(input.spec)}

Build this app completely (all screens, models, view models and navigation in the plan):
${JSON.stringify(input.plan, null, 2)}

Capabilities already added to the project (their files exist; use them as described):
${capabilityBlock(input.capabilities)}

Current project files:
${filesBlock(input.files)}

${OUTPUT}`),
    );
  }

  async fix(input: { plan: Plan; spec: AppSpec; errors: Diagnostic[]; files: SourceFile[]; attempt: number; maxAttempts: number }): Promise<FileChangeInput[]> {
    return filesFrom(
      await this.ask(`${SWIFT_RULES}

${ROOT_CONTRACT(input.spec)}

Build attempt ${input.attempt} of ${input.maxAttempts} failed. Fix every error with the smallest correct change. Do not remove planned features to make it compile unless no correct fix exists. Do not edit files under ${input.spec.name}/Capabilities/ unless an error is in them.

Errors:
${input.errors.map((e) => `- ${e.file ? `${e.file}:${e.line ?? "?"}:${e.column ?? "?"}: ` : ""}${e.message}`).join("\n")}

Files:
${filesBlock(input.files)}

${OUTPUT}`),
    );
  }

  async refine(input: Parameters<Brain["refine"]>[0]): Promise<{ files: FileChangeInput[]; capabilities?: string[]; design?: Plan["design"] }> {
    const value = await this.ask(`${SWIFT_RULES}

${ROOT_CONTRACT(input.spec)}

Apply this change to the existing app: ${input.change}

Plan (for context): ${JSON.stringify(input.plan)}
Capabilities available as modules (list ids in "capabilities" if the change needs one that is not yet in the project; already applied: ${input.spec.capabilities.join(", ") || "none"}):
${capabilityBlock(input.capabilities)}

Files:
${filesBlock(input.files)}

Return ONLY JSON: {"files":[...],"capabilities":["optional ids to add"],"design":{"mood":"...","palette":{"name":"...","primary":"#RRGGBB","secondary":"#RRGGBB","accent":"#RRGGBB"},"typography":"system|rounded|serif","shape":"square|soft|rounded|organic","density":"compact|comfortable|spacious","motion":"minimal|subtle|expressive"},"notes":"..."}. Include the full design object only when the user's requested change explicitly changes the visual direction or palette; otherwise omit it. The saved plan and semantic color assets will update together. where files follow: ${OUTPUT}`);
    const capabilities = (value as { capabilities?: unknown }).capabilities;
    const rawDesign = (value as { design?: unknown }).design;
    const design = rawDesign === undefined ? undefined : DesignSchema.parse(rawDesign);
    return { files: filesFrom(value), ...(Array.isArray(capabilities) ? { capabilities: capabilities.filter((c): c is string => typeof c === "string") } : {}), ...(design ? { design } : {}) };
  }
}
