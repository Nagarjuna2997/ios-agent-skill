import { defineApply } from "../_sdk/index.js";
import { paletteAssetFiles } from "../color-assets/apply.js";

const colorset = JSON.stringify(
  {
    colors: [
      { color: { "color-space": "srgb", components: { alpha: "1.000", red: "0.949", green: "0.949", blue: "0.969" } }, idiom: "universal" },
      {
        appearances: [{ appearance: "luminosity", value: "dark" }],
        color: { "color-space": "srgb", components: { alpha: "1.000", red: "0.110", green: "0.110", blue: "0.118" } },
        idiom: "universal",
      },
    ],
    info: { author: "xcode", version: 1 },
  },
  null,
  2,
);

const imageset = JSON.stringify(
  {
    images: [
      { filename: "LaunchLogo.png", idiom: "universal", scale: "1x" },
      { filename: "LaunchLogo@2x.png", idiom: "universal", scale: "2x" },
      { filename: "LaunchLogo@3x.png", idiom: "universal", scale: "3x" },
    ],
    info: { author: "xcode", version: 1 },
  },
  null,
  2,
);

// Launch screen: a background color with light and dark variants and a logo
// image, declared through Info.plist UILaunchScreen (no storyboard). The
// SplashContainer template continues the same picture into an animation.
export default defineApply(async (ctx) => {
  const palette = ctx.design?.palette ?? { name: "Ocean Ink", primary: "#1677C8", secondary: "#48A9A6", accent: "#F2A65A" };
  const accent = palette.primary;
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect x="20" y="20" width="200" height="200" rx="52" fill="${accent}"/><circle cx="120" cy="120" r="56" fill="none" stroke="#FFFFFF" stroke-width="18"/><circle cx="120" cy="120" r="16" fill="#FFFFFF"/></svg>`;
  const catalog = "Resources/Assets.xcassets";
  const surface = paletteAssetFiles(palette)["Resources/Assets.xcassets/BrandSurface.colorset/Contents.json"];
  await ctx.writeFile(`${catalog}/LaunchBackground.colorset/Contents.json`, surface ?? `${colorset}\n`);
  await ctx.writeFile(`${catalog}/LaunchLogo.imageset/Contents.json`, imageset + "\n");
  await ctx.writeFile(`${catalog}/LaunchLogo.imageset/LaunchLogo.png`, ctx.renderPng(logo, 120));
  await ctx.writeFile(`${catalog}/LaunchLogo.imageset/LaunchLogo@2x.png`, ctx.renderPng(logo, 240));
  await ctx.writeFile(`${catalog}/LaunchLogo.imageset/LaunchLogo@3x.png`, ctx.renderPng(logo, 360));
  ctx.setInfoPlist("UILaunchScreen", { UIColorName: "LaunchBackground", UIImageName: "LaunchLogo", UIImageRespectsSafeAreaInsets: true });
  ctx.note(`Generated a static launch screen using the approved ${palette.name} plan palette; replace LaunchLogo with the brand mark.`);
});
