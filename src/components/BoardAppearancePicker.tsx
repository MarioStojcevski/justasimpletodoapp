import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { KanbanBoard } from '../types'
import { BOARD_COLOR_PICKER_SWATCHES } from '../lib/boardAppearance'
import { BOARD_ICON_OPTIONS } from './BoardGlyph'

type Props = {
  board: KanbanBoard
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
  onPickIcon: (icon: number) => void
  onPickColor: (color: number) => void
}

export function BoardAppearancePicker({ board, open, anchorRef, onClose, onPickIcon, onPickColor }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const pad = 6
    let left = r.left
    const panelW = 216
    if (left + panelW > window.innerWidth - pad) left = window.innerWidth - panelW - pad
    if (left < pad) left = pad
    let top = r.bottom + 4
    const panelH = 200
    if (top + panelH > window.innerHeight - pad) top = r.top - panelH - 4
    if (top < pad) top = pad
    setPos({ top, left })
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (anchorRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={`Icon and color for ${board.title}`}
      className="fixed z-200 w-[216px] rounded-xl border-2 border-edge bg-white p-2.5 shadow-brutal-xl"
      style={{ top: pos.top, left: pos.left }}
    >
      <p className="mb-1.5 pl-0.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-neutral-500">Icon</p>
      <div className="mb-3 grid grid-cols-4 gap-1">
        {BOARD_ICON_OPTIONS.map((opt, idx) => {
          const sel = board.icon === idx
          return (
            <button
              key={opt.label}
              type="button"
              title={opt.label}
              aria-label={opt.label}
              aria-pressed={sel}
              className={`flex h-9 w-full items-center justify-center rounded-lg border transition-colors ${
                sel ? 'border-edge-strong bg-cream' : 'border-edge/50 bg-white hover:bg-ink/4'
              }`}
              onClick={() => onPickIcon(idx)}
            >
              <opt.Icon className="h-4 w-4 text-ink" strokeWidth={2.25} aria-hidden />
            </button>
          )
        })}
      </div>
      <p className="mb-1.5 pl-0.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-neutral-500">Color</p>
      <div className="grid grid-cols-4 gap-1.5">
        {BOARD_COLOR_PICKER_SWATCHES.map((sw, idx) => {
          const sel = board.color === idx
          return (
            <button
              key={idx}
              type="button"
              title={`Color ${idx + 1}`}
              aria-label={`Board color ${idx + 1}`}
              aria-pressed={sel}
              className={`mx-auto flex h-8 w-8 rounded-full border-2 ${sw} ${
                sel ? 'border-edge-strong ring-2 ring-edge/50' : 'border-white/80 hover:ring-2 hover:ring-edge/30'
              }`}
              onClick={() => onPickColor(idx)}
            />
          )
        })}
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
