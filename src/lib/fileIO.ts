import { BoardData, COMPAT_KEY, Task } from '../types'

export function exportBoard(tasks: Task[]) {
  const data: BoardData = { compatibleWith: COMPAT_KEY, tasks }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'justasimpletodoapp-board.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importBoard(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as BoardData
        if (data.compatibleWith !== COMPAT_KEY) {
          reject(new Error(`Incompatible file! Expected compatibleWith: "${COMPAT_KEY}".`))
          return
        }
        if (!Array.isArray(data.tasks)) {
          reject(new Error('Invalid file format: no tasks array found.'))
          return
        }
        resolve(data.tasks)
      } catch {
        reject(new Error('Failed to parse JSON file.'))
      }
    }
    reader.readAsText(file)
  })
}
