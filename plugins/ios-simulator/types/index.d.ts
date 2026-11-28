/** One row of the setup checklist. */
export type Step = {
  id: 'xcode' | 'select' | 'runtime'
  title: string
  isDone: boolean
  /** What to do about it, or what was found. Shown under the title. */
  detail: string
  /** The exact command that fixes it, when a command can. */
  fix?: string
}

export type Setup = {
  /** `uname` output. Everything here needs Darwin. */
  platform: string
  steps: Step[]
  isReady: boolean
  checkedAt: number
}

export type Device = {
  udid: string
  name: string
  runtime: string
  isBooted: boolean
}

export type Screen = {
  /** A `data:` URI, already size-checked against the Svg source limit. */
  dataUri: string
  width: number
  height: number
  takenAt: number
}

declare module 'claude-code' {
  interface PluginState {
    'ios-simulator': {
      // Shaped<> marks the three atoms declared with a `shape` tag: a stored
      // value from an older tag is declined rather than read back wrong.
      setup: Shaped<Setup | null>
      devices: Shaped<Device[]>
      screen: Shaped<Screen | null>
      // No shape tag, so no brand — these are plain values.
      selected: string | null
      status: string
      isAnnotating: boolean
      isRecording: boolean
    }
  }
}
