import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  Download,
  Calendar,
  ListTodo,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Upload,
} from 'lucide-react'
import { BoardAppearancePicker } from './BoardAppearancePicker'
import { BoardGlyph } from './BoardGlyph'
import { importWorkspaceFile } from '../lib/fileIO'
import { AREA_LABELS, AREA_ORDER, type AreaId, type KanbanBoard } from '../types'
import {
  btnAdd,
  btnCancel,
  chromeHeaderBorder,
  chromeHeaderFlex,
  modalBackdrop,
  modalPanel,
} from '../lib/ui'
import { useSidebarLayout } from '../layout/sidebar-layout-context'
import { useWorkspace } from '../state/workspace'

type DeleteModalState =
  | { kind: 'confirm'; boardId: string; title: string }
  | { kind: 'blocked'; message: string }
  | null

type RenameSession = { boardId: string; snapshot: string; draft: string }

const menuLink =
  'flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-2.5 py-2 text-sm font-semibold text-neutral-700 no-underline transition-[color,background-color,border-color,transform] duration-200 ease-out hover:bg-ink/4 hover:text-ink motion-safe:active:scale-[0.98]'
const menuLinkActive = 'border-edge-strong bg-[#ffffba]/70 font-bold text-ink'

const railBtn =
  'mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-ink/6 motion-safe:active:scale-90'
const railBtnEnd =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-0 text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-ink/6 motion-safe:active:scale-95'
const railNavActive = 'bg-[#ffffba]/80 text-ink ring-2 ring-edge/40 ring-inset'

/** Menu + Settings section shell */
const sectionBlock = 'shrink-0 border-b border-edge/50 px-3 pb-3 pt-2.5'
const sectionLabel = 'mb-2 pl-0.5 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-neutral-500'

/** Boards strip + per-area headings — subordinate to Menu */
const boardsStripLabel = 'text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-neutral-400'
const areaHeading = 'text-[0.6rem] font-semibold uppercase tracking-[0.11em] text-neutral-500'
/** Icon-only accordion controls (title + sr-only for meaning) */
const iconAccordionBtn =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-neutral-500 transition-[color,background-color,transform] duration-200 ease-out hover:bg-ink/6 hover:text-ink motion-safe:active:scale-90'

function initialAreasExpanded(): Record<AreaId, boolean> {
  return { personal: true, projects: true, work: true }
}

