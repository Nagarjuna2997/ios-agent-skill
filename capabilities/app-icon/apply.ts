import { defineApply } from "../_sdk/index.js";

// App icon: editable square SVG layers (kept in the project, excluded from the
// build) composited into an opaque 1024 px AppIcon by the existing local
// renderer. Import the layers into Icon Composer for a native layered icon.
export default defineApply(async (ctx) => {
  const palette = ctx.design?.palette ?? { name: "Ocean Ink", primary: "#1677C8", secondary: "#48A9A6", accent: "#F2A65A" };
  const background = palette.primary;
  const highlight = palette.secondary;
  const layers = {
    "background.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${highlight}"/><stop offset="1" stop-color="${background}"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/></svg>`,
    "foreground.svg": `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><circle cx="512" cy="512" r="236" fill="none" stroke="#FFFFFF" stroke-width="76"/><circle cx="512" cy="512" r="72" fill="#FFFFFF"/></svg>`,
  };
  for (const [name, svg] of Object.entries(layers)) await ctx.writeFile(`Resources/IconLayers/${name}`, svg + "\n");
  await ctx.writeFile(
    "Resources/IconLayers/README.md",
    "Editable icon layers, back to front: background.svg, foreground.svg. They are excluded from the app build.\nImport them into Icon Composer (Xcode) to create a layered .icon for Liquid Glass; the AppIcon PNG in Assets.xcassets is the flat fallback.\n",
  );
  ctx.excludeFromBuild("Resources/IconLayers/**");
  const files = await ctx.appIconSet(Object.values(layers), background);
  for (const [path, content] of Object.entries(files)) await ctx.writeFile(`Resources/Assets.xcassets/${path}`, content);
  ctx.setAppIcon("AppIcon");
  ctx.note(`Generated editable placeholder icon layers using the approved ${palette.name} plan palette; replace the geometry with brand artwork when available.`);
});
