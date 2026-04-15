import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, ColumnId, COLUMN_LABELS } from '../types'
import { TaskCard } from './TaskCard'
import { AddTaskForm } from './AddTaskForm'

interface Props {
  id: ColumnId
  tasks: Task[]
  onDelete: (id: string) => void
  onAdd: (title: string, description: string, assignee: string) => void
}

export function Column({ id, tasks, onDelete, onAdd }: Props) {
  const { setNodeRef } = useSortable({
    id: `column-${id}`,
    data: { type: 'column', column: id },
    disabled: true,
  })

  return (
    <div ref={setNodeRef} className={`column column-${id.toLowerCase()}`}>
      <div className="column-header">
        <h2 className="column-title">{COLUMN_LABELS[id]}</h2>
        {id === 'TODO' && <AddTaskForm onAdd={onAdd} />}
      </div>
      <div className="column-body">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && <div className="empty-hint">Drop here</div>}
      </div>
    </div>
  )
}
