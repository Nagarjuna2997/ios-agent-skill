import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Device, Screen, Setup, Step } from '../types'

const PANE = 'ios-simulator'

/** Svg `source` is capped at 131072 chars; leave room for the wrapper and overlay. */
const MAX_DATA_URI = 110_000

/** Downscale width. Small enough that a JPEG of it fits the cap with margin. */
const SHOT_WIDTH = 320

const setup = atom({ plugin: 'ios-simulator', key: 'setup' } as const, null, {
  shape: 'setup-1',
})
const devices = atom({ plugin: 'ios-simulator', key: 'devices' } as const, [], {
  shape: 'devices-1',
})
const selected = atom({ plugin: 'ios-simulator', key: 'selected' } as const, null)
const screen = atom({ plugin: 'ios-simulator', key: 'screen' } as const, null, {
  shape: 'screen-1',
})
const status = atom({ plugin: 'ios-simulator', key: 'status' } as const, 'Not checked yet.')
const isAnnotating = atom({ plugin: 'ios-simulator', key: 'isAnnotating' } as const, false)
const isRecording = atom({ plugin: 'ios-simulator', key: 'isRecording' } as const, false)

/**
 * The slice of `$` these helpers need.
 *
 * They are top-level function declarations on purpose: the engine refuses `$`
 * passed to anything else, so a helper closed over inside `register` does not
 * load.
 */
type Shell = {
  process: {
    run: (
      argv: readonly string[],
      init?: { timeoutMs?: number },
    ) => Promise<{ exitCode: number; stdout: string; stderr: string }>
  }
  fs: { read: (path: string, init?: { encoding?: string }) => Promise<unknown> }
}

/** Never throws: a missing executable is an answer, not a crash. */
async function tryRun(
  $: Shell,
  argv: readonly string[],
  timeoutMs = 20_000,
): Promise<{ ok: boolean; out: string; err: string }> {
  try {
    const ran = await $.process.run(argv, { timeoutMs })
    return { ok: ran.exitCode === 0, out: ran.stdout.trim(), err: ran.stderr.trim() }
  } catch (cause) {
    return { ok: false, out: '', err: cause instanceof Error ? cause.message : String(cause) }
  }
}

// MARK: - The checklist

/**
 * The three steps the Simulator setup screen shows, answered from the host.
 *
 * Each step reports what was *found*, not just pass/fail — "command line tools
 * selected instead of Xcode" is a different problem from "no Xcode", and they
 * have different fixes.
 */
async function probe($: Shell): Promise<Setup> {
  const uname = await tryRun($, ['uname'])
  const platform = uname.out || 'unknown'

  if (platform !== 'Darwin') {
    const blocked = (id: Step['id'], title: string): Step => ({
      id,
      title,
      isDone: false,
      detail: `Needs macOS. This session runs on ${platform}.`,
    })
    return {
      platform,
      isReady: false,
      checkedAt: Date.now(),
      steps: [
        blocked('xcode', 'Xcode installed'),
        blocked('select', 'Select Xcode'),
        blocked('runtime', 'Install Simulator'),
      ],
    }
  }

  const app = await tryRun($, ['ls', '-d', '/Applications/Xcode.app'])
  const picked = await tryRun($, ['xcode-select', '-p'])
  const developerDir = picked.out
  const isXcodeSelected = picked.ok && developerDir.includes('Xcode.app')
  const hasXcode = app.ok || isXcodeSelected

  const steps: Step[] = [
    {
      id: 'xcode',
      title: 'Xcode installed',
      isDone: hasXcode,
      detail: hasXcode
        ? app.ok
          ? '/Applications/Xcode.app'
          : developerDir
        : 'No Xcode.app found in /Applications.',
      fix: hasXcode ? undefined : 'Install Xcode from the Mac App Store',
    },
    {
      id: 'select',
      title: 'Select Xcode',
      isDone: isXcodeSelected,
      detail: isXcodeSelected
        ? developerDir
        : developerDir
          ? `Command-line tools point at ${developerDir}, not Xcode.`
          : 'xcode-select has no developer directory.',
      // The step the Simulator app asks for a password for: it rewrites a
      // symlink under /var/db, which is why it needs sudo and why it cannot
      // be done from here.
      fix: isXcodeSelected ? undefined : 'sudo xcode-select -s /Applications/Xcode.app',
    },
  ]

  let hasRuntime = false
  let runtimeDetail = 'Select Xcode first.'

  if (isXcodeSelected) {
    const runtimes = await tryRun($, ['xcrun', 'simctl', 'list', 'runtimes', '-j'], 30_000)
    if (runtimes.ok) {
      try {
        const parsed = JSON.parse(runtimes.out) as {
          runtimes?: { name?: string; identifier?: string; isAvailable?: boolean }[]
        }
        const available = (parsed.runtimes ?? []).filter(
          one => one.isAvailable === true && /iOS/i.test(one.identifier ?? one.name ?? ''),
        )
        hasRuntime = available.length > 0
        runtimeDetail = hasRuntime
          ? available.map(one => one.name).filter(Boolean).join(', ')
          : 'No iOS runtime is installed.'
      } catch {
        runtimeDetail = 'simctl returned output this could not parse.'
      }
    } else {
      runtimeDetail = runtimes.err || 'xcrun simctl is not answering.'
    }
  }

  steps.push({
    id: 'runtime',
    title: 'Install Simulator',
    isDone: hasRuntime,
    detail: runtimeDetail,
    fix: hasRuntime ? undefined : 'xcodebuild -downloadPlatform iOS',
  })

  return {
    platform,
    steps,
    isReady: steps.every(one => one.isDone),
    checkedAt: Date.now(),
  }
}

