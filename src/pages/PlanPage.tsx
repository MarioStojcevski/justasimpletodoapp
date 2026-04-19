import { useState } from 'react'
import { AREA_LABELS, AREA_ORDER, type AreaId } from '../types'
import { btnAdd, inputBrutalist } from '../lib/ui'
import { parsePlanBoardDump } from '../lib/planBoardParse'
import { useWorkspace } from '../state/workspace'

const placeholder = `# Home
- water plants
- tidy desk

# Work
- reply to client
- book meeting`

export function PlanPage() {
  const { applyPlanDump } = useWorkspace()
  const [text, setText] = useState('')
  const [areaId, setAreaId] = useState<AreaId>('projects')
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  function handleApply() {
    setMessage(null)
    const sections = parsePlanBoardDump(text)
    if (sections.length === 0) {
      setMessage({
        kind: 'err',
        text: 'Add at least one board line like `# My board name` and optional tasks with `- task title`.',
      })
      return
    }
    const taskCount = sections.reduce((n, s) => n + s.taskTitles.length, 0)
    applyPlanDump(text, areaId)
    setMessage({
      kind: 'ok',
      text: `Added ${sections.length} board${sections.length === 1 ? '' : 's'} and ${taskCount} task${taskCount === 1 ? '' : 's'} under ${AREA_LABELS[areaId]}.`,
    })
    setText('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 pb-10 md:p-8">
      <header className="mb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Plan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Each <code className="rounded border border-edge/60 bg-[#faf9f6] px-1 font-mono text-[0.85em]"># Board name</code>{' '}
          starts a new board. Lines starting with <code className="rounded border border-edge/60 bg-[#faf9f6] px-1 font-mono text-[0.85em]">- </code> become tasks in
          To Do with default settings (medium priority, no description).
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-ink">
          New boards go under
          <select
            className={`${inputBrutalist} max-w-xs cursor-pointer`}
            value={areaId}
            onChange={(e) => setAreaId(e.target.value as AreaId)}
          >
            {AREA_ORDER.map((id) => (
              <option key={id} value={id}>
                {AREA_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wide text-ink">
          Boards & tasks
          <textarea
            className="min-h-[320px] w-full rounded-[10px] border-2 border-edge p-3 font-mono text-sm leading-relaxed shadow-brutal-md outline-none transition-[border-color,box-shadow,transform] duration-200 ease-out focus-visible:-translate-x-px focus-visible:-translate-y-px focus-visible:ring-2 focus-visible:ring-edge/40"
            spellCheck={false}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
          />
        </label>

        {message && (
          <p
            className={`animate-[fade-in-modal_0.28s_ease-out] text-sm font-medium ${message.kind === 'ok' ? 'text-[#2d6a4f]' : 'text-red-700'}`}
            role="status"
          >
            {message.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={btnAdd} onClick={handleApply}>
            Add to workspace
          </button>
        </div>
      </div>
    </div>
  )
}
