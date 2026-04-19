import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Board } from '../components/Board'
import { useWorkspace } from '../state/workspace'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { state, setLastActiveBoard } = useWorkspace()

  useEffect(() => {
    if (boardId) setLastActiveBoard(boardId)
  }, [boardId, setLastActiveBoard])

  if (!boardId) return <Navigate to="/today" replace />
  const exists = state.boards.some((b) => b.id === boardId)
  if (!exists) return <Navigate to="/today" replace />

  return <Board boardId={boardId} />
}
