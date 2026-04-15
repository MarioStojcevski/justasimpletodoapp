import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { COLUMNS } from '../types'
import { useBoard } from '../hooks/useBoard'
import { Column } from './Column'
import { TaskCardOverlay } from './TaskCard'
import { Toolbar } from './Toolbar'

export function Board() {
  const {
    tasks,
    activeTask,
    addTask,
    deleteTask,
    loadTasks,
    onDragStart,
    onDragOver,
    onDragEnd,
  } = useBoard()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  return (
    <>
      <Toolbar tasks={tasks} onImport={loadTasks} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="board">
          {COLUMNS.map((col) => (
            <Column
              key={col}
              id={col}
              tasks={tasks.filter((t) => t.column === col)}
              onDelete={deleteTask}
              onAdd={addTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  )
}
