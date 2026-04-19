/**
 * Pure workspace transitions: (state) => nextState.
 * Used by the workspace provider instead of a reducer switch.
 */
import type { AreaId, DailyFocusState, KanbanBoard, Priority, Task, WorkspaceState } from '../types'
import { clampBoardAccent } from '../lib/boardAppearance'
import { normalizeKanbanBoard, normalizeTask } from '../lib/defaultWorkspace'
import * as focus from '../lib/dailyFocus'
import { parsePlanBoardDump } from '../lib/planBoardParse'
import { createId } from '../lib/ids'

function mapBoard(
  state: WorkspaceState,
  boardId: string,
  fn: (b: KanbanBoard) => KanbanBoard
): WorkspaceState {
  return {
    ...state,
    boards: state.boards.map((b) => (b.id === boardId ? fn(b) : b)),
  }
}

export function importWorkspaceState(payload: WorkspaceState): WorkspaceState {
  return {
    ...payload,
    boards: payload.boards.map((b) =>
      normalizeKanbanBoard({
        ...b,
        tasks: b.tasks.map((t) =>
          normalizeTask({ ...t, id: t.id, title: t.title, column: t.column })
        ),
      })
    ),
  }
}

export function addTask(
  state: WorkspaceState,
  args: {
    boardId: string
    title: string
    description: string
    assignee: string
    priority: Priority
    dueDate: string | null
  }
): WorkspaceState {
  const task: Task = normalizeTask({
    id: createId(),
    title: args.title,
    description: args.description,
    assignee: args.assignee,
    column: 'TODO',
    priority: args.priority,
    dueDate: args.dueDate,
  })
  return mapBoard(state, args.boardId, (b) => ({
    ...b,
    tasks: [...b.tasks, task],
  }))
}

export function deleteTask(state: WorkspaceState, boardId: string, taskId: string): WorkspaceState {
  return mapBoard(state, boardId, (b) => ({
    ...b,
    tasks: b.tasks.filter((t) => t.id !== taskId),
  }))
}

export function updateTask(
  state: WorkspaceState,
  boardId: string,
  taskId: string,
  patch: Partial<Task>
): WorkspaceState {
  return mapBoard(state, boardId, (b) => ({
    ...b,
    tasks: b.tasks.map((t) => {
      if (t.id !== taskId) return t
      const merged = { ...t, ...patch, id: t.id }
      return normalizeTask({
        ...merged,
        title: merged.title,
        column: merged.column,
      })
    }),
  }))
}

export function setBoardTasks(state: WorkspaceState, boardId: string, tasks: Task[]): WorkspaceState {
  return mapBoard(state, boardId, (b) => ({ ...b, tasks }))
}

export function addBoard(state: WorkspaceState, areaId: AreaId, title: string): WorkspaceState {
  return {
    ...state,
    boards: [
      ...state.boards,
      { id: createId(), areaId, title, tasks: [], icon: 0, color: 0 },
    ],
  }
}

/** Create boards and TODO tasks from `# Board` / `- task` dump. New boards go under `areaId` (default: Projects). */
export function importPlanBoardDump(
  state: WorkspaceState,
  text: string,
  areaId: AreaId = 'projects'
): WorkspaceState {
  const sections = parsePlanBoardDump(text)
  if (sections.length === 0) return state

  let next = state
  let firstNewBoardId: string | null = null

  for (const sec of sections) {
    next = addBoard(next, areaId, sec.boardTitle)
    const newBoard = next.boards[next.boards.length - 1]
    if (!firstNewBoardId) firstNewBoardId = newBoard.id

    for (const taskTitle of sec.taskTitles) {
      next = addTask(next, {
        boardId: newBoard.id,
        title: taskTitle,
        description: '',
        assignee: '',
        priority: 'P2',
        dueDate: null,
      })
    }
  }

  return firstNewBoardId ? setLastActiveBoard(next, firstNewBoardId) : next
}

export function deleteBoard(state: WorkspaceState, boardId: string): WorkspaceState {
  const board = state.boards.find((b) => b.id === boardId)
  if (!board) return state
  if (state.boards.length <= 1) return state
  const nextBoards = state.boards.filter((b) => b.id !== boardId)
  let lastActive = state.lastActiveBoardId
  if (lastActive === boardId) {
    lastActive = nextBoards[0]?.id ?? null
  }
  return { ...state, boards: nextBoards, lastActiveBoardId: lastActive }
}

export function renameBoard(state: WorkspaceState, boardId: string, title: string): WorkspaceState {
  const t = title.trim()
  if (!t) return state
  return {
    ...state,
    boards: state.boards.map((b) => (b.id === boardId ? { ...b, title: t } : b)),
  }
}

export function setBoardAppearance(
  state: WorkspaceState,
  boardId: string,
  patch: { icon?: number; color?: number }
): WorkspaceState {
  return {
    ...state,
    boards: state.boards.map((b) => {
      if (b.id !== boardId) return b
      const nextIcon = patch.icon !== undefined ? clampBoardAccent(patch.icon) : b.icon
      const nextColor = patch.color !== undefined ? clampBoardAccent(patch.color) : b.color
      return { ...b, icon: nextIcon, color: nextColor }
    }),
  }
}

export function setLastActiveBoard(state: WorkspaceState, boardId: string | null): WorkspaceState {
  return { ...state, lastActiveBoardId: boardId }
}

export function setDailyFocus(state: WorkspaceState, dailyFocus: DailyFocusState): WorkspaceState {
  return { ...state, dailyFocus }
}

export function workspacePickAnotherFocus(state: WorkspaceState): WorkspaceState {
  if (focus.isTodayCommitted(state)) return state
  return { ...state, dailyFocus: focus.pickAnotherFocus(state) }
}

export function workspaceShuffleTodaySlot(
  state: WorkspaceState,
  slot: 'p1' | 'p2' | 'p3'
): WorkspaceState {
  if (focus.isTodayCommitted(state)) return state
  return { ...state, dailyFocus: focus.shuffleTodaySlot(state, slot) }
}

export function workspaceDismissDailyFocus(state: WorkspaceState): WorkspaceState {
  if (focus.isTodayCommitted(state)) return state
  const today = focus.localDateString()
  return {
    ...state,
    dailyFocus: { pickDate: today, p1: null, p2: null, p3: null, skipDate: today, todayCommit: null },
  }
}

export function workspaceCommitTodayFocus(state: WorkspaceState): WorkspaceState {
  const today = focus.localDateString()
  const df = state.dailyFocus
  if (df.todayCommit?.day === today) return state
  if (!df.p1 || !df.p2 || !df.p3) return state
  if (
    !focus.slotValid(state.boards, df.p1, 'P1') ||
    !focus.slotValid(state.boards, df.p2, 'P2') ||
    !focus.slotValid(state.boards, df.p3, 'P3')
  ) {
    return state
  }
  return {
    ...state,
    dailyFocus: {
      ...df,
      pickDate: today,
      todayCommit: { day: today, p1: df.p1, p2: df.p2, p3: df.p3 },
    },
  }
}

export function workspaceClearTodayCommit(state: WorkspaceState): WorkspaceState {
  return {
    ...state,
    dailyFocus: { ...state.dailyFocus, todayCommit: null },
  }
}
