import { defineApply } from "../_sdk/index.js";
import { contrast, hslFromHex, readable } from "../_sdk/brand.js";

// Semantic colors with light and dark variants, derived from one brand hue
// (from the bundle identifier until the user supplies brand colors). Primary
// and secondary are adjusted until BrandOnPrimary text on them reaches 4.5:1.
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

export default defineApply(async (ctx) => {
  const palette = ctx.design?.palette ?? { primary: "#1677C8", secondary: "#48A9A6", accent: "#F2A65A" };
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
  for (const [name, [light, dark]] of Object.entries(colors)) {
    await ctx.writeFile(`Resources/Assets.xcassets/${name}.colorset/Contents.json`, colorset(light, dark));
  }
  await ctx.writeFile("Resources/Assets.xcassets/AccentColor.colorset/Contents.json", colorset(primaryLight, primaryDark));
  ctx.note(`Applied the ${ctx.design?.palette.name ?? "default Ocean Ink"} palette from the app plan; primary and accent text colors are adjusted to meet WCAG AA contrast where needed.`);
});
