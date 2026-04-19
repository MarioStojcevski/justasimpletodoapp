import { useEffect, useRef, useState } from 'react'
import type { Priority } from '../types'
import { PRIORITY_LABELS } from '../types'
import { btnAdd, btnCancel, inputBrutalist, modalBackdrop, modalPanel } from '../lib/ui'

const PRIORITIES: Priority[] = ['P1', 'P2', 'P3']

const labelClass = 'flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-ink'

export type TaskFormValues = {
  title: string
  description: string
  assignee: string
  priority: Priority
  dueDate: string | null
}

export type TaskFormSeed = {
  title: string
  description: string
  assignee: string
  priority: Priority
  dueDate: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
  variant: 'create' | 'edit'
  /** When the modal opens, fields load from this (create: omit or null for empty). */
  seed?: TaskFormSeed | null
}

const emptySeed: TaskFormSeed = {
  title: '',
  description: '',
  assignee: '',
  priority: 'P2',
  dueDate: '',
}

function seedFingerprint(s: TaskFormSeed | null | undefined): string {
  if (!s) return '__empty__'
  return `${s.title}|${s.description}|${s.assignee}|${s.priority}|${s.dueDate}`
}

export function TaskFormModal({ open, onClose, onSubmit, variant, seed }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('')
  const [priority, setPriority] = useState<Priority>('P2')
  const [dueDate, setDueDate] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const s = seed ?? emptySeed
    setTitle(s.title)
    setDescription(s.description)
    setAssignee(s.assignee)
    setPriority(s.priority)
    setDueDate(s.dueDate ?? '')
  }, [open, seedFingerprint(seed)])

  useEffect(() => {
    if (open) {
      titleRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit({
      title: trimmed,
      description: description.trim(),
      assignee: assignee.trim(),
      priority,
      dueDate: dueDate.trim() || null,
    })
    onClose()
  }

  if (!open) return null

  const heading = variant === 'create' ? 'New Task' : 'Edit Task'
  const submitLabel = variant === 'create' ? 'Add Task' : 'Save changes'

  return (
    <div
      className={modalBackdrop}
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
    >
      <div className={modalPanel}>
        <div className="flex items-start justify-between px-6 pt-5">
          <h2 className="text-xl font-bold tracking-tight text-ink">{heading}</h2>
          <button
            type="button"
            className="border-0 bg-transparent p-1 text-2xl font-bold text-ink/40 hover:opacity-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <label className={labelClass}>
            Title
            <input
              ref={titleRef}
              type="text"
              className={`${inputBrutalist} py-3 text-lg font-bold`}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) submit()
              }}
            />
          </label>

          <label className={labelClass}>
            Description
            <textarea
              className={`${inputBrutalist} min-h-[80px] resize-y leading-relaxed`}
              placeholder="Add more details…"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className={labelClass}>
              Priority
              <select
                className={`${inputBrutalist} cursor-pointer`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} — {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Due (optional)
              <input type="date" className={inputBrutalist} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
          </div>

          <label className={labelClass}>
            Assignee
            <input
              type="text"
              className={inputBrutalist}
              placeholder="Who's responsible?"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2.5 px-6 pb-5">
          <button type="button" className={btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnAdd} onClick={submit}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
