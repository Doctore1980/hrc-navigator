import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { trials } from '../data/trials'
import type { Trial } from '../types/evidence'
import { Badge, Card } from './ui'

type Row = {
  trial: string
  pathway: string
  mfs: string
  os: string
  toxicity: string
  qol: string
  evidence: Trial['evidenceLevel']
  maturity: Trial['maturity']
}

const rows: Row[] = trials.map((t) => ({
  trial: t.shortName,
  pathway: t.pathway === 'surgery' ? 'Surgery' : t.pathway === 'radiotherapy' ? 'RT' : 'RT vs surgery',
  mfs: t.outcomes.find((o) => o.endpoint === 'MFS')?.value ?? 'Pending',
  os: t.outcomes.find((o) => o.endpoint === 'OS')?.value ?? 'Pending',
  toxicity: t.toxicity,
  qol: t.outcomes.find((o) => o.endpoint === 'QoL')?.value ?? (t.maturity === 'Pending' ? 'Pending' : 'Limited data'),
  evidence: t.evidenceLevel,
  maturity: t.maturity,
}))

function SortIcon({ state }: { state: false | 'asc' | 'desc' }) {
  if (state === 'asc') return <ArrowUp size={12} aria-label="sorted ascending" />
  if (state === 'desc') return <ArrowDown size={12} aria-label="sorted descending" />
  return <ArrowUpDown size={12} className="opacity-40" aria-label="sortable" />
}

export function EvidenceTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: 'trial',
        header: 'Trial',
        cell: ({ getValue }) => (
          <span className="font-semibold text-slate-100">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'pathway',
        header: 'Pathway',
        cell: ({ getValue }) => {
          const v = getValue<string>()
          return <Badge tone={v === 'Surgery' ? 'amber' : 'blue'}>{v}</Badge>
        },
      },
      {
        accessorKey: 'mfs',
        header: 'MFS',
        cell: ({ getValue }) => <span className="text-xs text-slate-200">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'os',
        header: 'OS',
        cell: ({ getValue }) => <span className="text-xs text-slate-200">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'toxicity',
        header: 'Toxicity',
        cell: ({ getValue }) => (
          <span className="line-clamp-2 text-xs text-slate-400">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'qol',
        header: 'QoL',
        cell: ({ getValue }) => <span className="text-xs text-slate-200">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'evidence',
        header: 'Evidence',
        cell: ({ getValue }) => {
          const v = getValue<Trial['evidenceLevel']>()
          return (
            <Badge tone={v === 'High' ? 'green' : v === 'Moderate' ? 'blue' : 'amber'}>{v}</Badge>
          )
        },
      },
      {
        accessorKey: 'maturity',
        header: 'Maturity',
        cell: ({ getValue }) => (
          <Badge
            tone={
              getValue<string>() === 'Reported'
                ? 'green'
                : getValue<string>() === 'Interim'
                  ? 'blue'
                  : 'amber'
            }
          >
            {getValue<string>()}
          </Badge>
        ),
      },
    ],
    [],
  )

  // TanStack Table returns stable helpers that React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <Card className="overflow-hidden">
      {/* Search bar */}
      <div className="border-b border-white/8 p-4">
        <div className="relative max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter trials, evidence, outcome..."
            aria-label="Filter evidence table"
            className="h-9 w-full rounded-lg border border-white/10 bg-slate-950/70 pl-9 pr-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60 focus:ring-1 focus:ring-cyan-300/25"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" role="region" aria-label="Evidence comparison table">
        <table className="w-full min-w-[900px] text-left text-sm" aria-label="Trial evidence matrix">
          <caption className="sr-only">
            Cross-trial evidence comparison for high-risk prostate cancer. Columns: Trial, Pathway,
            MFS, OS, Toxicity, QoL, Evidence level, Maturity.
          </caption>
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-4 py-3">
                    <button
                      className="inline-flex items-center gap-1.5 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300/60"
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${header.column.id}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon state={header.column.getIsSorted()} />
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-slate-500">
                  No trials match the current filter.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-white/8 align-top transition hover:bg-white/[0.03]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 text-slate-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Row count */}
      <div className="border-t border-white/8 px-4 py-2 text-xs text-slate-500">
        {table.getFilteredRowModel().rows.length} of {rows.length} trials shown
      </div>
    </Card>
  )
}
