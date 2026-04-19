export type PlanBoardSection = { boardTitle: string; taskTitles: string[] }

/**
 * Parse plan dump: `# Board title` starts a board; `- task line` adds a TODO title under the current board.
 * Blank lines are ignored. Lines before the first `#` are ignored.
 */
export function parsePlanBoardDump(text: string): PlanBoardSection[] {
  const sections: PlanBoardSection[] = []
  let current: PlanBoardSection | null = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    const boardMatch = line.match(/^#\s*(.+)$/)
    if (boardMatch) {
      const boardTitle = boardMatch[1].trim()
      current = { boardTitle, taskTitles: [] }
      sections.push(current)
      continue
    }

    const taskMatch = line.match(/^-\s*(.+)$/)
    if (taskMatch && current) {
      const taskTitle = taskMatch[1].trim()
      if (taskTitle) current.taskTitles.push(taskTitle)
    }
  }

  return sections.filter((s) => s.boardTitle.length > 0)
}
