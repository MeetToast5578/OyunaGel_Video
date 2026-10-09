// Single source of truth for timing: scenes, in-scene cue frames, and the SFX the mixer places on them.
// 120 BPM at 30 fps: one beat = 15 frames, one bar = 60 frames.
export const FPS = 30
export const BEAT = 15
export const BAR = 60

export const SCENES = {
  cold: { start: 0, dur: 240 }, // bars 0-3: intro
  logo: { start: 240, dur: 120 }, // bar 4: drop
  hero: { start: 360, dur: 240 },
  sports: { start: 600, dur: 180 },
  wall: { start: 780, dur: 240 }, // bar 16 (frame 960) is the breakdown
  create: { start: 1020, dur: 300 }, // bar 17: re-drop
  phones: { start: 1320, dur: 240 },
  stats: { start: 1560, dur: 120 }, // build
  outro: { start: 1680, dur: 180 }, // bar 28: final hit
} as const
export const TOTAL = 1860

export const CREATE = {
  sport: 45, venue: 70, typeStart: 78, typeStep: 6, option: 125, time: 140, clockEnd: 176,
  plus: [190, 200, 210, 220], level: 235, publish: 258,
}
export const DETAIL = { start: 110, join: 188 } // join is local to the wall scene

type Sfx = [keyof typeof SCENES, number, string]
export const SFX: Sfx[] = [
  ['cold', 0, 'hit'], ['cold', 15, 'hit'],
  ['cold', 60, 'tick'], ['cold', 70, 'tick'], ['cold', 80, 'tick'],
  ['cold', 120, 'hit'], ['cold', 135, 'hit'], ['cold', 150, 'hit'],
  ...[0, 1, 2, 3, 4, 5, 6].map((i): Sfx => ['cold', 165 + i * 3, 'pop']),
  ['cold', 200, 'blip'], ['cold', 222, 'whoosh'],
  ['logo', 0, 'boom'], ['logo', 22, 'pop'], ['logo', 24, 'swish'], ['logo', 100, 'whoosh'],
  ['hero', 0, 'whoosh'], ['hero', 40, 'swish'], ['hero', 55, 'swish'], ['hero', 70, 'swish'],
  ['sports', 0, 'tick'], ['sports', 15, 'hit'], ['sports', 30, 'hit'], ['sports', 45, 'hit'],
  ['sports', 90, 'pop'], ['sports', 96, 'pop'], ['sports', 102, 'pop'], ['sports', 165, 'whoosh'],
  ['wall', 0, 'whoosh'], ['wall', 98, 'whoosh'],
  ...[0, 1, 2, 3, 4, 5, 6].map((i): Sfx => ['wall', DETAIL.start + 12 + i * 3, 'pop']),
  ['wall', DETAIL.join, 'click'], ['wall', DETAIL.join + 3, 'success'],
  ['create', 0, 'whoosh'], ['create', CREATE.sport, 'click'], ['create', CREATE.venue, 'click'],
  ...[0, 1, 2, 3, 4].map((i): Sfx => ['create', CREATE.typeStart + i * CREATE.typeStep, 'key']),
  ['create', CREATE.option, 'click'], ['create', CREATE.time, 'click'], ['create', CREATE.clockEnd, 'pop'],
  ...CREATE.plus.map((f): Sfx => ['create', f, 'click']),
  ['create', CREATE.level, 'click'], ['create', CREATE.publish, 'click'], ['create', CREATE.publish + 3, 'success'],
  ['phones', 4, 'whoosh'], ['phones', 14, 'swish'], ['phones', 24, 'swish'],
  ['stats', 0, 'swish'], ['stats', 98, 'whoosh'],
  ['outro', 0, 'boom'], ['outro', 30, 'swish'], ['outro', 58, 'pop'],
]
