import { createHash } from 'node:crypto';
import { readdir, readFile, lstat, realpath } from 'node:fs/promises';
import { resolve, relative, posix, sep } from 'node:path';
import * as plist from 'plist';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { z } from 'zod';
import { projectPaths, parsePropertyList, list, ObjectMap } from './project.js';
import { reviewLaunchScreens } from '../analyzers/launch-screen.js';
export const EvidenceState = z.enum(['OBSERVED', 'INFERRED', 'DEVELOPER_CONFIRMED', 'CONFLICTING', 'UNKNOWN', 'NOT_APPLICABLE']);
export type State = z.infer<typeof EvidenceState>;
export interface Evidence {
    id: string;
    file: string;
    sha256: string;
    kind: string;
}
export interface Claim {
    id: string;
    status: State;
    value: string | string[] | boolean | null;
    evidence: string[];
    limitations: string[];
}
export interface Feature extends Claim {
    relatedScreens: string[];
    relatedPermissions: string[];
    relatedServices: string[];
}
export interface Screen extends Claim {
    structural: boolean;
    reachable: 'UNKNOWN';
    runtime: 'NOT_CHECKED';
}
export interface Question {
    id: string;
    priority: 1 | 2 | 3;
    domain: string;
    question: string;
    claims: string[];
    evidence: string[];
}
export interface AppModel {
    schemaVersion: 1;
    selection: {
        project: string | null;
        workspace: string | null;
        target: string | null;
        configuration: string;
    };
    status: 'ANALYZED_WITH_LIMITATIONS' | 'BLOCKED';
    claims: Claim[];
    features: Feature[];
    screens: Screen[];
    evidence: Evidence[];
    coverage: string[];
    sectionHashes: Record<string, string>;
}
export interface Options {
    root: string;
    project?: string;
    workspace?: string;
    target?: string;
    configuration?: string;
    prompt?: string;
}
export interface Analysis {
    model: AppModel;
    questions: Question[];
    requirements: unknown[];
    changePlan: unknown;
    sourceFingerprint: string;
}
const ClaimSchema = z.object({id:z.string(),status:EvidenceState,value:z.union([z.string(),z.array(z.string()),z.boolean(),z.null()]),evidence:z.array(z.string()),limitations:z.array(z.string())}).strict();
export const AppModelSchema=z.object({schemaVersion:z.literal(1),selection:z.object({project:z.string().nullable(),workspace:z.string().nullable(),target:z.string().nullable(),configuration:z.string()}).strict(),status:z.enum(['ANALYZED_WITH_LIMITATIONS','BLOCKED']),claims:z.array(ClaimSchema),features:z.array(ClaimSchema.extend({relatedScreens:z.array(z.string()),relatedPermissions:z.array(z.string()),relatedServices:z.array(z.string())})),screens:z.array(ClaimSchema.extend({structural:z.boolean(),reachable:z.literal('UNKNOWN'),runtime:z.literal('NOT_CHECKED')})),evidence:z.array(z.object({id:z.string(),file:z.string(),sha256:z.string().regex(/^[a-f0-9]{64}$/),kind:z.string()}).strict()),coverage:z.array(z.string()),sectionHashes:z.record(z.string().regex(/^[a-f0-9]{64}$/))}).strict().superRefine((m,ctx)=>{const ids=new Set(m.evidence.map(e=>e.id));for(const c of [...m.claims,...m.features,...m.screens]){if(c.evidence.some(e=>!ids.has(e))||(c.status==='OBSERVED'&&!c.evidence.length))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Claim evidence is incomplete'});}});
export function canonical(v: unknown): string { if (Array.isArray(v))
    return '[' + v.map(canonical).join(',') + ']'; if (v && typeof v === 'object')
    return '{' + Object.entries(v).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([k, x]) => JSON.stringify(k) + ':' + canonical(x)).join(',') + '}'; return JSON.stringify(v); }
export const digest = (v: string | Uint8Array) => createHash('sha256').update(v).digest('hex');
const secret = /-----BEGIN|\b(?:sk|ghp|github_pat|AKIA)[-_A-Za-z0-9]{12,}|\beyJ[A-Za-z0-9_-]{15,}|(?:password|secret|token|api[_-]?key)\s*[:=]/i;
function safe(v: unknown): string | null { if (typeof v !== 'string' || v.length > 180 || secret.test(v) || /[\r\n\x00-\x1f]/.test(v) || /\$[({]/.test(v))
    return null; return v; }
function label(v: string): string { return safe(v) || 'redacted-' + digest(v).slice(0, 12); }
const skip = new Set(['.git', '.ios-agent', 'node_modules', 'Pods', 'Carthage', '.build', 'build', 'DerivedData', 'vendor', 'Vendor']);
/** Bounded inventory. Symlinks never supply evidence. No source text is serialized. */
class Inventory {
    files = new Set<string>();
    buffers = new Map<string, Buffer>();
    coverage = new Set<string>();
    bytes = 0;
    constructor(readonly root: string) { }
    async walk(dir = '') {
        if (this.files.size > 15000) {
            this.coverage.add('inventory-limit');
            return;
        }
        let entries;
        try {
            entries = await readdir(resolve(this.root, dir), { withFileTypes: true });
        }
        catch {
            this.coverage.add('unreadable-directory');
            return;
        }
        for (const e of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
            const p = posix.join(dir, e.name);
            if (e.isSymbolicLink()) {
                this.coverage.add('symlink-excluded');
                continue;
            }
            if (e.isDirectory()) {
                if (!skip.has(e.name) && !e.name.endsWith('.xcarchive'))
                    await this.walk(p);
            }
            else if (e.isFile())
                this.files.add(p);
            if (this.files.size > 15000)
                return;
        }
    }
    async read(p: string): Promise<Buffer | undefined> {
        if (!this.files.has(p) || p.split('/').some(x => skip.has(x)) || /(?:^|\/)(?:\.env[^/]*|AuthKey_[^/]+)|\.(p8|p12|pem|key|mobileprovision)$/.test(p))
            return;
        if (this.buffers.has(p))
            return this.buffers.get(p);
        try {
            let full = this.root;
            for (const part of p.split('/')) {
                full = resolve(full, part);
                if ((await lstat(full)).isSymbolicLink())
                    throw Error();
            }
            const s = await lstat(full);
            if (s.size > 4 * 1024 * 1024 || this.bytes + s.size > 64 * 1024 * 1024)
                throw Error();
            const b = await readFile(full);
            if (b.length > 4 * 1024 * 1024)
                throw Error();
            this.bytes += b.length;
            this.buffers.set(p, b);
            return b;
        }
        catch {
            this.coverage.add('unreadable-or-large-input');
            return;
        }
    }
}
const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', processEntities: false });
/** Conservative Swift lexical masking, including URLs, nested comments and raw strings. */
function withoutLiterals(s: string): string {
    let out = '', i = 0;
    while (i < s.length) {
        if (s.startsWith('//', i)) {
            const end = s.indexOf('\n', i);
            i = end < 0 ? s.length : end;
            out += ' ';
            continue;
        }
        if (s.startsWith('/*', i)) {
            let depth = 1;
            i += 2;
            while (i < s.length && depth) {
                if (s.startsWith('/*', i)) {
                    depth++;
                    i += 2;
                }
                else if (s.startsWith('*/', i)) {
                    depth--;
                    i += 2;
                }
                else {
                    i++;
                }
            }
            out += ' ';
            continue;
        }
        const start = /^(#+)?("""|")/.exec(s.slice(i));
        if (start) {
            const hashes = start[1] || '', q = start[2]!, end = q + hashes;
            i += start[0].length;
            while (i < s.length) {
                if (s[i] === '\\' && !hashes) {
                    i += 2;
                    continue;
                }
                if (s.startsWith(end, i)) {
                    i += end.length;
                    break;
                }
                i++;
            }
            out += ' "" ';
            continue;
        }
        out += s[i++];
    }
    return out;
}
export async function analyzeApp(options: Options): Promise<Analysis> {
    const root = await realpath(resolve(options.root));
    const inv = new Inventory(root);
    await inv.walk();
    const claims: Claim[] = [], features: Feature[] = [], screens: Screen[] = [], evidence: Evidence[] = [];
    const groups: Record<string, Record<string, string>> = { project: {}, source: {}, resources: {}, dependencies: {}, brief: {} };
    const configuration = options.configuration || 'Release';
    const selection: AppModel['selection'] = { project: null, workspace: null, target: null, configuration: label(configuration) };
    const claim = (id: string, value: Claim['value'], status: State, ev: string[] = [], limitations: string[] = []): Claim => { const c = { id, value, status, evidence: [...new Set(ev)].sort(), limitations }; claims.push(c); return c; };
    async function input(p: string, kind: string): Promise<{
        b: Buffer;
        id: string;
    } | undefined> { const b = await inv.read(p); if (!b)
        return; const hash = digest(b), id = 'e-' + digest(p).slice(0, 16); groups[kind]![p] = hash; if (!evidence.some(e => e.id === id))
        evidence.push({ id, file: label(p), sha256: hash, kind }); return { b, id }; }
    const finish = (): Analysis => {
        for (const c of claims)
            if (c.status === 'OBSERVED' && !c.evidence.length)
                throw Error('Observed claim without evidence');
        const model: AppModel = { schemaVersion: 1, selection, status: selection.target && !claims.some(c => c.id === 'configuration-resolution' && c.status === 'UNKNOWN') ? 'ANALYZED_WITH_LIMITATIONS' : 'BLOCKED', claims: claims.sort((a, b) => a.id.localeCompare(b.id, 'en')), features: features.sort((a, b) => a.id.localeCompare(b.id, 'en')), screens: screens.sort((a, b) => a.id.localeCompare(b.id, 'en')), evidence: evidence.sort((a, b) => a.id.localeCompare(b.id, 'en')), coverage: [...inv.coverage].sort(), sectionHashes: Object.fromEntries(Object.entries(groups).map(([k, v]) => { const ids = new Set(evidence.filter(e => e.kind === k).map(e => e.id)); const facts = claims.filter(c => c.evidence.some(e => ids.has(e)) || (k === 'brief' && (c.id.startsWith('intent:') || c.id === 'product-brief'))); return [k, digest(canonical({ inputs: v, facts, candidates: k === 'source' ? { features, screens } : null }))]; })) };
        AppModelSchema.parse(model);
        const questions = questionsFor(model);
        return { model, questions, requirements: [...claims.filter(c => c.id.startsWith('launch-finding:')).map(c => ({ id: c.id, status: 'NEEDS_REVIEW', evidence: c.evidence })), { id: 'phase-1', status: 'LOCAL_ANALYSIS_ONLY' }, { id: 'build-test-signing', status: 'NOT_CHECKED' }, { id: 'apple-account-and-listing', status: 'NOT_CHECKED' }, { id: 'compliance', status: 'NEEDS_CONFIRMATION' }], changePlan: { status: 'LOCAL_ONLY', remoteOperations: [], projectEdits: [], note: 'No metadata, icons, signing changes or submission generated in Phase 1.' }, sourceFingerprint: digest(canonical({ selection, sections: model.sectionHashes, coverage: model.coverage })) };
    };
    function projectPath(v: string) { const p = relative(root, resolve(root, v)).split(sep).join('/'); if (p.startsWith('../') || p === '..' || posix.isAbsolute(p))
        throw Error('Selection must be inside project root'); return p; }
    let projects = [...inv.files].filter(p => p.endsWith('.xcodeproj/project.pbxproj'));
    if (options.workspace) {
        const w = projectPath(options.workspace);
        selection.workspace = label(w);
        const entry = await input(posix.join(w, 'contents.xcworkspacedata'), 'project');
        if (!entry) {
            claim('workspace', null, 'UNKNOWN');
            return finish();
        }
        try {
            if (XMLValidator.validate(entry.b.toString()) !== true)
                throw Error();
            const doc = xml.parse(entry.b.toString());
            const refs: string[] = [];
            function visit(x: any) { if (!x || typeof x !== 'object')
                return; for (const [k, v] of Object.entries(x)) {
                if (k === 'FileRef')
                    for (const r of list(v)) {
                        const loc = r['@_location'];
                        if (typeof loc === 'string' && loc.startsWith('group:') && !doc.Workspace?.Group)
                            refs.push(posix.normalize(posix.join(posix.dirname(w), loc.slice(6), 'project.pbxproj')));
                        else
                            inv.coverage.add('workspace-reference-unresolved');
                    }
                else
                    visit(v);
            } }
            visit(doc);
            projects = projects.filter(p => refs.includes(p));
        }
        catch {
            inv.coverage.add('workspace-parse-failed');
            projects = [];
        }
    }
    if (options.project) {
        const p = projectPath(options.project);
        projects = projects.filter(x => x === (p.endsWith('.pbxproj') ? p : posix.join(p, 'project.pbxproj')));
    }
    if (projects.length !== 1) {
        claim('project-selection', null, 'UNKNOWN', [], ['Select one Xcode project; no source-wide fallback is used.']);
        return finish();
    }
    const project = projects[0]!;
    selection.project = label(project);
    const pe = await input(project, 'project');
    if (!pe) {
        claim('project-selection', null, 'UNKNOWN');
        return finish();
    }
    let parsed: ObjectMap;
    try {
        parsed = plist.parseOpenStep(pe.b.toString()) as ObjectMap;
    }
    catch {
        claim('project-selection', null, 'UNKNOWN', [pe.id]);
        return finish();
    }
    const objects = parsed.objects || {}, po = objects[parsed.rootObject] || {}, base = posix.dirname(posix.dirname(project)), filePath = projectPaths(objects, base);
    let targets = list(po.targets).map(id => ({ id, o: objects[id] })).filter(t => t.o?.isa === 'PBXNativeTarget' && t.o.productType === 'com.apple.product-type.application');
    if (options.target)
        targets = targets.filter(t => t.o.name === options.target);
    if (targets.length !== 1) {
        claim('target-selection', null, 'UNKNOWN', [pe.id], ['Select one application target explicitly.']);
        return finish();
    }
    const { o: target } = targets[0]!;
    selection.target = label(target.name || 'unnamed');
    const configs = (id: string) => list(objects[id]?.buildConfigurations).map(k => objects[k]).filter(Boolean);
    const cfg = configs(target.buildConfigurationList).find(c => c.name === configuration), pc = configs(po.buildConfigurationList).find(c => c.name === configuration);
    if (!cfg) {
        claim('configuration-resolution', null, 'UNKNOWN', [pe.id], ['Requested configuration does not exist.']);
        return finish();
    }
    const settings = { ...(pc?.buildSettings || {}), ...(cfg.buildSettings || {}) };
    if (cfg.baseConfigurationReference || pc?.baseConfigurationReference || Object.keys(settings).some(k => k.includes('[')) || settings.INFOPLIST_PREPROCESS === 'YES' || settings.EXCLUDED_SOURCE_FILE_NAMES || settings.INCLUDED_SOURCE_FILE_NAMES || list(target.fileSystemSynchronizedGroups).length) {
        claim('configuration-resolution', null, 'UNKNOWN', [pe.id], ['xcconfig, conditional/preprocessed settings, filters or synchronized membership require resolved Xcode evidence.']);
        return finish();
    }
    if (!/^iphone(os|simulator)/.test(settings.SDKROOT || '') && !String(settings.SUPPORTED_PLATFORMS || '').includes('iphone')) {
        claim('configuration-resolution', null, 'UNKNOWN', [pe.id], ['iOS SDK not established.']);
        return finish();
    }
    claim('configuration-resolution', 'static-explicit-membership', 'OBSERVED', [pe.id], ['Not resolved by Xcode; build and signing were not executed.']);
    claim('application-type', 'iOS application', 'OBSERVED', [pe.id]);
    const subst = (v: any): string | null => typeof v === 'string' ? safe(v.replace(/\$\(([^)]+)\)|\$\{([^}]+)\}/g, (_, a, b) => { const k = a || b; return k === 'TARGET_NAME' ? target.name : k === 'SRCROOT' || k === 'PROJECT_DIR' ? base : typeof settings[k] === 'string' && !/\$[({]/.test(settings[k]) ? settings[k] : '$(' + k + ')'; })) : null;
    const localPath = (v: any) => { const p = subst(v); if (!p || posix.isAbsolute(p))
        return; const x = posix.normalize(/\$[({](SRCROOT|PROJECT_DIR)/.test(v) ? p : posix.join(base, p)); return x === '..' || x.startsWith('../') ? undefined : x; };
    let info: ObjectMap = {}, infoEvidence = [pe.id], infoKnown = false;
    if (settings.INFOPLIST_FILE) {
        const p = localPath(settings.INFOPLIST_FILE);
        const r = p ? await input(p, 'project') : undefined;
        if (r) {
            try {
                info = parsePropertyList(r.b);
                infoEvidence = [r.id, pe.id];
                infoKnown = true;
            }
            catch {
                inv.coverage.add('plist-parse-failed');
            }
        }
    }
    if (settings.GENERATE_INFOPLIST_FILE === 'YES') {
        infoKnown = !settings.INFOPLIST_FILE || infoKnown;
        for (const [k, v] of Object.entries(settings))
            if (k.startsWith('INFOPLIST_KEY_'))
                info[k.slice(14)] = v;
    }
    claim('info-plist', infoKnown ? 'resolved-static-plist' : null, infoKnown ? 'OBSERVED' : 'UNKNOWN', infoEvidence);
    for (const [id, v] of Object.entries({ productName: info.CFBundleDisplayName || info.CFBundleName || settings.PRODUCT_NAME || target.productName, bundleIdentifier: info.CFBundleIdentifier || settings.PRODUCT_BUNDLE_IDENTIFIER, version: info.CFBundleShortVersionString || settings.MARKETING_VERSION, build: info.CFBundleVersion || settings.CURRENT_PROJECT_VERSION, deploymentTarget: settings.IPHONEOS_DEPLOYMENT_TARGET, developmentTeam: settings.DEVELOPMENT_TEAM, signingStyle: settings.CODE_SIGN_STYLE, codeSigningAllowed: settings.CODE_SIGNING_ALLOWED })) {
        const value = subst(v);
        claim(id, value, value === null ? 'UNKNOWN' : 'OBSERVED', infoEvidence);
    }
    claim('signing-validity', null, 'UNKNOWN', [], ['Configuration is not a valid identity, provisioning profile or signed archive.']);
    const sources = new Set<string>(), resources = new Set<string>(), dependencyEvidence: string[] = [];
    let membershipKnown = true;
    for (const phaseId of list(target.buildPhases)) {
        const phase = objects[phaseId];
        if (!phase) {
            membershipKnown = false;
            continue;
        }
        if (['PBXShellScriptBuildPhase', 'PBXCopyFilesBuildPhase'].includes(phase.isa)) {
            membershipKnown = false;
            inv.coverage.add('generated-or-copied-inputs-not-evaluated');
        }
        if (!['PBXSourcesBuildPhase', 'PBXResourcesBuildPhase', 'PBXFrameworksBuildPhase'].includes(phase.isa))
            continue;
        function ref(id: string) { const ob = objects[id]; if (!ob) {
            membershipKnown = false;
            return;
        } if (ob.isa === 'PBXVariantGroup') {
            for (const c of list(ob.children))
                ref(c);
            return;
        } const p = filePath(id); if (!p) {
            membershipKnown = false;
            return;
        } if (phase.isa === 'PBXSourcesBuildPhase')
            sources.add(p); if (phase.isa === 'PBXResourcesBuildPhase')
            resources.add(p); if (ob.lastKnownFileType === 'folder') {
            membershipKnown = false;
            inv.coverage.add('folder-resource-membership-unresolved');
        } }
        for (const build of list(phase.files)) {
            const ob = objects[build];
            if (ob?.platformFilter || ob?.platformFilters || ob?.settings?.COMPILER_FLAGS) {
                membershipKnown = false;
                continue;
            }
            if (ob?.fileRef)
                ref(ob.fileRef);
            else if (!ob?.productRef)
                membershipKnown = false;
        }
    }
    claim('membership', membershipKnown ? 'explicit' : 'partial', membershipKnown ? 'OBSERVED' : 'INFERRED', [pe.id], membershipKnown ? [] : ['Generated or conditional membership is incomplete.']);
    const extensions = list(target.dependencies).map(id => objects[objects[id]?.target]).filter(o => o?.productType === 'com.apple.product-type.app-extension');
    claim('extension-targets', extensions.map(o => label(o.name || 'unnamed')), extensions.length ? 'OBSERVED' : 'UNKNOWN', [pe.id], ['Extension internals are not merged into app evidence; audit separately.']);
    for (const key of Object.keys(info).sort())
        if (/^NS[A-Za-z]+UsageDescription$/.test(key))
            claim('permission:' + key, typeof info[key] === 'string' && !!info[key].trim() ? 'declared' : 'empty', 'OBSERVED', infoEvidence, ['Declaration does not establish use or off-device collection; purpose text is not exported.']);
    for (const key of ['CFBundleURLTypes', 'NSUserActivityTypes', 'LSApplicationQueriesSchemes'])
        if (info[key])
            claim('routes:' + key, 'declared', 'OBSERVED', infoEvidence, ['Route values are withheld; reachability not established.']);
    const entPath = localPath(settings.CODE_SIGN_ENTITLEMENTS);
    const ent = entPath ? await input(entPath, 'project') : undefined;
    if (ent) {
        try {
            for (const key of Object.keys(parsePropertyList(ent.b)).sort())
                if (/^(com\.apple\.|aps-environment|keychain-access-groups)/.test(key))
                    claim('entitlement:' + label(key), 'declared', 'OBSERVED', [ent.id], ['Provisioning approval and runtime behavior not verified.']);
        }
        catch {
            inv.coverage.add('entitlements-unreadable');
        }
    }
    else if (settings.CODE_SIGN_ENTITLEMENTS)
        claim('entitlements', null, 'UNKNOWN', [pe.id]);
    for (const id of list(target.packageProductDependencies)) {
        const product = objects[id];
        if (!product)
            continue;
        const name = safe(product.productName);
        if (name) {
            claim('dependency:' + name, 'linked-package-product', 'OBSERVED', [pe.id], ['SDK configuration and backend practices are unknown.']);
            dependencyEvidence.push(pe.id);
        }
    }
    for (const p of [...inv.files].sort())
        if ((p === posix.join(base, 'Package.resolved') || p.startsWith(posix.dirname(project) + '/project.xcworkspace/') && p.endsWith('/Package.resolved') || options.workspace && p.startsWith(selection.workspace + '/') && p.endsWith('/Package.resolved') || p === posix.join(base, 'Podfile.lock') || p === posix.join(base, 'Cartfile.resolved') || p === posix.join(base, 'Package.swift'))) {
            const r = await input(p, 'dependencies');
            if (r)
                claim('dependency-inventory:' + digest(p).slice(0, 8), 'present', 'OBSERVED', [r.id], ['Lockfile presence does not establish target linkage; contents are not exported.']);
        }
    const patterns: [
        string,
        RegExp,
        string[]
    ][] = [['pdf', /\b(?:PDFDocument|PDFView)\b/, []], ['document-scanning', /\bVNDocumentCameraViewController\b/, ['NSCameraUsageDescription']], ['camera', /\b(?:AVCaptureSession|AVCaptureDevice)\b/, ['NSCameraUsageDescription']], ['photos', /\b(?:PhotosPicker|PHPickerViewController|PHPhotoLibrary)\b/, ['NSPhotoLibraryUsageDescription']], ['microphone', /\b(?:AVAudioRecorder|requestRecordPermission)\b/, ['NSMicrophoneUsageDescription']], ['location', /\bCLLocationManager\b/, ['NSLocationWhenInUseUsageDescription']], ['contacts', /\bCNContactStore\b/, ['NSContactsUsageDescription']], ['health', /\bHKHealthStore\b/, ['NSHealthShareUsageDescription']], ['networking', /\b(?:URLSession|NWConnection)\b/, []], ['storekit', /\b(?:StoreKit|Transaction\.currentEntitlements|Product\.products)\b/, []], ['authentication', /\b(?:ASAuthorizationController|ASWebAuthenticationSession|signInWithEmailAndPassword)\b/, []], ['sign-in-with-apple', /\bASAuthorizationAppleIDProvider\b/, []], ['notifications', /\bUNUserNotificationCenter\b/, []], ['cloud', /\b(?:CKContainer|NSUbiquitousKeyValueStore)\b/, []], ['tracking', /\b(?:ATTrackingManager|ASIdentifierManager)\b/, ['NSUserTrackingUsageDescription']], ['analytics', /\b(?:FirebaseAnalytics|Analytics\.logEvent|Mixpanel)\b/, []], ['search', /\.searchable\s*\(/, []], ['canvas', /\b(?:PKCanvasView|Canvas)\s*\(/, []], ['local-storage', /\b(?:UserDefaults|FileManager|ModelContainer|NSPersistentContainer)\b/, []]];
    const hits = new Map<string, {
        ev: Set<string>;
        permissions: string[];
    }>();
    const nav = new Map<string, Set<string>>();
    const ui = new Map<string, Set<string>>();
    for (const p of [...sources].sort()) {
        if (!p.endsWith('.swift')) {
            inv.coverage.add('non-swift-source-not-analyzed');
            continue;
        }
        const r = await input(p, 'source');
        if (!r) {
            inv.coverage.add('source-missing');
            continue;
        }
        const raw = r.b.toString();
        const text = withoutLiterals(raw);
        if (/https?:\/\//.test(raw))
            claim('url-indicator:' + digest(p).slice(0, 8), 'URL-syntax-present', 'INFERRED', [r.id], ['May occur in comments or unused code. URL values, credentials and query strings are withheld.']);
        if (/\bUserDefaults\b/.test(text))
            claim('required-reason-indicator:' + digest(p).slice(0, 8), 'UserDefaults', 'INFERRED', [r.id], ['Potential required-reason API use; no legal reason selected.']);
        if (/#if|#elseif|#else/.test(text)) {
            inv.coverage.add('conditional-swift-not-analyzed');
            continue;
        }
        for (const framework of ['SwiftUI', 'UIKit'])
            if (new RegExp('\\bimport\\s+' + framework + '\\b').test(text)) {
                if (!ui.has(framework))
                    ui.set(framework, new Set());
                ui.get(framework)!.add(r.id);
            }
        for (const [id, re, permissions] of patterns)
            if (re.test(text)) {
                if (!hits.has(id))
                    hits.set(id, { ev: new Set(), permissions });
                hits.get(id)!.ev.add(r.id);
            }
        for (const m of text.matchAll(/\b(?:struct|class|final\s+class)\s+([A-Za-z_][\w]*)\s*:\s*(?:[^\n{]*\b)?(View|UIViewController|UITableViewController|UICollectionViewController)\b/g)) {
            screens.push({ id: 'screen:' + digest(p + ':' + m[1]).slice(0, 16), status: 'INFERRED', value: label(m[1]!), evidence: [r.id], limitations: ['Lexical type candidate; may be a reusable component rather than a screen.'], structural: true, reachable: 'UNKNOWN', runtime: 'NOT_CHECKED' });
        }
        for (const n of ['NavigationStack', 'NavigationLink', 'TabView', 'onOpenURL'])
            if (new RegExp('\\b' + n + '\\b').test(text)) {
                if (!nav.has(n))
                    nav.set(n, new Set());
                nav.get(n)!.add(r.id);
            }
    }
    for (const [n, ev] of ui)
        claim('framework:' + n, 'imported', 'OBSERVED', [...ev]);
    for (const [n, ev] of nav)
        claim('navigation:' + n, 'syntax-present', 'OBSERVED', [...ev], ['No complete graph or runtime reachability inferred.']);
    for (const [id, { ev, permissions }] of hits)
        features.push({ id, status: 'INFERRED', value: 'API-use candidate', evidence: [...ev].sort(), limitations: ['Lexical API indicator, not verified user-facing availability or data flow.'], relatedScreens: screens.filter(s => s.evidence.some(e => ev.has(e))).map(s => s.id), relatedPermissions: permissions.filter(p => info[p] !== undefined), relatedServices: [] });
    for (const name of ['authentication-required', 'subscriptions-offered', 'server-data-handling', 'analytics-absence', 'tracking-absence'])
        claim(name, null, 'UNKNOWN', [], ['Cannot establish from static absence or API presence.']);
    if (dependencyEvidence.length)
        claim('external-services', null, 'UNKNOWN', dependencyEvidence, ['Linked packages do not establish server destinations or retention.']);
    const resourceFiles = [...inv.files].filter(p => [...resources].some(r => p === r || p.startsWith(r + '/'))).sort();
    for (const p of resourceFiles) {
        const r = await input(p, 'resources');
        if (!r)
            continue;
        if (p.endsWith('PrivacyInfo.xcprivacy')) {
            try {
                const manifest = parsePropertyList(r.b);
                claim('privacy-manifest:' + digest(p).slice(0, 8), 'bundled-resource-declaration', 'OBSERVED', [r.id], ['Declarations are not runtime verification or App Privacy answers.']);
                for (const item of list(manifest.NSPrivacyAccessedAPITypes)) {
                    if (typeof item.NSPrivacyAccessedAPIType === 'string' && /^NSPrivacyAccessedAPICategory[A-Za-z]+$/.test(item.NSPrivacyAccessedAPIType))
                        claim('required-reason:' + item.NSPrivacyAccessedAPIType, item.NSPrivacyAccessedAPIType, 'OBSERVED', [r.id], ['Declared reasons not checked for applicability.']);
                }
            }
            catch {
                inv.coverage.add('privacy-manifest-invalid');
            }
        }
        if (p.endsWith('.xcstrings') || p.endsWith('.strings') || p.endsWith('.stringsdict'))
            claim('localization:' + digest(p).slice(0, 8), 'resource-present', 'OBSERVED', [r.id], ['Translation completeness not checked.']);
        if (p.endsWith('.storekit'))
            claim('storekit-configuration:' + digest(p).slice(0, 8), 'local-test-catalog', 'OBSERVED', [r.id], ['Local configuration does not prove products are available in App Store Connect.']);
        if (p.endsWith('.storyboard') && !posix.basename(p).includes('Launch')) {
            try {
                if (XMLValidator.validate(r.b.toString()) !== true)
                    throw Error();
                const doc = xml.parse(r.b.toString());
                const serialized = JSON.stringify(doc);
                if (serialized.includes('viewController'))
                    screens.push({ id: 'storyboard:' + digest(p).slice(0, 12), value: 'Storyboard controller candidate', status: 'INFERRED', evidence: [r.id], limitations: ['Runtime presentation not established.'], structural: true, reachable: 'UNKNOWN', runtime: 'NOT_CHECKED' });
            }
            catch {
                inv.coverage.add('storyboard-invalid');
            }
        }
    }
    const icon = subst(settings.ASSETCATALOG_COMPILER_APPICON_NAME);
    claim('app-icon-name', icon, icon ? 'OBSERVED' : 'UNKNOWN', [pe.id], ['Configuration is not compiled icon validation.']);
    if (icon) {
        const matches = resourceFiles.filter(p => p.endsWith('/' + icon + '.appiconset/Contents.json') && inv.buffers.has(p));
        claim('app-icon-resource', matches.length ? 'present' : null, matches.length ? 'OBSERVED' : 'UNKNOWN', evidence.filter(e => matches.some(p => 'e-' + digest(p).slice(0, 16) === e.id)).map(e => e.id), ['Native Icon Composer documents and image correctness require Xcode verification.']);
    }
    for (const p of [posix.join(base, 'README.md'), posix.join(base, 'BRIEF.md')]) {
        const r = await input(p, 'brief');
        if (r)
            claim('product-document:' + digest(p).slice(0, 8), 'present', 'OBSERVED', [r.id], ['Untrusted product documentation is hashed but not interpreted as shipping facts or persisted verbatim.']);
    }
    const launch = await reviewLaunchScreens(root, { project, target: target.name, configuration });
    claim('launch-screen', launch.configurations ? 'static-checks-executed' : null, launch.configurations ? 'OBSERVED' : 'UNKNOWN', [pe.id], ['Not a runtime launch certification.']);
    for (const rule of [...new Set(launch.findings.map(f => f.rule))].sort())
        claim('launch-finding:' + rule, rule, 'OBSERVED', [pe.id], ['See launch audit for full local diagnostic; no source excerpts exported.']);
    if (launch.coverage.length)
        inv.coverage.add('launch-analysis-partial');
    // Brief is interpreted using a fixed vocabulary; arbitrary text and secrets never enter artifacts.
    if (options.prompt) {
        const statements=options.prompt.split(/[.;\n]/).map(s=>s.trim().toLowerCase()).filter(Boolean);
        const controlled=statements.length>0&&statements.every(s=>/^(?:for (?:students|families|developers|businesses)|no (?:account|login|sign-in) (?:is )?required)$/.test(s));
        if(controlled){
          for(const audience of ['students','families','developers','businesses'])if(statements.includes('for '+audience))claim('intent:audience:'+audience,audience,'DEVELOPER_CONFIRMED',[],['Explicit controlled brief statement; intent is not shipping behavior.']);
          if(statements.some(s=>/^no /.test(s)))claim('intent:no-account',true,hits.has('authentication')||hits.has('sign-in-with-apple')?'CONFLICTING':'DEVELOPER_CONFIRMED',[...(hits.get('authentication')?.ev||[]),...(hits.get('sign-in-with-apple')?.ev||[])],['Authentication API presence may be optional or unreachable; developer clarification required.']);
        }
        claim('product-brief', 'provided', 'DEVELOPER_CONFIRMED', [], ['Free-form text is not persisted. Only recognized intent is recorded; no complete natural-language interpretation.']);
    }
    groups.brief!['intent'] = digest(canonical(claims.filter(c => c.id.startsWith('intent:') || c.id === 'product-brief')));
    inv.coverage.add('static-lexical-analysis-not-runtime-proof');
    return finish();
}
export function questionsFor(model: AppModel): Question[] {
    const out: Question[] = [];
    function add(id: string, priority: 1 | 2 | 3, domain: string, question: string, ids: string[]) { const items = [...model.claims, ...model.features].filter(c => ids.includes(c.id)); out.push({ id, priority, domain, question, claims: ids, evidence: [...new Set(items.flatMap(c => c.evidence))].sort() }); }
    if (model.status === 'BLOCKED') {
        add('selection', 1, 'distribution', 'Which explicit iOS application project, target and configuration should be analyzed? Resolve the reported configuration coverage gap.', model.claims.filter(c => c.status === 'UNKNOWN').map(c => c.id));
        return out;
    }
    const unknown = model.claims.filter(c => ['bundleIdentifier', 'version', 'build', 'info-plist'].includes(c.id) && c.status === 'UNKNOWN');
    if (unknown.length)
        add('identity', 1, 'distribution', 'Resolve the missing release identity or Info.plist evidence.', unknown.map(c => c.id));
    const conflict = model.claims.find(c => c.status === 'CONFLICTING');
    if (conflict)
        add('auth-conflict', 1, 'review', 'The brief says no account is required, but authentication APIs are present. Is sign-in optional, required, or excluded from this release?', [conflict.id]);
    else if (!model.claims.some(c => c.id === 'intent:no-account' && c.status === 'DEVELOPER_CONFIRMED'))
        add('auth-access', 2, 'review', 'Does the shipping app require an account or other restricted access for review?', ['authentication-required']);
    const sensitive = model.features.filter(f => ['document-scanning', 'camera', 'photos', 'microphone', 'location', 'contacts', 'health', 'networking', 'analytics', 'tracking', 'cloud', 'authentication'].includes(f.id));
    if (sensitive.length || model.claims.some(c => c.id.startsWith('permission:') || c.id.startsWith('dependency:') || c.id.startsWith('privacy-manifest:')))
        add('data-handling', 1, 'privacy', 'For the detected sensitive access/services, what data leaves the device, for what purposes, and is it retained or linked to a person?', [...sensitive.map(f => f.id), ...model.claims.filter(c => c.id.startsWith('permission:') || c.id.startsWith('dependency:') || c.id.startsWith('privacy-manifest:')).map(c => c.id), 'server-data-handling']);
    if (model.features.some(f => f.id === 'storekit'))
        add('purchases', 2, 'metadata', 'Which purchases or subscriptions are offered in this release? Local StoreKit evidence cannot establish live products.', ['storekit', 'subscriptions-offered']);
    add('signing', 2, 'signing', 'Validate the intended distribution signing identity and provisioning for this release; Phase 1 does not run signing checks.', ['signing-validity']);
    return out.sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id, 'en'));
}
