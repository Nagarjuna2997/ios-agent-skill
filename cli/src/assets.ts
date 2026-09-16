import { iconFiles } from "./icon.js";
import fs from "node:fs";
import path from "node:path";

export const defaultTokens = { version: 1, colors: {
  AccentColor: { light: "#2457DB", dark: "#90B4FF", highContrastLight: "#12358F", highContrastDark: "#C7DAFF" },
  Background: { light: "#FFFFFF", dark: "#000000", highContrastLight: "#FFFFFF", highContrastDark: "#000000" },
  TextPrimary: { light: "#202020", dark: "#F5F5F5", highContrastLight: "#000000", highContrastDark: "#FFFFFF" }
}};
const variants = ["light", "dark", "highContrastLight", "highContrastDark"] as const;
const info = { version: 1, author: "xcode" };
const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n";
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** Pure transform. All four appearances are explicit; no guessed dark colors. */
export function assetFiles(input: unknown): Record<string, string> {
  if (!object(input) || input.version !== 1 || !object(input.colors) || Object.keys(input).some(k => !["version", "colors"].includes(k))) throw Error("Expected version: 1 and colors object.");
  const entries = Object.entries(input.colors);
  if (!entries.length || entries.length > 512 || !Object.hasOwn(input.colors, "AccentColor")) throw Error("Provide 1–512 colors including AccentColor.");
  const files: Record<string, string> = { "Contents.json": json({ info }) };
  const names = new Set<string>();
  for (const [name, values] of entries) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(name) || names.has(name.toLowerCase()) || /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name)) throw Error(`Invalid or case-colliding asset name: ${name}`);
    names.add(name.toLowerCase());
    if (!object(values) || Object.keys(values).length !== 4 || variants.some(v => typeof values[v] !== "string" || !/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(values[v] as string))) throw Error(`${name}: require light, dark, highContrastLight, highContrastDark as #RRGGBB or #RRGGBBAA.`);
    const colors = variants.map(variant => {
      const hex = values[variant] as string;
      const channel = (offset: number) => (parseInt(hex.slice(offset, offset + 2), 16) / 255).toFixed(8);
      const appearances = [];
      if (variant === "dark" || variant === "highContrastDark") appearances.push({ appearance: "luminosity", value: "dark" });
      if (variant.startsWith("highContrast")) appearances.push({ appearance: "contrast", value: "high" });
      return { idiom: "universal", ...(appearances.length ? { appearances } : {}), color: { "color-space": "srgb", components: { red: channel(1), green: channel(3), blue: channel(5), alpha: hex.length === 9 ? channel(7) : "1.00000000" } } };
    });
    files[`${name}.colorset/Contents.json`] = json({ info, colors });
  }
  return files;
}
/** New catalog only: never overwrite designer-authored assets. */
export function generateAssets(tokensPath: string, destination: string, iconDirectory?: string, background = "#FFFFFF"): string[] {
  const stat = fs.lstatSync(tokensPath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw Error("Tokens must be a regular JSON file under 1 MiB.");
  const files: Record<string, string | Buffer> = { ...assetFiles(JSON.parse(fs.readFileSync(tokensPath, "utf8"))), ...(iconDirectory ? iconFiles(iconDirectory, background) : {}) };
  const target = path.resolve(destination);
  if (!target.endsWith(".xcassets")) throw Error("Output must end in .xcassets.");
  const parent = path.dirname(target);
  if (!fs.statSync(parent).isDirectory()) throw Error("Output parent must exist.");
  if (fs.existsSync(target)) throw Error("Catalog already exists. Generate to a new catalog and review the diff.");
  const staging = fs.mkdtempSync(path.join(parent, ".assets-"));
  try {
    for (const [relative, contents] of Object.entries(files)) {
      const file = path.join(staging, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, contents);
    }
    // Reserve destination without replacing an existing folder or symlink.
    fs.mkdirSync(target);
    for (const entry of fs.readdirSync(staging)) fs.renameSync(path.join(staging, entry), path.join(target, entry));
  } finally { fs.rmSync(staging, { recursive: true, force: true }); }
  return Object.keys(files).map(file => path.join(target, file));
}