async function listDevices($: Shell): Promise<Device[]> {
  const listed = await tryRun($, ['xcrun', 'simctl', 'list', 'devices', 'available', '-j'], 30_000)
  if (!listed.ok) return []

  try {
    const parsed = JSON.parse(listed.out) as {
      devices?: Record<string, { udid: string; name: string; state: string; isAvailable?: boolean }[]>
    }
    const out: Device[] = []
    for (const [runtime, group] of Object.entries(parsed.devices ?? {})) {
      if (!/iOS/i.test(runtime)) continue
      for (const one of group) {
        if (one.isAvailable === false) continue
        out.push({
          udid: one.udid,
          name: one.name,
          runtime: runtime.replace(/^com\.apple\.CoreSimulator\.SimRuntime\./, '').replace(/-/g, ' '),
          isBooted: one.state === 'Booted',
        })
      }
    }
    // Booted first: that is the one a person means by "the simulator".
    return out.sort((a, b) => Number(b.isBooted) - Number(a.isBooted))
  } catch {
    return []
  }
}

// MARK: - The screen

/**
 * Screenshot the device, downscale it, and return it as a `data:` URI.
 *
 * JPEG rather than PNG, and 320px wide, for one reason: `Svg.source` is capped
 * at 131072 characters and a full-resolution PNG of a modern iPhone is an
 * order of magnitude past that. The cap is checked before returning, because
 * an oversized source is refused by the surface and draws nothing — a blank
 * pane with no error is the worst possible failure here.
 */
async function capture(
  $: Shell,
  udid: string,
  dir: string,
): Promise<{ screen?: Screen; note: string }> {
  const png = `${dir}/ios-simulator-shot.png`
  const jpg = `${dir}/ios-simulator-shot.jpg`

  const shot = await tryRun($, ['xcrun', 'simctl', 'io', udid, 'screenshot', png], 30_000)
  if (!shot.ok) return { note: shot.err || 'simctl could not take a screenshot.' }

  // sips ships with macOS, so this adds no dependency.
  const scaled = await tryRun($, ['sips', '-Z', String(SHOT_WIDTH), '-s', 'format', 'jpeg', png, '--out', jpg])
  const source = scaled.ok ? jpg : png
  const mime = scaled.ok ? 'image/jpeg' : 'image/png'

  let base64 = ''
  try {
    const got = (await $.fs.read(source, { encoding: 'base64' })) as { base64?: string } | string
    base64 = typeof got === 'string' ? got : (got.base64 ?? '')
  } catch (cause) {
    return { note: cause instanceof Error ? cause.message : String(cause) }
  }
  if (!base64) return { note: 'The screenshot file read back empty.' }

  const dataUri = `data:${mime};base64,${base64}`
  if (dataUri.length > MAX_DATA_URI) {
    return {
      note: `Screenshot is ${Math.round(dataUri.length / 1024)} KB encoded, over the ${Math.round(
        MAX_DATA_URI / 1024,
      )} KB the pane can draw. Saved to ${source}.`,
    }
  }

  // sips reports the scaled size; fall back to the nominal width.
  const measured = await tryRun($, ['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', source])
  const width = Number(/pixelWidth:\s*(\d+)/.exec(measured.out)?.[1] ?? SHOT_WIDTH)
  const height = Number(/pixelHeight:\s*(\d+)/.exec(measured.out)?.[1] ?? Math.round(SHOT_WIDTH * 2.16))

  return { screen: { dataUri, width, height, takenAt: Date.now() }, note: 'Screen updated.' }
}

