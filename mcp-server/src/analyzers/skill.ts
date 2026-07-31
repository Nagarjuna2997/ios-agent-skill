import { readFile, readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";

import { Severity } from "./types.js";

/**
 * A defect in a skill repository's own metadata, rather than in Swift source.
 *
 * Separate from `Finding` because the location is a markdown or YAML file, not
 * a Swift file, and the excerpt must not be rendered in a `swift` code fence.
 */
export interface SkillFinding {
  /** Repo-relative path. */
  file: string;
  /** 1-indexed line, or 0 when the finding is about the file as a whole. */
  line: number;
  severity: Severity;
  /** Short kebab-case rule id, e.g. "agent-read-only-holds-write-tool". */
  rule: string;
  message: string;
  consequence: string;
  fix: string;
  /** The offending line, trimmed. Empty when not line-anchored. */
  excerpt: string;
}

export interface SkillLintResult {
  findings: SkillFinding[];
  /** What the linter actually inspected, so an empty report is not ambiguous. */
  checked: {
    skillFile: string | null;
    agentCount: number;
    mirrorsCompared: number;
    mirrorCheckSkipped: boolean;
    referencedPaths: number;
  };
}

/**
 * Tools an agent definition may name.
 *
 * A typo here is invisible at runtime — an unknown tool name is not granted and
 * not reported, so the agent silently lacks a capability its prompt assumes.
 */
const KNOWN_TOOLS = new Set([
  "Agent",
  "Bash",
  "BashOutput",
  "Edit",
  "ExitPlanMode",
  "Glob",
  "Grep",
  "KillShell",
  "NotebookEdit",
  "Read",
  "Task",
  "TodoWrite",
  "WebFetch",
  "WebSearch",
  "Write",
]);

/** Tools that mutate the working tree. The whole point of a read-only agent. */
const WRITE_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);

/**
 * Mirror targets. Kept in sync with scripts/sync-mirrors.sh.
 *
 * These are only compared when the repository demonstrably uses the mirror
 * pattern — see `lintMirrors`. A project with an unrelated CLAUDE.md must not
 * be told it has drifted from a SKILL.md it never mirrored.
 */
const MIRROR_CANDIDATES = [
  "AGENTS.md",
  "CLAUDE.md",
  "CONVENTIONS.md",
  "GEMINI.md",
  "replit.md",
  ".clinerules",
  ".continuerules",
  ".cursorrules",
  ".kilocoderules",
  ".roorules",
  ".rules",
  ".windsurfrules",
  ".aiassistant/rules/ios-skill.md",
  ".amazonq/rules/ios-skill.md",
  ".augment/rules/ios-skill.md",
  ".continue/rules/ios-skill.md",
  ".cursor/rules/ios-skill.md",
  ".github/copilot-instructions.md",
  ".junie/guidelines.md",
  ".kilocode/rules/ios-skill.md",
  ".roo/rules/ios-skill.md",
  ".tabnine/guidelines/ios-skill.md",
  ".trae/rules/ios-skill.md",
  ".windsurf/rules/ios-skill.md",
];

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Agent Skills caps the trigger description; past this it is silently truncated. */
const MAX_DESCRIPTION = 1024;

interface Frontmatter {
  /** Raw text between the `---` fences. */
  block: string;
  /** Top-level scalar keys mapped to their raw value and 1-indexed line. */
  entries: Map<string, { value: string; line: number }>;
  /** Line the body starts on. */
  bodyLine: number;
}

/**
 * Parse a leading YAML frontmatter block.
 *
 * Deliberately not a YAML parser: it reads top-level `key: value` pairs and
 * ignores nested structure. That covers every key these checks care about
 * without taking a dependency, and nested keys are simply not reported on.
 */
function parseFrontmatter(text: string): Frontmatter | null {
  const lines = text.split("\n");
  if (lines[0] !== "---") return null;

  const end = lines.indexOf("---", 1);
  if (end === -1) return null;

  const entries = new Map<string, { value: string; line: number }>();
  for (let index = 1; index < end; index += 1) {
    const match = /^([A-Za-z][A-Za-z0-9_-]*):[ \t]*(.*)$/.exec(lines[index]);
    if (match) {
      entries.set(match[1], { value: match[2].trim(), line: index + 1 });
    }
  }

  return {
    block: lines.slice(1, end).join("\n"),
    entries,
    bodyLine: end + 2,
  };
}

/** Strip a leading frontmatter block and the blank lines after it. */
function stripFrontmatter(text: string): string {
  const lines = text.split("\n");
  if (lines[0] !== "---") return text;

  const end = lines.indexOf("---", 1);
  if (end === -1) return text;

  let start = end + 1;
  while (start < lines.length && lines[start].trim() === "") start += 1;
  return lines.slice(start).join("\n");
}

