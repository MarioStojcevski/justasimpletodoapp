import { useState, useEffect, useRef } from 'react'

interface Props {
  onAdd: (title: string, description: string, assignee: string) => void
}

export function AddTaskForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      titleRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  function close() {
    setTitle('')
    setDescription('')
    setAssignee('')
    setOpen(false)
  }

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, description.trim(), assignee.trim())
    close()
  }

  return (
    <>
      <button className="add-task-btn" onClick={() => setOpen(true)}>+</button>

      {open && (
        <div
          className="modal-backdrop"
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) close() }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Task</h2>
              <button className="modal-close" onClick={close}>×</button>
            </div>

            <div className="modal-body">
              <label className="modal-label">
                Title
                <input
                  ref={titleRef}
                  type="text"
                  className="modal-input modal-input-title"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit() }}
                />
              </label>

              <label className="modal-label">
                Description
                <textarea
                  className="modal-textarea"
                  placeholder="Add more details…"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label className="modal-label">
                Assignee
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Who's responsible?"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={close}>Cancel</button>
              <button className="btn btn-add" onClick={submit}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
