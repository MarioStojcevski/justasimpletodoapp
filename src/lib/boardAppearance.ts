/** Indices 0..7 — boards store `icon` and `color` as these values */

export const BOARD_ACCENT_MAX = 7

export function clampBoardAccent(n: unknown, fallback = 0): number {
  const v = typeof n === 'number' && !Number.isNaN(n) ? Math.floor(n) : fallback
  return Math.max(0, Math.min(BOARD_ACCENT_MAX, v))
}

/** Pastel tile behind board glyph (icon uses contrasting ink-ish tone) */
export const BOARD_COLOR_SWATCHES: readonly string[] = [
  'bg-rose-200/95 text-rose-950',
  'bg-amber-200/95 text-amber-950',
  'bg-emerald-200/95 text-emerald-950',
  'bg-sky-200/95 text-sky-950',
  'bg-violet-200/95 text-violet-950',
  'bg-orange-200/95 text-orange-950',
  'bg-teal-200/95 text-teal-950',
  'bg-fuchsia-200/95 text-fuchsia-950',
] as const

/** Picker swatch: solid fill, ring when selected */
export const BOARD_COLOR_PICKER_SWATCHES: readonly string[] = [
  'bg-rose-300',
  'bg-amber-300',
  'bg-emerald-300',
  'bg-sky-300',
  'bg-violet-300',
  'bg-orange-300',
  'bg-teal-300',
  'bg-fuchsia-300',
] as const
