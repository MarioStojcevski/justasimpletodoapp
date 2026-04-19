/**
 * Workspace state: React context + pure mutation helpers in `workspaceMutations.ts`.
 * Board drag-and-drop helpers live here as `useBoard` (same file keeps one import path for UI).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import type { AreaId, KanbanBoard, Priority, Task, WorkspaceState } from '../types'
import { COLUMNS, type ColumnId } from '../types'
import { createDefaultWorkspace } from '../lib/defaultWorkspace'
import { dailyFocusEqual, resolveDailyFocus } from '../lib/dailyFocus'
import {
  exportWorkspace as downloadWorkspaceFile,
  loadWorkspaceFromStorage,
  saveWorkspaceToStorage,
} from '../lib/fileIO'
import * as M from './workspaceMutations'

function resolveTargetColumn(overId: string | number, tasks: Task[]): ColumnId | null {
  const colMatch = COLUMNS.find((c) => `column-${c}` === overId)
  if (colMatch) return colMatch
  const overTask = tasks.find((t) => t.id === overId)
  return overTask?.column ?? null
}

export type WorkspaceApi = {
  state: WorkspaceState
  importWorkspace: (ws: WorkspaceState) => void
  exportWorkspace: () => void
  addTask: (
    boardId: string,
    title: string,
    description: string,
    assignee: string,
    priority?: Priority,
    dueDate?: string | null
  ) => void
  deleteTask: (boardId: string, taskId: string) => void
  updateTask: (boardId: string, taskId: string, patch: Partial<Task>) => void
  setBoardTasks: (boardId: string, tasks: Task[]) => void
  addBoard: (areaId: AreaId, title?: string) => void
  deleteBoard: (boardId: string) => void
  renameBoard: (boardId: string, title: string) => void
  setBoardAppearance: (boardId: string, patch: { icon?: number; color?: number }) => void
  setLastActiveBoard: (boardId: string | null) => void
  syncDailyFocus: () => void
  pickAnotherFocus: () => void
  shuffleTodayFocusSlot: (slot: 'p1' | 'p2' | 'p3') => void
  dismissDailyFocus: () => void
  commitTodayFocus: () => void
  clearTodayCommit: () => void
  boardsForArea: (areaId: AreaId) => KanbanBoard[]
  /** Parse `# board` / `- task` text and append boards + TODO tasks (P2, empty description). */
  applyPlanDump: (text: string, areaId?: AreaId) => void
}

const WorkspaceContext = createContext<WorkspaceApi | null>(null)

