import { useState } from 'react'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { Task, COLUMNS, ColumnId } from '../types'

function createId() {
  return Math.random().toString(36).slice(2, 10)
}

function resolveTargetColumn(overId: string | number, tasks: Task[]): ColumnId | null {
  const colMatch = COLUMNS.find((c) => `column-${c}` === overId)
  if (colMatch) return colMatch
  const overTask = tasks.find((t) => t.id === overId)
  return overTask?.column ?? null
}

export function useBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  function addTask(title: string, assignee: string) {
    setTasks((prev) => [
      ...prev,
      { id: createId(), title, assignee, column: 'TODO' },
    ])
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function loadTasks(imported: Task[]) {
    setTasks(imported)
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
      setTasks((prev) =>
        prev.map((t) => (t.id === active.id ? { ...t, column: targetColumn } : t))
      )
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const targetColumn = resolveTargetColumn(over.id, tasks)
    if (!targetColumn) return

    const overTask = tasks.find((t) => t.id === over.id)

    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === active.id)
      if (idx === -1) return prev
      const updated = [...prev]
      updated[idx] = { ...updated[idx], column: targetColumn }

      if (overTask && overTask.id !== active.id) {
        const movedTask = updated.splice(idx, 1)[0]
        const overIdx = updated.findIndex((t) => t.id === overTask.id)
        updated.splice(overIdx, 0, movedTask)
      }

      return updated
    })
  }

  return {
    tasks,
    activeTask,
    addTask,
    deleteTask,
    loadTasks,
    onDragStart,
    onDragOver,
    onDragEnd,
  }
}
