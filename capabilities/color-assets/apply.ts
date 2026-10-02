import { defineApply } from "../_sdk/index.js";
import { brandHue, hsl, readable } from "../_sdk/brand.js";

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
  const hue = brandHue(ctx.bundleId);
  const colors: Record<string, [string, string]> = {
    BrandPrimary: [readable(hue, 70, 45, "#FFFFFF", "darker"), readable(hue, 75, 62, "#111111", "lighter")],
    BrandSecondary: [readable((hue + 150) % 360, 55, 42, "#FFFFFF", "darker"), readable((hue + 150) % 360, 60, 64, "#111111", "lighter")],
    BrandSurface: [hsl(hue, 30, 96), hsl(hue, 15, 12)],
    BrandOnPrimary: ["#FFFFFF", "#111111"],
  };
  for (const [name, [light, dark]] of Object.entries(colors)) {
    await ctx.writeFile(`Resources/Assets.xcassets/${name}.colorset/Contents.json`, colorset(light, dark));
  }
  ctx.note("Brand colors were derived from the bundle identifier; replace them with the real palette (generate_color_system can propose one).");
});
