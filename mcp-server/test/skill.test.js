import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { lintSkill } from "../dist/analyzers/skill.js";
import { renderSkillLint } from "../dist/report.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const rules = (result) => result.findings.map((f) => f.rule);
const bySeverity = (result, rule) =>
  result.findings.find((f) => f.rule === rule)?.severity;

let scratch;

before(async () => {
  scratch = await mkdtemp(join(tmpdir(), "skill-lint-"));
});

after(async () => {
  await rm(scratch, { recursive: true, force: true });
});

/** Build a throwaway skill repository from a {path: contents} map. */
async function fixture(name, files) {
  const root = join(scratch, name);
  for (const [path, contents] of Object.entries(files)) {
    const full = join(root, path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, contents, "utf8");
  }
  return root;
}

const SKILL_BODY = "# Rules\n\nAlways do the right thing.\n";

const skillFile = (overrides = {}) => {
  const fields = {
    name: "demo-skill",
    description:
      "Expert demo behavior for AI coding agents. Use when writing or reviewing demo code.",
    version: "1.0.0",
    license: "MIT",
    ...overrides,
  };
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${key}: ${value}`);
  return `---\n${lines.join("\n")}\n---\n\n${SKILL_BODY}`;
};

const agentFile = (fields) =>
  `---\n${Object.entries(fields)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}\n---\n\nYou are a demo agent.\n`;

describe("SKILL.md frontmatter", () => {
  test("a well-formed skill produces no findings", async () => {
    const root = await fixture("clean", { "SKILL.md": skillFile() });
    const result = await lintSkill(root);
    assert.deepEqual(result.findings, []);
    assert.equal(result.checked.skillFile, "SKILL.md");
  });

  test("a missing SKILL.md is a blocker, not a silent pass", async () => {
    const root = await fixture("no-skill", { "README.md": "# Nothing here\n" });
    const result = await lintSkill(root);
    assert.ok(rules(result).includes("skill-file-missing"));
    assert.equal(bySeverity(result, "skill-file-missing"), "blocker");
  });

  test("flags a file with no frontmatter block", async () => {
    const root = await fixture("no-frontmatter", { "SKILL.md": SKILL_BODY });
    const result = await lintSkill(root);
    assert.ok(rules(result).includes("skill-missing-frontmatter"));
  });

  test("flags each missing required key", async () => {
    const root = await fixture("missing-keys", {
      "SKILL.md": skillFile({ license: null, version: null }),
    });
    const result = await lintSkill(root);
    const missing = result.findings.filter(
      (f) => f.rule === "skill-frontmatter-missing-key",
    );
    assert.equal(missing.length, 2);
    assert.ok(missing.every((f) => f.severity === "blocker"));
  });

  test("flags a non-semver version", async () => {
    const root = await fixture("bad-version", { "SKILL.md": skillFile({ version: "v2" }) });
    assert.ok(rules(await lintSkill(root)).includes("skill-version-not-semver"));
  });

  test("accepts a prerelease semver version", async () => {
    const root = await fixture("prerelease", {
      "SKILL.md": skillFile({ version: "2.1.0-beta.1" }),
    });
    assert.ok(!rules(await lintSkill(root)).includes("skill-version-not-semver"));
  });

  test("flags a name that is not kebab-case", async () => {
    const root = await fixture("bad-name", { "SKILL.md": skillFile({ name: "Demo Skill" }) });
    assert.ok(rules(await lintSkill(root)).includes("skill-name-not-kebab-case"));
  });

  test("flags a description past the truncation limit", async () => {
    const root = await fixture("long-desc", {
      "SKILL.md": skillFile({ description: "Use when ".repeat(150) }),
    });
    const result = await lintSkill(root);
    assert.ok(rules(result).includes("skill-description-too-long"));
    assert.equal(bySeverity(result, "skill-description-too-long"), "serious");
  });

  test("flags a description too short to trigger on", async () => {
    const root = await fixture("short-desc", { "SKILL.md": skillFile({ description: "iOS stuff" }) });
    assert.ok(rules(await lintSkill(root)).includes("skill-description-too-short"));
  });

  test("flags a misspelled tool in allowed-tools", async () => {
    const root = await fixture("bad-allowed-tools", {
      "SKILL.md": skillFile({ "allowed-tools": "Read, Grap, Bash" }),
    });
    const result = await lintSkill(root);
    const finding = result.findings.find((f) => f.rule === "skill-unknown-tool");
    assert.ok(finding);
    assert.match(finding.message, /Grap/);
  });
});

describe("subagent tool permissions", () => {
  test("a read-only agent granted Write is a blocker", async () => {
    const root = await fixture("leaky-reviewer", {
      "SKILL.md": skillFile(),
      ".claude/agents/swift-reviewer.md": agentFile({
        name: "swift-reviewer",
        description:
          "Independent verifier for Swift changes. Use after code is written. Read-only — it never edits code.",
        tools: "Read, Grep, Glob, Bash, Write",
      }),
    });
    const result = await lintSkill(root);
    const finding = result.findings.find(
      (f) => f.rule === "agent-read-only-holds-write-tool",
    );
    assert.ok(finding, "expected the read-only boundary violation to be reported");
    assert.equal(finding.severity, "blocker");
    assert.match(finding.message, /Write/);
  });

  test("the same agent with only read tools passes", async () => {
    const root = await fixture("tight-reviewer", {
      "SKILL.md": skillFile(),
      ".claude/agents/swift-reviewer.md": agentFile({
        name: "swift-reviewer",
        description:
          "Independent verifier for Swift changes. Use after code is written. Read-only — it never edits code.",
        tools: "Read, Grep, Glob, Bash",
      }),
    });
    assert.deepEqual((await lintSkill(root)).findings, []);
  });

  test("an agent that does not claim read-only may hold Write", async () => {
    const root = await fixture("writer", {
      "SKILL.md": skillFile(),
      ".claude/agents/swift-refactorer.md": agentFile({
        name: "swift-refactorer",
        description:
          "Behavior-preserving Swift cleanups. Use for mechanical improvement with no behavior change.",
        tools: "Read, Grep, Glob, Edit, Write, Bash",
      }),
    });
    assert.ok(
      !rules(await lintSkill(root)).includes("agent-read-only-holds-write-tool"),
    );
  });

  test("an agent with no tools list is flagged — it silently inherits everything", async () => {
    const root = await fixture("no-tools", {
      "SKILL.md": skillFile(),
      ".claude/agents/ios-explore.md": agentFile({
        name: "ios-explore",
        description: "Read-only codebase search. Use when sweeping many files.",
      }),
    });
    const result = await lintSkill(root);
    assert.ok(rules(result).includes("agent-missing-tools"));
  });

  test("flags a name that does not match the filename", async () => {
    const root = await fixture("name-mismatch", {
      "SKILL.md": skillFile(),
      ".claude/agents/ios-explore.md": agentFile({
        name: "ios-explorer",
        description: "Read-only codebase search. Use when sweeping many files.",
        tools: "Read, Grep, Glob",
      }),
    });
    const result = await lintSkill(root);
    const finding = result.findings.find(
      (f) => f.rule === "agent-name-filename-mismatch",
    );
    assert.ok(finding);
    assert.match(finding.fix, /ios-explorer\.md/);
  });

  test("flags an unknown tool name in an agent", async () => {
    const root = await fixture("agent-typo", {
      "SKILL.md": skillFile(),
      ".claude/agents/ios-plan.md": agentFile({
        name: "ios-plan",
        description: "Planner. Use before a multi-file feature.",
        tools: "Read, Groop, Glob",
      }),
    });
    assert.ok(rules(await lintSkill(root)).includes("agent-unknown-tool"));
  });

  test("accepts the bracketed tools form", async () => {
    const root = await fixture("bracket-tools", {
      "SKILL.md": skillFile(),
      ".claude/agents/ios-plan.md": agentFile({
        name: "ios-plan",
        description: "Planner. Use before a multi-file feature.",
        tools: "[Read, Grep, Glob]",
      }),
    });
    assert.deepEqual((await lintSkill(root)).findings, []);
  });

  test("flags a description with no triggering condition", async () => {
    const root = await fixture("no-trigger", {
      "SKILL.md": skillFile(),
      ".claude/agents/ios-docs.md": agentFile({
        name: "ios-docs",
        description: "Writes documentation for Swift codebases and DocC comments.",
        tools: "Read, Write, Edit",
      }),
    });
    assert.ok(rules(await lintSkill(root)).includes("agent-description-lacks-trigger"));
  });

  test("counts the agents it inspected", async () => {
    const root = await fixture("agent-count", {
      "SKILL.md": skillFile(),
      ".claude/agents/a-one.md": agentFile({
        name: "a-one",
        description: "Does a thing. Use when you need it.",
        tools: "Read",
      }),
      ".claude/agents/a-two.md": agentFile({
        name: "a-two",
        description: "Does another thing. Use when you need that.",
        tools: "Read",
      }),
    });
    assert.equal((await lintSkill(root)).checked.agentCount, 2);
  });
});

describe("mirror sync", () => {
  test("flags a mirror that has drifted from SKILL.md", async () => {
    const root = await fixture("drifted", {
      "SKILL.md": skillFile(),
      "AGENTS.md": SKILL_BODY,
      "CLAUDE.md": "# Rules\n\nAlways do something else entirely.\n",
    });
    const result = await lintSkill(root);
    const drift = result.findings.filter((f) => f.rule === "mirror-out-of-sync");
    assert.equal(drift.length, 1);
    assert.equal(drift[0].file, "CLAUDE.md");
    assert.equal(result.checked.mirrorsCompared, 2);
  });

  test("does not report drift when no mirror matches — the repo is not using the pattern", async () => {
    const root = await fixture("hand-written", {
      "SKILL.md": skillFile(),
      "CLAUDE.md": "# Project notes\n\nHand-written, never generated from SKILL.md.\n",
    });
    const result = await lintSkill(root);
    assert.deepEqual(result.findings, []);
    assert.equal(result.checked.mirrorCheckSkipped, true);
  });

  test("a mirror still containing frontmatter is drift", async () => {
    const root = await fixture("frontmatter-leak", {
      "SKILL.md": skillFile(),
      "AGENTS.md": SKILL_BODY,
      "CLAUDE.md": skillFile(),
    });
    const result = await lintSkill(root);
    assert.ok(
      result.findings.some(
        (f) => f.rule === "mirror-out-of-sync" && f.file === "CLAUDE.md",
      ),
      "copying SKILL.md verbatim leaves YAML frontmatter as body text",
    );
  });
});

describe("doc references", () => {
  test("flags a backtick path that does not resolve", async () => {
    const root = await fixture("broken-ref", {
      "SKILL.md": skillFile().replace(
        SKILL_BODY,
        "See `docs/frameworks/nonexistent.md` for details.\n",
      ),
    });
    const result = await lintSkill(root);
    const finding = result.findings.find((f) => f.rule === "broken-doc-reference");
    assert.ok(finding);
    assert.equal(finding.line, 8);
  });

  test("resolves a path that does exist, and counts it", async () => {
    const root = await fixture("good-ref", {
      "SKILL.md": skillFile().replace(SKILL_BODY, "See `docs/real.md`.\n"),
      "docs/real.md": "# Real\n",
    });
    const result = await lintSkill(root);
    assert.deepEqual(result.findings, []);
    assert.equal(result.checked.referencedPaths, 1);
  });

  test("skips glob patterns rather than reporting them as missing", async () => {
    const root = await fixture("glob-ref", {
      "SKILL.md": skillFile().replace(SKILL_BODY, "Load `docs/frameworks/**` as needed.\n"),
    });
    assert.deepEqual((await lintSkill(root)).findings, []);
  });
});

describe("rendering", () => {
  test("an empty report states what was checked, not just that it passed", async () => {
    const root = await fixture("render-clean", { "SKILL.md": skillFile() });
    const output = renderSkillLint(await lintSkill(root));
    assert.match(output, /No findings/);
    assert.match(output, /## Checked/);
    assert.match(output, /\*\*Subagent definitions:\*\* 0/);
  });

  test("does not render markdown excerpts inside a swift fence", async () => {
    const root = await fixture("render-finding", {
      "SKILL.md": skillFile(),
      ".claude/agents/bad.md": agentFile({
        name: "bad",
        description: "A reviewer. Use after changes. Read-only — never edits.",
        tools: "Read, Write",
      }),
    });
    const output = renderSkillLint(await lintSkill(root));
    assert.match(output, /agent-read-only-holds-write-tool/);
    assert.ok(!output.includes("```swift"), "skill findings are not Swift source");
  });
});

describe("dogfooding", () => {
  test("this repository lints clean", async () => {
    const result = await lintSkill(REPO_ROOT);
    assert.deepEqual(
      result.findings.map((f) => `${f.file}:${f.line} ${f.rule}`),
      [],
    );
  });

  test("this repository's own checks actually ran", async () => {
    const { checked } = await lintSkill(REPO_ROOT);
    assert.equal(checked.skillFile, "SKILL.md");
    assert.equal(checked.agentCount, 24);
    assert.equal(checked.mirrorCheckSkipped, false);
    assert.ok(checked.mirrorsCompared >= 3, `compared ${checked.mirrorsCompared}`);
    assert.ok(checked.referencedPaths > 100, `resolved ${checked.referencedPaths}`);
  });
});
