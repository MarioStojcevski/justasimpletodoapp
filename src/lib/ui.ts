/** Shared neo-brutalist Tailwind fragments — muted edges/shadows (see @theme edge) */

/** Sidebar title row + board toolbar: same height + bottom rule so the line reads continuous across columns */
export const chromeHeaderFlex =
  'flex min-h-[44px] shrink-0 items-center gap-3 py-2 md:min-h-[48px] md:py-2.5'

export const chromeHeaderBorder = 'border-b-2 border-edge bg-white'

export const btnBrutalist =
  'rounded-lg border-[2px] border-edge px-5 py-2.5 font-bold uppercase text-xs tracking-wide shadow-brutal-md transition-[transform,box-shadow] duration-200 ease-out hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brutal-active motion-safe:active:scale-[0.98]'

export const btnAdd = `${btnBrutalist} bg-[#a8e6cf] text-ink`
export const btnExport = `${btnBrutalist} bg-[#ffd3b6] text-ink`
export const btnImport = `${btnBrutalist} bg-[#dcedc1] text-ink`
export const btnCancel = `${btnBrutalist} bg-white text-ink`

export const inputBrutalist =
  'rounded-lg border-[2px] border-edge bg-white px-3.5 py-2.5 font-sans text-sm font-medium text-ink shadow-brutal outline-none transition-[transform,box-shadow,border-color] duration-200 ease-out hover:border-edge-strong focus:-translate-x-px focus:-translate-y-px focus:border-edge-strong focus:shadow-brutal-md'

export const modalBackdrop =
  'fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 backdrop-blur-sm animate-[fade-in-modal_0.15s_ease-out]'

export const modalPanel =
  'flex w-[90%] max-w-[480px] flex-col rounded-2xl border-[2px] border-edge bg-white shadow-brutal-2xl animate-[modal-slide-up_0.2s_ease-out]'