/** The screenshot, plus optional layout guides, as one SVG document. */
function screenSvg(shot: Screen, withGuides: boolean): string {
  const { width: w, height: h } = shot
  // Rough iPhone safe-area proportions — enough to see whether content is
  // colliding with the status bar or the home indicator.
  const top = Math.round(h * 0.055)
  const bottom = Math.round(h * 0.039)
  const guides = withGuides
    ? `<g fill="none" stroke="#FF2D55" stroke-width="1" stroke-dasharray="4 3" opacity="0.9">
         <line x1="0" y1="${top}" x2="${w}" y2="${top}" />
         <line x1="0" y1="${h - bottom}" x2="${w}" y2="${h - bottom}" />
         <line x1="${Math.round(w / 2)}" y1="0" x2="${Math.round(w / 2)}" y2="${h}" opacity="0.4" />
         <rect x="8" y="8" width="${w - 16}" height="${h - 16}" stroke="#0A84FF" opacity="0.5" />
       </g>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image href="${shot.dataUri}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" />
  ${guides}
</svg>`
}

/**
 * Re-run the checklist and, when it passes, refresh the device list.
 *
 * Top-level because the engine refuses `$` passed to a function declared
 * inside `register` — it cannot see what such a function does with it.
 */
async function refreshSetup($: Shell & {
  state?: unknown
}): Promise<Setup> {
  const found = await probe($)
  await update($ as never, setup, () => found)

  if (found.isReady) {
    const list = await listDevices($)
    await update($ as never, devices, () => list)
    const booted = list.find(one => one.isBooted) ?? list[0]
    if (booted) {
      await update($ as never, selected, current => current ?? booted.udid)
    }
  }

  return found
}