function SidebarBoardRow({
  board,
  renameSession,
  setRenameSession,
  renameInputRef,
  flushRename,
  onRequestDelete,
}: {
  board: KanbanBoard
  renameSession: RenameSession | null
  setRenameSession: Dispatch<SetStateAction<RenameSession | null>>
  renameInputRef: RefObject<HTMLInputElement | null>
  flushRename: (s: RenameSession) => void
  onRequestDelete: (boardId: string, title: string) => void
}) {
  const { setLastActiveBoard, setBoardAppearance } = useWorkspace()
  const glyphAnchorRef = useRef<HTMLButtonElement>(null)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const { pathname } = useLocation()
  const isEditing = renameSession?.boardId === board.id
  const isRouteActive = pathname === `/board/${board.id}`

  function openRename() {
    setRenameSession((prev) => {
      if (prev?.boardId === board.id) {
        queueMicrotask(() => {
          renameInputRef.current?.focus()
          renameInputRef.current?.select()
        })
        return prev
      }
      if (prev) flushRename(prev)
      return { boardId: board.id, snapshot: board.title, draft: board.title }
    })
  }

  function finishRename() {
    setRenameSession((prev) => {
      if (!prev || prev.boardId !== board.id) return prev
      flushRename(prev)
      return null
    })
  }

  function cancelRename() {
    setRenameSession((prev) => {
      if (!prev || prev.boardId !== board.id) return prev
      return null
    })
  }

  return (
    <li
      className={`group/sidebar-row flex items-center gap-1 rounded-lg transition-[background-color] duration-200 ease-out ${
        isRouteActive ? 'bg-[#ffffba]/70' : ''
      } hover:bg-ink/4`}
    >
      <button
        type="button"
        ref={glyphAnchorRef}
        className="shrink-0 rounded-md border-0 bg-transparent p-0.5 transition-[opacity,transform] duration-200 ease-out hover:opacity-90 motion-safe:active:scale-95"
        title="Board icon & color"
        aria-expanded={appearanceOpen}
        aria-haspopup="dialog"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setAppearanceOpen((v) => !v)
        }}
      >
        <BoardGlyph icon={board.icon} color={board.color} size={14} />
      </button>
      <BoardAppearancePicker
        board={board}
        open={appearanceOpen}
        anchorRef={glyphAnchorRef}
        onClose={() => setAppearanceOpen(false)}
        onPickIcon={(icon) => setBoardAppearance(board.id, { icon })}
        onPickColor={(color) => setBoardAppearance(board.id, { color })}
      />
      <div className="min-w-0 flex-1 py-1.5 pl-2.5 pr-1">
        {isEditing ? (
          <input
            ref={renameInputRef}
            className="box-border w-full min-w-0 rounded-md border border-edge-strong bg-white px-1.5 py-1 font-sans text-sm font-semibold text-ink"
            value={renameSession?.draft ?? ''}
            onChange={(e) =>
              setRenameSession((prev) =>
                prev && prev.boardId === board.id ? { ...prev, draft: e.target.value } : prev
              )
            }
            onBlur={() => finishRename()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                ;(e.target as HTMLInputElement).blur()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                cancelRename()
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="block w-full max-w-full cursor-text truncate rounded px-0 py-0.5 text-left font-sans text-sm font-semibold text-ink transition-colors duration-200 ease-out hover:bg-ink/6"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              openRename()
            }}
          >
            {board.title}
          </button>
        )}
      </div>
      <NavLink
        to={`/board/${board.id}`}
        className={({ isActive }) =>
          `flex shrink-0 items-center rounded-r-md px-2 py-2 no-underline transition-[background-color,color] duration-200 ease-out hover:bg-ink/6 ${
            isActive ? 'bg-ink/8' : ''
          }`
        }
        onClick={() => setLastActiveBoard(board.id)}
      >
        <span className="text-[0.68rem] font-semibold lowercase tracking-wide text-neutral-500">
          {board.tasks.filter((t) => t.column === 'TODO').length} to do
        </span>
      </NavLink>
      <button
        type="button"
        className="h-7 w-7 shrink-0 rounded-md border-0 bg-transparent text-lg font-bold leading-none text-neutral-400 transition-[color,background,opacity,visibility] hover:bg-red-500/10 hover:text-red-700 max-sm:visible max-sm:opacity-100 sm:invisible sm:opacity-0 sm:group-hover/sidebar-row:visible sm:group-hover/sidebar-row:opacity-100"
        title="Delete board"
        aria-label={`Delete board ${board.title}`}
        onClick={() => onRequestDelete(board.id, board.title)}
      >
        ×
      </button>
    </li>
  )
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebarLayout()
  const { state, boardsForArea, addBoard, deleteBoard, renameBoard, importWorkspace, exportWorkspace, setLastActiveBoard } =
    useWorkspace()
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>(null)
  const [renameSession, setRenameSession] = useState<RenameSession | null>(null)
  const [areasBoardsExpanded, setAreasBoardsExpanded] = useState<Record<AreaId, boolean>>(initialAreasExpanded)
  const backdropRef = useRef<HTMLDivElement>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const workspaceImportRef = useRef<HTMLInputElement>(null)

  async function handleWorkspaceImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const ws = await importWorkspaceFile(file)
      importWorkspace(ws)
    } catch (err) {
      alert((err as Error).message)
    }
    e.target.value = ''
  }

  const allBoardListsHidden = AREA_ORDER.every((id) => !areasBoardsExpanded[id])

  function collapseAllBoardLists() {
    setAreasBoardsExpanded({ personal: false, projects: false, work: false })
  }

  function expandAllBoardLists() {
    setAreasBoardsExpanded(initialAreasExpanded())
  }

  function setAreaBoardListExpanded(areaId: AreaId, expanded: boolean) {
    setAreasBoardsExpanded((prev) => ({ ...prev, [areaId]: expanded }))
  }

  function flushRename(session: RenameSession) {
    const trimmed = session.draft.trim()
    const nextTitle = trimmed || session.snapshot
    const b = state.boards.find((x) => x.id === session.boardId)
    if (b && nextTitle !== b.title) renameBoard(session.boardId, nextTitle)
  }

  useEffect(() => {
    if (!renameSession) return
    const id = window.setTimeout(() => {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }, 0)
    return () => window.clearTimeout(id)
  }, [renameSession?.boardId])

  useEffect(() => {
    if (!deleteModal) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    if (deleteModal.kind === 'confirm') {
      queueMicrotask(() => confirmBtnRef.current?.focus())
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [deleteModal])

  useEffect(() => {
    if (!deleteModal) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDeleteModal(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteModal])

  useEffect(() => {
    if (sidebarOpen) return
    setRenameSession((prev) => {
      if (!prev) return null
      const trimmed = prev.draft.trim()
      const nextTitle = trimmed || prev.snapshot
      const b = state.boards.find((x) => x.id === prev.boardId)
      if (b && nextTitle !== b.title) renameBoard(prev.boardId, nextTitle)
      return null
    })
  }, [sidebarOpen, state.boards, renameBoard])

  function requestDeleteBoard(boardId: string, title: string) {
    if (renameSession) {
      flushRename(renameSession)
      setRenameSession(null)
    }
    if (state.boards.length <= 1) {
      setDeleteModal({
        kind: 'blocked',
        message:
          'You need at least one board in your workspace. Add another board before deleting this one.',
      })
      return
    }
    setDeleteModal({ kind: 'confirm', boardId, title })
  }

  function closeDeleteModal() {
    setDeleteModal(null)
  }

  function confirmDeleteBoard() {
    if (deleteModal?.kind === 'confirm') {
      deleteBoard(deleteModal.boardId)
    }
    closeDeleteModal()
  }

  return (
    <>
      {sidebarOpen ? (
        <div className="flex min-h-full w-[260px] min-w-[260px] flex-col">
        <div className={sectionBlock}>
          <div className="mb-2 flex items-center justify-between gap-2 pl-0.5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-neutral-500">Menu</p>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-0 text-ink transition-[background-color,transform] duration-200 ease-out hover:bg-ink/6 motion-safe:active:scale-95"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            <li>
              <NavLink
                to="/today"
                end
                className={({ isActive }) => `${menuLink} ${isActive ? menuLinkActive : ''}`}
              >
                <Calendar className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                <span>Today</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/plan"
                className={({ isActive }) => `${menuLink} ${isActive ? menuLinkActive : ''}`}
              >
                <ListTodo className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                <span>Plan</span>
              </NavLink>
            </li>
          </ul>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto border-t border-edge/35 px-3 pb-3 pt-2"
          aria-label="Boards by area"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className={boardsStripLabel}>Boards</span>
            {allBoardListsHidden ? (
              <button
                type="button"
                className={iconAccordionBtn}
                onClick={expandAllBoardLists}
                title="Show boards in all areas"
                aria-label="Show boards in all areas"
              >
                <ChevronsDown className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                className={iconAccordionBtn}
                onClick={collapseAllBoardLists}
                title="Hide boards in all areas"
                aria-label="Hide boards in all areas"
              >
                <ChevronsUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </button>
            )}
          </div>

          {AREA_ORDER.map((areaId, areaIndex) => {
            const expanded = areasBoardsExpanded[areaId]
            return (
              <section
                key={areaId}
                className={`py-3 ${areaIndex > 0 ? 'border-t border-edge/40' : ''}`}
              >
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pl-0.5 pr-0.5">
                  <h2 className={`${areaHeading} m-0`}>{AREA_LABELS[areaId]}</h2>
                  {expanded ? (
                    <button
                      type="button"
                      className={iconAccordionBtn}
                      onClick={() => setAreaBoardListExpanded(areaId, false)}
                      aria-expanded={expanded}
                      aria-controls={`board-list-${areaId}`}
                      title={`Hide boards in ${AREA_LABELS[areaId]}`}
                      aria-label={`Hide boards in ${AREA_LABELS[areaId]}`}
                    >
                      <ChevronUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={iconAccordionBtn}
                      onClick={() => setAreaBoardListExpanded(areaId, true)}
                      aria-expanded={expanded}
                      aria-controls={`board-list-${areaId}`}
                      title={`Show boards in ${AREA_LABELS[areaId]}`}
                      aria-label={`Show boards in ${AREA_LABELS[areaId]}`}
                    >
                      <ChevronDown className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                    </button>
                  )}
                </div>
                {expanded ? (
                  <>
                    <ul id={`board-list-${areaId}`} className="m-0 flex list-none flex-col gap-0.5 p-0">
                      {boardsForArea(areaId).map((b) => (
                        <SidebarBoardRow
                          key={b.id}
                          board={b}
                          renameSession={renameSession}
                          setRenameSession={setRenameSession}
                          renameInputRef={renameInputRef}
                          flushRename={flushRename}
                          onRequestDelete={requestDeleteBoard}
                        />
                      ))}
                      <li className="group/sidebar-row flex items-center gap-1 rounded-lg transition-[background-color] duration-200 ease-out hover:bg-ink/4">
                        <button
                          type="button"
                          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0.5 text-neutral-500 transition-colors hover:bg-ink/6 hover:text-ink"
                          onClick={() => addBoard(areaId)}
                          title={`Add board in ${AREA_LABELS[areaId]}`}
                          aria-label={`Add board in ${AREA_LABELS[areaId]}`}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                        </button>
                        <div
                          className="min-w-0 flex-1 rounded-l-md border-l-2 border-transparent py-1.5 pl-2.5 pr-1"
                          aria-hidden
                        />
                        <span className="invisible shrink-0 px-2 py-2 text-[0.68rem] font-semibold lowercase tracking-wide">
                          0 to do
                        </span>
                        <span className="invisible h-7 w-7 shrink-0" aria-hidden />
                      </li>
                    </ul>
                  </>
                ) : (
                  <p className="mb-0 pl-1 text-[0.62rem] text-neutral-400">
                    {boardsForArea(areaId).length} board{boardsForArea(areaId).length === 1 ? '' : 's'} hidden
                  </p>
                )}
              </section>
            )
          })}
        </nav>

        <footer className="shrink-0 border-t border-edge/60 bg-white px-3 py-3">
          <p className={sectionLabel}>Workspace</p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            <li>
              <button
                type="button"
                className={`${menuLink} w-full cursor-pointer text-left`}
                onClick={() => exportWorkspace()}
              >
                <Download className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                <span>Export everything</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`${menuLink} w-full cursor-pointer text-left`}
                onClick={() => workspaceImportRef.current?.click()}
              >
                <Upload className="h-4 w-4 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
                <span>Import everything</span>
              </button>
            </li>
          </ul>
        </footer>
        </div>
      ) : (
        <div className="flex h-full min-h-0 w-full flex-col bg-white">
          <div className={`${chromeHeaderFlex} w-full justify-end ${chromeHeaderBorder} px-1`}>
            <button
              type="button"
              className={railBtnEnd}
              onClick={() => setSidebarOpen(true)}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
          </div>

          <div
            className="flex w-full shrink-0 flex-col items-center gap-0.5 border-b-2 border-edge/70 py-2"
            aria-label="Menu"
          >
            <NavLink
              to="/today"
              title="Today"
              aria-label="Today"
              end
              className={({ isActive }) => `${railBtn} ${isActive ? railNavActive : ''}`}
            >
              <Calendar className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </NavLink>
            <NavLink
              to="/plan"
              title="Plan"
              aria-label="Plan"
              className={({ isActive }) => `${railBtn} ${isActive ? railNavActive : ''}`}
            >
              <ListTodo className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </NavLink>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center gap-0.5 overflow-y-auto overflow-x-hidden py-2 [scrollbar-width:thin]" aria-label="Boards">
            {AREA_ORDER.map((areaId) => (
              <div key={areaId} className="flex w-full flex-col items-center gap-0.5">
                {boardsForArea(areaId).map((b) => (
                  <NavLink
                    key={b.id}
                    to={`/board/${b.id}`}
                    title={b.title}
                    aria-label={b.title}
                    onClick={() => setLastActiveBoard(b.id)}
                    className={({ isActive }) => `${railBtn} ${isActive ? railNavActive : ''}`}
                  >
                    <BoardGlyph icon={b.icon} color={b.color} size={15} className="border-edge/30" />
                  </NavLink>
                ))}
              </div>
            ))}
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-0.5 border-t border-edge/60 py-2">
            <button
              type="button"
              className={`${railBtn} text-ink hover:bg-ink/6`}
              title="Export everything"
              aria-label="Export everything"
              onClick={() => exportWorkspace()}
            >
              <Download className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
            <button
              type="button"
              className={`${railBtn} text-ink hover:bg-ink/6`}
              title="Import everything"
              aria-label="Import everything"
              onClick={() => workspaceImportRef.current?.click()}
            >
              <Upload className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      )}

      <input
        ref={workspaceImportRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleWorkspaceImport}
      />

      {deleteModal && (
        <div
          className={modalBackdrop}
          ref={backdropRef}
          role="presentation"
          onClick={(e) => {
            if (e.target === backdropRef.current) closeDeleteModal()
          }}
        >
          <div className={modalPanel} role="dialog" aria-modal="true" aria-labelledby="delete-board-dialog-title">
            <div className="flex items-start justify-between px-6 pt-5">
              <h2 id="delete-board-dialog-title" className="text-xl font-bold tracking-tight text-ink">
                {deleteModal.kind === 'confirm' ? 'Delete board?' : 'Cannot delete'}
              </h2>
              <button
                type="button"
                className="border-0 bg-transparent p-1 text-2xl font-bold leading-none text-ink/40 transition-opacity hover:opacity-100"
                onClick={closeDeleteModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 px-6 py-5">
              {deleteModal.kind === 'confirm' ? (
                <p className="m-0 text-[0.95rem] font-medium leading-relaxed text-neutral-700">
                  Delete <strong className="font-extrabold text-ink">{deleteModal.title}</strong> and all tasks on
                  this board? This cannot be undone.
                </p>
              ) : (
                <p className="m-0 text-[0.95rem] font-medium leading-relaxed text-neutral-700">{deleteModal.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2.5 px-6 pb-5">
              {deleteModal.kind === 'confirm' ? (
                <>
                  <button type="button" className={btnCancel} onClick={closeDeleteModal}>
                    Cancel
                  </button>
                  <button ref={confirmBtnRef} type="button" className={btnAdd} onClick={confirmDeleteBoard}>
                    Delete board
                  </button>
                </>
              ) : (
                <button type="button" className={btnCancel} onClick={closeDeleteModal}>
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
