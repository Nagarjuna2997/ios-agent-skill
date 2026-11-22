import { promises as fs } from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import { tmpdir } from 'node:os';
import { captureProfiles } from './capture-profile.mjs';
import { projectText, schemeText, swiftString } from './project.mjs';

const nodeID = /^[a-z][A-Za-z0-9_-]{0,145}$/;
const orientations = ['portrait', 'landscapeLeft', 'landscapeRight'];

export function normalizeSetup(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).some(key => !['name','profile','orientation','locale','taps','visible'].includes(key)))
    throw Error('Invalid screen setup');
  const { name, profile, orientation, locale, taps, visible } = input;
  if (typeof name !== 'string' || !/^[A-Za-z0-9][ A-Za-z0-9_-]{0,39}$/.test(name))
    throw Error('Choose a screen setup name of 1–40 characters');
  if (typeof profile !== 'string' || !Object.hasOwn(captureProfiles, profile) || !orientations.includes(orientation))
    throw Error('Choose appearance, text size and orientation');
  if (typeof locale !== 'string' || !/^[A-Za-z]{2,3}(-[A-Za-z]{4})?-[A-Za-z]{2}$/.test(locale))
    throw Error('Enter a language and region such as en-US or zh-Hant-TW');
  if (!Array.isArray(taps) || taps.length > 12 || !taps.every(id => typeof id === 'string' && nodeID.test(id)) ||
      typeof visible !== 'string' || !nodeID.test(visible))
    throw Error('Enter up to 12 tap identifiers and one final visible element identifier from the App IR');
  return { name, profile, orientation, locale:Intl.getCanonicalLocales(locale)[0], taps:[...taps], visible };
}

export function comparisonConditions(before, after) {
  const keys = run => {
    const device = run.environment?.simulators?.find(row => row.udid === run.udid);
    return {
      simulator:run.udid, runtime:device?.runtime, xcode:run.environment?.xcode?.build,
      sdk:run.environment?.iosSimulatorSdk, profile:run.captureProfile?.profile,
      orientation:run.screenSetup?.orientation, locale:run.screenSetup?.locale,
      taps:run.screenSetup?.taps, visible:run.screenSetup?.visible
    };
  };
  const left = keys(before), right = keys(after);
  const mismatch = Object.keys(left).filter(key => JSON.stringify(left[key]) !== JSON.stringify(right[key]));
  if (mismatch.length) throw Error('Capture settings differ (' + mismatch.join(', ') + '). Capture both revisions with the same setup and simulator.');
  return before.screenSetup ? 'Both captures used the same screen setup and verified its final element. Pixel differences require review.'
    : 'Orientation, locale and navigation are not pinned in these captures. Pixel differences are exploratory.';
}

function driverSource(setup, bundle) {
  return `import XCTest
@MainActor final class ScreenSetupTests: XCTestCase {
    func testCaptureScreen() throws {
        continueAfterFailure = false
        let device = XCUIDevice.shared
        let original = device.orientation
        defer { device.orientation = original }
        device.orientation = .${setup.orientation}
        let app = XCUIApplication(bundleIdentifier: ${swiftString(bundle)})
        app.launchArguments = ["-AppleLocale", ${swiftString(setup.locale.replaceAll('-','_'))}, "-AppleLanguages", ${swiftString('(' + setup.locale + ')')}]
        app.launch()
        defer { app.terminate() }
        func element(_ identifier: String) -> XCUIElement {
            let matches = app.descendants(matching: .any).matching(NSPredicate(format: "identifier == %@", identifier))
            let first = matches.firstMatch
            XCTAssertTrue(first.waitForExistence(timeout: 8), identifier)
            XCTAssertEqual(matches.count, 1, identifier)
            XCTAssertTrue(first.isHittable, identifier)
            return first
        }
        let taps: [String] = [${setup.taps.map(swiftString).join(', ')}]
        for identifier in taps { element(identifier).tap() }
        _ = element(${swiftString(setup.visible)})
        XCTAssertEqual(device.orientation, .${setup.orientation})
        XCTAssert${setup.orientation === 'portrait' ? 'LessThan' : 'GreaterThan'}(app.frame.width, app.frame.height)
        let capture = XCTAttachment(data: app.screenshot().pngRepresentation, uniformTypeIdentifier: "public.png")
        capture.name = "studio-screen"
        capture.lifetime = .keepAlways
        add(capture)
    }
}`;
}