export const register: Register = on => {
  /** Held across presses so Stop can end the child. Reset by a reload. */
  let recorder: { return?: () => unknown } | null = null

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'ios-simulator',
      description: 'Open the iOS Simulator pane',
    })
    void $.ui.open({ id: PANE, title: 'iOS Simulator' })
    void refreshSetup($)

    return next(e)
  })

  on('command.run', { command: 'ios-simulator' }, async $ => {
    await $.ui.open({ id: PANE, title: 'iOS Simulator' })
    const found = await refreshSetup($)

    return {
      text: found.isReady
        ? 'iOS Simulator pane opened.'
        : `iOS Simulator pane opened. Setup is incomplete on ${found.platform}: ` +
          found.steps.filter(one => !one.isDone).map(one => one.title).join(', ') + '.',
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const table = $.ui.resolve(e)
    const { Box, Text, Button, Select } = table
    // Svg is on desktop, vscode and mobile; the terminal has Image instead and
    // gets the actions without the picture rather than a broken tree.
    const Svg = 'Svg' in table ? table.Svg : undefined
    const [found, list, pick, shot, note, guides, recording] = await Promise.all([
      read($, setup),
      read($, devices),
      read($, selected),
      read($, screen),
      read($, status),
      read($, isAnnotating),
      read($, isRecording),
    ])

    const act = async (fn: () => Promise<string>) => {
      try {
        await update($, status, () => 'Working…')
        const said = await fn()
        await update($, status, () => said)
      } catch (cause) {
        await update($, status, () => (cause instanceof Error ? cause.message : String(cause)))
      }
    }
    const device = list.find(one => one.udid === pick)

    // MARK: setup not finished
    if (!found || !found.isReady) {
      return (
        <Box flexDirection="column" gap={1}>
          <Text bold>Set up the iOS simulator</Text>
          <Text dimColor>Progress updates automatically as each step finishes.</Text>
          {(found?.steps ?? []).map(step => (
            <Box key={step.id} flexDirection="column" borderStyle="round" paddingX={1}>
              <Text color={step.isDone ? 'green' : undefined}>
                {step.isDone ? '✓' : '○'} {step.title}
              </Text>
              <Text dimColor>{step.detail}</Text>
              {step.fix && <Text color="cyan">{step.fix}</Text>}
            </Box>
          ))}
          <Button key="recheck" label="Re-check" onPress={() => void refreshSetup($)} />
          <Text dimColor>{note}</Text>
        </Box>
      )
    }

    // MARK: ready
    return (
      <Box flexDirection="column" gap={1}>
        <Select
          key="device"
          label="Device"
          value={pick ?? list[0]?.udid}
          options={list.map(one => ({
            value: one.udid,
            label: `${one.isBooted ? '● ' : '○ '}${one.name} — ${one.runtime}`,
          }))}
          onSelect={value => void update($, selected, () => value)}
        />

        {shot && Svg ? (
          <Svg
            source={screenSvg(shot, guides)}
            alt={`Screen of ${device?.name ?? 'the simulator'}${guides ? ', with layout guides' : ''}`}
            width={shot.width}
            height={shot.height}
          />
        ) : (
          <Text dimColor>
            {Svg ? 'No screen captured yet — press Reload.' : 'This surface cannot draw the screen; actions still work.'}
          </Text>
        )}

        <Box gap={1}>
          <Button
            key="boot"
            label={device?.isBooted ? 'Shutdown' : 'Boot'}
            onPress={() =>
              void act(async () => {
                if (!pick) return 'No device selected.'
                const ran = await tryRun($, ['xcrun', 'simctl', device?.isBooted ? 'shutdown' : 'boot', pick], 60_000)
                const list = await listDevices($)
                await update($, devices, () => list)
                return ran.ok ? (device?.isBooted ? 'Shut down.' : 'Booted.') : ran.err || 'simctl refused.'
              })
            }
          />
          <Button
            key="reload"
            label="Reload"
            onPress={() =>
              void act(async () => {
                if (!pick) return 'No device selected.'
                const got = await capture($ as never, pick, (await $.process.hookEnv()).CLAUDE_PLUGIN_DATA ?? '/tmp')
                if (got.screen) await update($, screen, () => got.screen ?? null)
                return got.note
              })
            }
          />
          <Button
            key="record"
            label={recording ? 'Stop' : 'Record'}
            onPress={() =>
              void act(async () => {
                if (!pick) return 'No device selected.'
                if (recording) {
                  await recorder?.return?.()
                  recorder = null
                  await update($, isRecording, () => false)
                  return 'Recording stopped.'
                }
                const data = (await $.process.hookEnv()).CLAUDE_PLUGIN_DATA ?? '/tmp'
                const out = `${data}/simulator-${Date.now()}.mp4`
                // The loop IS the child's life — leaving it kills the process,
                // so it runs detached and `return()` on the stream is Stop.
                const stream = $.process.spawn({
                  argv: ['xcrun', 'simctl', 'io', pick, 'recordVideo', '--force', out],
                })
                recorder = stream as unknown as { return?: () => unknown }
                void (async () => {
                  for await (const _ of stream) {
                    // Drain; the child lives until Stop or the module unloads.
                  }
                  await update($, isRecording, () => false)
                })()
                await update($, isRecording, () => true)
                return `Recording to ${out}`
              })
            }
          />
          <Button
            key="annotate"
            label={guides ? 'Guides off' : 'Guides'}
            onPress={() => void update($, isAnnotating, current => !current)}
          />
          <Button
            key="appearance"
            label="Dark/Light"
            onPress={() =>
              void act(async () => {
                if (!pick) return 'No device selected.'
                const now = await tryRun($, ['xcrun', 'simctl', 'ui', pick, 'appearance'])
                const nextOne = now.out.trim() === 'dark' ? 'light' : 'dark'
                const ran = await tryRun($, ['xcrun', 'simctl', 'ui', pick, 'appearance', nextOne])
                return ran.ok ? `Appearance set to ${nextOne}.` : ran.err || 'simctl refused.'
              })
            }
          />
          <Button
            key="commands"
            label="Commands"
            onPress={() =>
              void update($, status, () =>
                pick
                  ? `xcrun simctl boot ${pick} · xcrun simctl io ${pick} screenshot out.png · xcrun simctl openurl ${pick} <url>`
                  : 'No device selected.',
              )
            }
          />
        </Box>

        <Text dimColor>{note}</Text>
      </Box>
    )
  })
}
