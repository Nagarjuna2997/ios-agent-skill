/** Target-aware, read-only launch configuration checks. Unknown evidence is not a defect. */
import { readdir, readFile, stat } from 'node:fs/promises';
import { posix } from 'node:path';
import * as plist from 'plist';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { Finding } from './types.js';
import {projectPaths, parsePropertyList} from '../release/project.js';
const DOC = 'docs/tooling/launch-screen-review.md';
type Obj = Record<string, any>;
export interface LaunchReport { findings: Finding[]; coverage: string[]; configurations: number }
const skip = new Set(['.git', '.ios-agent', '.build', 'DerivedData', 'Pods', 'Carthage', 'node_modules', 'build', 'vendor', 'Vendor']);
const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: false });
const dict = (v: any): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const literal = (v: any): v is string => typeof v === 'string' && !/\$[({]/.test(v);
const yes = (v: any) => v === 'YES' || v === true;
const array = (v: any): any[] => Array.isArray(v) ? v : v ? [v] : [];

/** Inventory never follows symlinks; incomplete scans cannot prove missing resources. */
export async function reviewLaunchScreens(root: string, selection?: {project: string; target: string; configuration: string}): Promise<LaunchReport> {
  const findings: Finding[] = [], coverage: string[] = [];
  const excluded = new Set<string>();
  const files = new Set<string>(), contents = new Map<string, Buffer>();
  let complete = true, visited = 0, configurations = 0, parsedBytes = 0;
  async function walk(dir: string) {
    if (++visited > 10000) { complete = false; return; }
    let entries;
    try { entries = await readdir(posix.join(root, dir), { withFileTypes: true }); }
    catch { complete = false; return; }
    for (const e of entries) {
      const p = posix.join(dir, e.name);
      if (e.isSymbolicLink()) { complete = false; continue; }
      if (e.isDirectory()) { if (!skip.has(e.name)) await walk(p); else excluded.add(p); continue; }
      if (!e.isFile()) continue;
      if (files.size >= 10000) { complete = false; return; }
      files.add(p);
      if (/\.(pbxproj|plist|storyboard)$|\/Contents\.json$/.test(p)) {
        try {
          const size = (await stat(posix.join(root, p))).size;
          if (size > 1024 * 1024 || parsedBytes + size > 32 * 1024 * 1024) { complete = false; continue; }
          parsedBytes += size;
          const b = await readFile(posix.join(root, p));
          if (b.length > 1024 * 1024) { complete = false; continue; }
          contents.set(p, b);
        } catch { complete = false; }
      }
    }
  }
  await walk('');
  if (!complete) coverage.push('Inventory incomplete (limits, unreadable files or symlinks); missing-resource checks suppressed.');
  function issue(file: string, rule: string, message: string, fix: string, token = '', severity: Finding['severity'] = 'serious') {
    const buffer = contents.get(file);
    const source = buffer?.subarray(0,6).toString() === 'bplist' ? '' : buffer?.toString('utf8') || '';
    const lines = source.split('\n');
    const index = token ? lines.findIndex(l => l.includes(token)) : -1;
    findings.push({ file, line: index < 0 ? 1 : index + 1, rule, severity, message,
      consequence: 'The configured launch appearance may be unavailable or differ from the intended static launch screen.',
      fix, doc: DOC, excerpt: index < 0 ? '' : lines[index]!.trim() });
  }
  function parsePlist(p: string): Obj | undefined {
    const b = contents.get(p);
    if (!b) return;
    try {
      const result = parsePropertyList(b);
      return dict(result) ? result : undefined;
    } catch { return; }
  }
  for (const project of [...files].filter(p => p.endsWith('.xcodeproj/project.pbxproj') && (!selection || selection.project === p))) {
    let parsed: Obj;
    try { parsed = plist.parseOpenStep(contents.get(project)!.toString()) as Obj; }
    catch { coverage.push(`${project}: cannot parse project; skipped.`); continue; }
    const objects: Obj = parsed.objects || {}, base = posix.dirname(posix.dirname(project));
    const projectObj = objects[parsed.rootObject];
    if (!projectObj) { coverage.push(`${project}: missing project object.`); continue; }
    const filePath = projectPaths(objects, base);
    const configs = (id: string) => array(objects[id]?.buildConfigurations).map(k => objects[k]).filter(Boolean);
    for (const target of array(projectObj.targets).map(id => objects[id]).filter((o: Obj) => o && o.isa === 'PBXNativeTarget' && o.productType === 'com.apple.product-type.application')) {
      if (selection && target.name !== selection.target) continue;
      const resources = new Set<string>(); let resourceKnown = !array(target.fileSystemSynchronizedGroups).length;
      for (const id of array(target.buildPhases)) {
        const phase = objects[id];
        if (phase?.isa === 'PBXShellScriptBuildPhase' || phase?.isa === 'PBXCopyFilesBuildPhase') resourceKnown = false;
        if (phase?.isa !== 'PBXResourcesBuildPhase') continue;
        function resource(ref: string) {
          const o = objects[ref]; if (!o) { resourceKnown = false; return; }
          if (o.isa === 'PBXVariantGroup') { for (const c of array(o.children)) resource(c); return; }
          const p = filePath(ref); if (p === undefined) resourceKnown = false; else { resources.add(p); if ([...excluded].some(dir => p === dir || p.startsWith(dir + '/') || dir.startsWith(p + '/'))) resourceKnown = false; if (o.lastKnownFileType === 'folder' || o.explicitFileType === 'folder') resourceKnown = false; }
        }
        for (const build of array(phase.files)) {
          const bf = objects[build];
          if (bf?.platformFilter || bf?.platformFilters) { resourceKnown = false; continue; }
          resource(bf?.fileRef);
        }
      }
      for (const cfg of configs(target.buildConfigurationList)) {
        if (selection && cfg.name !== selection.configuration) continue;
        const pc = configs(projectObj.buildConfigurationList).find(c => c.name === cfg.name);
        const label = `${target.name || 'app'}/${cfg.name || 'configuration'}`;
        const settings = { ...(pc?.buildSettings || {}), ...(cfg.buildSettings || {}) };
        if (settings.EXCLUDED_SOURCE_FILE_NAMES || settings.INCLUDED_SOURCE_FILE_NAMES) { coverage.push(`${label}: resource inclusion/exclusion settings require Xcode resolution; skipped.`); continue; }
        if (cfg.baseConfigurationReference || pc?.baseConfigurationReference || Object.keys(settings).some(k => k.includes('['))) {
          coverage.push(`${label}: xcconfig or conditional settings need Xcode resolution; skipped.`); continue;
        }
        if (!/^iphone(os|simulator)/.test(settings.SDKROOT || '') && !String(settings.SUPPORTED_PLATFORMS || '').includes('iphone')) continue;
        if (settings.INFOPLIST_PREPROCESS === 'YES') { coverage.push(`${label}: preprocessed plist skipped.`); continue; }
        let info: Obj = {}, source = project;
        if (['GENERATE_INFOPLIST_FILE','INFOPLIST_KEY_UILaunchScreen_Generation'].some(k => settings[k] !== undefined && !['YES','NO',true,false].includes(settings[k]))) { coverage.push(`${label}: unresolved plist generation settings; skipped.`); continue; }
        const generated = yes(settings.GENERATE_INFOPLIST_FILE);
        if (settings.INFOPLIST_FILE) {
          let p = settings.INFOPLIST_FILE;
          if (typeof p !== 'string') { coverage.push(`${label}: nonliteral plist path.`); continue; }
          p = p.replace(/\$\((SRCROOT|PROJECT_DIR)\)|\$\{(SRCROOT|PROJECT_DIR)\}/g, base === '.' ? '.' : base);
          if (!literal(p) || p.startsWith('/')) { coverage.push(`${label}: unresolved plist path.`); continue; }
          // Plain paths are relative to the directory containing the xcodeproj.
          if (!/\$[({](SRCROOT|PROJECT_DIR)/.test(settings.INFOPLIST_FILE)) p = posix.join(base, p);
          p = posix.normalize(p);
          const parsedInfo = parsePlist(p);
          if (!parsedInfo) { coverage.push(`${label}: ${p} is missing, unreadable or unsupported; configuration not evaluated.`); continue; }
          info = parsedInfo; source = p;
        } else if (!generated) { coverage.push(`${label}: no resolved Info.plist; skipped.`); continue; }
        if (generated) {
          for (const [k, v] of Object.entries(settings)) if (k.startsWith('INFOPLIST_KEY_') && k !== 'INFOPLIST_KEY_UILaunchScreen_Generation') info[k.slice(14)] = v;
          if (yes(settings.INFOPLIST_KEY_UILaunchScreen_Generation) && info.UILaunchScreen === undefined) info.UILaunchScreen = {};
        } else if (Object.keys(settings).some(k => k.startsWith('INFOPLIST_KEY_UILaunch'))) {
          coverage.push(`${label}: launch build overrides with non-generated plist require resolved build evidence; skipped.`); continue;
        }
        if (Object.entries(info).some(([k,v]) => k.startsWith('UILaunch') && typeof v === 'string' && !literal(v))) {
          coverage.push(`${label}: unresolved launch substitution; skipped.`); continue;
        }
        configurations++;
        const storyboard = info.UILaunchStoryboardName;
        const launch = info.UILaunchScreen;
        const alternatives = Object.keys(info).some(k => /^UILaunch(Storyboards|Screens|Image)|^UILaunch.*[~\-]/.test(k));
        if (alternatives) { coverage.push(`${label}: device-specific, multi-launch or legacy configuration not evaluated.`); continue; }
        if (storyboard === undefined && launch === undefined) {
          if (resourceKnown) issue(source, 'launch-configuration-missing', `${label}: resolved iOS app configuration has no launch-screen mechanism.`, 'Configure a static launch storyboard or UILaunchScreen dictionary; generated plists may use UILaunchScreen generation.', 'UILaunch');
          else coverage.push(`${label}: no explicit mechanism, but generated/synchronized resources prevent a missing-config conclusion.`);
          continue;
        }
        if (launch !== undefined && !dict(launch)) issue(source, 'launch-configuration-type', `${label}: UILaunchScreen must be a dictionary.`, 'Use a dictionary, including an empty dictionary for a plain launch appearance.', 'UILaunchScreen');
        if (storyboard !== undefined && (typeof storyboard !== 'string' || !storyboard.trim())) {
          issue(source, 'launch-configuration-type', `${label}: UILaunchStoryboardName must be a nonempty string.`, 'Set the storyboard base name or remove the unused key.', 'UILaunchStoryboardName'); continue;
        }
        const minimum = Number.parseFloat(settings.IPHONEOS_DEPLOYMENT_TARGET || info.MinimumOSVersion || '0');
        if (!storyboard && dict(launch) && minimum > 0 && minimum < 14) issue(source, 'launch-dictionary-availability', `${label}: dictionary-only launch configuration requires iOS 14, but the deployment target is ${minimum}.`, 'Supply a storyboard fallback for older supported systems or intentionally raise the deployment target.', 'UILaunchScreen');
        if (storyboard && dict(launch) && Number.parseFloat(settings.IPHONEOS_DEPLOYMENT_TARGET || info.MinimumOSVersion || '0') >= 14) {
          issue(source, 'launch-mechanisms-overlap', `${label}: both single-storyboard and dictionary launch mechanisms are configured.`, 'Review the intended mechanism and remove redundant configuration; retain deliberate compatibility fallbacks.', 'UILaunch', 'minor');
        }
        const catalogs = [...resources].filter(p => p.endsWith('.xcassets'));
        const assetSets = [...files].filter(p => p.endsWith('/Contents.json') && catalogs.some(c => p.startsWith(c + '/')));
        let namespacesKnown = true;
        const assetName = (p: string) => {
          const dir = posix.dirname(p); const catalog = catalogs.find(c => p.startsWith(c + '/'))!;
          const parts = dir.slice(catalog.length + 1).split('/'); const name = parts.pop()!.replace(/\.(imageset|colorset)$/, '');
          let prefix = ''; let current = catalog;
          for (const part of parts) { current += '/' + part;
            if (files.has(current + '/Contents.json')) {
              try { if (JSON.parse(contents.get(current + '/Contents.json')!.toString()).properties?.['provides-namespace']) prefix += part + '/'; } catch { namespacesKnown = false; }
            }
          }
          return prefix + name;
        };
        function asset(name: any, kind: 'image' | 'color', origin: string) {
          if (typeof name !== 'string' || !name) return;
          if (!literal(name)) { coverage.push(`${label}: unresolved launch asset name.`); return; }
          if (!resourceKnown || !complete) { coverage.push(`${label}: asset membership incomplete; ${name} not checked.`); return; }
          const candidates = assetSets.filter(p => p.endsWith(kind === 'image' ? '.imageset/Contents.json' : '.colorset/Contents.json') && assetName(p) === name);
          if (!namespacesKnown) { coverage.push(`${label}: invalid asset namespace metadata; asset absence not evaluated.`); return; }
          const loose = kind === 'image' && [...resources].some(p => files.has(p) && posix.basename(p).replace(/(@[23]x)?\.(png|jpg|jpeg|pdf)$/i, '') === name.replace(/\.(png|jpg|jpeg|pdf)$/i, ''));
          if (!candidates.length && !loose) issue(origin, 'launch-asset-missing', `${label}: launch ${kind} “${name}” is absent from the target's explicit resources.`, 'Correct the case-sensitive name or add the matching asset to this target.', name);
          for (const p of candidates) {
            let data; try { data = JSON.parse(contents.get(p)!.toString()); } catch { coverage.push(`${p}: invalid/unreadable asset metadata.`); continue; }
            for (const entry of array(data.images)) if (literal(entry.filename) && !files.has(posix.join(posix.dirname(p), entry.filename))) issue(p, 'launch-asset-file-missing', `${label}: launch image asset references missing file “${entry.filename}”.`, 'Restore the image payload or correct Contents.json.', entry.filename);
          }
        }
        if (dict(launch)) { asset(launch.UIImageName, 'image', source); asset(launch.UIColorName, 'color', source); }
        if (!storyboard) continue;
        const name = storyboard.replace(/\.storyboard$/, '');
        const matches = [...resources].filter(p => p.endsWith('.storyboard') && posix.basename(p, '.storyboard') === name);
        if (!matches.length) {
          if (complete && resourceKnown) issue(source, 'launch-storyboard-missing', `${label}: launch storyboard “${storyboard}” is not in this target's resources.`, 'Correct the launch name and target resource membership; a file existing elsewhere is insufficient.', storyboard);
          else coverage.push(`${label}: storyboard membership is unresolved.`);
          continue;
        }
        for (const p of matches) {
          const text = contents.get(p)?.toString();
          if (!text) {
            if (complete && resourceKnown && !files.has(p)) issue(source, 'launch-storyboard-missing', `${label}: referenced launch storyboard file is missing: ${p}.`, 'Restore the storyboard or correct its project reference.', storyboard);
            else coverage.push(`${p}: storyboard unreadable.`);
            continue;
          }
          if (XMLValidator.validate(text) !== true) { issue(p, 'launch-storyboard-invalid', `${label}: launch storyboard is malformed XML.`, 'Repair the storyboard XML in Interface Builder.'); continue; }
          const document = xml.parse(text).document;
          if (!document || document['@_type'] !== 'com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB') { coverage.push(`${p}: unsupported Interface Builder document.`); continue; }
          const nodes: Array<[string, Obj]> = [];
          function descend(o: any) { if (!dict(o)) return; for (const [k,v] of Object.entries(o)) for (const n of array(v)) if (dict(n)) { nodes.push([k,n]); descend(n); } }
          descend(document);
          const initial = document['@_initialViewController'];
          if (!initial || !nodes.some(([,n]) => n['@_id'] === initial)) issue(p, 'launch-initial-controller-missing', `${label}: launch storyboard has no resolvable initial view controller.`, 'Select the launch UIViewController as the initial view controller.', 'document');
          if (nodes.some(([,n]) => n['@_customClass'])) issue(p, 'launch-custom-class', `${label}: launch storyboard uses a custom class.`, 'Use standard UIKit views; move executable UI behavior into the app after launch.', 'customClass');
          if (nodes.some(([k]) => ['action','outlet','outletCollection'].includes(k))) issue(p, 'launch-code-connection', `${label}: launch storyboard contains actions or outlets.`, 'Remove code connections from the static launch document.', 'connections');
          if (nodes.some(([k]) => k === 'userDefinedRuntimeAttribute')) issue(p, 'launch-runtime-attribute', `${label}: launch storyboard has runtime attributes.`, 'Remove runtime attributes; launch screens cannot execute app configuration code.', 'userDefinedRuntimeAttribute');
          if (nodes.some(([k]) => k === 'webView')) issue(p, 'launch-deprecated-view', `${label}: launch storyboard contains a deprecated UIWebView.`, 'Replace it with a static supported UIKit view.', 'webView');
          const systemImages = new Set(nodes.filter(([k,n]) => k === 'image' && n['@_catalog'] === 'system').map(([,n]) => n['@_name']));
          for (const [k,n] of nodes) {
            if (n['@_image'] && n['@_catalog'] !== 'system' && !systemImages.has(n['@_image'])) asset(n['@_image'], 'image', p);
            if (k === 'color' && n['@_name']) asset(n['@_name'], 'color', p);
          }
        }
      }
    }
  }
  if (!configurations) coverage.push('No resolved iOS application configurations were evaluated; this is not a clean launch-screen certification.');
  return { findings, coverage: [...new Set(coverage)], configurations };
}
