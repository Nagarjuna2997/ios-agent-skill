#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const catalogPath = join(root, "frameworks.json");
const indexPath = join(root, "docs/apple-framework-index.md");
const readmePath = join(root, "README.md");
const write = process.argv.includes("--write");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const allowedStatuses = new Set(["active", "planned", "deprecated", "skipped"]);
const problems = [];
const seen = new Set();

if (catalog.schemaVersion !== 1) {
  problems.push("frameworks.json: schemaVersion must be 1");
}

if (!Array.isArray(catalog.technologies)) {
  problems.push("frameworks.json: technologies must be an array");
}

for (const [index, item] of catalog.technologies.entries()) {
  const label = item.name || `entry ${index}`;

  for (const key of ["name", "category", "platforms", "covered", "status"]) {
    if (!(key in item)) {
      problems.push(`${label}: missing ${key}`);
    }
  }

  if (seen.has(item.name)) {
    problems.push(`${label}: duplicate technology name`);
  }
  seen.add(item.name);

  if (!Array.isArray(item.platforms) || item.platforms.length === 0) {
    problems.push(`${label}: platforms must be a non-empty array`);
  }

  if (typeof item.covered !== "boolean") {
    problems.push(`${label}: covered must be boolean`);
  }

  if (!allowedStatuses.has(item.status)) {
    problems.push(`${label}: status must be one of ${[...allowedStatuses].join(", ")}`);
  }

  if (item.appleDocumentation && !String(item.appleDocumentation).startsWith("https://developer.apple.com/")) {
    problems.push(`${label}: appleDocumentation must point at developer.apple.com`);
  }

  if (item.covered && !item.guide) {
    problems.push(`${label}: covered entries must name a guide`);
  }

  if (item.guide && !existsSync(join(root, item.guide))) {
    problems.push(`${label}: guide does not exist: ${item.guide}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

const counts = {
  tracked: catalog.technologies.length,
  covered: catalog.technologies.filter((item) => item.covered).length,
  planned: catalog.technologies.filter((item) => item.status === "planned").length,
  skipped: catalog.technologies.filter((item) => item.status === "skipped").length,
  deprecated: catalog.technologies.filter((item) => item.status === "deprecated").length,
};
counts.coverage = `${((counts.covered / counts.tracked) * 100).toFixed(1)}%`;

const byCategory = new Map();
for (const item of catalog.technologies) {
  const group = byCategory.get(item.category) || [];
  group.push(item);
  byCategory.set(item.category, group);
}

function guideCell(item) {
  if (!item.guide) {
    return "";
  }
  const href = item.guide.startsWith("docs/") ? item.guide.replace(/^docs\//, "") : `../${item.guide}`;
  return `[${item.guide}](${href})`;
}

function renderIndex() {
  const lines = [
    "# Apple Framework Index",
    "",
    "This file is generated from `frameworks.json`. Run `node scripts/check-framework-catalog.mjs --write` after editing the catalog.",
    "",
    "The goal is not to mirror every Apple documentation navigator entry. The goal is to track the Apple app-development technologies an AI iOS engineer should route, use, or deliberately skip.",
    "",
    "## Coverage",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Tracked technologies | ${counts.tracked} |`,
    `| Covered by a guide | ${counts.covered} |`,
    `| Planned | ${counts.planned} |`,
    `| Skipped | ${counts.skipped} |`,
    `| Deprecated | ${counts.deprecated} |`,
    `| Coverage | ${counts.coverage} |`,
    "",
  ];

  for (const [category, items] of [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`## ${category}`, "", "| Technology | Platforms | Status | Guide |", "|---|---|---|---|");
    for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`| ${item.name} | ${item.platforms.join(", ")} | ${item.status}${item.covered ? " / covered" : ""} | ${guideCell(item)} |`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function renderReadmeBlock() {
  return [
    "<!-- apple-catalog:start -->",
    `Apple catalog tracked: **${counts.tracked}** technologies. Covered: **${counts.covered}**. Planned: **${counts.planned}**. Skipped: **${counts.skipped}**. Deprecated: **${counts.deprecated}**. Coverage: **${counts.coverage}**.`,
    "",
    "Source of truth: [`frameworks.json`](frameworks.json). Human index: [`docs/apple-framework-index.md`](docs/apple-framework-index.md).",
    "<!-- apple-catalog:end -->",
  ].join("\n");
}

const expectedIndex = renderIndex();
const currentIndex = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";

const readme = readFileSync(readmePath, "utf8");
const blockPattern = /<!-- apple-catalog:start -->[\s\S]*?<!-- apple-catalog:end -->/;
const expectedBlock = renderReadmeBlock();

if (write) {
  writeFileSync(indexPath, expectedIndex);
  if (!blockPattern.test(readme)) {
    throw new Error("README.md is missing apple-catalog markers");
  }
  writeFileSync(readmePath, readme.replace(blockPattern, expectedBlock));
  console.log(`Apple catalog tracked: ${counts.tracked}; covered: ${counts.covered}; coverage: ${counts.coverage}`);
  process.exit(0);
}

if (currentIndex !== expectedIndex) {
  console.error("docs/apple-framework-index.md is stale. Run node scripts/check-framework-catalog.mjs --write");
  process.exit(1);
}

if (!blockPattern.test(readme)) {
  console.error("README.md is missing apple-catalog markers");
  process.exit(1);
}

if (readme.match(blockPattern)[0] !== expectedBlock) {
  console.error("README.md Apple catalog summary is stale. Run node scripts/check-framework-catalog.mjs --write");
  process.exit(1);
}

console.log(`OK - Apple catalog tracked: ${counts.tracked}; covered: ${counts.covered}; coverage: ${counts.coverage}`);
