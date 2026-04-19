import type { BoardData, KanbanBoard, Task, WorkspaceState } from '../types'
import {
  LEGACY_BOARD_COMPAT_KEY,
  WORKSPACE_COMPAT_KEY,
  WORKSPACE_STORAGE_KEY,
} from '../types'
import { normalizeDailyFocusPayload } from './dailyFocus'
import { createDefaultWorkspace, normalizeKanbanBoard, normalizeTask } from './defaultWorkspace'
import { createId } from './ids'

export function exportWorkspace(state: WorkspaceState) {
  const data = { ...state, compatibleWith: WORKSPACE_COMPAT_KEY }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'justasimpletodoapp-workspace.json'
  a.click()
  URL.revokeObjectURL(url)
}

function isWorkspacePayload(data: unknown): data is WorkspaceState {
  if (!data || typeof data !== 'object') return false
  const o = data as Record<string, unknown>
  const idOk = typeof o.lastActiveBoardId === 'string' || o.lastActiveBoardId === null
  return o.compatibleWith === WORKSPACE_COMPAT_KEY && Array.isArray(o.boards) && idOk
}

function migrateLegacyBoard(data: BoardData): WorkspaceState {
  const base = createDefaultWorkspace()
  const tasks = data.tasks.map((t) =>
    normalizeTask({
      ...t,
      id: t.id || createId(),
      column: t.column,
      title: t.title,
    })
  )
  const projectsBoard = base.boards.find((b) => b.areaId === 'projects')
  if (projectsBoard) {
    projectsBoard.title = 'Imported'
    projectsBoard.tasks = tasks
  }
  return {
    ...base,
    lastActiveBoardId: projectsBoard?.id ?? base.lastActiveBoardId,
  }
}

export function parseWorkspaceJson(text: string): WorkspaceState {
  const data = JSON.parse(text) as unknown
  if (isWorkspacePayload(data)) {
    return {
      compatibleWith: data.compatibleWith,
      lastActiveBoardId: data.lastActiveBoardId,
      boards: data.boards.map((b) =>
        normalizeKanbanBoard({
          ...b,
          tasks: (b.tasks as Task[]).map((t) => normalizeTask({ ...t, id: t.id, title: t.title, column: t.column })),
        } as KanbanBoard)
      ),
      dailyFocus: normalizeDailyFocusPayload(data.dailyFocus),
    }
  }
  const legacy = data as BoardData
  if (legacy.compatibleWith === LEGACY_BOARD_COMPAT_KEY && Array.isArray(legacy.tasks)) {
    return migrateLegacyBoard(legacy)
  }
  throw new Error(
    `Incompatible file. Expected compatibleWith "${WORKSPACE_COMPAT_KEY}" or legacy "${LEGACY_BOARD_COMPAT_KEY}".`
  )
}

export function importWorkspaceFile(file: File): Promise<WorkspaceState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string
        resolve(parseWorkspaceJson(text))
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Failed to parse workspace file.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}

export function loadWorkspaceFromStorage(): WorkspaceState | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (!raw?.trim()) return null
    return parseWorkspaceJson(raw)
  } catch {
    return null
  }
}

export function saveWorkspaceToStorage(state: WorkspaceState) {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state))
}

