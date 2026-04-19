import { useEffect } from 'react'
import { DailyFocus } from '../components/DailyFocus'
import { useWorkspace } from '../state/workspace'

export function TodayPage() {
  const { state, syncDailyFocus } = useWorkspace()
  const { boards, dailyFocus } = state

  useEffect(() => {
    syncDailyFocus()
  }, [syncDailyFocus, boards, dailyFocus])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pb-10 md:p-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Today</h1>
      </header>

      <div className="mx-auto w-full max-w-2xl">
        <DailyFocus />
      </div>
    </div>
  )
}
