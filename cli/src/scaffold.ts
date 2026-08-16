import fs from "node:fs";
import path from "node:path";

import { APP_DIR, INTERNAL_ENTRIES, ProjectLayout, gitignoreContents, layoutFor } from "./layout.js";
import { defaultConfig, writeConfig } from "./config.js";

export class ScaffoldError extends Error {}

/** Reserved on Windows regardless of extension. Creating one produces an unopenable directory. */
const WINDOWS_RESERVED = new Set([
  "con", "prn", "aux", "nul",
  ...Array.from({ length: 9 }, (_, i) => `com${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `lpt${i + 1}`),
]);

/**
 * Validate a project name before any directory exists.
 *
 * Stricter than the filesystem on purpose. The name becomes a Swift type
 * prefix, a directory, and a target name, so the intersection of what all three
 * accept is what is actually usable — and a name rejected up front costs
 * nothing, while one rejected by Xcode two steps later costs a rebuild.
 */
export function validateProjectName(name: string): void {
  if (name.length === 0) throw new ScaffoldError("Project name cannot be empty.");
  if (name.length > 64) throw new ScaffoldError("Project name cannot exceed 64 characters.");
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
    throw new ScaffoldError(
      `Invalid project name "${name}". Use a letter followed by letters, digits, or underscores — it becomes a Swift type name.`,
    );
  }
  if (WINDOWS_RESERVED.has(name.toLowerCase())) {
    throw new ScaffoldError(`"${name}" is reserved on Windows and cannot be a directory name.`);
  }
}

export interface ScaffoldOptions {
  readonly name: string;
  /** Parent directory. The project is created at `<parentDir>/<name>`. */
  readonly parentDir: string;
  /** Create only `App/`; `.ios-agent/` materialises on first command that needs it. */
  readonly minimal?: boolean;
  readonly license?: "MIT" | "none";
  /** Allow scaffolding into a directory that already has contents. */
  readonly force?: boolean;
  readonly now?: Date;
}

export interface ScaffoldResult {
  readonly layout: ProjectLayout;
  /** Absolute paths written, in creation order. */
  readonly created: string[];
}

export function scaffoldProject(options: ScaffoldOptions): ScaffoldResult {
  const { name, parentDir, minimal = false, license = "MIT", force = false, now = new Date() } = options;
  validateProjectName(name);

  const root = path.join(path.resolve(parentDir), name);
  const layout = layoutFor(root);
  const created: string[] = [];

  if (fs.existsSync(root) && !force) {
    const existing = fs.readdirSync(root);
    if (existing.length > 0) {
      throw new ScaffoldError(
        `${root} already exists and is not empty (${existing.length} entries). Pass --force to scaffold into it anyway.`,
      );
    }
  }

  const write = (target: string, contents: string) => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents, "utf8");
    created.push(target);
  };

  const sourceDir = path.join(layout.app, name);
  const testDir = path.join(layout.app, `${name}Tests`);

  write(path.join(sourceDir, `${name}App.swift`), appEntryPoint(name));
  write(path.join(sourceDir, "ContentView.swift"), contentView(name));
  write(path.join(testDir, `${name}Tests.swift`), testStub(name));

  if (!minimal) {
    write(path.join(root, "README.md"), readme(name));
    write(path.join(root, ".gitignore"), rootGitignore());
    if (license === "MIT") {
      write(path.join(root, "LICENSE"), mitLicense(now.getUTCFullYear()));
    }
    for (const target of ensureInternal(layout)) {
      created.push(target);
    }
    writeConfig(layout, defaultConfig(name, path.join(APP_DIR, name), now));
    created.push(layout.config);
  }

  return { layout, created };
}

/**
 * Create `.ios-agent/` and the entries marked eager, idempotently.
 *
 * Every command that writes calls this first, which is what makes the minimal
 * scaffold honest: `MyApp/App/` alone is a real project, and the internal
 * directory appears the first time there is something to put in it rather than
 * sitting empty as a promise.
 */
export function ensureInternal(layout: ProjectLayout): string[] {
  const created: string[] = [];

  if (!fs.existsSync(layout.internal)) {
    fs.mkdirSync(layout.internal, { recursive: true });
    created.push(layout.internal);
  }

  // Regenerated every time: it is derived from INTERNAL_ENTRIES, so a build
  // that adds a disposable directory fixes stale checkouts on next run.
  fs.writeFileSync(layout.gitignore, gitignoreContents(), "utf8");
  created.push(layout.gitignore);

  for (const entry of INTERNAL_ENTRIES) {
    if (!entry.eager || entry.kind !== "directory") continue;
    const target = path.join(layout.internal, entry.name);
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
      created.push(target);
    }
  }

  return created;
}

/** Create one internal directory on demand. Callers name it via the layout. */
export function ensureInternalDir(layout: ProjectLayout, target: string): string {
  ensureInternal(layout);
  fs.mkdirSync(target, { recursive: true });
  return target;
}

// MARK: - File contents

function appEntryPoint(name: string): string {
  return `import SwiftUI

@main
struct ${name}App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
`;
}

function contentView(name: string): string {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "swift")
                .font(.system(size: 48))
                .foregroundStyle(.tint)

            Text("${name}")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundStyle(Color(.label))

            Text("Replace this view to get started.")
                .font(.body)
                .foregroundStyle(Color(.secondaryLabel))
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview("Light") {
    ContentView()
}

#Preview("Dark") {
    ContentView()
        .preferredColorScheme(.dark)
}
`;
}

function testStub(name: string): string {
  return `import XCTest
@testable import ${name}

final class ${name}Tests: XCTestCase {

    func testPlaceholderIsReplacedBeforeShipping() {
        // Replace this with a real assertion about real behaviour. A test that
        // cannot fail reports success whether the app works or not.
        XCTAssertTrue(true, "placeholder")
    }
}
`;
}

function readme(name: string): string {
  return `# ${name}

## Layout

\`\`\`
${name}/
├── App/            # your source — this is the part you edit
└── .ios-agent/     # tool-managed; safe to delete, regenerates on demand
\`\`\`

Everything outside \`App/\` is managed for you. \`.ios-agent/\` holds caches,
logs, state, and build artifacts; only \`.ios-agent/config.json\` is tracked in
git, and the generated \`.ios-agent/.gitignore\` handles the rest.

## Opening this in Xcode

\`ios-agent\` generates Swift sources, not an Xcode project — an \`.xcodeproj\`
is a build-system artifact that Xcode should own.

1. Xcode → File → New → Project → App (SwiftUI, Swift)
2. Save it inside \`App/\`
3. Right-click the project → Add Files, and add \`App/${name}/\`
4. Build and run with \`Cmd + R\`

## Commands

\`\`\`
ios-agent where      Print resolved paths (add --json for tooling)
ios-agent info       Summarise the project
ios-agent doctor     Check the layout for problems
ios-agent clean      Delete every disposable internal file
\`\`\`
`;
}

function rootGitignore(): string {
  return `# macOS
.DS_Store

# Xcode
build/
DerivedData/
*.xcuserstate
*.xcuserdatad/
xcuserdata/
*.moved-aside

# Swift Package Manager
.build/
.swiftpm/
Package.resolved

# ios-agent internals are ignored by .ios-agent/.gitignore, which is generated
# and kept next to the files it governs. Nothing about them belongs here.
`;
}

function mitLicense(year: number): string {
  return `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}
