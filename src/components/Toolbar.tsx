import { useRef } from 'react'
import { Task } from '../types'
import { exportBoard, importBoard } from '../lib/fileIO'

interface Props {
  tasks: Task[]
  onImport: (tasks: Task[]) => void
}

export function Toolbar({ tasks, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importBoard(file)
      onImport(imported)
    } catch (err) {
      alert((err as Error).message)
    }
    e.target.value = ''
  }

  return (
    <header className="toolbar">
      <h1 className="logo">justasimpletodoapp</h1>
      <div className="actions">
        <button className="btn btn-export" onClick={() => exportBoard(tasks)}>Export</button>
        <button className="btn btn-import" onClick={() => fileRef.current?.click()}>Import</button>
        <input ref={fileRef} type="file" accept=".json" hidden onChange={handleImport} />
      </div>
    </header>
  )
}
