export type ColumnId = 'TODO' | 'INPROGRESS' | 'DONE'

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  column: ColumnId
}

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

export const COMPAT_KEY = 'justasimpletodoapp1'
