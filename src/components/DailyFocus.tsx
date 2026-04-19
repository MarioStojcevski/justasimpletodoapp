import { Link } from 'react-router-dom'
import { RefreshCw, Shuffle } from 'lucide-react'
import {
  collectTodoRefs,
  findTaskAnyColumn,
  findTodoRef,
  isTodayCommitted,
  localDateString,
  refsForPriority,
  todayTripleReadyForCommit,
} from '../lib/dailyFocus'
import { AREA_LABELS, COLUMN_LABELS, type Priority } from '../types'
import { btnAdd } from '../lib/ui'
import { useWorkspace } from '../state/workspace'
import { DayCountdownRing } from './DayCountdownRing'

const card =
  'rounded-2xl border-2 border-edge bg-white p-5 shadow-brutal-md transition-[box-shadow,transform] duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-brutal-lg'
const textLinkBtn =
  'cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-neutral-600 underline decoration-ink/25 decoration-2 underline-offset-[3px] transition-[color,text-decoration-color,transform] duration-200 ease-out hover:text-ink hover:decoration-ink motion-safe:active:scale-[0.98]'

const iconBtn =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-edge bg-[#faf9f6] text-ink shadow-brutal-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-[#ffffba]/80 motion-safe:active:scale-95'

type SlotKey = 'p1' | 'p2' | 'p3'

function slotLabel(slot: SlotKey): string {
  if (slot === 'p1') return 'P1'
  if (slot === 'p2') return 'P2'
  return 'P3'
}

function slotPriority(slot: SlotKey): Priority {
  return slot === 'p1' ? 'P1' : slot === 'p2' ? 'P2' : 'P3'
}

export function DailyFocus() {
  const {
    state,
    pickAnotherFocus,
    shuffleTodayFocusSlot,
    dismissDailyFocus,
    commitTodayFocus,
    clearTodayCommit,
  } = useWorkspace()
  const { dailyFocus, boards } = state
  const today = localDateString()
  const locked = isTodayCommitted(state, today)
  const commit = dailyFocus.todayCommit

  const noPicks = !dailyFocus.p1 && !dailyFocus.p2 && !dailyFocus.p3

  if (locked && commit && commit.day === today) {
    const snapshot = commit
    function lockedRow(slot: SlotKey) {
      const pick = snapshot[slot]
      if (!pick) {
        return (
          <div
            key={slot}
            className="rounded-xl border-2 border-edge/60 bg-[#faf9f6] px-3 py-3 text-sm text-neutral-600"
          >
            <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">{slotLabel(slot)}</p>
            <p className="mt-1">No task was saved for this slot.</p>
          </div>
        )
      }
      const ref = findTaskAnyColumn(boards, pick.taskId, pick.boardId)
      const board = boards.find((b) => b.id === pick.boardId)
      return (
        <div key={slot} className="rounded-xl border-2 border-edge bg-[#faf9f6] px-3 py-3">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-neutral-500">{slotLabel(slot)}</p>
          {ref ? (
            <>
              <p className="mb-1 text-base font-extrabold leading-snug text-ink">{ref.task.title}</p>
              <p className="mb-2 text-sm text-neutral-600">
                {board && (
                  <>
                    {AREA_LABELS[board.areaId]} — {board.title} — {COLUMN_LABELS[ref.task.column]}
                  </>
                )}
              </p>
              <Link className={`${textLinkBtn} inline-flex w-fit`} to={`/board/${ref.boardId}`}>
                Open board
              </Link>
            </>
          ) : (
            <p className="text-sm text-neutral-600">Task no longer on this board.</p>
          )}
        </div>
      )
    }

    return (
      <section className={card}>
        <h2 className="mb-1 text-base font-extrabold text-ink">Today — locked in</h2>
        <p className="mb-5 text-sm text-neutral-600">
          Your three picks stay fixed until midnight or until you stop today. Time left in the day:
        </p>
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
          <DayCountdownRing />
          <div className="flex w-full min-w-0 max-w-md flex-1 flex-col gap-3">
            {(['p1', 'p2', 'p3'] as const).map((s) => lockedRow(s))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-edge/40 pt-4">
          <button type="button" className={textLinkBtn} onClick={() => clearTodayCommit()}>
            Stop today
          </button>
        </div>
      </section>
    )
  }

  if (dailyFocus.skipDate === today && noPicks) {
    return (
      <section className={card}>
        <h2 className="mb-2.5 text-base font-extrabold text-ink">Today — three picks</h2>
        <p className="mb-3 text-sm leading-relaxed text-neutral-600">
          Cleared for today. Randomize when you want a fresh P1, P2, and P3 from your to-dos.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className={textLinkBtn} onClick={() => pickAnotherFocus()}>
            <span className="inline-flex items-center gap-2">
              <Shuffle className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
              Randomize all
            </span>
          </button>
        </div>
      </section>
    )
  }

  const hasAnyTodo = collectTodoRefs(boards).length > 0

  function renderSlotRow(slot: SlotKey) {
    const priority = slotPriority(slot)
    const pick = dailyFocus[slot]
    const pool = refsForPriority(boards, priority)

    if (!pick) {
      return (
        <div
          key={slot}
          className="flex flex-col gap-2 rounded-xl border-2 border-edge/60 bg-[#faf9f6] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">{slotLabel(slot)}</p>
            <p className="text-sm text-neutral-600">
              {pool.length === 0
                ? `No ${slotLabel(slot)} tasks in To Do.`
                : 'Syncing or waiting for a pick…'}
            </p>
          </div>
          {pool.length > 0 && (
            <button
              type="button"
              className={iconBtn}
              title={`New random ${slotLabel(slot)}`}
              aria-label={`New random ${slotLabel(slot)}`}
              onClick={() => shuffleTodayFocusSlot(slot)}
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </button>
          )}
        </div>
      )
    }

    const ref = findTodoRef(boards, pick.taskId, pick.boardId)
    if (!ref || ref.task.priority !== priority) {
      return (
        <div
          key={slot}
          className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-edge/70 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">{slotLabel(slot)}</p>
            <p className="text-sm text-neutral-600">This pick is no longer a matching To Do.</p>
          </div>
          <button
            type="button"
            className={iconBtn}
            title={`New random ${slotLabel(slot)}`}
            aria-label={`New random ${slotLabel(slot)}`}
            onClick={() => shuffleTodayFocusSlot(slot)}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      )
    }

    const board = boards.find((b) => b.id === ref.boardId)

    return (
      <div
        key={slot}
        className="flex flex-col gap-2 rounded-xl border-2 border-edge bg-[#faf9f6] px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-neutral-500">{slotLabel(slot)}</p>
          <p className="mb-1 text-base font-extrabold leading-snug text-ink">{ref.task.title}</p>
          <p className="mb-2 text-sm text-neutral-600">
            {board && (
              <>
                {AREA_LABELS[board.areaId]} — {board.title} — {COLUMN_LABELS[ref.task.column]}
              </>
            )}
          </p>
          <Link className={`${textLinkBtn} inline-flex w-fit`} to={`/board/${ref.boardId}`}>
            Open board
          </Link>
        </div>
        <button
          type="button"
          className={iconBtn}
          title={`New random ${slotLabel(slot)}`}
          aria-label={`New random ${slotLabel(slot)}`}
          onClick={() => shuffleTodayFocusSlot(slot)}
        >
          <RefreshCw className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    )
  }

  if (!hasAnyTodo) {
    return (
      <section className={card}>
        <h2 className="mb-2.5 text-base font-extrabold text-ink">Today — three picks</h2>
        <p className="mb-3 text-sm leading-relaxed text-neutral-600">
          No open to-dos to suggest. Add tasks on a board from the sidebar.
        </p>
      </section>
    )
  }

  const canBegin = todayTripleReadyForCommit(boards, dailyFocus)

  return (
    <section className={card}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-extrabold text-ink">Today — three picks</h2>
        <button type="button" className={textLinkBtn} onClick={() => pickAnotherFocus()}>
          <span className="inline-flex items-center gap-2">
            <Shuffle className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            Randomize all
          </span>
        </button>
      </div>
      <p className="mb-4 text-sm text-neutral-600">
        One suggestion per priority (P1, P2, P3), drawn at random from To Do on any board. Use refresh on a row to
        re-roll just that slot. When you are happy with all three, tap BEGIN — you will not be able to change them
        until tomorrow or until you stop today.
      </p>
      <div className="mb-4 flex flex-col gap-3">
        {(['p1', 'p2', 'p3'] as const).map((slot) => renderSlotRow(slot))}
      </div>
      <div className="mb-4 flex flex-col gap-2 border-t border-edge/40 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className={`${btnAdd} disabled:cursor-not-allowed disabled:opacity-45`}
            disabled={!canBegin}
            title={canBegin ? 'Lock these three picks for the rest of the day' : 'Need a valid P1, P2, and P3 in To Do'}
            onClick={() => commitTodayFocus()}
          >
            BEGIN
          </button>
          <button type="button" className={textLinkBtn} onClick={() => dismissDailyFocus()}>
            Dismiss for today
          </button>
        </div>
        {!canBegin && (
          <p className="text-xs text-neutral-500">Fix or refresh any row that is empty or invalid to enable BEGIN.</p>
        )}
      </div>
    </section>
  )
}
