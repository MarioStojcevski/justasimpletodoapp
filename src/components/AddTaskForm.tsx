import { useState } from 'react'
import type { Priority } from '../types'
import { TaskFormModal, type TaskFormValues } from './TaskFormModal'

interface Props {
  onAdd: (
    title: string,
    description: string,
    assignee: string,
    priority: Priority,
    dueDate: string | null
  ) => void
}

export function AddTaskForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)

  function handleSubmit(v: TaskFormValues) {
    onAdd(v.title, v.description, v.assignee, v.priority, v.dueDate)
  }

  return (
    <>
      <button
        type="button"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-2 border-edge bg-white text-base font-bold leading-none text-ink shadow-brutal-sm transition-[transform,box-shadow] hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-active"
        onClick={() => setOpen(true)}
      >
        +
      </button>

      <TaskFormModal open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} variant="create" />
    </>
  )
}
