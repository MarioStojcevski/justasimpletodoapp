import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { SidebarLayoutContext } from './sidebar-layout-context'

const SIDEBAR_STORAGE_KEY = 'justasimpletodoapp-sidebar-open'

const RAIL_WIDTH_CLASS = 'w-12 min-w-12 max-w-12'
const EXPANDED_WIDTH_CLASS = 'w-[260px] min-w-[260px] max-w-[260px]'

const SHAPES: { pos: string; className: string }[] = [
  {
    pos: 'top-[12%] left-[5%]',
    className:
      'h-[60px] w-[60px] rounded-full border-[2px] border-edge/35 bg-[#ffb3ba] animate-[shape-float_14s_ease-in-out_infinite]',
  },
  {
    pos: 'top-[65%] left-[8%]',
    className:
      'h-11 w-11 rounded-md border-[2px] border-edge/35 bg-[#ffffba] animate-[shape-spin-float_18s_linear_infinite]',
  },
  {
    pos: 'top-[30%] right-[4%]',
    className:
      'h-[60px] w-[60px] rounded-full border-[2px] border-edge/35 bg-[#bae1ff] animate-[shape-float_14s_ease-in-out_infinite]',
  },
  {
    pos: 'top-[75%] right-[6%]',
    className:
      'h-11 w-11 rounded-md border-[2px] border-edge/35 bg-[#baffc9] animate-[shape-spin-float_18s_linear_infinite]',
  },
  {
    pos: 'top-[45%] left-[3%]',
    className:
      'h-10 w-10 rotate-45 rounded border-[2px] border-edge/35 bg-[#ffd8a8] animate-[shape-drift_12s_ease-in-out_infinite]',
  },
  {
    pos: 'top-[85%] left-1/2 -translate-x-1/2',
    className:
      'h-[60px] w-[60px] rounded-full border-[2px] border-edge/35 bg-[#d5baff] animate-[shape-float_14s_ease-in-out_infinite]',
  },
  {
    pos: 'top-[15%] right-[12%]',
    className:
      'h-11 w-11 rounded-md border-[2px] border-edge/35 bg-[#ffb3ba] animate-[shape-spin-float_18s_linear_infinite]',
  },
  {
    pos: 'top-[55%] right-[2%]',
    className:
      'h-10 w-10 rotate-45 rounded border-[2px] border-edge/35 bg-[#ffffba] animate-[shape-drift_12s_ease-in-out_infinite]',
  },
]

function readSidebarPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) !== '0'
  } catch {
    return true
  }
}

export function AppShell() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarPreference)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [sidebarOpen])

  const layoutValue = { sidebarOpen, setSidebarOpen }

  return (
    <SidebarLayoutContext.Provider value={layoutValue}>
      <div className="relative flex h-screen flex-col overflow-hidden">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          {SHAPES.map((s, i) => (
            <div
              key={i}
              className={`pointer-events-none absolute border-edge/30 opacity-20 ${s.pos} ${s.className}`}
              style={{ animationDelay: `${i * -1.7}s` }}
            />
          ))}
        </div>
        <div className="relative z-1 flex min-h-0 flex-1 flex-row overflow-hidden">
          <aside
            id="app-sidebar"
            className={`flex min-h-0 shrink-0 flex-col overflow-hidden border-edge bg-white transition-[width,min-width,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] border-r-2 ${
              sidebarOpen ? EXPANDED_WIDTH_CLASS : RAIL_WIDTH_CLASS
            }`}
          >
            <Sidebar />
          </aside>
          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div key={location.pathname} className="page-enter flex min-h-0 flex-1 flex-col">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayoutContext.Provider>
  )
}
