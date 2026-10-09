import { defineApply } from "../_sdk/index.js";
import { contrast, hslFromHex, readable } from "../_sdk/brand.js";

// Semantic color sets with light and dark variants, derived from the approved
// plan palette. Foreground and accent colors are adjusted for WCAG AA contrast.
const component = (hex: string, offset: number) => (parseInt(hex.slice(offset, offset + 2), 16) / 255).toFixed(3);
const colorset = (light: string, dark: string) =>
  JSON.stringify(
    {
      colors: [
        { color: { "color-space": "srgb", components: { alpha: "1.000", red: component(light, 1), green: component(light, 3), blue: component(light, 5) } }, idiom: "universal" },
        {
          appearances: [{ appearance: "luminosity", value: "dark" }],
          color: { "color-space": "srgb", components: { alpha: "1.000", red: component(dark, 1), green: component(dark, 3), blue: component(dark, 5) } },
          idiom: "universal",
        },
      ],
      info: { author: "xcode", version: 1 },
    },
    null,
    2,
  ) + "\n";

export function paletteAssetFiles(palette: { name: string; primary: string; secondary: string; accent: string }): Record<string, string> {
  const accessible = (hex: string, text: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
    if (contrast(hex, text) >= 4.5) return hex.toUpperCase();
    const { hue, saturation, lightness } = hslFromHex(hex);
    return readable(hue, saturation, lightness, text, text === "#FFFFFF" ? "darker" : "lighter");
  };
  const textOnPrimaryLight = contrast(palette.primary, "#FFFFFF") >= contrast(palette.primary, "#111111") ? "#FFFFFF" : "#111111";
  const textOnPrimaryDark = contrast(palette.primary, "#111111") >= contrast(palette.primary, "#FFFFFF") ? "#111111" : "#FFFFFF";
  const primaryLight = accessible(palette.primary, textOnPrimaryLight);
  const primaryDark = accessible(palette.primary, textOnPrimaryDark);
  const secondaryLight = accessible(palette.secondary, textOnPrimaryLight);
  const secondaryDark = accessible(palette.secondary, textOnPrimaryDark);
  const accentLight = accessible(palette.accent, textOnPrimaryLight);
  const accentDark = accessible(palette.accent, textOnPrimaryDark);
  const colors: Record<string, [string, string]> = {
    BrandPrimary: [primaryLight, primaryDark],
    BrandSecondary: [secondaryLight, secondaryDark],
    BrandAccent: [accentLight, accentDark],
    BrandSurface: ["#F5F7FA", "#191C22"],
    BrandOnPrimary: [textOnPrimaryLight, textOnPrimaryDark],
  };
  const files: Record<string, string> = {};
  for (const [name, [light, dark]] of Object.entries(colors)) {
    files[`Resources/Assets.xcassets/${name}.colorset/Contents.json`] = colorset(light, dark);
  }
  files["Resources/Assets.xcassets/AccentColor.colorset/Contents.json"] = colorset(primaryLight, primaryDark);
  return files;
}

export default defineApply(async (ctx) => {
  const palette = ctx.design?.palette ?? { name: "Ocean Ink", primary: "#1677C8", secondary: "#48A9A6", accent: "#F2A65A" };
  for (const [path, contents] of Object.entries(paletteAssetFiles(palette))) await ctx.writeFile(path, contents);
  ctx.note(`Applied the ${palette.name} palette from the app plan; primary and accent text colors are adjusted to meet WCAG AA contrast where needed.`);
});
