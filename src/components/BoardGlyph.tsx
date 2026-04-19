import type { LucideIcon } from 'lucide-react'
import {
  Bone,
  Bug,
  Fish,
  FlaskConical,
  Ghost,
  Rabbit,
  Rocket,
  Skull,
} from 'lucide-react'
import { BOARD_COLOR_SWATCHES, clampBoardAccent } from '../lib/boardAppearance'

/** Eight deliberately un-corporate glyphs for boards */
export const BOARD_ICON_OPTIONS: readonly { Icon: LucideIcon; label: string }[] = [
  { Icon: Ghost, label: 'Ghost' },
  { Icon: Skull, label: 'Skull' },
  { Icon: Rocket, label: 'Rocket' },
  { Icon: Fish, label: 'Fish' },
  { Icon: Bug, label: 'Bug' },
  { Icon: Rabbit, label: 'Rabbit' },
  { Icon: Bone, label: 'Bone' },
  { Icon: FlaskConical, label: 'Flask' },
] as const

type Props = {
  icon: number
  color: number
  /** Icon pixel size (default 16) */
  size?: number
  className?: string
}

export function BoardGlyph({ icon, color, size = 16, className = '' }: Props) {
  const i = clampBoardAccent(icon, 0)
  const c = clampBoardAccent(color, 0)
  const entry = BOARD_ICON_OPTIONS[i] ?? BOARD_ICON_OPTIONS[0]
  const Icon = entry.Icon
  const tone = BOARD_COLOR_SWATCHES[c] ?? BOARD_COLOR_SWATCHES[0]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-edge/40 ${tone} ${className}`}
      style={{ width: size + 10, height: size + 10 }}
    >
      <Icon width={size} height={size} strokeWidth={2.25} aria-hidden />
    </span>
  )
}
