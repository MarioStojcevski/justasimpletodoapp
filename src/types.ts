export type ColumnId = 'TODO' | 'INPROGRESS' | 'DONE'

export type Priority = 'P1' | 'P2' | 'P3'

export type AreaId = 'personal' | 'projects' | 'work'

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  column: ColumnId
  priority: Priority
  dueDate?: string | null
}

export interface KanbanBoard {
  id: string
  areaId: AreaId
  title: string
  tasks: Task[]
  /** 0..7 — see `boardAppearance` / `BoardGlyph` */
  icon: number
  /** 0..7 — pastel swatch behind icon */
  color: number
}

/** One TODO task pick (board + task id) */
export type TodayPickSlot = { taskId: string; boardId: string } | null

/** Frozen triple after user taps BEGIN; cleared at next local day or “Stop today”. */
export interface TodayCommitSnapshot {
  day: string
  p1: TodayPickSlot
  p2: TodayPickSlot
  p3: TodayPickSlot
}

/** Three daily suggestions: one P1, one P2, one P3 from anywhere (TODO column) */
export interface DailyFocusState {
  pickDate: string
  p1: TodayPickSlot
  p2: TodayPickSlot
  p3: TodayPickSlot
  /** When set to today's date, suggestions stay hidden until user randomizes or tomorrow. */
  skipDate?: string | null
  /** When `day` is today, picks are locked until midnight or Stop today. */
  todayCommit?: TodayCommitSnapshot | null
}

export interface WorkspaceState {
  compatibleWith: string
  boards: KanbanBoard[]
  lastActiveBoardId: string | null
  dailyFocus: DailyFocusState
}

/** Legacy single-board export format */
export interface BoardData {
  compatibleWith: string
  tasks: Task[]
}

export const COLUMNS: ColumnId[] = ['TODO', 'INPROGRESS', 'DONE']

export const COLUMN_LABELS: Record<ColumnId, string> = {
  TODO: 'To Do',
  INPROGRESS: 'In Progress',
  DONE: 'Done',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  P1: 'High',
  P2: 'Medium',
  P3: 'Low',
}

export const AREA_ORDER: AreaId[] = ['personal', 'projects', 'work']

export const AREA_LABELS: Record<AreaId, string> = {
  personal: 'Personal life',
  projects: 'Projects',
  work: 'Work',
}

export const LEGACY_BOARD_COMPAT_KEY = 'justasimpletodoapp1'
export const WORKSPACE_COMPAT_KEY = 'justasimpletodoapp-workspace-1'

export const WORKSPACE_STORAGE_KEY = 'justasimpletodoapp-workspace-v1'
