import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, ColumnId, COLUMN_LABELS, type Priority } from '../types'
import { TaskCard } from './TaskCard'
import { AddTaskForm } from './AddTaskForm'

const COL_BG: Record<ColumnId, string> = {
  TODO: 'bg-[#e0e0e0]',
  INPROGRESS: 'bg-[#fff9c4]',
  DONE: 'bg-[#c8e6c9]',
}

interface Props {
  id: ColumnId
  boardId: string
  tasks: Task[]
  onDelete: (id: string) => void
  onAdd: (
    title: string,
    description: string,
    assignee: string,
    priority?: Priority,
    dueDate?: string | null
  ) => void
}

export function Column({ id, boardId, tasks, onDelete, onAdd }: Props) {
  const { setNodeRef } = useSortable({
    id: `column-${id}`,
    data: { type: 'column', column: id },
    disabled: true,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-h-[120px] flex-col overflow-hidden rounded-2xl border-2 border-edge shadow-brutal-xl transition-[box-shadow,transform] duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-brutal-lg-hover md:min-h-0 ${COL_BG[id]}`}
    >
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b-2 border-edge px-[18px]">
        <h2 className="text-xs font-bold uppercase tracking-[1.5px] text-ink">{COLUMN_LABELS[id]}</h2>
        {id === 'TODO' && <AddTaskForm onAdd={onAdd} />}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain p-3.5">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} boardId={boardId} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="rounded-[10px] border-2 border-dashed border-edge/50 py-7 text-center text-sm font-bold uppercase tracking-wide text-ink/30">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
