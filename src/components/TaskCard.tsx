import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '../types'

interface Props {
  task: Task
  onDelete: (id: string) => void
}

export function TaskCard({ task, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { column: task.column } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="task-card" {...attributes} {...listeners}>
      <div className="task-header">
        <span className="task-title">{task.title}</span>
        <button
          className="delete-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
        >
          ×
        </button>
      </div>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      {task.assignee && <span className="task-assignee">{task.assignee}</span>}
    </div>
  )
}

export function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="task-card dragging-overlay">
      <div className="task-header">
        <span className="task-title">{task.title}</span>
      </div>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      {task.assignee && <span className="task-assignee">{task.assignee}</span>}
    </div>
  )
}
