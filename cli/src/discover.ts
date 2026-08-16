import fs from "node:fs";
import path from "node:path";

import { INTERNAL_DIR, ProjectLayout, layoutFor } from "./layout.js";

/** How far up the tree to look before giving up. Guards against a symlink loop. */
const MAX_ASCENT = 64;

export interface Discovery {
  readonly layout: ProjectLayout;
  /** How the root was determined — surfaced by `where`, because an implicit root is unfalsifiable. */
  readonly source: "explicit" | "environment" | "ancestor";
}

/**
 * Find the project root for a working directory.
 *
 * Resolution order, highest first:
 *   1. an explicit path the caller passed
 *   2. `IOS_AGENT_HOME`
 *   3. the nearest ancestor containing `.ios-agent/`
 *
 * The upward walk is what git, npm, and cargo all do, and it is why `ios-agent`
 * works from a nested source directory instead of only from the root. Returning
 * `source` alongside the path matters as much as the path: a user staring at an
 * empty result cannot otherwise tell an empty project from a wrong root, which
 * is the single most confusing failure this class of tool has.
 */
export function discoverProject(
  startDir: string = process.cwd(),
  env: NodeJS.ProcessEnv = process.env,
  explicitRoot?: string,
): Discovery | undefined {
  if (explicitRoot) {
    return { layout: layoutFor(explicitRoot), source: "explicit" };
  }

  const fromEnv = env.IOS_AGENT_HOME?.trim();
  if (fromEnv) {
    return { layout: layoutFor(fromEnv), source: "environment" };
  }

  let current = path.resolve(startDir);
  for (let step = 0; step < MAX_ASCENT; step += 1) {
    if (isDirectory(path.join(current, INTERNAL_DIR))) {
      return { layout: layoutFor(current), source: "ancestor" };
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return undefined;
}

function isDirectory(candidate: string): boolean {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
}
