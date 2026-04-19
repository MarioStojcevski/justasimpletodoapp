import { createPortal } from 'react-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { COLUMNS } from '../types'
import { useBoard } from '../state/workspace'
import { Column } from './Column'
import { TaskCardOverlay } from './TaskCard'

interface Props {
  boardId: string
}

export function Board({ boardId }: Props) {
  const { board, tasks, activeTask, onAdd, onDelete, onDragStart, onDragOver, onDragEnd } = useBoard(boardId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const dragOverlay = (
    <DragOverlay zIndex={10000}>
      {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
    </DragOverlay>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 md:gap-5 md:p-8">
          <header className="shrink-0 border-b-2 border-edge pb-3 md:pb-4">
            <h1 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
              {board?.title ?? 'Board'}
            </h1>
          </header>
          <div className="relative z-1 grid min-h-0 flex-1 grid-cols-1 grid-rows-3 gap-4 overflow-hidden md:grid-cols-3 md:grid-rows-1 md:gap-6">
            {COLUMNS.map((col) => (
              <Column
                key={col}
                id={col}
                boardId={boardId}
                tasks={tasks.filter((t) => t.column === col)}
                onDelete={onDelete}
                onAdd={onAdd}
              />
            ))}
          </div>
        </div>
        {typeof document !== 'undefined' ? createPortal(dragOverlay, document.body) : dragOverlay}
      </DndContext>
    </div>
  )
}
