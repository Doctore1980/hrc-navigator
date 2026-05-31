import { Activity, Beaker, Boxes, GitBranch, LayoutDashboard, Menu, Rows3, UserRound, X } from "lucide-react"
import { useState, type ReactNode } from 'react'
import { useEvidenceStore, type PageId } from '../store/useEvidenceStore'
import { ExportActions } from './ExportActions'


const nav: Array<{ id: PageId; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explorer', label: 'Trial Explorer', icon: Boxes },
  { id: 'patient', label: 'Patient Navigator', icon: UserRound },
  { id: 'pathway', label: 'Treatment Pathway', icon: GitBranch },
  { id: 'matrix', label: 'Evidence Matrix', icon: Rows3 },
  { id: 'future', label: 'Future Evidence', icon: Beaker },
]

function NavItem({ label, icon: Icon, current, onClick }: {
  label: string
  icon: typeof LayoutDashboard
  current: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-current={current ? 'page' : undefined}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
        current
          ? 'bg-cyan-300/12 text-cyan-100 shadow-sm'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      <Icon size={16} aria-hidden="true" className={current ? 'text-cyan-300' : ''} />
      {label}
    </button>
  )
}

const DISCLAIMER =
  'Educational tool only. Does not provide medical advice, prescribe treatment, or replace multidisciplinary clinical judgment.'

export function AppShell({ children }: { children: ReactNode }) {
  const page = useEvidenceStore((s) => s.page)
  const setPage = useEvidenceStore((s) => s.setPage)
  const [mobileOpen, setMobileOpen] = useState(false)

  function navigate(id: PageId) {
    setPage(id)
    setMobileOpen(false)
  }

  return (
    <div id="app-shell" className="min-h-screen bg-[#080b12] text-slate-100">
      {/* Background gradients */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(34,211,238,.12),transparent_30%),radial-gradient(circle_at_82%_8%,rgba(16,185,129,.09),transparent_32%),linear-gradient(180deg,#080b12,#10131b_50%,#080b12)]"
      />

      {/* ── Desktop sidebar ── */}
      <aside
        className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-white/8 bg-[#090d14]/95 px-3 py-4 backdrop-blur-xl lg:flex print:hidden"
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="mb-5 flex items-center gap-3 px-2 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <Activity size={18} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white">Evidence Navigator</div>
            <div className="text-xs text-slate-500">High-risk PCa · 2026</div>
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Main navigation" className="flex-1 space-y-0.5">
          {nav.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              current={page === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        {/* Disclaimer */}
        <div
          role="note"
          className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/8 p-3 text-xs leading-relaxed text-amber-100/80"
        >
          {DISCLAIMER}
        </div>
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 lg:hidden print:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      ) : null}

      {/* ── Mobile drawer panel ── */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 flex-col border-r border-white/10 bg-[#090d14]/98 px-3 py-4 backdrop-blur-xl transition-transform duration-250 lg:hidden print:hidden ${
          mobileOpen ? 'flex translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-cyan-300" aria-hidden="true" />
            <span className="text-sm font-bold text-white">Evidence Navigator</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/8 hover:text-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Mobile main navigation" className="flex-1 space-y-0.5">
          {nav.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              current={page === item.id}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>
        <div role="note" className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/8 p-3 text-xs leading-relaxed text-amber-100/80">
          {DISCLAIMER}
        </div>
      </aside>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#080b12]/90 px-4 py-3 backdrop-blur-xl lg:ml-64 print:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="shrink-0 rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/8 hover:text-white lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                High-Risk Prostate Cancer Evidence Navigator 2026
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Trial applicability · outcomes · toxicity · treatment pathway
              </p>
            </div>
          </div>
          <ExportActions />
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        id="main-content"
        className="px-4 py-5 md:px-6 lg:ml-64 lg:px-8 lg:py-7"
        tabIndex={-1}
        aria-label="Page content"
      >
        {children}
      </main>
    </div>
  )
}
