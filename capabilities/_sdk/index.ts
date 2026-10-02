// Shared types for capability apply.ts and verify.ts files. These mirror the
// context objects the agent passes in (mcp-server/src/agent/capabilities.ts and
// verify.ts); keep them in sync. Capabilities import nothing else at run time.

export interface PackageDependency {
  name: string;
  url: string;
  version: { from?: string; exactVersion?: string };
  products: string[];
}

export interface ApplyContext {
  readonly id: string;
  readonly appName: string;
  readonly bundleId: string;
  readonly displayName: string;
  /** Folder under the project root that holds app sources (the app name). */
  readonly sourcesDir: string;
  /** Capabilities already applied before this one. */
  readonly capabilities: readonly string[];
  setInfoPlist(key: string, value: unknown): void;
  addEntitlement(key: string, value: unknown): void;
  addBuildSetting(key: string, value: string): void;
  addPackage(pkg: PackageDependency): void;
  setAppIcon(name: string): void;
  /** Keep files matching this glob (relative to the sources folder) out of the build and the app bundle. */
  excludeFromBuild(pattern: string): void;
  /** Use this StoreKit configuration (path relative to the sources folder) when running from Xcode. */
  setStoreKitConfiguration(path: string): void;
  /**
   * Add a widget or Live Activity to the app's WidgetKit extension (target
   * `<AppName>Widgets`, created on first use). `widget` is the Swift expression
   * listed in the generated WidgetBundle, such as "OrderStatusLiveActivity()".
   * `sources` (relative to the sources folder) are compiled into the extension;
   * `extensionOnly` paths are also kept out of the app target.
   */
  addWidget(options: { widget: string; sources: string[]; extensionOnly?: string[]; entitlements?: Record<string, unknown> }): void;
  /** Render SVG markup to PNG at the given width with resvg (no network, no system fonts). */
  renderPng(svg: string, width: number): Uint8Array;
  /** Composite square SVG layers over an opaque #RRGGBB background into AppIcon.appiconset files (keys relative to the asset catalog). */
  appIconSet(layers: string[], background: string): Promise<Record<string, string | Uint8Array>>;
  /** Write a file relative to the app sources folder; existing different files are kept. */
  writeFile(path: string, content: string | Uint8Array): Promise<void>;
  note(message: string): void;
}

export type Apply = (ctx: ApplyContext) => void | Promise<void>;

/** Manifest requirements and template/ are applied by the agent; use this for anything extra. */
export function defineApply(apply: Apply): Apply {
  return apply;
}

export interface VerifyOutcome {
  status: "verified" | "failed" | "blocked";
  reason?: string;
  errors?: Array<{ file?: string; line?: number; message: string }>;
  toolchain?: string;
}

export interface VerifyContext {
  readonly id: string;
  /**
   * Create a minimal SwiftUI app, apply this capability (and its dependencies),
   * add the given extra source files under the app folder, and build it for
   * the iOS Simulator. Blocked when Xcode or a simulator is not available.
   * XcodeGen is used when installed; otherwise the built-in project writer.
   */
  buildMinimalApp(extraFiles?: Record<string, string>): Promise<VerifyOutcome>;
}

export type Verify = (ctx: VerifyContext) => Promise<VerifyOutcome>;

export function defineVerify(verify: Verify): Verify {
  return verify;
}