/** No `localStorage` payload (or corrupt JSON) → materialize `DEFAULT_WORKSPACE_BOARD_SEEDS` via `createDefaultWorkspace`. */
function readInitialState(): WorkspaceState {
  return loadWorkspaceFromStorage() ?? createDefaultWorkspace()
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(readInitialState)

  useEffect(() => {
    saveWorkspaceToStorage(state)
  }, [state])

  const importWorkspace = useCallback((ws: WorkspaceState) => {
    setState(M.importWorkspaceState(ws))
  }, [])

  const exportWorkspace = useCallback(() => {
    downloadWorkspaceFile(state)
  }, [state])

  const addTask = useCallback(
    (
      boardId: string,
      title: string,
      description: string,
      assignee: string,
      priority: Priority = 'P2',
      dueDate: string | null = null
    ) => {
      setState((s) => M.addTask(s, { boardId, title, description, assignee, priority, dueDate }))
    },
    []
  )

  const deleteTask = useCallback((boardId: string, taskId: string) => {
    setState((s) => M.deleteTask(s, boardId, taskId))
  }, [])

  const updateTask = useCallback((boardId: string, taskId: string, patch: Partial<Task>) => {
    setState((s) => M.updateTask(s, boardId, taskId, patch))
  }, [])

  const setBoardTasks = useCallback((boardId: string, tasks: Task[]) => {
    setState((s) => M.setBoardTasks(s, boardId, tasks))
  }, [])

  const addBoard = useCallback((areaId: AreaId, title?: string) => {
    setState((s) => M.addBoard(s, areaId, title?.trim() || 'New board'))
  }, [])

  const deleteBoard = useCallback((boardId: string) => {
    setState((s) => M.deleteBoard(s, boardId))
  }, [])

  const renameBoard = useCallback((boardId: string, title: string) => {
    setState((s) => M.renameBoard(s, boardId, title))
  }, [])

  const setBoardAppearance = useCallback((boardId: string, patch: { icon?: number; color?: number }) => {
    setState((s) => M.setBoardAppearance(s, boardId, patch))
  }, [])

  const setLastActiveBoard = useCallback((boardId: string | null) => {
    setState((s) => M.setLastActiveBoard(s, boardId))
  }, [])

  const syncDailyFocus = useCallback(() => {
    setState((s) => {
      const next = resolveDailyFocus(s)
      if (dailyFocusEqual(next, s.dailyFocus)) return s
      return M.setDailyFocus(s, next)
    })
  }, [])

  const pickAnotherFocus = useCallback(() => {
    setState((s) => M.workspacePickAnotherFocus(s))
  }, [])

  const shuffleTodayFocusSlot = useCallback((slot: 'p1' | 'p2' | 'p3') => {
    setState((s) => M.workspaceShuffleTodaySlot(s, slot))
  }, [])

  const dismissDailyFocus = useCallback(() => {
    setState((s) => M.workspaceDismissDailyFocus(s))
  }, [])

  const commitTodayFocus = useCallback(() => {
    setState((s) => M.workspaceCommitTodayFocus(s))
  }, [])

  const clearTodayCommit = useCallback(() => {
    setState((s) => M.workspaceClearTodayCommit(s))
  }, [])

  const boardsForArea = useCallback(
    (areaId: AreaId) => state.boards.filter((b) => b.areaId === areaId),
    [state.boards]
  )

  const applyPlanDump = useCallback((text: string, areaId?: AreaId) => {
    setState((s) => M.importPlanBoardDump(s, text, areaId ?? 'projects'))
  }, [])

  const api = useMemo(
    () => ({
      state,
      importWorkspace,
      exportWorkspace,
      addTask,
      deleteTask,
      updateTask,
      setBoardTasks,
      addBoard,
      deleteBoard,
      renameBoard,
      setBoardAppearance,
      setLastActiveBoard,
      syncDailyFocus,
      pickAnotherFocus,
      shuffleTodayFocusSlot,
      dismissDailyFocus,
      commitTodayFocus,
      clearTodayCommit,
      boardsForArea,
      applyPlanDump,
    }),
    [
      state,
      importWorkspace,
      exportWorkspace,
      addTask,
      deleteTask,
      updateTask,
      setBoardTasks,
      addBoard,
      deleteBoard,
      renameBoard,
      setBoardAppearance,
      setLastActiveBoard,
      syncDailyFocus,
      pickAnotherFocus,
      shuffleTodayFocusSlot,
      dismissDailyFocus,
      commitTodayFocus,
      clearTodayCommit,
      boardsForArea,
      applyPlanDump,
    ]
  )

  return <WorkspaceContext.Provider value={api}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceApi {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}

export function useBoard(boardId: string) {
  const { state, setBoardTasks, addTask, deleteTask } = useWorkspace()
  const board = useMemo(() => state.boards.find((b) => b.id === boardId), [state.boards, boardId])
  const tasks = board?.tasks ?? []
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  function onAdd(
    title: string,
    description: string,
    assignee: string,
    priority: Priority = 'P2',
    dueDate: string | null = null
  ) {
    addTask(boardId, title, description, assignee, priority, dueDate)
  }

  function onDelete(id: string) {
    deleteTask(boardId, id)
  }

  function replaceTasks(next: Task[]) {
    setBoardTasks(boardId, next)
  }

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    const targetColumn = resolveTargetColumn(over.id, tasks)
    if (!targetColumn) return

    const current = tasks.find((t) => t.id === active.id)
    if (current && current.column !== targetColumn) {
      replaceTasks(tasks.map((t) => (t.id === active.id ? { ...t, column: targetColumn } : t)))
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const targetColumn = resolveTargetColumn(over.id, tasks)
    if (!targetColumn) return

    const overTask = tasks.find((t) => t.id === over.id)

    const idx = tasks.findIndex((t) => t.id === active.id)
    if (idx === -1) return
    const updated = [...tasks]
    updated[idx] = { ...updated[idx], column: targetColumn }

    if (overTask && overTask.id !== active.id) {
      const movedTask = updated.splice(idx, 1)[0]
      const overIdx = updated.findIndex((t) => t.id === overTask.id)
      updated.splice(overIdx, 0, movedTask)
    }

    replaceTasks(updated)
  }

  return {
    board,
    tasks,
    activeTask,
    onAdd,
    onDelete,
    onDragStart,
    onDragOver,
    onDragEnd,
  }
}