export async function captureScreenSetup({runner, cleanupRunner=runner, udid, setup, bundle, output}) {
  const dir = await fs.mkdtemp(path.join(tmpdir(), 'studio-screen-'));
  const driverBundle = 'com.example.studio.capture.d' + randomUUID().replaceAll('-','');
  async function run(command, args, timeoutMs) {
    const result = await runner.run(command, args, {cwd:dir, timeoutMs});
    if (result.exitCode !== 0 || result.timedOut || result.spawnError)
      throw Error(command + ' failed during screen capture: ' + (result.spawnError || (result.stdout + '\n' + result.stderr).trim().slice(-3000)));
    return result.stdout;
  }
  try {
    const project = path.join(dir, 'AppProject.xcodeproj');
    const schemes = path.join(project, 'xcshareddata', 'xcschemes');
    await Promise.all([schemes, path.join(dir,'App'), path.join(dir,'UITests')].map(d => fs.mkdir(d,{recursive:true})));
    await Promise.all([
      fs.writeFile(path.join(project,'project.pbxproj'),projectText(['App/Driver.swift'],'Studio Capture',driverBundle)),
      fs.writeFile(path.join(schemes,'AppProject.xcscheme'),schemeText()),
      fs.writeFile(path.join(dir,'App/Driver.swift'),'import SwiftUI\n@main struct Driver: App { var body: some Scene { WindowGroup { EmptyView() } } }'),
      fs.writeFile(path.join(dir,'UITests/AcceptanceTests.swift'),driverSource(setup,bundle))
    ]);
    const results = path.join(dir,'result.xcresult');
    await run('xcodebuild',['test','-project',project,'-scheme','AppProject','-destination','platform=iOS Simulator,id='+udid,
      '-parallel-testing-enabled','NO','-derivedDataPath',path.join(dir,'derived'),'-resultBundlePath',results,'CODE_SIGNING_ALLOWED=NO'],420000);
    const summary = JSON.parse(await run('xcrun',['xcresulttool','get','test-results','summary','--path',results],30000));
    if (summary.passedTests !== 1 || summary.failedTests !== 0 || summary.skippedTests !== 0) throw Error('Expected one passing screen capture test');
    const images = path.join(dir,'attachments');
    await run('xcrun',['xcresulttool','export','attachments','--path',results,'--output-path',images],30000);
    const manifest = JSON.parse(await fs.readFile(path.join(images,'manifest.json'),'utf8'));
    const found = manifest.filter(t=>t.testIdentifier==='ScreenSetupTests/testCaptureScreen()').flatMap(t=>t.attachments)
      .filter(a=>a.deviceId===udid && !a.isAssociatedWithFailure && a.suggestedHumanReadableName.startsWith('studio-screen_'));
    if (found.length!==1 || !/^[\w-]+\.png$/.test(found[0].exportedFileName)) throw Error('Verified screen attachment missing or ambiguous');
    await fs.copyFile(path.join(images,found[0].exportedFileName),output);
  } finally {
    // These unique IDs belong to this capture. Never uninstall the app being measured.
    try {
      for (const id of [driverBundle+'.uitests.xctrunner',driverBundle]) {
        const probe=await cleanupRunner.run('xcrun',['simctl','get_app_container',udid,id],{timeoutMs:15000});
        if (probe.exitCode!==0) continue;
        const removed=await cleanupRunner.run('xcrun',['simctl','uninstall',udid,id],{timeoutMs:30000});
        if (removed.exitCode!==0) throw Error('Unable to remove temporary Studio capture driver '+id);
      }
    } finally { await fs.rm(dir,{recursive:true,force:true}); }
  }
}
