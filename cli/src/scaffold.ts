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
  readonly brief?: string;
  readonly xcodegen?: boolean;
}

export interface ScaffoldResult {
  readonly layout: ProjectLayout;
  /** Absolute paths written, in creation order. */
  readonly created: string[];
}

export function scaffoldProject(options: ScaffoldOptions): ScaffoldResult {
  const { name, parentDir, minimal = false, license = "MIT", force = false, now = new Date() } = options;
  validateProjectName(name);
  if (options.brief !== undefined && !options.brief.trim()) throw new ScaffoldError("--brief requires a non-empty description.");

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

  const planned = new Map<string, string>();
  const write = (target: string, contents: string) => { planned.set(target, contents); };

  const sourceDir = path.join(layout.app, name);
  const testDir = path.join(layout.app, `${name}Tests`);

  write(path.join(sourceDir, `${name}App.swift`), appEntryPoint(name));
  write(path.join(sourceDir, "ContentView.swift"), contentView(name));
  write(path.join(testDir, `${name}Tests.swift`), testStub(name));

  if (options.brief !== undefined) write(path.join(layout.app, "APP_BRIEF.md"), implementationBrief(name, options.brief));
  if (options.xcodegen) {
    write(path.join(layout.app, "project.yml"), projectSpec(name));
    write(path.join(layout.app, "BUILD.md"), buildInstructions(name));
    for (const [file, contents] of Object.entries(iconLayers())) write(path.join(sourceDir, "IconLayers", file), contents);
  }

  if (!minimal) {
    write(path.join(root, "README.md"), options.xcodegen ? readme(name).replace(/## Opening this in Xcode[\s\S]*?## Commands/, "## Opening this in Xcode\n\nSee [App/BUILD.md](App/BUILD.md) for XcodeGen generation and simulator builds.\n\n## Commands") : readme(name));
    write(path.join(root, ".gitignore"), rootGitignore());
    if (license === "MIT") {
      write(path.join(root, "LICENSE"), mitLicense(now.getUTCFullYear()));
    }
  }

  // Preflight all authored files, even under --force, before writing anything.
  for (const target of [...planned.keys(), ...(!minimal ? [layout.config, layout.gitignore] : [])]) {
    let candidate = target;
    while (candidate !== path.dirname(root)) {
      if (fs.existsSync(candidate) || fs.lstatSync(candidate, { throwIfNoEntry: false })) {
        const stat = fs.lstatSync(candidate);
        if (candidate === target || stat.isSymbolicLink() || !stat.isDirectory()) {
          throw new ScaffoldError(`Refusing to overwrite or follow existing path: ${candidate}`);
        }
      }
      candidate = path.dirname(candidate);
    }
  }
  if (!minimal && fs.existsSync(layout.config)) throw new ScaffoldError(`Refusing to overwrite ${layout.config}`);
  for (const [target, contents] of planned) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, contents, { encoding: "utf8", flag: "wx" });
    created.push(target);
  }

  if (!minimal) {
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

private enum StarterTokens {
    static let spacing: CGFloat = 16
    static let padding: CGFloat = 24
    static let symbolSize: CGFloat = 48
}

struct ContentView: View {
    var body: some View {
        VStack(spacing: StarterTokens.spacing) {
            Image(systemName: "swift")
                .font(.system(size: StarterTokens.symbolSize))
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
        .padding(StarterTokens.padding)
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
@testable import \`${name}\`

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

function implementationBrief(name: string, brief: string): string {
  return `# ${name} implementation brief

This is an editable handoff for your coding agent. The CLI saved your description;
it has not generated or implemented these features.

## App description

${brief}

## Implementation checklist

- Translate the description into the primary user journey and a small first release.
- Define screens, navigation, data models, persistence, and loading/empty/error states.
- Choose semantic colors and reusable spacing/type tokens; support Dynamic Type and dark mode.
- Implement the app in SwiftUI, with offline previews and injected dependencies where needed.
- Customize IconLayers, import the layers into Icon Composer, and validate the resulting icon in Xcode.
- Build and test on an available simulator; report actual results and remaining limitations.
`;
}

function projectSpec(name: string): string {
  // Names have already passed the Swift/filesystem allowlist; quote YAML scalars
  // anyway so names such as Yes, Null, and On remain strings.
  const quoted = JSON.stringify(name);
  const bundle = name.toLowerCase().replace(/_/g, "-");
  return `name: ${quoted}
options:
  deploymentTarget:
    iOS: "17.0"
settings:
  base:
    SWIFT_VERSION: "5.0"
    GENERATE_INFOPLIST_FILE: YES
    CURRENT_PROJECT_VERSION: "1"
    MARKETING_VERSION: "1.0"
targets:
  ${quoted}:
    type: application
    platform: iOS
    sources:
      - path: ${quoted}
        excludes:
          - IconLayers
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: "com.example.${bundle}"
        INFOPLIST_KEY_UILaunchScreen_Generation: YES
        INFOPLIST_KEY_UIApplicationSceneManifest_Generation: YES
        TARGETED_DEVICE_FAMILY: "1,2"
  "${name}Tests":
    type: bundle.unit-test
    platform: iOS
    sources:
      - path: "${name}Tests"
    dependencies:
      - target: ${quoted}
    settings:
      base:
        PRODUCT_BUNDLE_IDENTIFIER: "com.example.${bundle}.tests"
schemes:
  ${quoted}:
    build:
      targets:
        ${quoted}: all
    test:
      targets:
        - "${name}Tests"
`;
}

function buildInstructions(name: string): string {
  return `# Build ${name}

Prerequisites: macOS, Xcode 15 or newer with an installed iOS simulator runtime,
and XcodeGen installed separately. The CLI does not install or run these tools.
Icon Composer requires a compatible Xcode installation and is only needed for icon editing.

From this App directory:

\`\`\`sh
xcodegen generate --spec project.yml
open ${name}.xcodeproj
xcodebuild -project ${name}.xcodeproj -scheme ${name} -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath ../.ios-agent/build build CODE_SIGNING_ALLOWED=NO
xcodebuild -project ${name}.xcodeproj -scheme ${name} -showdestinations
\`\`\`

Choose an available simulator destination from that list to run tests in Xcode
or with xcodebuild test. The starter test is a placeholder: replace it with real
behavior assertions. Device builds require your own bundle identifier and signing team.
Edit project.yml and regenerate when changing targets or build settings.
No .xcodeproj is created until you run XcodeGen. The project has no shipping app
icon yet; see ${name}/IconLayers/README.md before distribution.
`;
}

function iconLayers(): Record<string, string> {
  const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${body}</svg>\n`;
  return {
    "background.svg": svg('<rect width="1024" height="1024" fill="#2457DB"/>'),
    "foreground.svg": svg('<path d="M512 220 L804 512 L512 804 L220 512 Z" fill="#FFFFFF"/>'),
    "accent.svg": svg('<circle cx="512" cy="512" r="96" fill="#90E8FF"/>'),
    "manifest.json": JSON.stringify({ format: "ios-agent-svg-layer-starter", version: 1, canvas: { width: 1024, height: 1024 }, layers: ["background.svg", "foreground.svg", "accent.svg"], nativeIconCreated: false }, null, 2) + "\n",
    "README.md": `# Editable icon layers

These are separate SVG starter assets, ordered background → foreground → accent.
Edit their paths and colors in a vector editor to fit your app. They are generic
placeholders, not finished branding or an Icon Composer document.

1. Open Icon Composer from a compatible Xcode installation and create a new icon.
2. Import each SVG as a separate layer, preserving the back-to-front order above.
3. Adjust groups, materials, and appearances; preview at small sizes.
4. Save the native .icon document under App/<Name>/ and add it to your Xcode target.
5. Configure the app icon in Xcode and build to validate all required appearances.

manifest.json describes these source layers for humans and tooling; it is not
Apple's .icon format. No native .icon has been created or validated. The XcodeGen
spec excludes this folder from app resources. After adding a native icon, update
project.yml as required by your Xcode/XcodeGen versions and regenerate the project.
`,
  };
}
