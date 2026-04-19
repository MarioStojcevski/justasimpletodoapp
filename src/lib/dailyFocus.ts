import type {
  DailyFocusState,
  KanbanBoard,
  Priority,
  Task,
  TodayCommitSnapshot,
  TodayPickSlot,
  WorkspaceState,
} from '../types'

export function localDateString(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type TodoRef = { task: Task; boardId: string }

export function collectTodoRefs(boards: KanbanBoard[]): TodoRef[] {
  const out: TodoRef[] = []
  for (const b of boards) {
    for (const t of b.tasks) {
      if (t.column === 'TODO') out.push({ task: t, boardId: b.id })
    }
  }
  return out
}

export function refsForPriority(boards: KanbanBoard[], priority: Priority): TodoRef[] {
  return collectTodoRefs(boards).filter((r) => r.task.priority === priority)
}

function pickOne(refs: TodoRef[], exclude: Set<string>): TodayPickSlot {
  const pool = refs.filter((r) => !exclude.has(r.task.id))
  const use = pool.length ? pool : refs
  if (!use.length) return null
  const r = use[Math.floor(Math.random() * use.length)]
  return { taskId: r.task.id, boardId: r.boardId }
}

export function findTodoRef(boards: KanbanBoard[], taskId: string, boardId: string): TodoRef | null {
  const b = boards.find((x) => x.id === boardId)
  if (!b) return null
  const t = b.tasks.find((x) => x.id === taskId && x.column === 'TODO')
  if (!t) return null
  return { task: t, boardId }
}

/** Task on a board in any column (for locked “today” display after BEGIN). */
export function findTaskAnyColumn(boards: KanbanBoard[], taskId: string, boardId: string): TodoRef | null {
  const b = boards.find((x) => x.id === boardId)
  if (!b) return null
  const t = b.tasks.find((x) => x.id === taskId)
  if (!t) return null
  return { task: t, boardId }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function nextLocalMidnight(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0)
}

/** Milliseconds from `now` until next local midnight (00:00). */
export function msUntilLocalMidnight(now = new Date()): number {
  return Math.max(0, nextLocalMidnight(now).getTime() - now.getTime())
}

/** Share of a full 24h ring still “left” until midnight (1 at start of day → 0 at midnight). */
export function dayRingFractionRemaining(now = new Date()): number {
  return Math.min(1, Math.max(0, msUntilLocalMidnight(now) / MS_PER_DAY))
}

export function isTodayCommitted(state: WorkspaceState, today = localDateString()): boolean {
  return state.dailyFocus.todayCommit?.day === today
}

export function slotValid(boards: KanbanBoard[], slot: TodayPickSlot, priority: Priority): boolean {
  if (!slot) return false
  const r = findTodoRef(boards, slot.taskId, slot.boardId)
  return !!r && r.task.priority === priority
}

export function todayTripleReadyForCommit(boards: KanbanBoard[], df: DailyFocusState): boolean {
  return slotValid(boards, df.p1, 'P1') && slotValid(boards, df.p2, 'P2') && slotValid(boards, df.p3, 'P3')
}

/** Random P1 / P2 / P3 from any board (TODO). Avoids duplicate task ids across slots when possible. */
export function shuffleAllTodayPicks(state: WorkspaceState, today = localDateString()): DailyFocusState {
  const refs1 = refsForPriority(state.boards, 'P1')
  const refs2 = refsForPriority(state.boards, 'P2')
  const refs3 = refsForPriority(state.boards, 'P3')
  const exclude = new Set<string>()
  const p1 = pickOne(refs1, exclude)
  if (p1) exclude.add(p1.taskId)
  const p2 = pickOne(refs2, exclude)
  if (p2) exclude.add(p2.taskId)
  const p3 = pickOne(refs3, exclude)
  if (p3) exclude.add(p3.taskId)
  return { pickDate: today, p1, p2, p3, skipDate: null, todayCommit: null }
}

export function shuffleTodaySlot(
  state: WorkspaceState,
  slot: 'p1' | 'p2' | 'p3',
  today = localDateString()
): DailyFocusState {
  const priority: Priority = slot === 'p1' ? 'P1' : slot === 'p2' ? 'P2' : 'P3'
  const cur = state.dailyFocus
  const exclude = new Set<string>()
  for (const key of ['p1', 'p2', 'p3'] as const) {
    if (key === slot) continue
    const s = cur[key]
    if (s) exclude.add(s.taskId)
  }
  const refs = refsForPriority(state.boards, priority)
  const next = pickOne(refs, exclude)
  return { ...cur, pickDate: today, [slot]: next, skipDate: null, todayCommit: null }
}

function emptyTriple(today: string): DailyFocusState {
  return { pickDate: today, p1: null, p2: null, p3: null, skipDate: null, todayCommit: null }
}

function parseCommit(v: unknown): TodayCommitSnapshot | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const day = typeof o.day === 'string' ? o.day : null
  if (!day) return null
  const parseSlot = (s: unknown): TodayPickSlot => {
    if (!s || typeof s !== 'object') return null
    const x = s as Record<string, unknown>
    const taskId = typeof x.taskId === 'string' ? x.taskId : null
    const boardId = typeof x.boardId === 'string' ? x.boardId : null
    return taskId && boardId ? { taskId, boardId } : null
  }
  return { day, p1: parseSlot(o.p1), p2: parseSlot(o.p2), p3: parseSlot(o.p3) }
}

