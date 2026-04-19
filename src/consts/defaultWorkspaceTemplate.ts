import type { AreaId, ColumnId, Priority } from '../types'

/** Serializable task rows — IDs are assigned when building `WorkspaceState`. */
export type DefaultWorkspaceTaskSeed = {
  title: string
  description?: string
  assignee?: string
  column?: ColumnId
  priority?: Priority
  dueDate?: string | null
}

export type DefaultWorkspaceBoardSeed = {
  areaId: AreaId
  title: string
  icon: number
  color: number
  tasks: DefaultWorkspaceTaskSeed[]
}

/**
 * Canonical first-run workspace: one board per area (personal / projects / work).
 * Shipped content only; runtime assigns fresh board and task ids.
 */
export const DEFAULT_WORKSPACE_BOARD_SEEDS: DefaultWorkspaceBoardSeed[] = [
  {
    areaId: 'personal',
    title: 'Learning Slovene',
    icon: 2,
    color: 3,
    tasks: [
      {
        title: 'Drill: dober dan / živijo / adijo (tone + spelling)',
        description: 'Five minutes out loud; record one take if you want playback check.',
        priority: 'P1',
      },
      {
        title: 'Vocab set: hrana in pijača (20 cards)',
        description: 'Bread, water, coffee, apple — Slovene labels only on the front.',
        priority: 'P2',
      },
      {
        title: 'Listen: 5 min clip with Slovene subtitles',
        description: 'Pick any short RTV clip; pause once to note three new words.',
        column: 'INPROGRESS',
        priority: 'P3',
      },
      {
        title: 'Grammar: dual (midva / vidva / onadva)',
        description: 'Write four mini dialogues using dual forms correctly.',
        priority: 'P2',
      },
      {
        title: 'Review: last week’s flashcards',
        description: 'Mark leeches; move two hardest cards to tomorrow.',
        column: 'DONE',
        priority: 'P3',
      },
    ],
  },
  {
    areaId: 'projects',
    title: 'AR Unity Game',
    icon: 5,
    color: 1,
    tasks: [
      {
        title: 'AR Foundation: plane detection baseline scene',
        description: 'Empty scene, one test object snap-to-plane, Android build.',
        priority: 'P1',
        assignee: 'You',
      },
      {
        title: 'Interaction: tap-to-place reticle + haptic',
        description: 'Raycast from screen center; reject hits beyond 3 m.',
        priority: 'P2',
      },
      {
        title: 'VFX: portal shader pass (mobile-safe)',
        description: 'Single-pass fake volumetric; profile on mid-tier GPU.',
        column: 'INPROGRESS',
        priority: 'P1',
      },
      {
        title: 'Enemy spawn: burst from portal with cooldown',
        description: 'Pool 12 agents; cap simultaneous spawns at 3.',
        priority: 'P2',
      },
      {
        title: 'Polish: occlusion when AR object behind real furniture',
        description: 'Document known limitations for v0.1.',
        column: 'TODO',
        priority: 'P3',
      },
    ],
  },
  {
    areaId: 'work',
    title: 'justasimpletodoapp',
    icon: 6,
    color: 4,
    tasks: [
      {
        title: 'Feature: telepathic checkbox',
        description:
          'User wants tasks to mark complete when they “really mean it,” without touch or voice. Estimate: ∞ story points.',
        priority: 'P1',
        assignee: 'PM (??? )',
      },
      {
        title: 'Integrate OAuth 7 with parallel-universe user API',
        description:
          'Staging credentials only exist in Earth-7. QA blocked until wormhole budget approved.',
        priority: 'P1',
        assignee: 'Backend',
      },
      {
        title: 'Export board to holographic cube (.hcube)',
        description: 'Spec says vertices must spell emotional subtext. Legal wants a waiver.',
        priority: 'P2',
        assignee: 'Formats',
      },
      {
        title: 'Retroactive GC: free memory before allocation was conceived',
        description:
          'Performance win is huge; causality linter fails on CI. Ship behind flag REALITY_UNSAFE.',
        priority: 'P2',
        assignee: 'Runtime',
      },
      {
        title: 'Dark mode for infrared-only displays',
        description:
          'Must pass WCAG-9000 “stealth readability” audit. Design sent palette #000000 × 50.',
        column: 'INPROGRESS',
        priority: 'P3',
        assignee: 'Design',
      },
      {
        title: 'USB-Olfactory import: sniff-to-add task',
        description:
          'Hardware team says dongle smells like “burning roadmap.” P0 blocker: nose calibration lab.',
        priority: 'P3',
        assignee: 'Hardware',
      },
      {
        title: 'AI prioritization via soul scan (HIPAA-exempt per user tarot)',
        description: 'Ethics board meeting scheduled on the astral plane; dial-in TBD.',
        priority: 'P1',
        assignee: 'ML',
      },
    ],
  },
]
