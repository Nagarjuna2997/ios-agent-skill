import { defineApply } from "../_sdk/index.js";

// Registers a custom URL scheme derived from the app name, for example
// "foodrun://orders/42". Universal links (https) need a domain; see universal-links.
export default defineApply((ctx) => {
  const scheme = ctx.appName.toLowerCase().replace(/[^a-z0-9]/g, "");
  ctx.setInfoPlist("CFBundleURLTypes", [{ CFBundleURLName: ctx.bundleId, CFBundleURLSchemes: [scheme] }]);
  ctx.note(`Registered the URL scheme ${scheme}://. Test with: xcrun simctl openurl booted ${scheme}://<screen>/<id>`);
});
