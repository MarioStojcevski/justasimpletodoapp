import type { KanbanBoard, Task, WorkspaceState } from '../types'
import { WORKSPACE_COMPAT_KEY } from '../types'
import {
  DEFAULT_WORKSPACE_BOARD_SEEDS,
  type DefaultWorkspaceBoardSeed,
} from '../consts/defaultWorkspaceTemplate'
import { clampBoardAccent } from './boardAppearance'
import { createId } from './ids'

function materializeBoard(seed: DefaultWorkspaceBoardSeed): KanbanBoard {
  const tasks: Task[] = seed.tasks.map((t) =>
    normalizeTask({
      id: createId(),
      title: t.title,
      description: t.description ?? '',
      assignee: t.assignee ?? '',
      column: t.column ?? 'TODO',
      priority: t.priority ?? 'P2',
      dueDate: t.dueDate ?? null,
    })
  )
  return normalizeKanbanBoard({
    id: createId(),
    areaId: seed.areaId,
    title: seed.title,
    tasks,
    icon: seed.icon,
    color: seed.color,
  })
}

/** Ensure persisted / imported boards have `icon` + `color` in range */
export function normalizeKanbanBoard(b: KanbanBoard): KanbanBoard {
  return {
    ...b,
    icon: clampBoardAccent(b.icon, 0),
    color: clampBoardAccent(b.color, 0),
    tasks: b.tasks,
  }
}

/** Fresh workspace from `DEFAULT_WORKSPACE_BOARD_SEEDS` (new ids every call). */
export function createDefaultWorkspace(): WorkspaceState {
  const boards = DEFAULT_WORKSPACE_BOARD_SEEDS.map(materializeBoard)
  return {
    compatibleWith: WORKSPACE_COMPAT_KEY,
    boards,
    lastActiveBoardId: boards[1]?.id ?? boards[0].id,
    dailyFocus: { pickDate: '', p1: null, p2: null, p3: null, skipDate: null, todayCommit: null },
  }
}

export function normalizeTask(t: Partial<Task> & { id: string; title: string; column: Task['column'] }): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    assignee: t.assignee ?? '',
    column: t.column,
    priority: t.priority ?? 'P2',
    dueDate: t.dueDate ?? null,
  }
}
