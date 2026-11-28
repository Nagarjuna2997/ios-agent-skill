import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'ios-simulator',
  component: 'Pane',
  requestId: 'ios-simulator',
  props: {
    title: 'iOS Simulator',
    isFocused: false,
    bodyColumns: 44,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 24 },
    view: {},
  },
} as const

/** The host answers as a Mac with Xcode selected and one iOS runtime. */
function mac(argv: readonly string[]) {
  const line = argv.join(' ')
  if (line === 'uname') return { exitCode: 0, stdout: 'Darwin\n', stderr: '' }
  if (line.startsWith('ls -d /Applications/Xcode.app')) {
    return { exitCode: 0, stdout: '/Applications/Xcode.app\n', stderr: '' }
  }
  if (line === 'xcode-select -p') {
    return { exitCode: 0, stdout: '/Applications/Xcode.app/Contents/Developer\n', stderr: '' }
  }
  if (line.includes('list runtimes')) {
    return {
      exitCode: 0,
      stderr: '',
      stdout: JSON.stringify({
        runtimes: [{ name: 'iOS 26.0', identifier: 'com.apple.CoreSimulator.SimRuntime.iOS-26-0', isAvailable: true }],
      }),
    }
  }
  if (line.includes('list devices')) {
    return {
      exitCode: 0,
      stderr: '',
      stdout: JSON.stringify({
        devices: {
          'com.apple.CoreSimulator.SimRuntime.iOS-26-0': [
            { udid: 'AAA', name: 'iPhone 17 Pro', state: 'Shutdown', isAvailable: true },
            { udid: 'BBB', name: 'iPhone 17', state: 'Booted', isAvailable: true },
          ],
        },
      }),
    }
  }
  return { exitCode: 1, stdout: '', stderr: `no stub for ${line}` }
}

test('on a host without Xcode the pane shows the checklist, not a dead screen', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ios-simulator' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  // Linux: every probe fails the way it does in a cloud container.
  on('process.run', (_, e) =>
    e.argv.join(' ') === 'uname'
      ? { value: { exitCode: 0, stdout: 'Linux\n', stderr: '' } }
      : { value: { exitCode: 127, stdout: '', stderr: 'command not found' } },
  )

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /Set up the iOS simulator/ }))?.text).toBeTruthy()
  // The reason is named rather than left as a bare failure.
  expect((await ui.find({ type: 'Text', text: /Needs macOS/ }))?.text).toBeTruthy()
  await ui.unmount()
})

test('a command-line-tools developer dir fails Select Xcode and names the fix', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ios-simulator' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('process.run', (_, e) => {
    const line = e.argv.join(' ')
    if (line === 'uname') return { value: { exitCode: 0, stdout: 'Darwin\n', stderr: '' } }
    if (line.startsWith('ls -d')) return { value: { exitCode: 0, stdout: '/Applications/Xcode.app\n', stderr: '' } }
    if (line === 'xcode-select -p') {
      // The state the Simulator's own setup screen asks for a password to fix.
      return { value: { exitCode: 0, stdout: '/Library/Developer/CommandLineTools\n', stderr: '' } }
    }
    return { value: { exitCode: 1, stdout: '', stderr: '' } }
  })

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /sudo xcode-select -s/ }))?.text).toBeTruthy()
  await ui.unmount()
})

test('a ready Mac gets the device picker, booted device first', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ios-simulator' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('process.run', (_, e) => ({ value: mac(e.argv) }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  const picker = await ui.find({ type: 'Select', key: 'device' })
  expect(picker).toBeTruthy()
  // Booted sorts first: that is the one a person means by "the simulator".
  expect(picker?.props?.options?.[0]?.label).toContain('iPhone 17')
  expect(picker?.props?.options?.[0]?.value).toBe('BBB')
  await ui.unmount()
})

test('the terminal surface loses the picture, not the actions', async ($, on) => {
  on('command.register', () => ({ value: { command: 'ios-simulator' } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('process.run', (_, e) => ({ value: mac(e.argv) }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })

  // Terminal has Image, not Svg — the tree must still mount and still act.
  expect(await ui.find({ type: 'Button', key: 'reload' })).toBeTruthy()
  expect(await ui.find({ type: 'Button', key: 'record' })).toBeTruthy()
  await ui.unmount()
})