/** Migrate persisted state from legacy single-task daily focus. */
export function normalizeDailyFocusPayload(data: unknown): DailyFocusState {
  const today = localDateString()
  if (!data || typeof data !== 'object') {
    return { ...emptyTriple(today), skipDate: null, todayCommit: null }
  }
  const o = data as Record<string, unknown>
  if (typeof o.p1 === 'object' || o.p1 === null) {
    const parseSlot = (v: unknown): TodayPickSlot => {
      if (!v || typeof v !== 'object') return null
      const s = v as Record<string, unknown>
      const taskId = typeof s.taskId === 'string' ? s.taskId : null
      const boardId = typeof s.boardId === 'string' ? s.boardId : null
      return taskId && boardId ? { taskId, boardId } : null
    }
    return {
      pickDate: typeof o.pickDate === 'string' ? o.pickDate : '',
      p1: parseSlot(o.p1),
      p2: parseSlot(o.p2),
      p3: parseSlot(o.p3),
      skipDate: typeof o.skipDate === 'string' || o.skipDate === null ? (o.skipDate as string | null) : null,
      todayCommit: parseCommit(o.todayCommit),
    }
  }
  const taskId = typeof o.taskId === 'string' ? o.taskId : null
  const boardId = typeof o.boardId === 'string' ? o.boardId : null
  return {
    pickDate: typeof o.pickDate === 'string' ? o.pickDate : '',
    p1: taskId && boardId ? { taskId, boardId } : null,
    p2: null,
    p3: null,
    skipDate: typeof o.skipDate === 'string' || o.skipDate === null ? (o.skipDate as string | null) : null,
    todayCommit: parseCommit(o.todayCommit),
  }
}

function commitEqual(x: TodayCommitSnapshot | null | undefined, y: TodayCommitSnapshot | null | undefined): boolean {
  if (!x && !y) return true
  if (!x || !y) return false
  const slotEq = (a: TodayPickSlot, b: TodayPickSlot) =>
    a === b || (!!a && !!b && a.taskId === b.taskId && a.boardId === b.boardId)
  return x.day === y.day && slotEq(x.p1, y.p1) && slotEq(x.p2, y.p2) && slotEq(x.p3, y.p3)
}

export function dailyFocusEqual(a: DailyFocusState, b: DailyFocusState): boolean {
  const slotEq = (x: TodayPickSlot, y: TodayPickSlot) =>
    x === y || (!!x && !!y && x.taskId === y.taskId && x.boardId === y.boardId)
  return (
    a.pickDate === b.pickDate &&
    slotEq(a.p1, b.p1) &&
    slotEq(a.p2, b.p2) &&
    slotEq(a.p3, b.p3) &&
    (a.skipDate ?? null) === (b.skipDate ?? null) &&
    commitEqual(a.todayCommit ?? null, b.todayCommit ?? null)
  )
}

function refillSlot(
  boards: KanbanBoard[],
  priority: Priority,
  otherSlots: TodayPickSlot[]
): TodayPickSlot {
  const exclude = new Set<string>()
  for (const s of otherSlots) {
    if (s) exclude.add(s.taskId)
  }
  return pickOne(refsForPriority(boards, priority), exclude)
}

/** Ensure today’s triple exists and each slot still points at a TODO with the right priority. */
export function resolveDailyFocus(state: WorkspaceState, today = localDateString()): DailyFocusState {
  let df = state.dailyFocus
  if (df.todayCommit && df.todayCommit.day !== today) {
    df = { ...df, todayCommit: null }
  }
  if (df.todayCommit?.day === today) {
    return df
  }

  const noPicks = !df.p1 && !df.p2 && !df.p3

  if (df.skipDate === today && noPicks) {
    return df
  }

  if (df.pickDate !== today) {
    return shuffleAllTodayPicks(state, today)
  }

  let next: DailyFocusState = { ...df, pickDate: today }
  let changed = false

  const valid1 = slotValid(state.boards, next.p1, 'P1')
  const valid2 = slotValid(state.boards, next.p2, 'P2')
  const valid3 = slotValid(state.boards, next.p3, 'P3')

  if (!valid1) {
    next.p1 = refillSlot(state.boards, 'P1', [next.p2, next.p3])
    changed = true
  }
  if (!valid2) {
    next.p2 = refillSlot(state.boards, 'P2', [next.p1, next.p3])
    changed = true
  }
  if (!valid3) {
    next.p3 = refillSlot(state.boards, 'P3', [next.p1, next.p2])
    changed = true
  }

  if (!changed && valid1 && valid2 && valid3) {
    return df
  }

  return { ...next, skipDate: null, todayCommit: null }
}

export function pickAnotherFocus(state: WorkspaceState): DailyFocusState {
  return shuffleAllTodayPicks(state)
}