async function readIfPresent(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** Split a `tools:` value, tolerating both `A, B` and `[A, B]` forms. */
function parseToolList(value: string): string[] {
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((entry) => entry.trim().replace(/^["']|["']$/g, ""))
    .filter((entry) => entry.length > 0);
}

/**
 * Does this description claim the agent cannot write?
 *
 * Matched against the description because that is the contract the main agent
 * reads when it decides to delegate. If the prose promises read-only and the
 * frontmatter grants Edit, the delegation decision was made on a false premise.
 */
function claimsReadOnly(description: string): boolean {
  return /read[- ]only|never edits?|does not (?:edit|change|modify)|no write tools/i.test(
    description,
  );
}

function checkSkillFrontmatter(
  relativePath: string,
  text: string,
  findings: SkillFinding[],
): void {
  const frontmatter = parseFrontmatter(text);

  if (!frontmatter) {
    findings.push({
      file: relativePath,
      line: 1,
      severity: "blocker",
      rule: "skill-missing-frontmatter",
      message: `${relativePath} has no YAML frontmatter block.`,
      consequence:
        "Agent Skills loaders read `name` and `description` from frontmatter to decide when to load the skill. Without it the skill never triggers.",
      fix: "Add a `---` fenced block at the very top of the file with at least `name`, `description`, `version`, and `license`.",
      excerpt: text.split("\n")[0] ?? "",
    });
    return;
  }

  for (const key of ["name", "description", "version", "license"]) {
    if (!frontmatter.entries.has(key)) {
      findings.push({
        file: relativePath,
        line: 1,
        severity: "blocker",
        rule: "skill-frontmatter-missing-key",
        message: `${relativePath} frontmatter is missing \`${key}\`.`,
        consequence:
          key === "description"
            ? "The description is the trigger. With none, the skill is never selected for a task."
            : `Loaders that require \`${key}\` reject the skill outright.`,
        fix: `Add \`${key}:\` to the frontmatter block.`,
        excerpt: "",
      });
    }
  }

  const name = frontmatter.entries.get("name");
  if (name && !KEBAB.test(name.value)) {
    findings.push({
      file: relativePath,
      line: name.line,
      severity: "serious",
      rule: "skill-name-not-kebab-case",
      message: `Skill name \`${name.value}\` is not lowercase-kebab-case.`,
      consequence:
        "Skill names are used as invocation identifiers. Mixed case or spaces make the skill unaddressable by name.",
      fix: "Rename to lowercase words separated by hyphens.",
      excerpt: `name: ${name.value}`,
    });
  }

  const version = frontmatter.entries.get("version");
  if (version && !SEMVER.test(version.value.replace(/^["']|["']$/g, ""))) {
    findings.push({
      file: relativePath,
      line: version.line,
      severity: "serious",
      rule: "skill-version-not-semver",
      message: `Version \`${version.value}\` is not semantic versioning.`,
      consequence:
        "Consumers cannot tell a breaking change from a patch, and release tooling that sorts versions misorders them.",
      fix: "Use MAJOR.MINOR.PATCH, for example `2.0.0`.",
      excerpt: `version: ${version.value}`,
    });
  }

  const description = frontmatter.entries.get("description");
  if (description) {
    if (description.value.length > MAX_DESCRIPTION) {
      findings.push({
        file: relativePath,
        line: description.line,
        severity: "serious",
        rule: "skill-description-too-long",
        message: `Description is ${description.value.length} characters; the limit is ${MAX_DESCRIPTION}.`,
        consequence:
          "Loaders truncate past the limit, so the trailing trigger conditions are silently dropped and the skill stops matching those tasks.",
        fix: "Trim to the triggering conditions. Move detail into the body, which is not length-limited.",
        excerpt: `${description.value.slice(0, 80)}…`,
      });
    } else if (description.value.length < 40) {
      findings.push({
        file: relativePath,
        line: description.line,
        severity: "minor",
        rule: "skill-description-too-short",
        message: "Description is too short to trigger reliably.",
        consequence:
          "The description is matched against the task. A few words give the loader almost nothing to match on, so the skill loads inconsistently.",
        fix: "State what the skill does and the specific conditions under which it should load.",
        excerpt: `description: ${description.value}`,
      });
    }
  }

  const allowed = frontmatter.entries.get("allowed-tools");
  if (allowed) {
    for (const tool of parseToolList(allowed.value)) {
      if (!KNOWN_TOOLS.has(tool)) {
        findings.push({
          file: relativePath,
          line: allowed.line,
          severity: "serious",
          rule: "skill-unknown-tool",
          message: `\`allowed-tools\` names an unknown tool \`${tool}\`.`,
          consequence:
            "An unrecognized tool name is not granted and not reported. The skill runs without a capability its instructions assume it has.",
          fix: `Correct the spelling, or remove \`${tool}\` if it is not a real tool.`,
          excerpt: `allowed-tools: ${allowed.value}`,
        });
      }
    }
  }
}

async function lintAgents(
  root: string,
  findings: SkillFinding[],
): Promise<number> {
  const directory = join(root, ".claude", "agents");

  let files: string[];
  try {
    files = (await readdir(directory)).filter((name) => name.endsWith(".md")).sort();
  } catch {
    return 0;
  }

  for (const file of files) {
    const relativePath = join(".claude", "agents", file);
    const text = await readFile(join(directory, file), "utf8");
    const frontmatter = parseFrontmatter(text);

    if (!frontmatter) {
      findings.push({
        file: relativePath,
        line: 1,
        severity: "blocker",
        rule: "agent-missing-frontmatter",
        message: `${file} has no YAML frontmatter.`,
        consequence:
          "Without frontmatter the file is not registered as a subagent at all. It looks defined but can never be invoked.",
        fix: "Add a `---` block with `name`, `description`, and `tools`.",
        excerpt: text.split("\n")[0] ?? "",
      });
      continue;
    }

    const stem = basename(file, ".md");
    const name = frontmatter.entries.get("name");

    if (!name) {
      findings.push({
        file: relativePath,
        line: 1,
        severity: "serious",
        rule: "agent-missing-name",
        message: `${file} frontmatter has no \`name\`.`,
        consequence: "The subagent cannot be addressed by name.",
        fix: `Add \`name: ${stem}\`.`,
        excerpt: "",
      });
    } else {
      if (!KEBAB.test(name.value)) {
        findings.push({
          file: relativePath,
          line: name.line,
          severity: "serious",
          rule: "agent-name-not-kebab-case",
          message: `Agent name \`${name.value}\` is not lowercase-kebab-case.`,
          consequence: "Names outside this form are not reliably resolvable at invocation.",
          fix: "Rename to lowercase words separated by hyphens.",
          excerpt: `name: ${name.value}`,
        });
      }
      if (name.value !== stem) {
        findings.push({
          file: relativePath,
          line: name.line,
          severity: "serious",
          rule: "agent-name-filename-mismatch",
          message: `Agent is named \`${name.value}\` but the file is \`${file}\`.`,
          consequence:
            "Documentation and delegation prompts reference one identifier while the loader registers the other, so the delegation silently fails to resolve.",
          fix: `Rename the file to \`${name.value}.md\`, or change \`name\` to \`${stem}\`.`,
          excerpt: `name: ${name.value}`,
        });
      }
    }

    const description = frontmatter.entries.get("description");
    if (!description || description.value === "") {
      findings.push({
        file: relativePath,
        line: 1,
        severity: "serious",
        rule: "agent-missing-description",
        message: `${file} has no \`description\`.`,
        consequence:
          "The description is what the main agent reads to decide whether to delegate. With none, the subagent is never chosen.",
        fix: "Add a description stating when to use this agent, not just what it is.",
        excerpt: "",
      });
    } else if (!/\b(use|when|after|before)\b/i.test(description.value)) {
      findings.push({
        file: relativePath,
        line: description.line,
        severity: "minor",
        rule: "agent-description-lacks-trigger",
        message: `${file} describes what the agent is, but not when to use it.`,
        consequence:
          "Delegation is decided by matching the task against this text. A description with no triggering condition rarely matches.",
        fix: 'Add an explicit trigger — "Use when …", "Use after …".',
        excerpt: `description: ${description.value.slice(0, 80)}…`,
      });
    }

    const tools = frontmatter.entries.get("tools");
    if (!tools || tools.value === "") {
      findings.push({
        file: relativePath,
        line: 1,
        severity: "serious",
        rule: "agent-missing-tools",
        message: `${file} does not declare \`tools\`.`,
        consequence:
          "An agent with no tool list inherits every tool the main agent has. A reviewer meant to be read-only silently gains Edit and Write.",
        fix: "Declare the minimum tools this agent needs, for example `tools: Read, Grep, Glob`.",
        excerpt: "",
      });
      continue;
    }

    const granted = parseToolList(tools.value);

    for (const tool of granted) {
      if (!KNOWN_TOOLS.has(tool)) {
        findings.push({
          file: relativePath,
          line: tools.line,
          severity: "serious",
          rule: "agent-unknown-tool",
          message: `${file} grants an unknown tool \`${tool}\`.`,
          consequence:
            "An unrecognized name is not granted and not reported. The agent's prompt assumes a capability it does not have, and fails at the moment it tries to use it.",
          fix: `Correct the spelling, or drop \`${tool}\`.`,
          excerpt: `tools: ${tools.value}`,
        });
      }
    }

    if (description && claimsReadOnly(description.value)) {
      const violations = granted.filter((tool) => WRITE_TOOLS.has(tool));
      if (violations.length > 0) {
        findings.push({
          file: relativePath,
          line: tools.line,
          severity: "blocker",
          rule: "agent-read-only-holds-write-tool",
          message: `${file} is described as read-only but is granted ${violations.join(", ")}.`,
          consequence:
            "The main agent delegates to it believing it cannot change code. A reviewer that can edit will fix what it was supposed to report, which destroys the separation of duties the review depends on.",
          fix: `Remove ${violations.join(", ")} from \`tools\`, or stop describing the agent as read-only.`,
          excerpt: `tools: ${tools.value}`,
        });
      }
    }
  }

  return files.length;
}

/**
 * Compare mirrors against SKILL.md's body.
 *
 * Only runs when at least one candidate already matches byte-for-byte. That
 * proves the repository uses the generated-mirror pattern; without the check, a
 * project with a hand-written CLAUDE.md would be told all 24 mirrors are stale.
 */
async function lintMirrors(
  root: string,
  skillText: string,
  findings: SkillFinding[],
): Promise<{ compared: number; skipped: boolean }> {
  const body = stripFrontmatter(skillText).trimEnd();

  const present: Array<{ path: string; matches: boolean }> = [];
  for (const candidate of MIRROR_CANDIDATES) {
    const text = await readIfPresent(join(root, candidate));
    if (text === null) continue;
    present.push({ path: candidate, matches: text.trimEnd() === body });
  }

  if (present.length === 0 || !present.some((entry) => entry.matches)) {
    return { compared: 0, skipped: true };
  }

  for (const entry of present) {
    if (entry.matches) continue;
    findings.push({
      file: entry.path,
      line: 0,
      severity: "serious",
      rule: "mirror-out-of-sync",
      message: `${entry.path} does not match the body of SKILL.md.`,
      consequence:
        "Agents reading this file get different rules from agents reading SKILL.md. The divergence is invisible until two agents disagree about the same codebase.",
      fix: "Regenerate with `./scripts/sync-mirrors.sh`, then commit the result.",
      excerpt: "",
    });
  }

  return { compared: present.length, skipped: false };
}

const REFERENCE = /`((?:docs|patterns|checklists|templates|scripts|samples)\/[^`\s]+)`/g;

/** Flag backtick-quoted repository paths that do not resolve. */
async function lintReferences(
  root: string,
  sources: string[],
  findings: SkillFinding[],
): Promise<number> {
  let count = 0;

  for (const source of sources) {
    const text = await readIfPresent(join(root, source));
    if (text === null) continue;

    const lines = text.split("\n");
    for (let index = 0; index < lines.length; index += 1) {
      for (const match of lines[index].matchAll(REFERENCE)) {
        const reference = match[1];
        if (reference.includes("*")) continue;
        count += 1;

        if (!(await exists(join(root, reference.replace(/\/$/, ""))))) {
          findings.push({
            file: source,
            line: index + 1,
            severity: "serious",
            rule: "broken-doc-reference",
            message: `References \`${reference}\`, which does not exist.`,
            consequence:
              "An agent told to consult this path finds nothing and proceeds without the rules it was supposed to apply — silently, because a missing file is not an error it reports.",
            fix: `Create ${reference}, or correct the path.`,
            excerpt: lines[index].trim(),
          });
        }
      }
    }
  }

  return count;
}

