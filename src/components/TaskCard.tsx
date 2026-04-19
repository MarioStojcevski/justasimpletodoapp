import { useMemo, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, type Priority, PRIORITY_LABELS } from '../types'
import { useWorkspace } from '../state/workspace'
import { TaskFormModal, type TaskFormValues, type TaskFormSeed } from './TaskFormModal'

const PRI_ORDER: Priority[] = ['P1', 'P2', 'P3']

const PRI_RING: Record<Priority, string> = {
  P1: 'bg-[#ffb3ba]',
  P2: 'bg-[#ffffba]',
  P3: 'bg-[#bae1ff]',
}

const dragHandleClass =
  'mt-0.5 flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border-0 bg-transparent text-neutral-400 transition-[color,background-color] hover:bg-ink/8 hover:text-ink active:cursor-grabbing'

interface Props {
  boardId: string
  task: Task
  onDelete: (id: string) => void
}

export function TaskCard({ boardId, task, onDelete }: Props) {
  const { updateTask } = useWorkspace()
  const [editOpen, setEditOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { column: task.column },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const editSeed: TaskFormSeed = useMemo(
    () => ({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate ?? '',
    }),
    [task.title, task.description, task.assignee, task.priority, task.dueDate]
  )

  function cyclePriority(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    const i = PRI_ORDER.indexOf(task.priority)
    const next = PRI_ORDER[(i + 1) % PRI_ORDER.length]
    updateTask(boardId, task.id, { priority: next })
  }

  function saveEdit(v: TaskFormValues) {
    updateTask(boardId, task.id, {
      title: v.title,
      description: v.description,
      assignee: v.assignee,
      priority: v.priority,
      dueDate: v.dueDate,
    })
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex gap-2 rounded-[10px] border-2 border-edge bg-white p-3 shadow-brutal-md transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-x-px motion-safe:hover:-translate-y-px motion-safe:hover:shadow-brutal-lg-hover"
      >
        <button
          type="button"
          className={dragHandleClass}
          title="Drag to move"
          aria-label="Drag to move task"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
        <div
          className="min-w-0 flex-1 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setEditOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setEditOpen(true)
            }
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="wrap-break-word text-[0.95rem] font-bold text-ink">{task.title}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                className={`cursor-pointer rounded-full border border-edge-strong px-2 py-0.5 font-mono text-[0.68rem] font-extrabold transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:scale-105 motion-safe:active:scale-95 ${PRI_RING[task.priority]}`}
                title={`Priority: ${PRIORITY_LABELS[task.priority]} (click to cycle)`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={cyclePriority}
              >
                {task.priority}
              </button>
              <button
                type="button"
                className="border-0 bg-transparent p-0.5 text-xl font-bold leading-none text-ink/40 transition-[color,transform] duration-200 ease-out hover:text-red-600 motion-safe:active:scale-90"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onDelete(task.id)}
              >
                ×
              </button>
            </div>
          </div>
          {task.description && (
            <p className="mt-1.5 line-clamp-3 wrap-break-word text-xs font-medium leading-snug text-neutral-600">
              {task.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {task.assignee && (
              <span className="mt-1 inline-block rounded-full border border-edge-strong bg-[#ffecb3] px-2.5 py-0.5 text-xs font-bold text-ink">
                {task.assignee}
              </span>
            )}
            {task.dueDate && (
              <span className="rounded-md border border-edge-strong bg-sky-100 px-2 py-0.5 text-[0.72rem] font-bold text-ink">
                Due {task.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <TaskFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={saveEdit}
        variant="edit"
        seed={editSeed}
      />
    </>
  )
}

export function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="flex cursor-grabbing gap-2 rounded-[10px] border-2 border-edge bg-white p-3 shadow-brutal-2xl">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400">
        <GripVertical className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="wrap-break-word text-[0.95rem] font-bold text-ink">{task.title}</span>
          <span
            className={`shrink-0 rounded-full border border-edge-strong px-2 py-0.5 font-mono text-[0.68rem] font-extrabold ${PRI_RING[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="mt-1.5 line-clamp-3 wrap-break-word text-xs font-medium text-neutral-600">{task.description}</p>
        )}
        {task.assignee && (
          <span className="mt-2 inline-block rounded-full border border-edge-strong bg-[#ffecb3] px-2.5 py-0.5 text-xs font-bold">
            {task.assignee}
          </span>
        )}
      </div>
    </div>
  )
}
