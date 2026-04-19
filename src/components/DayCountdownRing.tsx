import { useEffect, useLayoutEffect, useState } from 'react'
import { dayRingFractionRemaining, msUntilLocalMidnight } from '../lib/dailyFocus'

const R = 54
const C = 2 * Math.PI * R

/** Intro: full ring then ease down to real “day left” fraction (runs once on mount, e.g. after BEGIN). */
const INTRO_MS = 3000
/** End intro just after CSS transition finishes so the handoff to the 1s ticker is clean. */
const INTRO_END_MS = INTRO_MS + 50

function formatHms(ms: number): string {
  const totalM = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalM / 60)
  const m = totalM % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

export function DayCountdownRing() {
  const [, setTick] = useState(0)
  const [displayFrac, setDisplayFrac] = useState(1)
  const [intro, setIntro] = useState(true)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  useLayoutEffect(() => {
    const target = dayRingFractionRemaining()
    const raf = requestAnimationFrame(() => {
      setDisplayFrac(target)
    })
    const t = window.setTimeout(() => {
      setIntro(false)
      setDisplayFrac(dayRingFractionRemaining())
    }, INTRO_END_MS)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (intro) return undefined
    const id = window.setInterval(() => {
      setDisplayFrac(dayRingFractionRemaining())
    }, 1000)
    return () => window.clearInterval(id)
  }, [intro])

  const now = new Date()
  const msLeft = msUntilLocalMidnight(now)
  const dash = Math.min(1, Math.max(0, displayFrac)) * C

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[140px] w-[140px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-edge/35"
          />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className={`text-[#6b8f71] transition-[stroke-dasharray] ${
              intro ? 'duration-3000 ease-out' : 'duration-1000 ease-linear'
            }`}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-extrabold tabular-nums tracking-tight text-ink">
            {formatHms(msLeft)}
          </span>
          <span className="mt-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-neutral-500">
            until midnight
          </span>
        </div>
      </div>
    </div>
  )
}