/** Lint a skill repository's metadata: frontmatter, agents, mirrors, references. */
export async function lintSkill(root: string): Promise<SkillLintResult> {
  const findings: SkillFinding[] = [];

  const skillPath = (await exists(join(root, "SKILL.md"))) ? "SKILL.md" : null;
  const skillText = skillPath ? await readFile(join(root, skillPath), "utf8") : null;

  if (skillText === null) {
    findings.push({
      file: "SKILL.md",
      line: 0,
      severity: "blocker",
      rule: "skill-file-missing",
      message: "No SKILL.md at the repository root.",
      consequence:
        "SKILL.md is the entry point every Agent Skills loader looks for. Without it there is no skill to load, whatever else the repository contains.",
      fix: "Create SKILL.md with YAML frontmatter (`name`, `description`, `version`, `license`) and the instruction body beneath it.",
      excerpt: "",
    });
  } else {
    checkSkillFrontmatter("SKILL.md", skillText, findings);
  }

  const agentCount = await lintAgents(root, findings);
  const mirrors = skillText
    ? await lintMirrors(root, skillText, findings)
    : { compared: 0, skipped: true };
  const referencedPaths = await lintReferences(
    root,
    ["SKILL.md", "README.md"],
    findings,
  );

  return {
    findings,
    checked: {
      skillFile: skillPath,
      agentCount,
      mirrorsCompared: mirrors.compared,
      mirrorCheckSkipped: mirrors.skipped,
      referencedPaths,
    },
  };
}
