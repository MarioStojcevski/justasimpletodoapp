import { useState } from 'react'

interface Props {
  onAdd: (title: string, assignee: string) => void
}

export function AddTaskForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, assignee.trim())
    setTitle('')
    setAssignee('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="add-task-btn" onClick={() => setOpen(true)}>+</button>
    )
  }

  return (
    <div className="add-task-inline">
      <input
        autoFocus
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <input
        type="text"
        placeholder="Assignee"
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <div className="add-task-actions">
        <button className="btn btn-add" onClick={submit}>Add</button>
        <button className="btn btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  )
}
